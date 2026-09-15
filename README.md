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
FABLE2026
```

For live Supabase data, also enter your private `ADMIN_TOKEN` from Vercel environment variables.
