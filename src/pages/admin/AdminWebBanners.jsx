import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AdminButton, AdminTable } from '../../components/ui';
import { ImageKitUploader } from '../../components/Admin';
import adminAPI from '../../services/adminAPI';

export default function AdminWebBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    imageUrl: '',
    link: '#',
    type: 'promo',
    platform: 'website',
    order: 0
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getBanners({ platform: 'website' });
      setBanners(data.banners || []);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      setError('Failed to load website banners');
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
      await adminAPI.createBanner({ ...newBanner, platform: 'website' });
      setShowAddModal(false);
      setNewBanner({ title: '', imageUrl: '', link: '#', type: 'promo', platform: 'website', order: 0 });
      fetchBanners();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save website banner');
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
    if (!window.confirm('Delete this website banner?')) return;
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
            className="w-20 h-20 object-cover rounded-lg border shadow-sm aspect-video"
          />
          <div>
            <p className="font-semibold text-gray-900">{banner.title}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{banner.type}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Link',
      accessor: 'link',
      render: (banner) => <span className="text-sm text-gray-600">{banner.link}</span>
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (banner) => (
        <button 
          onClick={() => handleDelete(banner._id)} 
          className="text-red-600 hover:text-red-900 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (banner) => (
        <button 
          onClick={() => toggleStatus(banner._id, banner.isActive)}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌐 Website Banners</h1>
          <p className="text-gray-500 text-sm">Manage banners specifically for the web frontend</p>
        </div>
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={fetchBanners}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </AdminButton>
          <AdminButton onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Web Banner
          </AdminButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <AdminTable data={banners} columns={columns} loading={loading} />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Add Website Banner</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="e.g., Seasonal Sale"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirection Link</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="/products/category"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image (Wide Landscape)</label>
                <div className="border-2 border-dashed rounded-xl p-4 bg-gray-50">
                  {newBanner.imageUrl ? (
                    <div className="relative group">
                      <img src={newBanner.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        onClick={() => setNewBanner({...newBanner, imageUrl: ''})}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBanner}
                  disabled={saving || !newBanner.imageUrl}
                  className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Uploading...' : 'Upload to Website'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
