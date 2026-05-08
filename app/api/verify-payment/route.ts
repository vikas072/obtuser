import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { firestore, firebaseAdmin } from '@/lib/firebase-admin';

// Removed global init to handle it inside the POST function for better error reporting

export async function POST(req: Request) {
  try {
    const { uid, semesterId, subjectIds, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!uid || !semesterId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }

    const rzpKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_SECRET;

    if (!rzpSecret) {
      return NextResponse.json({ error: 'RAZORPAY_SECRET is not configured on the server. Please add it to Vercel Environment Variables.' }, { status: 500 });
    }

    if (!rzpKeyId) {
      return NextResponse.json({ error: 'RAZORPAY_KEY_ID is not configured. Please add it to Vercel Environment Variables.' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', rzpSecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ verified: false, error: 'Firebase Admin is not configured. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Vercel.' }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpSecret,
    });

    // Fetch the order to get the actual amount paid
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const amountPaid = order.amount / 100;

    await firestore.collection('users').doc(uid).set(
      {
        isPaid: true,
        purchasedSemesters: firebaseAdmin.firestore.FieldValue.arrayUnion(semesterId),
        unlockedSubjects: firebaseAdmin.firestore.FieldValue.arrayUnion(...(subjectIds || [])),
        lastPaymentAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        [`payments.${razorpay_order_id}`]: {
          razorpayPaymentId: razorpay_payment_id,
          semesterId: semesterId,
          subjectIds: subjectIds || [],
          amount: amountPaid,
          couponCode: order.notes.couponCode || '',
          timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error('verify failed:', error);
    const errorMessage = error?.message || error?.description || (typeof error === 'string' ? error : 'Unknown error');
    return NextResponse.json({ verified: false, error: `Verification failed: ${errorMessage}` }, { status: 500 });
  }
}
