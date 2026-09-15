const { json, cors, requireAdmin, safeText, supabaseRequest } = require('../../_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH, OPTIONS');
      return json(res, 405, { ok: false, error: 'Method not allowed' });
    }
    requireAdmin(req);
    const id = req.query?.id;
    if (!id) return json(res, 400, { ok: false, error: 'Order id is required.' });
    const status = safeText(req.body?.status || 'updated');
    await supabaseRequest('orders', {
      method: 'PATCH',
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
      prefer: 'return=minimal',
    }, `?id=eq.${encodeURIComponent(id)}`);
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
