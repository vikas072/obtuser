import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  signInWithPopup,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const hasFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean)

const app = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null
const storage = app ? getStorage(app) : null

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

const ensureFirebaseConfigured = () => {
  if (!hasFirebaseConfig || !auth || !db || !storage) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to .env.local.'
    )
  }
}

export const signInWithGoogle = () => {
  ensureFirebaseConfigured()

  return signInWithPopup(auth, googleProvider).catch((error) => {
    const popupFallbackErrors = new Set([
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
    ])

    if (popupFallbackErrors.has(error?.code)) {
      return signInWithRedirect(auth, googleProvider)
    }

    throw error
  })
}

export const getUserData = async (uid) => {
  if (!uid) return null
  ensureFirebaseConfigured()

  const userRef = doc(db, 'users', uid)
  const userSnapshot = await getDoc(userRef)

  return userSnapshot.exists() ? userSnapshot.data() : null
}

export { app, auth, db, storage, hasFirebaseConfig }
