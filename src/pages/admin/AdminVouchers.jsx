import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, RefreshCw, TicketPercent, Power, Search } from 'lucide-react';
import adminAPI from '../../services/adminAPI';
import { useAuth } from '../../context/AuthContext';
import AdminInput from '../../components/ui/AdminInput';
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils';

const initialForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  maxDiscount: '',
  minOrderValue: '0',
  expiryDate: '',
  usageLimit: '',
  perUserLimit: '1',
  isActive: true
};

const formatDate = (value) => {
  if (!value) return 'No expiry';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'Invalid date';
  return dt.toLocaleString();
};

const formatDiscount = (voucher) => {
  if (voucher.discountType === 'percentage') {
    const cap = voucher.maxDiscount ? ` (max ₹${voucher.maxDiscount})` : '';
    return `${voucher.discountValue}%${cap}`;
  }
  return `₹${voucher.discountValue}`;
};

export default function AdminVouchers() {
  const { user } = useAuth();
  const isDeliveryPartner = hasDeliveryPartnerAccess(user);

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const listQuery = useMemo(() => {
    const query = {};
    if (search.trim()) query.search = search.trim().toUpperCase();
    if (statusFilter === 'active') query.isActive = true;
    if (statusFilter === 'inactive') query.isActive = false;
    return query;
  }, [search, statusFilter]);

  const fetchVouchers = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await adminAPI.getVouchers(listQuery);
      setVouchers(data?.vouchers || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load vouchers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [listQuery]);

  const onInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderValue: form.minOrderValue,
        usageLimit: form.usageLimit || null,
        perUserLimit: form.perUserLimit || null,
        expiryDate: form.expiryDate || null,
        isActive: form.isActive
      };

      if (form.discountType === 'percentage') {
        payload.maxDiscount = form.maxDiscount || null;
      }

      await adminAPI.createVoucher(payload);
      setForm(initialForm);
      setSuccess('Voucher created successfully');
      fetchVouchers(true);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to create voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (voucherId) => {
    setError('');
    setSuccess('');
    try {
      await adminAPI.toggleVoucherStatus(voucherId);
      setSuccess('Voucher status updated');
      fetchVouchers(true);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to update voucher status');
    }
  };

  if (isDeliveryPartner) {
    return <Navigate to="/admin/orders" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Vouchers</h1>
          <p className="text-gray-600 text-sm">Create and manage checkout discount vouchers securely.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchVouchers(true)}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleCreateVoucher} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-gray-900">
          <TicketPercent className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Add Coupon</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdminInput
            label="Voucher Code"
            id="voucher-code"
            value={form.code}
            onChange={(e) => onInputChange('code', e.target.value.toUpperCase())}
            required
            className="uppercase"
          />

          <div className="relative">
            <select
              id="discount-type"
              value={form.discountType}
              onChange={(e) => onInputChange('discountType', e.target.value)}
              className="peer block w-full rounded-lg border border-gray-300 bg-transparent px-3 pb-2.5 pt-4 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-0"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <label
              htmlFor="discount-type"
              className="absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text bg-white px-1 text-sm text-gray-500 duration-300"
            >
              Discount Type
            </label>
          </div>

          <AdminInput
            label={form.discountType === 'percentage' ? 'Discount %' : 'Discount amount'}
            id="discount-value"
            type="number"
            min="0"
            step="0.01"
            value={form.discountValue}
            onChange={(e) => onInputChange('discountValue', e.target.value)}
            required
          />

          <AdminInput
            label="Min order value"
            id="min-order-value"
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderValue}
            onChange={(e) => onInputChange('minOrderValue', e.target.value)}
          />

          {form.discountType === 'percentage' && (
            <AdminInput
              label="Max discount (optional)"
              id="max-discount"
              type="number"
              min="0"
              step="0.01"
              value={form.maxDiscount}
              onChange={(e) => onInputChange('maxDiscount', e.target.value)}
            />
          )}

          <AdminInput
            label="Expiry Date"
            id="expiry-date"
            type="datetime-local"
            value={form.expiryDate}
            onChange={(e) => onInputChange('expiryDate', e.target.value)}
          />

          <AdminInput
            label="Usage limit (optional)"
            id="usage-limit"
            type="number"
            min="1"
            step="1"
            value={form.usageLimit}
            onChange={(e) => onInputChange('usageLimit', e.target.value)}
          />

          <AdminInput
            label="Per-user limit"
            id="per-user-limit"
            type="number"
            min="1"
            step="1"
            value={form.perUserLimit}
            onChange={(e) => onInputChange('perUserLimit', e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onInputChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active after creation
          </label>

          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={saving}
          >
            <Plus className="mr-2 h-4 w-4" />
            {saving ? 'Creating...' : 'Create Voucher'}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:w-40"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Discount</th>
                <th className="px-3 py-2">Rules</th>
                <th className="px-3 py-2">Usage</th>
                <th className="px-3 py-2">Expiry</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-6 text-center text-gray-500">Loading vouchers...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-6 text-center text-gray-500">No vouchers found</td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher._id} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-semibold text-gray-900">{voucher.code}</td>
                    <td className="px-3 py-3 text-gray-700">{formatDiscount(voucher)}</td>
                    <td className="px-3 py-3 text-gray-700">
                      Min ₹{voucher.minOrderValue || 0}
                      <br />
                      Per-user: {voucher.perUserLimit ?? 1}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {voucher.usedCount || 0}
                      {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ' / unlimited'}
                    </td>
                    <td className="px-3 py-3 text-gray-700">{formatDate(voucher.expiryDate)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${voucher.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {voucher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(voucher._id)}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Power className="mr-1 h-3.5 w-3.5" />
                        {voucher.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
