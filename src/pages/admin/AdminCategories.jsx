import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AdminButton, AdminTable } from '../../components/ui';
import { ImageKitUploader } from '../../components/Admin';
import adminAPI from '../../services/adminAPI';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    description: '',
    order: 0
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleUploadComplete = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      setNewCategory({ ...newCategory, imageUrl: imageUrls[imageUrls.length - 1] });
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name || !newCategory.imageUrl) {
      setError('Name and Image are required');
      return;
    }
    try {
      setSaving(true);
      await adminAPI.createCategory(newCategory);
      setShowAddModal(false);
      setNewCategory({ name: '', slug: '', imageUrl: '', description: '', order: 0 });
      fetchCategories();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateCategoryStatus(id, !currentStatus);
      fetchCategories();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminAPI.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const columns = [
    {
      header: 'Category',
      render: (cat) => (
        <div className="flex items-center space-x-3">
          <img 
            src={cat.imageUrl} 
            alt={cat.name} 
            className="w-12 h-12 object-cover rounded-lg border"
          />
          <div>
            <p className="font-semibold text-gray-900">{cat.name}</p>
            <p className="text-xs text-gray-500">{cat.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (cat) => (
        <button 
          onClick={() => toggleStatus(cat._id, cat.isActive)}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {cat.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {cat.isActive ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      header: 'Actions',
      render: (cat) => (
        <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-900">
          <Trash2 className="w-5 h-5" />
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500">Manage categories and their display images for the App</p>
        </div>
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={fetchCategories}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </AdminButton>
          <AdminButton onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </AdminButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <AdminTable data={categories} columns={columns} loading={loading} />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Casual Wear"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Short description..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                <div className="border-2 border-dashed rounded-xl p-4 bg-gray-50">
                  {newCategory.imageUrl ? (
                    <div className="relative group">
                      <img src={newCategory.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mx-auto" />
                      <button 
                        onClick={() => setNewCategory({...newCategory, imageUrl: ''})}
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
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCategory}
                  disabled={saving || !newCategory.imageUrl || !newCategory.name}
                  className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
