import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { AuthInput, GoogleIcon } from '../features/auth'
import { apiPost } from '../services/apiClient'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    
    profileImage: null,
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (India - 10 digits)
    if (!formData.phone) {
      newErrors.phone = 'Mobile number is required'
    } else {
      const phoneRegex = /^[6-9]\d{9}$/
      if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit Indian mobile number'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 uppercase letter and 1 number'
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
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
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        termsAccepted: formData.agreeToTerms
      }
      await apiPost('/auth/register-initiate', payload)

      // Persist email for the verification page as a fallback
      try { localStorage.setItem('pending_email', formData.email) } catch (err) { console.warn('pending_email store failed', err) }

      // Always move to email verification step on success
      navigate('/verify-email', { 
        state: { email: formData.email },
        replace: true 
      })
      return
      
      // The rest of this flow occurs after verification
    } catch (error) {
      const msg = error?.message || 'Registration failed. Please try again.'
      setErrors({ submit: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://doordripp-backend.onrender.com/api'
    // Redirect browser to backend Google OAuth endpoint
    window.location.href = `${apiBase}/auth/google`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign up</h2>
          <p className="mt-2 text-sm text-gray-600">Fill in your details to get started</p>
        </div>
        <div className="auth-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              icon={User}
              error={errors.fullName}
              required
            />
            <AuthInput
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              error={errors.email}
              required
            />
            <AuthInput
              type="tel"
              name="phone"
              placeholder="Enter your mobile number"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              error={errors.phone}
              required
            />
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
            <AuthInput
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              error={errors.confirmPassword}
              required
            />
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2 accent-black"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-5">
                  I agree to DOORDRIPP's{' '}
                  <Link to="/terms" className="text-black hover:text-gray-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-black hover:text-gray-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
              )}
            </div>
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-black font-semibold hover:text-gray-700 transition-colors"
              >
                Sign in
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-2xl font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
