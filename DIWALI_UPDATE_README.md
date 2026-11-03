# Fable Diwali seasonal update (October 2026)

This package starts from the **original pre-Navratri** version of the Fable website. It does not include the Navratri spotlight cards, CSS lamps, or oversized seasonal hangings.

## What's changed
- Home hero: festive editorial photography and updated text/links, in an independent responsive `.diwali-hero` component. The generated marketing reference image was cropped so no screenshot navigation/text is embedded in the site.
- Natural marigold hangings, diyas and fairy lights are part of the photography, not repeating flat shapes. Minimal animated highlights mimic a gentle glow; reduced-motion preferences are respected.
- Desktop: balanced text/photo composition. Mobile: photograph first, text beneath it. No text overlays on people, navbar or product photos.
- Subtle Diwali announcement copy on public pages; rest of the store remains original.

## Preservation
The ZIP retains all existing API functions, Supabase connection logic, Razorpay code, Resend email setup, the admin page, product catalog/images, and shopping cart. No credentials are stored in this ZIP.

## Deploy
Upload all files to the existing GitHub repository (keeping your Vercel Environment Variables unchanged), commit and wait for Vercel to deploy. Verify on mobile, tablet, and desktop after cache reload.

The Diwali photo is a seasonal marketing visualization, not a listing for any specific product.
