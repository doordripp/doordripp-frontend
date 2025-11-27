// Firebase client helpers for OTP sign-in
import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export function setupRecaptcha(containerId = 'recaptcha-container') {
  // size: 'invisible' for invisible reCAPTCHA
  return new RecaptchaVerifier(containerId, { size: 'invisible' }, auth)
}

export async function sendSmsVerification(phone, verifier) {
  // phone should be E.164 format, e.g. +911234567890
  return await signInWithPhoneNumber(auth, phone, verifier)
}

export async function confirmCode(confirmationResult, code) {
  const userCred = await confirmationResult.confirm(code)
  const idToken = await userCred.user.getIdToken()
  return { user: userCred.user, idToken }
}

export default {
  setupRecaptcha,
  sendSmsVerification,
  confirmCode
}
