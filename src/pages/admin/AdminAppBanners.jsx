import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, RefreshCw, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { AdminButton, AdminTable } from '../../components/ui';
import { ImageKitUploader } from '../../components/Admin';
import adminAPI from '../../services/adminAPI';

export default function AdminAppBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    imageUrl: '',
    link: '#',
    type: 'promo',
    platform: 'app',
    order: 0
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getBanners({ platform: 'app' });
      setBanners(data.banners || []);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUploadComplete = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      setNewBanner({ ...newBanner, imageUrl: imageUrls[imageUrls.length - 1] });
    }
  };

  const handleSaveBanner = async () => {
    if (!newBanner.imageUrl) {
      setError('Please upload an image first');
      return;
    }
    try {
      setSaving(true);
      // Force platform to be 'app'
      await adminAPI.createBanner({ ...newBanner, platform: 'app' });
      setShowAddModal(false);
      setNewBanner({ title: '', imageUrl: '', link: '#', type: 'promo', platform: 'app', order: 0 });
      fetchBanners();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateBannerStatus(id, !currentStatus);
      fetchBanners();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this app banner?')) return;
    try {
      await adminAPI.deleteBanner(id);
      fetchBanners();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const columns = [
    {
      header: 'Banner',
      accessor: 'imageUrl',
      render: (banner) => (
        <div className="flex items-center space-x-3">
          <img 
            src={banner.imageUrl} 
            alt={banner.title} 
            className="w-20 h-20 object-cover rounded-lg border shadow-sm aspect-square"
          />
          <div>
            <p className="font-semibold text-gray-900">{banner.title}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{banner.type}</p>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                📱 App
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Link',
      accessor: 'link',
      render: (banner) => (
        <span className="text-sm text-gray-700">{banner.link}</span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (banner) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleDelete(banner._id)} 
            className="text-red-600 hover:text-red-900"
            title="Delete banner"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (banner) => (
        <button 
          onClick={() => toggleStatus(banner._id, banner.isActive)}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {banner.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {banner.isActive ? 'Active' : 'Inactive'}
        </button>
      )
    }
  ];

  return (
    <div className="p-6 pb-20 lg:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📱 Mobile App Banners</h1>
          <p className="text-gray-500">Manage promotional banners for mobile app only</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs font-semibold text-blue-700">📱 MOBILE APP ONLY</span>
            <span className="text-xs text-blue-600">These banners won't appear on website</span>
          </div>
        </div>
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={fetchBanners}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </AdminButton>
          <AdminButton onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add App Banner
          </AdminButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <AdminTable data={banners} columns={columns} loading={loading} />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Mobile App Banner</h2>
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-semibold text-blue-700">📱 For Mobile App</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Title
                  <span className="text-xs text-gray-500 ml-2">(Will be shown in app)</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Summer Sale 2026"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Redirection Link
                  <span className="text-xs text-gray-500 ml-2">(Screen/Product to open)</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="/products/men or product_id"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">💡 Use '#' for no action, or product/category path</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Type
                </label>
                <select
                  value={newBanner.type}
                  onChange={(e) => setNewBanner({...newBanner, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="promo">Promo Banner</option>
                  <option value="hero">Hero Banner</option>
                  <option value="sale">Sale Banner</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image (Landscape recommended - 16:9 ratio)
                  <span className="text-xs text-gray-500 ml-2">Best: 1920x1080px</span>
                </label>
                <div className="border-2 border-dashed rounded-xl p-4 bg-gray-50">
                  {newBanner.imageUrl ? (
                    <div className="relative group">
                      <img 
                        src={newBanner.imageUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button 
                        onClick={() => setNewBanner({...newBanner, imageUrl: ''})}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✓ Ready for app
                      </div>
                    </div>
                  ) : (
                    <ImageKitUploader onUploadComplete={handleUploadComplete} />
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBanner}
                  disabled={saving || !newBanner.imageUrl}
                  className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
                >
                  {saving ? 'Uploading...' : '📱 Upload to App'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
