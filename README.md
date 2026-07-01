# Fable by Kavita Anu - E-commerce Website

A responsive multi-page fashion storefront built with plain HTML, CSS and JavaScript.

## Pages

- `index.html` - animated brand home page
- `products.html` - complete shop with category filters and search

## Included

- 21 product photographs extracted and web-optimised from the supplied Fable lookbooks
- Sarees, Lehengas, Kurta Sets and Fusion Edit categories
- Product search and URL-based category filtering
- Product quick-view modal and size selection
- Persistent shopping bag using browser `localStorage`
- Quantity controls, subtotal calculation and remove actions
- Order-enquiry form that copies the complete order and opens Fable's Instagram
- Responsive desktop, tablet and mobile layouts
- Parallax, reveal, hover, marquee and micro-interaction animations
- Reduced-motion accessibility support

## Run locally

Open `index.html` directly, or start a local server in this folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Before publishing

1. The product names, descriptions and prices in `catalog.js` are website-ready placeholders inferred from the supplied photographs. Confirm and replace them with the brand's final catalogue information.
2. The checkout currently creates an order enquiry rather than collecting payment. Add a secure backend and payment gateway before enabling online payments.
3. Confirm the final shipping, return, privacy and terms policies.
4. Replace or extend the Instagram enquiry flow with the brand's official WhatsApp number, email or commerce backend when available.
