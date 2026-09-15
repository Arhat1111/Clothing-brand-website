const json = (res, status, data, extraHeaders = {}) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  Object.entries(extraHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(data));
};

const cors = (req, res) => {
  const allowed = process.env.ALLOWED_ORIGIN || req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
};

const requireAdmin = (req) => {
  const token = req.headers['x-admin-token'] || '';
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    const error = new Error('Admin token missing or incorrect.');
    error.status = 401;
    throw error;
  }
};

const safeText = (value, limit = 5000) => String(value || '').trim().slice(0, limit);

const normalizePhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
};

const supabaseHeaders = (prefer) => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!process.env.SUPABASE_URL || !key) {
    const error = new Error('Supabase environment variables are missing. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
    error.status = 500;
    throw error;
  }
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
};

const supabaseUrl = (table, query = '') => {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  return `${base}/rest/v1/${table}${query}`;
};

const supabaseRequest = async (table, options = {}, query = '') => {
  const response = await fetch(supabaseUrl(table, query), {
    ...options,
    headers: {
      ...supabaseHeaders(options.prefer),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.error || `Supabase request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
};

const rowToOrder = (row) => {
  let items = [];
  if (Array.isArray(row.items_json)) items = row.items_json;
  else { try { items = JSON.parse(row.items_json || '[]'); } catch {} }
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    paymentStatus: row.payment_status,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      city: row.customer_city,
      address: row.customer_address,
    },
    note: row.note,
    items,
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    discountLabel: row.discount_label,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const rowToSubscriber = (row) => ({
  id: row.id,
  name: row.name,
  rawPhone: row.raw_phone,
  phone: row.phone,
  sourcePage: row.source_page,
  status: row.status,
  discountEligible: Boolean(row.discount_eligible),
  discountUsedAt: row.discount_used_at || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildOrderRecord = (order) => {
  const now = new Date().toISOString();
  const customer = order.customer || {};
  const id = safeText(order.id) || `fable-${Date.now()}`;
  const items = Array.isArray(order.items) ? order.items : [];
  return {
    id,
    source: safeText(order.source || 'website'),
    status: safeText(order.status || 'enquiry_received'),
    payment_status: safeText(order.paymentStatus || 'not_paid'),
    customer_name: safeText(customer.name),
    customer_email: safeText(customer.email).toLowerCase(),
    customer_phone: safeText(customer.phone),
    customer_city: safeText(customer.city),
    customer_address: safeText(customer.address),
    note: safeText(order.note),
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    total: Number(order.total || 0),
    discount_label: safeText(order.discountLabel),
    items_json: items,
    razorpay_order_id: safeText(order.razorpayOrderId || order.razorpay_order_id),
    razorpay_payment_id: safeText(order.razorpayPaymentId || order.razorpay_payment_id),
    created_at: safeText(order.createdAt || now),
    updated_at: now,
  };
};

const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));

const buildPlainOrderText = (order, items) => {
  const lines = [
    'Fable by Kavita Anu - Order Confirmation',
    '',
    `Order ID: ${order.id}`,
    `Customer: ${order.customer_name || ''}`,
    `Phone: ${order.customer_phone || ''}`,
    `City: ${order.customer_city || ''}`,
    `Address: ${order.customer_address || ''}`,
    '',
    'Items:',
    ...items.map((item, index) => `${index + 1}. ${item.name} | Size: ${item.size || 'Custom'} | Qty: ${Number(item.qty || 1)} | ₹${Number(item.lineTotal || item.unitPrice || 0).toLocaleString('en-IN')}`),
    '',
    `Total: ₹${Number(order.total || 0).toLocaleString('en-IN')}`,
    order.razorpay_payment_id ? `Razorpay Payment ID: ${order.razorpay_payment_id}` : '',
  ].filter(Boolean);
  return lines.join('\n');
};

const sendConfirmationEmail = async (order) => {
  if (!process.env.RESEND_API_KEY) return { sent: false, skipped: true, reason: 'RESEND_API_KEY missing' };
  if (!order.customer_email) return { sent: false, skipped: true, reason: 'Customer email missing' };
  const from = process.env.EMAIL_FROM || 'Fable by Kavita Anu <orders@fablebykavitaanu.in>';
  const businessEmail = safeText(process.env.BUSINESS_EMAIL).toLowerCase();
  const items = (() => {
    if (Array.isArray(order.items_json)) return order.items_json;
    try { return JSON.parse(order.items_json || '[]'); } catch { return []; }
  })();
  const itemsHtml = items.map((item) => `<li>${escapeHtml(item.name)} — Size: ${escapeHtml(item.size || 'Custom')} — Qty: ${Number(item.qty || 1)} — ₹${Number(item.lineTotal || item.unitPrice || 0).toLocaleString('en-IN')}</li>`).join('');
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2422;background:#fffaf8;padding:24px;border-radius:14px">
      <h2 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:400">Thank you for your Fable by Kavita Anu order</h2>
      <p>Hi ${escapeHtml(order.customer_name || 'there')},</p>
      <p>Your payment has been received and your order has been saved successfully. Our team will contact you shortly to confirm dispatch and delivery details.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
      ${order.razorpay_payment_id ? `<p><strong>Razorpay Payment ID:</strong> ${escapeHtml(order.razorpay_payment_id)}</p>` : ''}
      <h3 style="font-size:16px;margin-top:22px">Selected pieces</h3>
      <ul>${itemsHtml || '<li>Order items saved in dashboard.</li>'}</ul>
      <p><strong>Total paid:</strong> ₹${Number(order.total || 0).toLocaleString('en-IN')}</p>
      <p style="margin-top:22px">Fable by Kavita Anu</p>
    </div>`;
  const payload = {
    from,
    to: [order.customer_email],
    ...(businessEmail ? { reply_to: businessEmail } : {}),
    subject: `Fable order confirmed - ${order.id}`,
    html,
    text: buildPlainOrderText(order, items),
  };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { sent: false, error: result.message || result.error || 'Email provider error', status: response.status };
    return { sent: true, id: result.id };
  } catch (error) {
    return { sent: false, error: error.message || 'Email provider network error' };
  }
};


const getOrderItems = (order) => {
  if (Array.isArray(order.items_json)) return order.items_json;
  if (Array.isArray(order.items)) return order.items;
  try { return JSON.parse(order.items_json || '[]'); } catch { return []; }
};

const buildOwnerOrderHtml = (order, items, event = 'paid') => {
  const isPaid = String(order.payment_status || order.paymentStatus || '').includes('paid') || event === 'paid';
  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eadfdb">${escapeHtml(item.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eadfdb">${escapeHtml(item.size || 'Custom')}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eadfdb;text-align:center">${Number(item.qty || 1)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eadfdb;text-align:right">₹${Number(item.lineTotal || item.unitPrice || 0).toLocaleString('en-IN')}</td>
    </tr>`).join('');
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.58;color:#2b2422;background:#fffaf8;padding:24px;border-radius:18px;border:1px solid #eadfdb">
      <p style="margin:0 0 8px;letter-spacing:.12em;text-transform:uppercase;color:#8a3148;font-size:11px">${isPaid ? 'Paid order received' : 'New website order enquiry'}</p>
      <h2 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:400;font-size:30px">Fable order details</h2>
      <div style="background:#fff;padding:16px 18px;border-radius:14px;border:1px solid #eee1dd;margin-bottom:18px">
        <p style="margin:4px 0"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
        <p style="margin:4px 0"><strong>Status:</strong> ${escapeHtml(order.status || '')} / ${escapeHtml(order.payment_status || order.paymentStatus || '')}</p>
        ${order.razorpay_payment_id ? `<p style="margin:4px 0"><strong>Razorpay Payment ID:</strong> ${escapeHtml(order.razorpay_payment_id)}</p>` : ''}
        ${order.razorpay_order_id ? `<p style="margin:4px 0"><strong>Razorpay Order ID:</strong> ${escapeHtml(order.razorpay_order_id)}</p>` : ''}
      </div>
      <div style="background:#fff;padding:16px 18px;border-radius:14px;border:1px solid #eee1dd;margin-bottom:18px">
        <p style="margin:4px 0"><strong>Customer:</strong> ${escapeHtml(order.customer_name || '')}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${escapeHtml(order.customer_email || '')}</p>
        <p style="margin:4px 0"><strong>Phone:</strong> ${escapeHtml(order.customer_phone || '')}</p>
        <p style="margin:4px 0"><strong>City:</strong> ${escapeHtml(order.customer_city || '')}</p>
        <p style="margin:4px 0"><strong>Address:</strong> ${escapeHtml(order.customer_address || '')}</p>
        ${order.note ? `<p style="margin:4px 0"><strong>Note:</strong> ${escapeHtml(order.note)}</p>` : ''}
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee1dd;border-radius:14px;overflow:hidden">
        <thead><tr style="background:#f8ece8"><th style="text-align:left;padding:10px 8px">Item</th><th style="text-align:left;padding:10px 8px">Size</th><th style="padding:10px 8px">Qty</th><th style="text-align:right;padding:10px 8px">Amount</th></tr></thead>
        <tbody>${itemsHtml || '<tr><td colspan="4" style="padding:12px">Items saved in dashboard.</td></tr>'}</tbody>
      </table>
      <div style="margin-top:18px;background:#2a171b;color:#fff;padding:16px 18px;border-radius:14px">
        <p style="margin:3px 0"><strong>Subtotal:</strong> ₹${Number(order.subtotal || 0).toLocaleString('en-IN')}</p>
        ${Number(order.discount || 0) ? `<p style="margin:3px 0"><strong>Discount:</strong> -₹${Number(order.discount || 0).toLocaleString('en-IN')} ${escapeHtml(order.discount_label || '')}</p>` : ''}
        <p style="margin:3px 0;font-size:18px"><strong>Total:</strong> ₹${Number(order.total || 0).toLocaleString('en-IN')}</p>
      </div>
    </div>`;
};

const sendOwnerOrderEmail = async (order, event = 'paid') => {
  if (!process.env.RESEND_API_KEY) return { sent: false, skipped: true, reason: 'RESEND_API_KEY missing' };
  const businessEmail = safeText(process.env.BUSINESS_EMAIL).toLowerCase();
  if (!businessEmail || !businessEmail.includes('@')) return { sent: false, skipped: true, reason: 'BUSINESS_EMAIL missing' };
  const from = process.env.EMAIL_FROM || 'Fable by Kavita Anu <orders@fablebykavitaanu.in>';
  const items = getOrderItems(order);
  const isPaid = String(order.payment_status || order.paymentStatus || '').includes('paid') || event === 'paid';
  const payload = {
    from,
    to: [businessEmail],
    subject: `${isPaid ? 'New paid Fable order' : 'New Fable order enquiry'} - ${order.id}`,
    html: buildOwnerOrderHtml(order, items, event),
    text: buildPlainOrderText(order, items),
  };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { sent: false, error: result.message || result.error || 'Email provider error', status: response.status };
    return { sent: true, id: result.id, to: businessEmail };
  } catch (error) {
    return { sent: false, error: error.message || 'Owner email provider network error' };
  }
};

module.exports = {
  json,
  cors,
  requireAdmin,
  safeText,
  normalizePhone,
  supabaseRequest,
  rowToOrder,
  rowToSubscriber,
  buildOrderRecord,
  sendConfirmationEmail,
  sendOwnerOrderEmail,
  getOrderItems,
};
