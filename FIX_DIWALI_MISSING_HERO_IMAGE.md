# Fix: Diwali banner photo not loading on GitHub

The image files were already included in the original ZIP under:
- assets/seasonal/diwali-editorial-desktop.webp
- assets/seasonal/diwali-editorial-mobile.webp

If only HTML/CSS files were uploaded, or GitHub did not preserve the
assets/seasonal folder, the hero background displays as a tan rectangle.

## Fix included in this version
- Embedded both Diwali photographs directly inside diwali.css.
- Removed the fragile separate <picture> image paths on the homepage hero.
- Changed the CSS version query string in index.html to refresh cached CSS.
- Original files are still included for future reuse.
- Kept Razorpay, Supabase, 10% Diwali pricing, shopping and admin code unchanged.

## Deploy
Upload and commit the entire extracted ZIP contents to your GitHub
repository ROOT (not the ZIP file itself, and not inside an extra folder).
If only changing what's needed for the banner, replace BOTH:
  index.html
  diwali.css
Then let Vercel redeploy. Hard refresh the page.

The rest of the website, including Vercel env variables, is unaffected.
