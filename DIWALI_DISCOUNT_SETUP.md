# Diwali 10% discount — website and backend

- All shop products have an automatic 10% Diwali discount. Existing catalogue list prices are unchanged.
- The older one-time 5% WhatsApp promotion is temporarily superseded; discounts do NOT stack.
- Product cards and quick views show sale prices and original prices. Cart and checkout show subtotal, discount, total.
- Vercel API `/api/razorpay-create-order` recalculates the payable amount from the server-side product catalogue, not user-submitted price.
- Vercel API `/api/orders` revalidates prices against the same catalogue before saving to Supabase. Existing `subtotal`, `discount`, `total`, and `discount_label` columns are used. No SQL migration is required.
- `/api/razorpay-verify-payment` verifies signature, links to the stored order, and checks Razorpay payment status and amount before marking paid and emailing customer/owner.
- Existing Supabase and Razorpay environment variables remain as configured. Upload all updated files to GitHub, redeploy Vercel.
- Important: switching off the Diwali offer later requires changing BOTH front-end and server discount logic together.
- Do a small controlled payment test and verify exact Razorpay, Supabase, admin and email amounts before promoting publicly.
