import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from 'react-router-dom'
import adminAPI from "../../services/adminAPI";
import DeliveryZoneMapDrawer from "../../components/admin/DeliveryZoneMapDrawer";
import { loadGoogleMaps } from "../../utils/googleMapsLoader";
import { useAuth } from '../../context/AuthContext'
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils'
import { usePanelBase } from '../../hooks/usePanelBase'

const emptyForm = {
  id: null,
  name: "",
  type: "radius",
  deliveryFee: 0,
  minOrderValue: 0,
  estimatedDeliveryTime: "",
  description: "",
  isActive: true,
  radiusKm: 5,
  centerLat: "",
  centerLng: "",
  polygonText: "" // one lat,lng per line
};

export default function AdminDeliveryZones() {
  const { user } = useAuth()
  const base = usePanelBase()
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)
  
  if (isDeliveryPartner) {
    return <Navigate to={`${base}/orders`} replace />
  }

  const [zones, setZones] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showMapDrawer, setShowMapDrawer] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsLoadError, setMapsLoadError] = useState(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedZoneForManager, setSelectedZoneForManager] = useState(null);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availableDeliveryPartners, setAvailableDeliveryPartners] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [assignedManagers, setAssignedManagers] = useState({});
  const [assignmentTab, setAssignmentTab] = useState('managers');

  // Pre-compute display rows
  const zoneRows = useMemo(() => zones || [], [zones]);

  // Load Google Maps on component mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setMapsLoadError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
      return;
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        setMapsLoaded(true);
        setMapsLoadError(null);
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setMapsLoadError(err.message || 'Failed to load Google Maps');
      });
  }, []);

  useEffect(() => {
    loadZones();
    loadStats();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDeliveryZones();
      setZones(data.zones || []);
    } catch (err) {
      console.error("Failed to load zones", err);
      setError("Could not load delivery zones. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminAPI.getDeliveryZoneStats();
      setStats(data.stats || null);
    } catch (err) {
      console.warn("Zone stats unavailable", err.message);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setMessage("");
    setError(null);
  };

  const handleEdit = (zone) => {
    setForm({
      id: zone._id,
      name: zone.name || "",
      type: zone.type || "radius",
      deliveryFee: zone.deliveryFee ?? 0,
      minOrderValue: zone.minOrderValue ?? 0,
      estimatedDeliveryTime: zone.estimatedDeliveryTime ?? "",
      description: zone.description || "",
      isActive: zone.isActive ?? true,
      radiusKm: zone.radiusKm ?? 0,
      centerLat: zone.center?.lat ?? "",
      centerLng: zone.center?.lng ?? "",
      polygonText: (zone.polygon || [])
        .map((p) => `${p.lat},${p.lng}`)
        .join("\n")
    });
    setMessage("Editing existing delivery zone");
  };

  const parsePolygon = (text) => {
    if (!text.trim()) return [];
    return text
      .split(/\n|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [latStr, lngStr] = line.split(/,|\s+/);
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          throw new Error(`Invalid coordinate: ${line}`);
        }
        return { lat, lng };
      });
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      type: form.type,
      deliveryFee: Number(form.deliveryFee) || 0,
      minOrderValue: Number(form.minOrderValue) || 0,
      estimatedDeliveryTime: form.estimatedDeliveryTime ? Number(form.estimatedDeliveryTime) : undefined,
      description: form.description?.trim(),
      isActive: !!form.isActive
    };

    if (!payload.name) throw new Error("Name is required");

    if (payload.type === "radius") {
      const lat = parseFloat(form.centerLat);
      const lng = parseFloat(form.centerLng);
      const radiusKm = Number(form.radiusKm);
      if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error("Center lat/lng are required for radius");
      if (!radiusKm || radiusKm <= 0) throw new Error("Radius must be greater than 0");
      payload.center = { lat, lng };
      payload.radiusKm = radiusKm;
    } else {
      const polygon = parsePolygon(form.polygonText || "");
      if (!polygon.length || polygon.length < 3) throw new Error("Polygon needs at least 3 points");
      payload.polygon = polygon;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage("");

    try {
      const payload = buildPayload();
      if (form.id) {
        await adminAPI.updateDeliveryZone(form.id, payload);
        setMessage("Delivery zone updated");
      } else {
        await adminAPI.createDeliveryZone(payload);
        setMessage("Delivery zone created");
      }
      await loadZones();
      resetForm();
    } catch (err) {
      console.error("Save failed", err);
      setError(err?.response?.data?.message || err.message || "Failed to save zone");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm("Delete this delivery zone?")) return;
    try {
      await adminAPI.deleteDeliveryZone(zoneId);
      setMessage("Zone deleted");
      await loadZones();
      if (form.id === zoneId) resetForm();
    } catch (err) {
      setError("Failed to delete zone");
    }
  };

  const handleToggle = async (zoneId) => {
    try {
      await adminAPI.toggleDeliveryZoneStatus(zoneId);
      await loadZones();
    } catch (err) {
      setError("Could not toggle status");
    }
  };

  const handleMapZoneSave = (zoneData) => {
    // Populate form with map-drawn data
    setForm({
      ...form,
      type: zoneData.type,
      centerLat: zoneData.center?.lat || "",
      centerLng: zoneData.center?.lng || "",
      radiusKm: zoneData.radiusKm || 0,
      polygonText: zoneData.polygon
        ? zoneData.polygon.map(p => `${p.lat},${p.lng}`).join("\n")
        : ""
    });
    setShowMapDrawer(false);
    setMessage("Zone drawn! Fill in details and save.");
  };

  const loadAvailableManagers = async () => {
    try {
      setLoadingManagers(true);
      const data = await adminAPI.getAllUsers();
      // Filter users who have either 'admin' or 'manager' role
      const managers = (data.users || []).filter(u => 
        u.roles?.includes('admin') || u.roles?.includes('manager')
      );
      // Filter users who have 'delivery_partner' role
      const deliveryPartners = (data.users || []).filter(u => 
        u.roles?.includes('delivery_partner')
      );
      setAvailableManagers(managers);
      setAvailableDeliveryPartners(deliveryPartners);
    } catch (err) {
      console.error('Failed to load managers:', err);
      setError('Failed to load managers');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleOpenManagerModal = async (zone) => {
    setSelectedZoneForManager(zone);
    setAssignmentTab('managers');
    setShowManagerModal(true);
    await loadAvailableManagers();
  };

  const handleAssignManager = async (managerId) => {
    if (!selectedZoneForManager) return;

    try {
      setSaving(true);
      await adminAPI.assignManagerToArea({
        managerId,
        deliveryZoneId: selectedZoneForManager._id
      });
      
      setMessage(`Manager assigned to ${selectedZoneForManager.name}`);
      setShowManagerModal(false);
      setSelectedZoneForManager(null);
      
      // Reload to show assignment
      await loadZones();
    } catch (err) {
      console.error('Failed to assign manager:', err);
      setError(err?.response?.data?.error || 'Failed to assign manager');
    } finally {
      setSaving(false);
    }
  };

  const loadAssignedManagers = async () => {
    try {
      const data = await adminAPI.getAreaManagerAssignments();
      const assignments = data.assignments || [];
      const byZone = {};
      assignments.forEach(a => {
        if (!byZone[a.deliveryZone?._id]) {
          byZone[a.deliveryZone?._id] = [];
        }
        byZone[a.deliveryZone?._id].push({
          id: a._id,
          name: a.manager?.name || 'Unknown'
        });
      });
      setAssignedManagers(byZone);
    } catch (err) {
      console.warn('Failed to load assigned managers:', err);
    }
  };

  const handleRemoveManager = async (assignmentId) => {
    if (!window.confirm('Remove this manager from the zone?')) return;

    try {
      setSaving(true);
      await adminAPI.removeManagerFromArea(assignmentId);
      setMessage('Manager removed successfully');
      await loadZones();
    } catch (err) {
      console.error('Failed to remove manager:', err);
      setError(err?.response?.data?.error || 'Failed to remove manager');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadAssignedManagers();
  }, [zones]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Areas</h1>
          <p className="text-sm text-gray-600">Manage polygon and radius-based delivery zones.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMapDrawer(!showMapDrawer)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            🗺️ {showMapDrawer ? 'Hide Map' : 'Draw on Map'}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + New Zone
          </button>
        </div>
      </header>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Active Zones" value={stats.zones?.active ?? 0} />
          <StatCard label="Total Addresses" value={stats.addresses?.total ?? 0} />
          <StatCard label="Verified Addresses" value={stats.addresses?.verified ?? 0} />
        </div>
      )}

      {/* Map Drawing Interface */}
      {showMapDrawer && (
        <div className="bg-white rounded-lg shadow p-4">
          {mapsLoadError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <p className="font-semibold">Google Maps Error</p>
              <p className="text-sm mt-1">{mapsLoadError}</p>
            </div>
          ) : !mapsLoaded ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Google Maps...</p>
              </div>
            </div>
          ) : (
            <DeliveryZoneMapDrawer
              onZoneSave={handleMapZoneSave}
              existingZone={form.id ? {
                type: form.type,
                polygon: form.type === 'polygon' ? parsePolygon(form.polygonText) : null,
                center: form.type === 'radius' && form.centerLat && form.centerLng ? {
                  lat: parseFloat(form.centerLat),
                  lng: parseFloat(form.centerLng)
                } : null,
                radiusKm: form.type === 'radius' ? parseFloat(form.radiusKm) : null
              } : null}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-4 rounded-lg shadow col-span-1 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">{form.id ? "Edit Delivery Zone" : "Create Delivery Zone"}</h2>
          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
          {message && <div className="mb-2 text-sm text-green-600">{message}</div>}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Central Zone"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="radius">Radius</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>

            {form.type === "radius" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Center Lat *</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={form.centerLat}
                    onChange={(e) => setForm({ ...form, centerLat: e.target.value })}
                    placeholder="28.6139"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Center Lng *</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={form.centerLng}
                    onChange={(e) => setForm({ ...form, centerLng: e.target.value })}
                    placeholder="77.2090"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Radius (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={form.radiusKm}
                    onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Polygon Points (lat,lng per line)</label>
                <textarea
                  className="mt-1 w-full border rounded-md px-3 py-2 h-32 font-mono text-xs"
                  value={form.polygonText}
                  onChange={(e) => setForm({ ...form, polygonText: e.target.value })}
                  placeholder={`28.6304,77.2177\n28.6380,77.2280\n28.6250,77.2350`}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Fee</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Order Value</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ETA (minutes)</label>
              <input
                type="number"
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={form.estimatedDeliveryTime}
                onChange={(e) => setForm({ ...form, estimatedDeliveryTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description / Notes</label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : form.id ? "Update Zone" : "Create Zone"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white p-4 rounded-lg shadow col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Existing Delivery Zones</h2>
            <span className="text-sm text-gray-500">{zoneRows.length} zones</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading zones...</div>
          ) : zoneRows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No delivery zones configured yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Fee</th>
                    <th className="px-3 py-2">Min Order</th>
                    <th className="px-3 py-2">ETA</th>
                    <th className="px-3 py-2">Assigned Manager</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {zoneRows.map((zone) => (
                    <tr key={zone._id}>
                      <td className="px-3 py-2 font-medium text-gray-900">{zone.name}</td>
                      <td className="px-3 py-2 capitalize">{zone.type}</td>
                      <td className="px-3 py-2">₹{zone.deliveryFee ?? 0}</td>
                      <td className="px-3 py-2">₹{zone.minOrderValue ?? 0}</td>
                      <td className="px-3 py-2">{zone.estimatedDeliveryTime ? `${zone.estimatedDeliveryTime}m` : "-"}</td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          {assignedManagers[zone._id]?.length > 0 ? (
                            <div className="space-y-1">
                              {assignedManagers[zone._id].map((mgr, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  <span>{mgr.name}</span>
                                  <button
                                    onClick={() => handleRemoveManager(mgr.id)}
                                    disabled={saving}
                                    className="ml-2 text-blue-600 hover:text-red-600 font-bold"
                                    title="Remove manager"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${zone.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                          {zone.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:underline text-xs"
                          onClick={() => handleEdit(zone)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-green-600 hover:underline text-xs"
                          onClick={() => handleOpenManagerModal(zone)}
                        >
                          Manager
                        </button>
                        <button
                          className="text-yellow-600 hover:underline text-xs"
                          onClick={() => handleToggle(zone._id)}
                        >
                          {zone.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          className="text-red-600 hover:underline text-xs"
                          onClick={() => handleDelete(zone._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Manager Assignment Modal */}
      {showManagerModal && selectedZoneForManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Assign to {selectedZoneForManager.name}
              </h2>
              <button
                onClick={() => setShowManagerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setAssignmentTab('managers')}
                className={`px-4 py-2 font-medium text-sm transition ${
                  assignmentTab === 'managers'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Managers
              </button>
              <button
                onClick={() => setAssignmentTab('delivery-partners')}
                className={`px-4 py-2 font-medium text-sm transition ${
                  assignmentTab === 'delivery-partners'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Delivery Partners
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {loadingManagers ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : assignmentTab === 'managers' ? (
              availableManagers.length === 0 ? (
                <p className="text-gray-600 text-sm py-4">No managers available to assign.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableManagers.map(manager => (
                    <button
                      key={manager._id}
                      onClick={() => handleAssignManager(manager._id)}
                      disabled={saving}
                      className="w-full text-left p-3 border rounded hover:bg-blue-50 transition"
                    >
                      <div className="font-medium text-gray-900">{manager.name}</div>
                      <div className="text-xs text-gray-500">{manager.email}</div>
                    </button>
                  ))}
                </div>
              )
            ) : availableDeliveryPartners.length === 0 ? (
              <p className="text-gray-600 text-sm py-4">No delivery partners available to assign.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableDeliveryPartners.map(partner => (
                  <button
                    key={partner._id}
                    onClick={() => handleAssignManager(partner._id)}
                    disabled={saving}
                    className="w-full text-left p-3 border rounded hover:bg-green-50 transition"
                  >
                    <div className="font-medium text-gray-900">{partner.name}</div>
                    <div className="text-xs text-gray-500">{partner.email}</div>
                    <div className="text-xs text-green-600 mt-1">🚗 Delivery Partner</div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowManagerModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
