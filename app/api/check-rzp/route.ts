import { NextResponse } from 'next/server';

export async function GET() {
  const rzpKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
  const rzpSecret = (process.env.RAZORPAY_SECRET || '').trim();

  return NextResponse.json({
    hasKeyId: !!rzpKeyId,
    keyIdPrefix: rzpKeyId.slice(0, 15),
    hasSecret: !!rzpSecret,
    secretPrefix: rzpSecret.slice(0, 8),
    envLoaded: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
