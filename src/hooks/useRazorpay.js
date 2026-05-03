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

  /**
   * @param {string} semesterId
   * @param {string[]} subjectIds
   * @param {string} couponCode
   * @param {'upi' | null} preferredMethod
   */
  const startPayment = useCallback(async (semesterId, subjectIds = [], couponCode = '', preferredMethod = null) => {
    if (!user?.uid) {
      toast.error('Please login before making a payment.')
      return
    }

    if (!semesterId) {
      toast.error('Semester selection is required.')
      return
    }

    setIsLoading(true)

    try {
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout. Please retry.')
      }

      const apiBaseUrl = '' // Use relative paths for Next.js API routes

      const orderResponse = await fetch(`${apiBaseUrl}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, semesterId, subjectIds, couponCode }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order. Check if Vercel Environment Variables are set.');
      }

      const orderData = await orderResponse.json()

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in your .env file.');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount, // Use the amount from server
        currency: 'INR',
        name: 'Optusers',
        description: `Unlock ${subjectIds.length} Subjects for Semester ${semesterId.replace('sem', '')}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        config: preferredMethod === 'upi' ? {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true,
            },
          },
        } : undefined,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${apiBaseUrl}/api/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: user.uid,
                semesterId,
                subjectIds,
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

            await refreshUserData(user.uid)
            toast.success(`Selected subjects unlocked successfully!`)
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
