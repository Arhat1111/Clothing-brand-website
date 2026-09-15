const { json, cors, requireAdmin, supabaseRequest, rowToOrder, sendOwnerOrderEmail, safeText } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return json(res, 405, { ok: false, error: 'Method not allowed' });
    }
    requireAdmin(req);
    const orderId = safeText(req.body?.orderId || req.body?.id);
    if (!orderId) return json(res, 400, { ok: false, error: 'Order ID is required.' });
    const rows = await supabaseRequest('orders', { method: 'GET' }, `?select=*&id=eq.${encodeURIComponent(orderId)}&limit=1`);
    const order = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!order) return json(res, 404, { ok: false, error: 'Order not found.' });
    const ownerEmail = await sendOwnerOrderEmail(order, 'admin_manual');
    return json(res, ownerEmail.sent ? 200 : 500, { ok: ownerEmail.sent, order: rowToOrder(order), ownerEmail });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
