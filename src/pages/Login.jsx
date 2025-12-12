import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthInput, GoogleIcon } from '../features/auth'
import { apiPost } from '../services/apiClient'
import { authStorage } from '../utils/auth'
import { useAuth } from '../context/AuthContext'
// OTP via email (nodemailer) - Firebase SMS removed

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  // phone removed, using email-only flows
  const { fetchMe } = useAuth()
  // OTP states (email-based)
  const [otpMode, setOtpMode] = useState(false)
  const [emailForOtp, setEmailForOtp] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  const handleEmailOrPhoneChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, emailOrPhone: value }))
    if (errors.emailOrPhone) setErrors(prev => ({ ...prev, emailOrPhone: '' }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'Email or phone number is required'
    } else {
      // Email validation only
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.emailOrPhone)) newErrors.emailOrPhone = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})

    try {
      const payload = { email: formData.emailOrPhone, password: formData.password }
      const data = await apiPost('/auth/login', payload)
      // server sets httpOnly cookie for session; store returned user locally
      const user = data.user || data
      authStorage.setUser({ _id: user.id || user._id, name: user.name, email: user.email, role: user.roles || user.role })
      // populate global auth state from backend cookies and redirect based on role
      let me = null
      try { me = await fetchMe() } catch (e) { /* ignore */ }
      const current = me || authStorage.getUser() || {}
      const roles = current?.roles || current?.role || []
      const roleArray = Array.isArray(roles) ? roles : [roles]
      if (roleArray.includes('ADMIN') || roleArray.includes('SUPER_ADMIN')) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      const msg = error?.error || error?.message || (typeof error === 'string' ? error : JSON.stringify(error))
      setErrors({ submit: msg || 'Login failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // OTP handlers
  const handleSendOtp = async () => {
    setIsSendingOtp(true)
    try {
      const email = emailForOtp.trim()
      if (!email) throw new Error('Email is required')
      // Request backend to send email OTP
      await apiPost('/auth/send-otp', { email })
      // show instruction to check email
      setErrors(prev => ({ ...prev, submit: 'OTP sent to your email. Please check and enter the code.' }))
    } catch (err) {
      const msg = err?.error || err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
      setErrors(prev => ({ ...prev, submit: msg || 'Failed to send OTP' }))
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsVerifyingOtp(true)
    try {
      const email = emailForOtp.trim()
      if (!email) throw new Error('Email is required')
      const data = await apiPost('/auth/verify-otp', { email, code: otpCode })
      const user = data.user || data
      authStorage.setUser({ _id: user.id || user._id, name: user.name, email: user.email, role: user.roles || user.role })
      let me = null
      try { me = await fetchMe() } catch (e) { /* ignore */ }
      const current = me || authStorage.getUser() || {}
      const roles = current?.roles || current?.role || []
      const roleArray = Array.isArray(roles) ? roles : [roles]
      if (roleArray.includes('ADMIN') || roleArray.includes('SUPER_ADMIN')) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err?.error || err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
      setErrors(prev => ({ ...prev, submit: msg || 'OTP verification failed' }))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleGoogleLogin = () => {
    // Use relative /api so Vite dev proxy forwards to backend and
    // the browser remains same-origin for cookies.
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    // Redirect browser to backend Google OAuth endpoint
    window.location.href = `${apiBase}/auth/google`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-black tracking-wide">
            DOORDRIPP
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue shopping
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Phone Input */}
            <AuthInput
              type="text"
              name="emailOrPhone"
              placeholder="Email"
              value={formData.emailOrPhone}
              onChange={handleEmailOrPhoneChange}
              icon={Mail}
              error={errors.emailOrPhone}
              required
            />

            {/* Password Input */}
            <AuthInput
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              error={errors.password}
              required
            />

            {/* OTP Sign-in toggle */}
            <div className="mt-2">
              <button type="button" onClick={() => setOtpMode(v => !v)} className="text-sm text-blue-600">{otpMode ? 'Use password login' : 'Sign in with Email OTP'}</button>
            </div>

            {otpMode && (
              <div className="space-y-3 mt-3">
                <div>
                  <input value={emailForOtp} onChange={(e)=>setEmailForOtp(e.target.value)} placeholder="Email for OTP" className="w-full p-3 border rounded" />
                </div>
                <div>
                  <button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-gray-800 text-white py-2 rounded">
                    {isSendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                <div>
                  <input value={otpCode} onChange={(e)=>setOtpCode(e.target.value)} placeholder="Enter OTP" className="w-full p-3 border rounded" />
                  <button type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="w-full bg-green-600 text-white py-2 rounded mt-2">
                    {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-black hover:text-gray-700 font-medium transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-black font-semibold hover:text-gray-700 transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}