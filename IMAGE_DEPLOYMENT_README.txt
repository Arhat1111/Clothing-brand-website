FABLE BY KAVITA ANU — IMAGE DEPLOYMENT FIX

This is the ORIGINAL website only. Design, Supabase, Razorpay and serverless API files are unchanged.

Root cause: the new product image files were present in the prior ZIP, but were apparently missing/unreachable in the published GitHub/Vercel deployment. The new 9 products now include their model and original front/back images directly inside catalog.js as WebP data URIs. Their images render even if separate assets/products image files are accidentally omitted. The original image files are still included in the ZIP.

DEPLOY: Upload/extract ALL ZIP CONTENTS into your existing repository ROOT (alongside index.html). Replace existing catalog.js. Keep the same Vercel environment variables. Do NOT upload the ZIP itself as a website file.

After deployment, hard-refresh Ctrl+Shift+R / Cmd+Shift+R. Check images in products.html; if still blank, verify published catalog.js is updated and that there is no Content-Security-Policy header blocking data:image/webp.

IMPORTANT: If website is served directly from github.io instead of Vercel, existing /api serverless payment and order functions DO NOT run there. Use Vercel for the live site.

No production changes or payment tests were performed.
