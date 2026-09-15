const { json, cors, requireAdmin, safeText, normalizePhone, supabaseRequest, rowToSubscriber } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method === 'POST') {
      const lead = req.body || {};
      const now = new Date().toISOString();
      const phone = normalizePhone(lead.phone || lead.rawPhone || '');
      if (!phone) return json(res, 400, { ok: false, error: 'Phone number is required.' });
      const record = {
        id: safeText(lead.id) || `lead-${Date.now()}`,
        name: safeText(lead.name),
        raw_phone: safeText(lead.rawPhone || lead.phone),
        phone,
        source_page: safeText(lead.sourcePage),
        status: safeText(lead.status || 'Subscribed'),
        discount_eligible: lead.discountEligible === false ? false : true,
        discount_used_at: safeText(lead.discountUsedAt) || null,
        created_at: safeText(lead.createdAt || now),
        updated_at: now,
      };
      const rows = await supabaseRequest('subscribers', {
        method: 'POST',
        body: JSON.stringify(record),
        prefer: 'resolution=merge-duplicates,return=representation',
      }, '?on_conflict=phone');
      const saved = Array.isArray(rows) && rows[0] ? rows[0] : record;
      return json(res, 200, { ok: true, subscriber: rowToSubscriber(saved) });
    }

    if (req.method === 'GET') {
      requireAdmin(req);
      const rows = await supabaseRequest('subscribers', { method: 'GET' }, '?select=*&order=created_at.desc&limit=1000');
      return json(res, 200, { ok: true, subscribers: Array.isArray(rows) ? rows.map(rowToSubscriber) : [] });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || 'Server error' });
  }
};
