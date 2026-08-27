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
