# Razorpay Setup for Fable by Kavita Anu on Vercel

## Required Vercel Environment Variables

Add these in Vercel > Project > Environment Variables:

```txt
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Keep these already-added values:

```txt
SUPABASE_URL=https://txndwsvdynwsesddsnyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
ADMIN_TOKEN=your_private_admin_token
```

Optional email variables:

```txt
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Fable by Kavita Anu <orders@fablebykavitaanu.in>
BUSINESS_EMAIL=owner-email@example.com
```

## Flow

1. Customer submits checkout form.
2. Vercel API creates a Razorpay order.
3. The order is saved in Supabase as `payment_pending`.
4. Razorpay Checkout opens.
5. On success, Vercel verifies the Razorpay signature.
6. Supabase order becomes `paid` / `paid_order_received`.
7. Confirmation email sends if Resend is configured.
8. Admin page shows the live order.

## Test

After adding keys and redeploying, open:

```txt
https://your-vercel-site.vercel.app/api/health
```

It should show:

```json
"razorpay": true
```
