const { json, cors, requireAdmin, supabaseRequest, rowToOrder, buildOrderRecord, sendConfirmationEmail } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method === 'POST') {
      const record = buildOrderRecord(req.body || {});
      const rows = await supabaseRequest('orders', {
        method: 'POST',
        body: JSON.stringify(record),
        prefer: 'return=representation',
      });
      const saved = Array.isArray(rows) && rows[0] ? rows[0] : record;
      const email = await sendConfirmationEmail(saved);
      return json(res, 200, { ok: true, order: rowToOrder(saved), email });
    }

    if (req.method === 'GET') {
      requireAdmin(req);
      const rows = await supabaseRequest('orders', { method: 'GET' }, '?select=*&order=created_at.desc&limit=1000');
      return json(res, 200, { ok: true, orders: Array.isArray(rows) ? rows.map(rowToOrder) : [] });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
