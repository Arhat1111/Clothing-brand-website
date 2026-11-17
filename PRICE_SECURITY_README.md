# Fable — verified product pricing package

This update is for the **original** website, not the retired Diwali edition. The look and layout are unchanged.

## New products and prices (INR)

| ID | Price | Category |
|---|---:|---|
| scarlet-structured-sleeve-midi-dress | 7,500 | Dresses |
| midnight-gold-embellished-mini-dress | 15,000 | Dresses |
| tangerine-ruffle-two-piece-set | 11,000 | Festive Wear |
| powder-blue-asymmetric-two-piece-set | 7,500 | Drape Sets |
| cobalt-blue-patchwork-tie-front-shirt | 7,500 | Tops & Shirts |

Each is still tagged New Arrival. Model images and garment photo galleries are unchanged.

## Important: Deploy all changed files together

The browser's catalogue, server manifest and new payment endpoint MUST come from the same ZIP/deployment. Updating only `catalog.js` will not update the server-side Razorpay price authority.

- `catalog.js`: updated display prices and pricePending flags.
- `script.js`: saves pending order in Supabase before creating Razorpay order; avoids embedding data URLs in order JSON.
- `api/_catalog-prices.json`: server-side product price/availability manifest for ALL current products.
- `api/_pricing.js`: checks valid product ID, size, quantity, sold-out/pending status, subtotal and registered 5% discount eligibility.
- `api/orders.js`: creates pending Supabase orders with trusted product prices, ignoring browser-provided item prices/status.
- `api/razorpay-create-order.js`: reads saved Supabase order and uses recalculated total, not browser-supplied amount.
- `api/razorpay-verify-payment.js`: verifies HMAC, saved order association, actual captured payment amount and currency before marking Supabase paid.
- `tools/generate-price-manifest.js`: regenerate manifest from the edited catalogue whenever future product prices are changed.

Existing `api/_utils.js`, Vercel configuration, Supabase schema, admin panel and email integration files are retained. The `orders` table is still the place where purchase items and prices are stored. The catalogue is maintained in `catalog.js` plus the manifest, **not** in a Supabase `products` table. You do NOT need to re-run the schema merely for this update.

## Setup and testing

1. Commit the **complete extracted ZIP contents** to the GitHub repository connected to the original site's Vercel project. Keep existing Vercel project environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, etc.) unchanged.
2. Confirm on the Vercel deployment that five product prices display correctly and each product opens with the model image and its original-photo slider.
3. In **Razorpay TEST mode**, place a single-product order; confirm the amount, the Supabase `orders` record, status transition to `paid`, and admin dashboard display. If using live Razorpay keys, use a controlled live test and reconcile/refund appropriately.
4. Test an invalid quantity or tampered total (server must reject) and a sold-out item (cannot checkout). Verify any 5% signup discount with an eligible record in the Supabase `subscribers` table.
5. Payment-status updates require a captured payment; if your account uses delayed capture, it needs an additional webhook/verification workflow before treating payment as paid.

**Security limitations:** This fixes price tampering through the payment endpoints. It does not implement real-time stock reservations, a complete one-time discount concurrency lock, or Razorpay webhook reconciliation. The existing public subscriber-registration API can still be abused without OTP verification and rate limits. Those require separate work for a production-scale store.

**Future price updates:** edit `catalog.js`, run `node tools/generate-price-manifest.js`, and deploy both modified files together. Never edit only the browser catalogue.
