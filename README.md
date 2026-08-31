# Fable by Kavita Anu - E-commerce Website

Updated full responsive website for Fable by Kavita Anu.

## Included
- Main website layout inspired by the live Fable visual direction
- Saree, Rakhi/Festive, and What Celebrities Wear product pages
- Updated celebrity-product pricing from the latest product upload
- Multiple images per celebrity product from the New Look Book
- Product quick-view popup with image slider, arrows, thumbnails, and keyboard support
- Cart, size selection, order enquiry flow, and responsive mobile layout

Open `index.html` to start.


Update: The What Celebrities Wear page now shows a two-row product preview followed by a button linking to the full products page.


Latest update:
- Added Our Story page with the two-friends origin story.
- Added Size Guide page for Indian ethnic wear measurements.
- Added WhatsApp free consultation buttons and updated enquiry flow to WhatsApp.


## Favicon / Google icon
A branded Fable monogram favicon has been added in ICO, SVG, PNG, Apple Touch Icon, and Web Manifest formats. Upload the files to the website root so browsers and Google can pick up the icon. Google may take time to refresh cached search-result icons after deployment.

## WhatsApp updates popup and admin dashboard

This version adds a WhatsApp updates popup to the public pages. It asks for the customer's name and WhatsApp number, then saves the entry in browser localStorage under `fable-whatsapp-update-leads-v1`.

Open `admin.html` to view the admin dashboard. Demo passcode: `FABLE2026`.

Admin features included:
- view saved subscriber names and phone numbers
- search subscribers
- export CSV
- copy all numbers
- open a pre-filled WhatsApp chat per subscriber
- mark subscribers as messaged after opening WhatsApp

Important: Because this is a static HTML/CSS/JS website, the included admin dashboard stores data only in the browser. For live production, connect the popup to a real database such as Firebase/Google Sheets and use the official WhatsApp Business API or an approved provider to send automated messages.


## WhatsApp updates discount

The website popup now collects name + WhatsApp number and applies a 5% first-order discount automatically in the shopping bag.

How the one-time rule works in this static version:
- The entered WhatsApp number is normalized to digits only. Indian 10-digit numbers are stored as `91XXXXXXXXXX`.
- Subscriber entries are saved under `fable-whatsapp-update-leads-v1`.
- A separate discount ledger is saved under `fable-discount-phone-ledger-v2`.
- If the ledger says the phone number is `used`, or the number exists in the legacy used-phone list, the 5% discount will not apply again.
- When the customer submits the order enquiry, the same normalized phone number must be used in checkout. Then the ledger is marked `used` with a timestamp.

Important: This static version prevents repeat discount use in the same browser/device storage. For live cross-device enforcement and real phone ownership verification, connect the popup to Firebase/Supabase/Google Sheets, verify the phone number with OTP, and check the central discount ledger before applying the discount.

## Google Analytics

The Google tag `G-95XXSLB0LH` has been inserted once immediately after the `<head>` tag on every HTML page.
