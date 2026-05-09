require('dotenv').config({ path: '.env.local' });
console.log({
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET ? process.env.RAZORPAY_SECRET.substring(0, 4) + '...' : 'MISSING'
});
