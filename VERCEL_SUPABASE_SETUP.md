# Fable by Kavita Anu — Vercel + Supabase + Resend Setup

This version removes Cloudflare/Firebase and uses:

- Vercel for hosting + backend API routes
- Supabase for permanent orders/subscribers database
- Resend for customer email confirmations
- Razorpay endpoints included for later once you have the live Razorpay secret

## 1. Create Supabase project

1. Open Supabase.
2. Create a new project.
3. Copy your Project URL from Project Settings → Data API / API.
4. Copy a server-side key from Project Settings → API Keys.
   - Use `SUPABASE_SERVICE_ROLE_KEY` or the newer secret/server key.
   - Never put this key in frontend files.

## 2. Create the database tables

1. In Supabase, open SQL Editor.
2. Paste everything from `supabase/schema.sql`.
3. Click Run.

The browser does not access Supabase directly. Vercel API routes use the server key securely.

## 3. Deploy to Vercel

1. Upload this folder to GitHub.
2. In Vercel, click Add New → Project.
3. Import the GitHub repository.
4. Deploy.

Vercel automatically deploys the HTML/CSS/JS website and the `/api` backend files.

## 4. Add Vercel environment variables

In Vercel Project → Settings → Environment Variables, add:

```txt
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-side-key
ADMIN_TOKEN=make-a-long-private-admin-token
```

Optional email variables:

```txt
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=Fable by Kavita Anu <orders@yourdomain.com>
BUSINESS_EMAIL=fable@email.com
```

Optional Razorpay variables for later:

```txt
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

After adding variables, redeploy the project.

## 5. Test the API

Open:

```txt
https://your-vercel-project.vercel.app/api/health
```

You should see:

```json
{"ok":true,"service":"Fable Vercel Supabase API"}
```

## 6. Connect the frontend

If the whole website is hosted on Vercel, leave this line in `script.js` blank:

```js
const FABLE_API_BASE_URL = "";
```

If the website stays on GitHub Pages and only the backend is on Vercel, paste your Vercel URL:

```js
const FABLE_API_BASE_URL = "https://your-vercel-project.vercel.app";
```

Then redeploy your frontend.

## 7. Admin page

Open:

```txt
/admin.html
```

First passcode:

```txt
[private admin passcode]
```

Then enter the same `ADMIN_TOKEN` that you added in Vercel environment variables. This lets the admin page read central orders and subscribers from Supabase.

## 8. Email confirmation

Order enquiry emails will send only after these are set in Vercel:

```txt
RESEND_API_KEY
EMAIL_FROM
```

Use a verified Resend domain/email for best deliverability.

## 9. Razorpay later

The Razorpay API endpoints are already included:

```txt
/api/razorpay-create-order
/api/razorpay-verify-payment
```

Do not connect live payments until you have Razorpay Live Key ID + Key Secret and account activation.
