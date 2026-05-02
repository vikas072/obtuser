const path = require('path')
const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const Razorpay = require('razorpay')
const admin = require('firebase-admin')

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Payment server is running correctly!')
})

const PAYMENT_AMOUNT_PAISE = 2900

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sk3cwe4bRMi6Qp',
  key_secret: process.env.RAZORPAY_SECRET,
})

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } else {
    console.warn(
      'Firebase Admin env vars are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    )
  }
}

const firestore = admin.apps.length ? admin.firestore() : null

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { uid, semesterId } = req.body || {}

    if (!uid || !semesterId) {
      return res.status(400).json({ error: 'uid and semesterId are required' })
    }

    if (!process.env.RAZORPAY_SECRET) {
      return res
        .status(500)
        .json({ error: 'RAZORPAY_SECRET is not configured on server' })
    }

    const order = await razorpay.orders.create({
      amount: PAYMENT_AMOUNT_PAISE,
      currency: 'INR',
      receipt: `optusers_${uid}_${semesterId}_${Date.now()}`,
      notes: {
        uid,
        semesterId,
      },
    })

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('create-order failed:', error)
    return res.status(500).json({ error: 'Failed to create order' })
  }
})

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { uid, semesterId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {}

    if (!uid || !semesterId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' })
    }

    if (!process.env.RAZORPAY_SECRET) {
      return res
        .status(500)
        .json({ error: 'RAZORPAY_SECRET is not configured on server' })
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Invalid signature' })
    }

    if (!firestore) {
      return res
        .status(500)
        .json({ verified: false, error: 'Firebase Admin is not configured' })
    }

    // Update user data: mark as paid and add the semester to purchasedSemesters array
    await firestore.collection('users').doc(uid).set(
      {
        isPaid: true,
        purchasedSemesters: admin.firestore.FieldValue.arrayUnion(semesterId),
        lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
        [`payments.${razorpay_order_id}`]: {
          razorpayPaymentId: razorpay_payment_id,
          semesterId: semesterId,
          amount: PAYMENT_AMOUNT_PAISE / 100,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    )

    return res.json({ verified: true })
  } catch (error) {
    console.error('verify failed:', error)
    return res.status(500).json({ verified: false, error: 'Verification failed' })
  }
})

const port = Number(process.env.PORT) || 5000
app.listen(port, () => {
  console.log(`Payment server running on port ${port}`)
})
