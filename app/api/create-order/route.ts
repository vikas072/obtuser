import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firestore, firebaseAdmin, getFirebaseError } from '@/lib/firebase-admin';

const BASE_PRICE_PAISE = 29900; // ₹299
const COUPONS: Record<string, number> = {
  'SAVE90': 2900, // ₹29
  'OFF90': 2900,  // ₹29
  'EXAM90': 2900, // ₹29
};

const isPaymentBypassEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.ALLOW_PAYMENT_BYPASS === 'true';

// Removed global init to handle it inside the POST function for better error reporting

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, semesterId, subjectIds, couponCode } = body;
    console.log('--- CREATE ORDER REQUEST ---');
    console.log('Body:', body);
    console.log('----------------------------');

    if (!uid || !semesterId) {
      return NextResponse.json({ error: 'uid and semesterId are required' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ error: getFirebaseError() || 'Firebase Admin is not configured.' }, { status: 500 });
    }

    if (isPaymentBypassEnabled()) {
      await firestore.collection('users').doc(uid).set(
        {
          isPaid: true,
          purchasedSemesters: firebaseAdmin.firestore.FieldValue.arrayUnion(semesterId),
          unlockedSubjects: firebaseAdmin.firestore.FieldValue.arrayUnion(...(subjectIds || [])),
          lastPaymentAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          [`payments.dev_${Date.now()}`]: {
            razorpayPaymentId: 'dev_bypass',
            semesterId,
            subjectIds: subjectIds || [],
            amount: 0,
            couponCode: couponCode || '',
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      return NextResponse.json({
        devBypass: true,
        orderId: 'dev_bypass',
        amount: 0,
        currency: 'INR',
      });
    }

    const rzpKeyIdRaw = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const rzpSecretRaw = (process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();

    // Remove wrapping quotes without altering valid credential characters.
    const rzpKeyId = rzpKeyIdRaw.replace(/^['"]|['"]$/g, '');
    const rzpSecret = rzpSecretRaw.replace(/^['"]|['"]$/g, '');

    console.log('Razorpay Auth Check (create-order):', {
      hasKeyId: !!rzpKeyId,
      keyIdPrefix: rzpKeyId.slice(0, 15),
      keyIdLength: rzpKeyId.length,
      hasSecret: !!rzpSecret,
      secretLength: rzpSecret.length,
    });

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

    // Bypassing the SDK to rule out SDK-level issues
    const auth = Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString('base64');
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: 'INR',
        receipt: `order_${uid.slice(-6)}_${Date.now()}`,
        notes: {
          uid,
          semesterId,
          subjectIds: JSON.stringify(subjectIds || []),
          couponCode: couponCode || '',
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errorData = await rzpResponse.json();
      console.error('Razorpay API failed:', errorData);
      if (errorData?.error?.description === 'Authentication failed') {
        return NextResponse.json(
          {
            error:
              'Razorpay authentication failed. Check that RAZORPAY_KEY_ID and RAZORPAY_SECRET are from the same Razorpay account and mode (test/live), then restart or redeploy.',
          },
          { status: 401 }
        );
      }
      throw errorData;
    }

    const order = await rzpResponse.json();

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
