import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiPost } from '../services/apiClient'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const emailParam = params.get('email') || ''
  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (emailParam) setEmail(emailParam)
  }, [emailParam])

  const handleVerify = async () => {
    setIsVerifying(true)
    setMessage('')
    try {
      if (!email) throw new Error('Email is required')
      if (!code) throw new Error('Code is required')
      if (typeof apiPost !== 'function') throw new Error('apiPost is not available. Check `src/services/apiClient.js` export and the import path.')
      // Request a verification token for registration flow
      const data = await apiPost('/auth/verify-otp', { email, code, forRegistration: true })
      setMessage('Email verified — returning to signup...')
      // If backend returned a verificationToken (for registration), store it so Signup can use it
      if (data?.verificationToken) {
        try { localStorage.setItem('verification_token', data.verificationToken) } catch (e) {}
      }
      // Redirect back to signup so the user can complete registration
      setTimeout(() => navigate('/signup'), 700)
    } catch (err) {
      // apiClient throws the parsed JSON body on non-OK responses
      const msg = err?.error || err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
      setMessage(msg || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      if (!email) throw new Error('Email is required')
      const data = await apiPost('/auth/send-otp', { email })
      setMessage(data?.message || 'OTP resent — check your email')
    } catch (err) {
      const msg = err?.error || err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
      setMessage(msg || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Verify your email</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code we sent to your email to complete registration.</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded mb-3" />
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="6-digit code" className="w-full p-3 border rounded mb-3" />
        <button onClick={handleVerify} disabled={isVerifying} className="w-full bg-green-600 text-white p-3 rounded mb-2">{isVerifying ? 'Verifying...' : 'Verify'}</button>
        <button onClick={handleResend} disabled={isResending} className="w-full bg-gray-100 p-3 rounded">{isResending ? 'Resending...' : 'Resend code'}</button>
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  )
}
