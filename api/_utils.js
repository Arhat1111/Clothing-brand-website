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

const sendConfirmationEmail = async (order) => {
  if (!process.env.RESEND_API_KEY || !order.customer_email) return { sent: false, skipped: true };
  const items = (() => {
    if (Array.isArray(order.items_json)) return order.items_json;
    try { return JSON.parse(order.items_json || '[]'); } catch { return []; }
  })();
  const itemsHtml = items.map((item) => `<li>${escapeHtml(item.name)} — Size: ${escapeHtml(item.size || 'Custom')} — Qty: ${Number(item.qty || 1)}</li>`).join('');
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2422">
      <h2>Thank you for your Fable by Kavita Anu enquiry</h2>
      <p>Hi ${escapeHtml(order.customer_name || 'there')},</p>
      <p>We have received your order enquiry. Our team will confirm availability, final pricing, shipping and payment details shortly.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Estimated total:</strong> ₹${Number(order.total || 0).toLocaleString('en-IN')}</p>
      <p>Fable by Kavita Anu</p>
    </div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Fable by Kavita Anu <orders@yourdomain.com>',
      to: [order.customer_email],
      reply_to: process.env.BUSINESS_EMAIL || undefined,
      subject: `Fable order enquiry received - ${order.id}`,
      html,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return { sent: false, error: result.message || 'Email provider error' };
  return { sent: true, id: result.id };
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
};
