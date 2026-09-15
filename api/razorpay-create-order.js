const { json, cors } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return json(res, 405, { ok: false, error: 'Method not allowed' });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return json(res, 500, { ok: false, error: 'Razorpay keys are not configured yet.' });
    }
    const amount = Math.round(Number(req.body?.amount || 0));
    if (!amount || amount < 100) return json(res, 400, { ok: false, error: 'Valid amount in paise is required.' });
    const receipt = String(req.body?.receipt || `fable-${Date.now()}`).slice(0, 40);
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt, payment_capture: 1 }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return json(res, response.status, { ok: false, error: data.error?.description || data.message || 'Razorpay order creation failed' });
    return json(res, 200, { ok: true, keyId: process.env.RAZORPAY_KEY_ID, order: data });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
