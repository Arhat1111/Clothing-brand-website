const { json, cors, requireAdmin, sendConfirmationEmail } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return json(res, 405, { ok: false, error: 'Method not allowed' });
    }
    requireAdmin(req);
    const to = String(req.body?.to || '').trim().toLowerCase();
    if (!to || !to.includes('@')) return json(res, 400, { ok: false, error: 'Valid test recipient email is required.' });
    const sampleOrder = {
      id: `fable-email-test-${Date.now()}`,
      customer_name: req.body?.name || 'Fable Customer',
      customer_email: to,
      customer_phone: req.body?.phone || 'Test phone',
      customer_city: req.body?.city || 'Test city',
      customer_address: req.body?.address || 'Test address',
      items_json: [{ name: 'Test Fable Order', size: 'S', qty: 1, lineTotal: 1 }],
      total: 1,
      razorpay_payment_id: 'test-email-only',
    };
    const email = await sendConfirmationEmail(sampleOrder);
    return json(res, email.sent ? 200 : 500, { ok: email.sent, email });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
