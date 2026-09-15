# Owner Live Order Alerts Setup

This version sends order details to the brand owner live after Razorpay payment and adds owner alert tools inside `admin.html`.

## What works

1. Customer places order and pays through Razorpay.
2. Vercel verifies the Razorpay payment.
3. Supabase order changes to `paid` / `paid_order_received`.
4. Customer confirmation email is sent if `RESEND_API_KEY` and `EMAIL_FROM` are configured.
5. Owner order email is sent live if `BUSINESS_EMAIL` is configured.
6. Admin page auto-refreshes orders every 15 seconds.
7. Admin can manually resend an order email to owner from the Actions column.
8. Admin can optionally save owner WhatsApp number on that device and open a prefilled WhatsApp order message.

## Required Vercel environment variables

Add these in Vercel → Project → Environment Variables:

```txt
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_or_secret_key
ADMIN_TOKEN=your_private_admin_token
RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Fable by Kavita Anu <orders@fablebykavitaanu.in>
BUSINESS_EMAIL=owner_email_here
```

Then redeploy the project.

## Health check

Open:

```txt
/api/health
```

It should show:

```json
"supabase": true,
"email": true,
"emailFrom": true,
"businessEmail": true,
"ownerNotifications": true,
"razorpay": true
```

## Admin page

Open:

```txt
/admin.html
```

Login with:

```txt
[private admin passcode]
```

Then enter your Vercel `ADMIN_TOKEN` in the Admin API Token field and click `Save token`.

The Owner Live Alerts box will show whether owner email is configured. Every order row now has:

- Copy
- Email owner
- WhatsApp owner

Automatic WhatsApp sending is not included here because WhatsApp Business Cloud API requires Meta app setup, a permanent access token, and approved templates. The admin page WhatsApp button opens a prefilled message that the owner/admin can send manually.
