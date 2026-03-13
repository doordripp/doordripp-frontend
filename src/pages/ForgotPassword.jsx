import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowLeft } from 'lucide-react'
import { AuthInput } from '../features/auth'
import { apiPost } from '../services/apiClient'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email/phone, 2: OTP verification, 3: success
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    otp: ['', '', '', '', '', '']
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPhone, setIsPhone] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

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

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...formData.otp]
    newOtp[index] = value
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }))
    setErrors({})

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const validateEmailOrPhone = () => {
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

  const validateOTP = () => {
    const otpCode = formData.otp.join('')
    if (otpCode.length !== 6) {
      return { otp: 'Please enter a 6-digit OTP' }
    }
    return {}
  }

  const handleSubmitEmailOrPhone = async (e) => {
    e.preventDefault()
    
    const newErrors = validateEmailOrPhone()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      // Extract email from the input (ignore phone for now)
      const email = isPhone ? null : formData.emailOrPhone
      if (!email) {
        setErrors({ submit: 'Please enter an email address to reset your password.' })
        setIsLoading(false)
        return
      }

      await apiPost('/auth/forgot-password', {
        email
      })
      setErrors({ submit: '' })
      setStep(3) // Skip OTP step and show success message
    } catch (error) {
      setErrors({ submit: error?.message || 'Failed to send password reset email. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    const newErrors = validateOTP()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const otpCode = formData.otp.join('')
      const response = await apiPost('/auth/verify-forgot-password-otp', {
        emailOrPhone: formData.emailOrPhone,
        otp: otpCode
      })
      
      // Store the reset token in session storage for the reset password page
      sessionStorage.setItem('passwordResetToken', response.token || otpCode)
      sessionStorage.setItem('resetEmail', formData.emailOrPhone)
      
      setStep(3)
    } catch (error) {
      setErrors({ submit: error?.message || 'Invalid OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    try {
      await apiPost('/auth/forgot-password', {
        emailOrPhone: formData.emailOrPhone
      })
      setCountdown(60)
      setFormData(prev => ({
        ...prev,
        otp: ['', '', '', '', '', '']
      }))
    } catch (error) {
      setErrors({ submit: 'Failed to resend OTP. Please try again.' })
    } finally {
      setIsResending(false)
    }
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="font-semibold text-gray-900 mb-6">
              {formData.emailOrPhone}
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
              The link will expire in 1 hour. If you don't receive it, check your spam folder.
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

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-extrabold text-black tracking-wide">
              DOORDRIPP
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verify OTP
            </h2>
            <p className="mt-2 text-gray-600">
              We've sent a link to reset password {formData.emailOrPhone}
            </p>
          </div>

          {/* OTP Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-gray-100">
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                    placeholder="0"
                  />
                ))}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {errors.otp && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.otp}</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Didn't receive the OTP?{' '}
                  {countdown > 0 ? (
                    <span className="text-gray-400">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-black font-semibold hover:underline disabled:opacity-50"
                    >
                      {isResending ? 'Resending...' : 'Resend OTP'}
                    </button>
                  )}
                </p>
              </div>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setFormData(prev => ({
                    ...prev,
                    otp: ['', '', '', '', '', '']
                  }))
                  setErrors({})
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Email/Phone Input
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
            Enter your email and we'll send you a password reset link
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-gray-100">
          <form onSubmit={handleSubmitEmailOrPhone} className="space-y-6">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
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
