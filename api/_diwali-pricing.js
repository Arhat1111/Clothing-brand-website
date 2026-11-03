// Server-authoritative Diwali pricing. Never trust amounts or product prices from the browser.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'catalog.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { timeout: 1000 });
const products = new Map((sandbox.window.FABLE_PRODUCTS || []).filter(p => !p.showcaseOnly && p.category !== 'celebrities' && p.category !== 'celebrity').map(p => [p.id, p]));
const roundMoney = n => Math.round((n + Number.EPSILON) * 100) / 100;
function priceOrder(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 40) throw Object.assign(new Error('Add valid items to the bag.'), { status: 400 });
  const clean = items.map(item => {
    const product = products.get(String(item.id || ''));
    const qty = Number(item.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20 || !product.sizes.includes(item.size)) throw Object.assign(new Error('Invalid product, quantity or size.'), { status: 400 });
    return { id: product.id, name: product.name, category: product.categoryLabel || product.category, size: item.size, qty, unitPrice: product.price, lineTotal: roundMoney(product.price * qty), image: product.image };
  });
  const subtotal = roundMoney(clean.reduce((a, b) => a + b.lineTotal, 0));
  const discount = roundMoney(subtotal * 0.10);
  return { items: clean, subtotal, discount, total: roundMoney(subtotal - discount), discountLabel: 'Diwali 10% off (sitewide)' };
}
module.exports = { priceOrder };
