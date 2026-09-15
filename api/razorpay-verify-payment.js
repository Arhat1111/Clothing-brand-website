const crypto = require('crypto');
const { json, cors, supabaseRequest, safeText } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return json(res, 405, { ok: false, error: 'Method not allowed' });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) return json(res, 500, { ok: false, error: 'Razorpay secret is not configured yet.' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_order_id } = req.body || {};
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature) return json(res, 400, { ok: false, error: 'Payment signature verification failed.' });
    if (local_order_id) {
      await supabaseRequest('orders', {
        method: 'PATCH',
        body: JSON.stringify({
          payment_status: 'paid',
          status: 'paid_order_received',
          razorpay_order_id: safeText(razorpay_order_id),
          razorpay_payment_id: safeText(razorpay_payment_id),
          updated_at: new Date().toISOString(),
        }),
        prefer: 'return=minimal',
      }, `?id=eq.${encodeURIComponent(local_order_id)}`);
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
