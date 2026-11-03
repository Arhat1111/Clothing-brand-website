const { json, cors } = require('./_utils');
const { priceOrder } = require('./_diwali-pricing');
module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return json(res, 500, { ok: false, error: 'Razorpay keys are not configured.' });
    const pricing = priceOrder(req.body?.items);
    const amount = Math.round(pricing.total * 100);
    const receipt = String(req.body?.receipt || `fable-${Date.now()}`).slice(0, 40);
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return json(res, response.status, { ok: false, error: data.error?.description || 'Razorpay order creation failed' });
    return json(res, 200, { ok: true, keyId: process.env.RAZORPAY_KEY_ID, order: data, pricing });
  } catch (error) { return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' }); }
};
