import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiPost } from '../services/apiClient'
import { Settings } from 'lucide-react'

export default function Profile() {
  const { user, logout, fetchMe } = useAuth()
  const navigate = useNavigate()
  const [preview, setPreview] = useState(user?.avatar || null)
  const [uploading, setUploading] = useState(false)

  // Check if user is admin
  const isAdmin = user?.roles && Array.isArray(user.roles) 
    ? user.roles.some(r => r.toUpperCase() === 'ADMIN')
    : false

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin')
    }
  }, [isAdmin, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
    // upload immediately
    uploadAvatarFromFile(file)
  }

  const uploadAvatarFromFile = async (file) => {
    try {
      setUploading(true)
      const reader = new FileReader()
      const p = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      // send base64 data URL to backend
      const res = await apiPost('/auth/avatar', { avatar: p })
      // refresh user from server
      await fetchMe()
      setUploading(false)
    } catch (e) {
      console.error('Upload failed', e)
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold">Not signed in</h2>
        <p className="mt-2 text-sm text-gray-600">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <div className="mt-6 bg-white border rounded-md shadow-sm p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400">No photo</div>
            )}
          </div>
          <div>
            <label className="inline-block bg-blue-600 text-white px-3 py-1 rounded cursor-pointer">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500">Name</div>
          <div className="text-lg font-medium">{user.name || '—'}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500">Email</div>
          <div className="text-lg font-medium">{user.email || '—'}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500">Role</div>
          <div className="text-lg font-medium">
            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                👑 Admin
              </span>
            ) : (
              <span className="text-gray-700">Customer</span>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-green-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <Settings size={18} />
              Go to Admin Panel
            </Link>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
