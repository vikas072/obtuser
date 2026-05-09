const Razorpay = require('razorpay');
require('dotenv').config({ path: '.env.local' });

const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const rzpSecret = process.env.RAZORPAY_SECRET;

console.log('Testing with:', { rzpKeyId, rzpSecret: rzpSecret ? 'EXISTS' : 'MISSING' });

const razorpay = new Razorpay({
  key_id: rzpKeyId,
  key_secret: rzpSecret,
});

razorpay.orders.create({
  amount: 100,
  currency: 'INR',
  receipt: 'test_receipt'
}).then(order => {
  console.log('Order created successfully:', order.id);
}).catch(err => {
  console.error('Order creation failed:', err);
});
