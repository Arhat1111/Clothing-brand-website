# Image loading fix

Celebrity showcase images were previously referenced from `assets/celebrities/showcase/`. Some deployments were not serving that nested folder correctly, causing the celebrity cards to show blank gradient blocks.

Fix applied:
- Copied every showcase image into `assets/celebrities/` top-level.
- Updated `catalog.js` to use the top-level image paths.
- Added a JavaScript fallback that automatically retries without `/showcase/` if an older cached image path fails.
- Added cache-busting to CSS/JS references.
