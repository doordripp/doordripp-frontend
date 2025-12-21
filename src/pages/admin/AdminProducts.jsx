import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter, RefreshCw } from 'lucide-react'
import { AdminButton, AdminTable } from '../../components/ui'
import { ImageKitUploader } from '../../components/Admin'
import { formatCurrency } from '../../utils/adminHelpers'
import adminAPI from '../../services/adminAPI'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, in-stock, out-of-stock
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getProducts({ search: searchTerm })
      setProducts(response.products || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError('Failed to load products. Please try again.')
      // Fallback to mock data for development
      setProducts([
        {
          id: '1',
          name: 'Premium Cotton T-Shirt',
          price: 2499,
          stock: 150,
          category: 'Clothing',
          status: 'Active',
          images: ['https://via.placeholder.com/150']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (product) => (
        <div className="flex items-center space-x-3 max-w-md">
          <div className="flex -space-x-2 flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              product.images.slice(0, 2).map((img, idx) => (
                <img 
                  key={idx}
                  src={img || 'https://via.placeholder.com/40'} 
                  alt={product.name}
                  className="w-10 h-10 rounded-md object-cover border-2 border-white"
                />
              ))
            ) : (
              <img 
                src="https://via.placeholder.com/40" 
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            )}
            {product.images && product.images.length > 2 && (
              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                +{product.images.length - 2}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate max-w-xs" title={product.name}>{product.name}</div>
            <div className="text-sm text-gray-500">{product.category}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (product) => formatCurrency(product.price)
    },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (product) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {product.stock}
        </span>
      )
    },
    {
      header: 'Collections',
      accessor: 'collections',
      render: (product) => (
        <div className="flex flex-wrap gap-1">
          {product.isNewArrival && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Top
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Featured
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (product) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {product.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (product) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleEditProduct(product)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit Product"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleToggleStock(product)}
            className={`${
              product.stock > 0 ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
            }`}
            title={product.stock > 0 ? 'Mark Out of Stock' : 'Mark In Stock'}
          >
            {product.stock > 0 ? '📦' : '✅'}
          </button>
          <button 
            onClick={() => handleDeleteProduct(product._id || product.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete Product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'in-stock' && product.stock > 0) ||
      (stockFilter === 'out-of-stock' && product.stock === 0)
    
    return matchesSearch && matchesStock
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowAddModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowAddModal(true)
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(id)
        setProducts(products.filter(p => {
          const pId = p._id || p.id
          return pId !== id
        }))
      } catch (err) {
        console.error('Failed to delete product:', err)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  const handleToggleStock = async (product) => {
    const productId = product._id || product.id
    const newStock = product.stock > 0 ? 0 : 100
    const action = newStock === 0 ? 'out of stock' : 'in stock'
    
    if (window.confirm(`Mark "${product.name}" as ${action}?`)) {
      try {
        const updated = await adminAPI.updateProduct(productId, { stock: newStock })
        setProducts(products.map(p => {
          const pId = p._id || p.id
          return pId === productId ? updated : p
        }))
      } catch (err) {
        console.error('Failed to update stock:', err)
        alert('Failed to update stock status. Please try again.')
      }
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      setSaving(true)
      if (editingProduct) {
        // Update existing product - use _id or id
        const productId = editingProduct._id || editingProduct.id
        const updated = await adminAPI.updateProduct(productId, productData)
        setProducts(products.map(p => {
          const pId = p._id || p.id
          const editId = editingProduct._id || editingProduct.id
          return pId === editId ? updated : p
        }))
      } else {
        // Add new product
        const newProduct = await adminAPI.createProduct(productData)
        setProducts([newProduct, ...products])
      }
      setShowAddModal(false)
    } catch (err) {
      console.error('Failed to save product:', err)
      console.error('Error details:', err.response?.data || err.message)
      alert(`Failed to save product: ${err.response?.data?.error || err.message || 'Please try again.'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchProducts}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <AdminButton onClick={handleAddProduct} className="flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Product</span>
          </AdminButton>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Products</option>
            <option value="in-stock">✅ In Stock</option>
            <option value="out-of-stock">❌ Out of Stock</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredProducts.length} products
          {stockFilter === 'out-of-stock' && filteredProducts.length > 0 && (
            <span className="ml-2 text-red-600 font-medium">
              ({filteredProducts.length} out of stock)
            </span>
          )}
        </div>
      </div>

      {/* Products Table */}
      <AdminTable 
        data={filteredProducts}
        columns={columns}
      />

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => setShowAddModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}

// Product Modal Component
function ProductModal({ product, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    stock: product?.stock || '',
    category: product?.category || 'Men',
    subcategory: product?.subcategory || '',
    dressStyle: product?.dressStyle || '',
    description: product?.description || '',
    details: product?.details || '',
    images: product?.images || [],
    colors: product?.colors || [],
    sizes: product?.sizes || [],
    rating: product?.rating || { rating: 4.5, reviews: 0 },
    isNewArrival: product?.isNewArrival || false,
    isBestSeller: product?.isBestSeller || false,
    isFeatured: product?.isFeatured || false
  })

  const categories = ['Men', 'Women', 'Accessories', 'Footwear']
  const subcategories = ['T-shirts', 'Shirts', 'Jeans', 'Shorts', 'Hoodies', 'Jackets', 'Dresses', 'Tops', 'Suits', 'Outfits', 'Kurtis', 'Casual Partywear', 'Bags', 'Watches', 'Belts', 'Sunglasses', 'Wallets', 'Caps', 'Sneakers', 'Boots', 'Formal Shoes', 'Sports Shoes', 'Casual Shoes', 'Sandals']
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42']
  const shoeSizes = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
  const availableColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate discount if original price is provided
    const price = parseFloat(formData.price)
    const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null
    const discount = originalPrice && originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : null

    onSave({
      ...formData,
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      stock: parseInt(formData.stock),
      image: formData.images[0] || '', // First image as main image
      rating: formData.rating,
      details: formData.details,
      dressStyle: formData.dressStyle || ''
    })
  }
  
  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }
  
  const toggleColor = (colorHex) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorHex)
        ? prev.colors.filter(c => c !== colorHex)
        : [...prev.colors, colorHex]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-auto">
        <h2 className="text-xl font-bold mb-4">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Cotton T-Shirt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dress Style <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.dressStyle}
                onChange={(e) => setFormData({...formData, dressStyle: e.target.value})}
                placeholder="e.g., A-line, Maxi, Bodycon"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 100"
                />
                <select
                  value={formData.stock > 0 ? 'in-stock' : 'out-of-stock'}
                  onChange={(e) => setFormData({...formData, stock: e.target.value === 'out-of-stock' ? 0 : 100})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  title="Quick stock status"
                >
                  <option value="in-stock">✅ In Stock</option>
                  <option value="out-of-stock">❌ Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2499"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₹) <span className="text-gray-500 text-xs">(optional - for discounts)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 39.99"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes *
            </label>
            <div className="flex flex-wrap gap-2">
              {(formData.category === 'Footwear' ? shoeSizes : availableSizes).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-md border-2 transition-colors ${
                    formData.sizes.includes(size)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Colors *
            </label>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(color => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => toggleColor(color.hex)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-all ${
                    formData.colors.includes(color.hex)
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={color.name}
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm">{color.name}</span>
                  {formData.colors.includes(color.hex) && (
                    <span className="text-xs text-black">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collections & Features
            </label>
            <div className="space-y-3 bg-gray-50 p-4 rounded-md">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({...formData, isNewArrival: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">New Arrival</span>
                  <p className="text-xs text-gray-500">Show this product in New Arrivals collection</p>
                </div>
                {formData.isNewArrival && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Active</span>
                )}
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Top Selling</span>
                  <p className="text-xs text-gray-500">Show this product in Top Selling collection</p>
                </div>
                {formData.isBestSeller && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">Active</span>
                )}
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Featured Product</span>
                  <p className="text-xs text-gray-500">Highlight this product on homepage and promotions</p>
                </div>
                {formData.isFeatured && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Active</span>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Product description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Details (long / rich text)
            </label>
            <textarea
              rows={6}
              value={formData.details}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed product information, specs, materials, care instructions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>
            <ImageKitUploader
              existingImages={formData.images}
              onUploadComplete={(images) => setFormData({...formData, images})}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && <RefreshCw size={16} className="animate-spin" />}
              <span>{product ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}