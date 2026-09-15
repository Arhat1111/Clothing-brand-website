# Fable by Kavita Anu Website

This is the Vercel + Supabase ready version of the Fable by Kavita Anu website.

## Included

- Static HTML/CSS/JS store pages
- Shop page with celebrity/showcase items blocked from sale
- Cart enquiry flow
- Custom admin page
- Vercel API routes in `/api`
- Supabase database schema in `supabase/schema.sql`
- Resend customer email confirmation support
- Razorpay backend endpoints included for later live payment integration

## Setup guide

Open `VERCEL_SUPABASE_SETUP.md` and follow the steps.

## Important files

- `script.js` — frontend cart/admin logic
- `catalog.js` — product data/prices
- `admin.html` — admin dashboard
- `api/orders.js` — save/read orders
- `api/subscribers.js` — save/read subscribers
- `supabase/schema.sql` — database tables
- `.env.example` — environment variable names

## Admin login

Default frontend passcode:

```txt
[private admin passcode]
```

For live Supabase data, also enter your private `ADMIN_TOKEN` from Vercel environment variables.


## Owner live alerts

This version includes live owner order alerts:

- Paid Razorpay orders are saved to Supabase.
- After payment verification, the backend sends the customer confirmation email and a separate owner order email when Resend variables are configured.
- Admin page auto-refreshes orders every 15 seconds.
- Admin can copy any order, email any order to the owner again, or open a prefilled WhatsApp message to the owner.

Required Vercel environment variables for owner email alerts:

```txt
RESEND_API_KEY=your_resend_key
EMAIL_FROM=Fable by Kavita Anu <orders@fablebykavitaanu.in>
BUSINESS_EMAIL=owner_email_here
```

After adding or changing variables, redeploy the Vercel project.
