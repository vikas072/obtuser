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

const BASE_PRICE_PAISE = 29900 // ₹299
const COUPONS = {
  'SAVE90': 2900, // ₹29
  'OFF90': 2900,  // ₹29
  'EXAM90': 2900, // ₹29
}

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
if (!razorpayKeyId) {
  console.error('CRITICAL: RAZORPAY_KEY_ID is missing in environment variables.');
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
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

app.post('/api/create-order', createOrderHandler)
app.post('/api/payment/create-order', createOrderHandler)

async function createOrderHandler(req, res) {
  try {
    const { uid, semesterId, subjectIds, couponCode } = req.body || {}

    if (!uid || !semesterId) {
      return res.status(400).json({ error: 'uid and semesterId are required' })
    }

    if (!process.env.RAZORPAY_SECRET) {
      return res
        .status(500)
        .json({ error: 'RAZORPAY_SECRET is not configured on server' })
    }

    // Calculate amount based on coupon
    let finalAmount = BASE_PRICE_PAISE
    if (couponCode && COUPONS[couponCode.toUpperCase()]) {
      finalAmount = COUPONS[couponCode.toUpperCase()]
    }
    if (finalAmount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise' })
    }

    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: 'INR',
      receipt: `order_${uid.slice(-6)}_${Date.now()}`,
      notes: {
        uid,
        semesterId,
        subjectIds: JSON.stringify(subjectIds || []),
        couponCode: couponCode || '',
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
}

app.post('/api/verify-payment', verifyHandler)
app.post('/api/payment/verify', verifyHandler)

async function verifyHandler(req, res) {
  try {
    const { uid, semesterId, subjectIds, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
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

    // Update user data: mark as paid, add semester, and add individual subjects
    // Fetch the order to get the actual amount paid
    const order = await razorpay.orders.fetch(razorpay_order_id)
    const amountPaid = order.amount / 100

    await firestore.collection('users').doc(uid).set(
      {
        isPaid: true,
        purchasedSemesters: admin.firestore.FieldValue.arrayUnion(semesterId),
        unlockedSubjects: admin.firestore.FieldValue.arrayUnion(...(subjectIds || [])),
        lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
        [`payments.${razorpay_order_id}`]: {
          razorpayPaymentId: razorpay_payment_id,
          semesterId: semesterId,
          subjectIds: subjectIds || [],
          amount: amountPaid,
          couponCode: order.notes.couponCode || '',
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
}

const port = Number(process.env.PORT) || 5000
app.listen(port, () => {
  console.log(`Payment server running on port ${port}`)
})
