import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firestore } from '@/lib/firebase-admin';

const BASE_PRICE_PAISE = 29900; // ₹299
const COUPONS: Record<string, number> = {
  'SAVE90': 2900, // ₹29
  'OFF90': 2900,  // ₹29
  'EXAM90': 2900, // ₹29
};

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const razorpaySecret = process.env.RAZORPAY_SECRET || '';

console.log('Razorpay Initialization:', {
  keyIdPrefix: razorpayKeyId.substring(0, 8),
  secretPrefix: razorpaySecret.substring(0, 4),
  hasSecret: !!razorpaySecret
});

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpaySecret,
});

export async function POST(req: Request) {
  try {
    const { uid, semesterId, subjectIds, couponCode } = await req.json();

    if (!uid || !semesterId) {
      return NextResponse.json({ error: 'uid and semesterId are required' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ verified: false, error: 'Firebase Admin is not configured. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Vercel.' }, { status: 500 });
    }

    if (!razorpaySecret) {
      return NextResponse.json({ error: 'RAZORPAY_SECRET is not configured on the server. Please add it to Vercel Environment Variables.' }, { status: 500 });
    }

    if (!razorpayKeyId) {
      return NextResponse.json({ error: 'RAZORPAY_KEY_ID is not configured. Please add it to Vercel Environment Variables.' }, { status: 500 });
    }

    // Calculate amount based on coupon
    let finalAmount = BASE_PRICE_PAISE;
    if (couponCode && COUPONS[couponCode.toUpperCase()]) {
      finalAmount = COUPONS[couponCode.toUpperCase()];
    }

    if (finalAmount < 100) {
      return NextResponse.json({ error: 'Amount must be at least 100 paise' }, { status: 400 });
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
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('create-order failed:', error);
    return NextResponse.json({ error: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}
