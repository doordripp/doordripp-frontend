import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowLeft } from 'lucide-react'
import { AuthInput } from '../features/auth'

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    emailOrPhone: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPhone, setIsPhone] = useState(false)

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Reset password for:', formData.emailOrPhone)
      setIsSubmitted(true)
    } catch (error) {
      setErrors({ submit: 'Failed to send reset instructions. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check your {isPhone ? 'phone' : 'email'}
            </h2>
            
            <p className="text-gray-600 mb-8">
              We've sent password reset instructions to{' '}
              <span className="font-medium text-gray-900">
                {formData.emailOrPhone}
              </span>
            </p>
            
            <Link
              to="/login"
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 inline-flex items-center justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
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
            Forgot password?
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email or phone number and we'll send you reset instructions
          </p>
        </div>

        {/* Reset Form */}
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

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Reset Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending instructions...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            {/* Back to Login */}
            <Link
              to="/login"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}