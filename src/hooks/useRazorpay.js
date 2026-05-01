import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { markUserPaid } from '@/src/firebase'
import { useAuth } from '@/src/AuthContext'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const PAYMENT_AMOUNT_PAISE = 2900

let razorpayScriptPromise = null

const loadRazorpayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = RAZORPAY_SCRIPT_URL
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  return razorpayScriptPromise
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, refreshUserData } = useAuth()

  const startPayment = useCallback(async () => {
    if (!user?.uid) {
      toast.error('Please login before making a payment.')
      return
    }

    setIsLoading(true)

    try {
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout. Please retry.')
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''

      const orderResponse = await fetch(`${apiBaseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order.')
      }

      const orderData = await orderResponse.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Sk3cwe4bRMi6Qp',
        amount: PAYMENT_AMOUNT_PAISE,
        currency: 'INR',
        name: 'Optusers',
        description: 'Lifetime Access - One Time Payment',
        order_id: orderData.orderId,
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${apiBaseUrl}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: user.uid,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed.')
            }

            const verifyData = await verifyResponse.json()

            if (!verifyData.verified) {
              throw new Error('Payment could not be verified.')
            }

            await markUserPaid(user.uid)
            await refreshUserData(user.uid)
            toast.success('Payment successful! Lifetime access unlocked.')
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Payment succeeded but verification failed.'
            toast.error(message)
          }
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', (errorEvent) => {
        const description = errorEvent?.error?.description
        toast.error(description || 'Payment failed. Please try again.')
      })
      paymentObject.open()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to start payment.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [refreshUserData, user])

  return {
    startPayment,
    isLoading,
  }
}
