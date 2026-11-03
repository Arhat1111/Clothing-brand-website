const crypto = require('crypto');
const { json, cors, supabaseRequest, safeText, rowToOrder, sendConfirmationEmail, sendOwnerOrderEmail } = require('./_utils');

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
    const left = Buffer.from(String(expected), 'utf8');
    const right = Buffer.from(String(razorpay_signature || ''), 'utf8');
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return json(res, 400, { ok: false, error: 'Payment signature verification failed.' });
    if (!local_order_id || !razorpay_order_id || !razorpay_payment_id) return json(res,400,{ok:false,error:'Missing payment information.'});
    const previous = await supabaseRequest('orders', {}, `?id=eq.${encodeURIComponent(local_order_id)}&select=*&limit=1`);
    const pending = Array.isArray(previous) && previous[0];
    if (!pending || pending.razorpay_order_id !== razorpay_order_id) return json(res, 400, { ok:false, error:'Payment does not match the saved order.' });
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, { headers: {Authorization: `Basic ${auth}`} });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok || payment.order_id !== razorpay_order_id || payment.status !== 'captured' || Number(payment.amount) !== Math.round(Number(pending.total) * 100)) return json(res, 400, { ok:false, error:'Razorpay payment amount/status does not match order.' });
    if (pending.payment_status === 'paid') return json(res, 200, {ok:true, order: rowToOrder(pending), alreadyProcessed:true});
    let saved = null;
    let email = { sent: false, skipped: true };
    let ownerEmail = { sent: false, skipped: true };
    if (local_order_id) {
      const rows = await supabaseRequest('orders', {
        method: 'PATCH',
        body: JSON.stringify({
          payment_status: 'paid',
          status: 'paid_order_received',
          razorpay_order_id: safeText(razorpay_order_id),
          razorpay_payment_id: safeText(razorpay_payment_id),
          updated_at: new Date().toISOString(),
        }),
        prefer: 'return=representation',
      }, `?id=eq.${encodeURIComponent(local_order_id)}`);
      saved = Array.isArray(rows) && rows[0] ? rows[0] : null;
      if (saved) {
        email = await sendConfirmationEmail(saved);
        ownerEmail = await sendOwnerOrderEmail(saved, 'paid');
      }
    }
    return json(res, 200, { ok: true, order: saved ? rowToOrder(saved) : null, email, ownerEmail });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
