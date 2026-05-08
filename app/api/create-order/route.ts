import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firestore } from '@/lib/firebase-admin';

const BASE_PRICE_PAISE = 29900; // ₹299
const COUPONS: Record<string, number> = {
  'SAVE90': 2900, // ₹29
  'OFF90': 2900,  // ₹29
  'EXAM90': 2900, // ₹29
};

// Removed global init to handle it inside the POST function for better error reporting

export async function POST(req: Request) {
  try {
    const { uid, semesterId, subjectIds, couponCode } = await req.json();

    if (!uid || !semesterId) {
      return NextResponse.json({ error: 'uid and semesterId are required' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ verified: false, error: 'Firebase Admin is not configured. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Vercel.' }, { status: 500 });
    }

    const rzpKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_SECRET;

    if (!rzpSecret) {
      return NextResponse.json({ error: 'RAZORPAY_SECRET is not configured on the server. Please add it to Vercel Environment Variables.' }, { status: 500 });
    }

    if (!rzpKeyId) {
      return NextResponse.json({ error: 'RAZORPAY_KEY_ID is not configured. Please add it to Vercel Environment Variables.' }, { status: 500 });
    }

    // Initialize Razorpay inside the handler to catch initialization errors
    const razorpay = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpSecret,
    });

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
  } catch (error: any) {
    console.error('create-order failed:', error);
    const errorMessage = error?.message || error?.description || (typeof error === 'string' ? error : 'Unknown error');
    return NextResponse.json({ error: `Failed to create order: ${errorMessage}` }, { status: 500 });
  }
}
