# Fable Razorpay + Email Fix Notes

This update fixes two checkout issues:

1. After successful Razorpay payment, the customer is no longer redirected to WhatsApp Web.
2. Resend email sending is more reliable and now sends a customer confirmation email, with an optional BCC copy to the business email.

## Required Vercel Environment Variables

Keep these in Vercel only. Do not upload secrets to GitHub.

```txt
SUPABASE_URL=https://txndwsvdynwsesddsnyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
ADMIN_TOKEN=your_private_admin_token
RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Fable by Kavita Anu <orders@fablebykavitaanu.in>
BUSINESS_EMAIL=owner_email_for_order_copies
```

## After adding or changing Vercel variables

Redeploy the project. Then open:

```txt
/api/health
```

Expected:

```json
{
  "ok": true,
  "supabase": true,
  "email": true,
  "emailFrom": true,
  "businessEmail": true,
  "razorpay": true
}
```

## Test email endpoint

After redeploying, test email by opening the browser console on the site and running this, replacing the token and email:

```js
fetch('/api/test-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': 'YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({ to: 'your@email.com' })
}).then(r => r.json()).then(console.log)
```

If it returns `ok: true`, Resend is working. If not, check Vercel Function Logs and Resend Logs.
