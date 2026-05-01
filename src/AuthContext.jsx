'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, getUserData, hasFirebaseConfig, signInWithGoogle } from './firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshUserData = async (uid) => {
    if (!uid) {
      setIsPaid(false)
      return null
    }

    const data = await getUserData(uid)
    setIsPaid(Boolean(data?.isPaid))
    return data
  }

  const safeRefreshUserData = async (uid) => {
    try {
      return await refreshUserData(uid)
    } catch (error) {
      // Firestore rules can block reads for new users; keep auth session usable.
      console.warn('Unable to read user profile from Firestore:', error)
      setIsPaid(false)
      return null
    }
  }

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false)
      return
    }

    let unsubscribe = () => {}
    let mounted = true

    const initAuth = async () => {
      try {
        // Completes pending Google redirect sign-in flow, if present.
        await getRedirectResult(auth)
      } catch (error) {
        console.error('Redirect sign-in failed:', error)
      }

      if (!mounted) return

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser)

        if (!currentUser) {
          setIsPaid(false)
          setLoading(false)
          return
        }

        await safeRefreshUserData(currentUser.uid)
        setLoading(false)
      })
    }

    initAuth()

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = async () => {
    const result = await signInWithGoogle()
    await safeRefreshUserData(result.user.uid)
    return result
  }

  const logout = async () => {
    if (!auth) {
      setUser(null)
      setIsPaid(false)
      return
    }

    await signOut(auth)
    setUser(null)
    setIsPaid(false)
  }

  const value = useMemo(
    () => ({
      user,
      isPaid,
      loading,
      login,
      logout,
      refreshUserData: safeRefreshUserData,
    }),
    [user, isPaid, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
