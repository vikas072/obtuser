import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firestore, getFirebaseError } from '@/lib/firebase-admin';

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
      return NextResponse.json({ error: getFirebaseError() || 'Firebase Admin is not configured.' }, { status: 500 });
    }

    const rzpKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const rzpSecret = (process.env.RAZORPAY_SECRET || '').trim();

    console.log('--- RAZORPAY DEBUG START ---');
    console.log('rzpKeyId:', rzpKeyId);
    console.log('rzpSecret:', rzpSecret);
    console.log('--- RAZORPAY DEBUG END ---');

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
    let detail = 'Unknown error';
    if (error instanceof Error) {
      detail = error.message;
    } else if (typeof error === 'object') {
      detail = JSON.stringify(error);
    } else if (typeof error === 'string') {
      detail = error;
    }
    return NextResponse.json({ error: `Failed to create order: ${detail}` }, { status: 500 });
  }
}
