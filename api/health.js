const { json, cors } = require('./_utils');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  return json(res, 200, {
    ok: true,
    service: 'Fable Vercel Supabase API',
    supabase: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)),
    email: Boolean(process.env.RESEND_API_KEY),
    emailFrom: Boolean(process.env.EMAIL_FROM),
    businessEmail: Boolean(process.env.BUSINESS_EMAIL),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  });
};
