import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Phone, Lock } from 'lucide-react'
import { AuthInput, GoogleIcon } from '../features/auth'
import { apiPost } from '../services/apiClient'
import { authStorage } from '../utils/auth'
import { useAuth } from '../context/AuthContext'
import { setupRecaptcha, sendSmsVerification, confirmCode } from '../services/firebaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPhone, setIsPhone] = useState(false)
  const { fetchMe } = useAuth()
  // OTP states
  const [otpMode, setOtpMode] = useState(false)
  const [phoneForOtp, setPhoneForOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  // Detect if input is phone number or email
  const handleEmailOrPhoneChange = (e) => {
    const value = e.target.value
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    
    setIsPhone(phoneRegex.test(value) && value.length > 5)
    setFormData(prev => ({
      ...prev,
      emailOrPhone: value
    }))
    
    // Clear error when user starts typing
    if (errors.emailOrPhone) {
      setErrors(prev => ({ ...prev, emailOrPhone: '' }))
    }
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
    } else if (!isPhone) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Please enter a valid email address'
      }
    } else {
      // Phone validation
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
      if (!phoneRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Please enter a valid phone number'
      }
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
      // populate global auth state from backend cookies
      try { await fetchMe() } catch (e) { /* ignore */ }
      // On success, redirect to home
      navigate('/')
    } catch (error) {
      const msg = error?.message || 'Login failed. Please try again.'
      setErrors({ submit: msg })
    } finally {
      setIsLoading(false)
    }
  }

  // OTP handlers
  const handleSendOtp = async () => {
    setIsSendingOtp(true)
    try {
      const phone = phoneForOtp.trim()
      if (!phone) throw new Error('Phone is required')
      // ensure E.164 format; here we assume user enters full with + or country code
      const verifier = setupRecaptcha('recaptcha-container')
      const confirmation = await sendSmsVerification(phone, verifier)
      setConfirmationResult(confirmation)
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to send OTP' }))
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsVerifyingOtp(true)
    try {
      if (!confirmationResult) throw new Error('No OTP request found')
      const res = await confirmCode(confirmationResult, otpCode)
      const idToken = res.idToken
      // send idToken to backend to exchange for app JWT cookie
      const data = await apiPost('/auth/firebase', { idToken })
      const user = data.user || data
      authStorage.setUser({ _id: user.id || user._id, name: user.name, email: user.email, role: user.roles || user.role })
      try { await fetchMe() } catch (e) { /* ignore */ }
      navigate('/')
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || 'OTP verification failed' }))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
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
              placeholder="Email or Phone Number"
              value={formData.emailOrPhone}
              onChange={handleEmailOrPhoneChange}
              icon={isPhone ? Phone : Mail}
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
              <button type="button" onClick={() => setOtpMode(v => !v)} className="text-sm text-blue-600">{otpMode ? 'Use password login' : 'Sign in with SMS (OTP)'}</button>
            </div>

            {otpMode && (
              <div className="space-y-3 mt-3">
                <div>
                  <input value={phoneForOtp} onChange={(e)=>setPhoneForOtp(e.target.value)} placeholder="Phone (E.164, e.g. +911234567890)" className="w-full p-3 border rounded" />
                </div>
                <div id="recaptcha-container"></div>
                {!confirmationResult ? (
                  <button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-gray-800 text-white py-2 rounded">
                    {isSendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <>
                    <input value={otpCode} onChange={(e)=>setOtpCode(e.target.value)} placeholder="Enter OTP" className="w-full p-3 border rounded" />
                    <button type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="w-full bg-green-600 text-white py-2 rounded mt-2">
                      {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </>
                )}
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