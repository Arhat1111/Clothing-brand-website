'use strict';
const assert = require('assert');
const { CATALOG, canonicalItems, validateSavedOrder, validateOrderPricing } = require('./api/_pricing');
const cases = [
 ['cobalt-blue-patchwork-tie-front-shirt',7500,'tops'],
 ['scarlet-structured-sleeve-midi-dress',7500,'dresses'],
 ['midnight-gold-embellished-mini-dress',15000,'dresses'],
 ['tangerine-ruffle-two-piece-set',11000,'festive'],
 ['powder-blue-asymmetric-two-piece-set',7500,'drapes'],
];
async function main() {
 for (const [id,price,category] of cases) {
   const p=CATALOG.find(p=>p.id===id); assert(p,`Missing ${id}`);
   assert.strictEqual(p.price,price);assert.strictEqual(p.pricePending,false);assert.strictEqual(p.category,category);
   const priceInfo=canonicalItems([{id,size:'M',qty:2,unitPrice:1,lineTotal:1,name:'ATTACK'}]);
   assert.strictEqual(priceInfo.subtotal,price*2);assert.strictEqual(priceInfo.items[0].unitPrice,price);
   const valid=await validateOrderPricing({items:[{id,size:'M',qty:2}],subtotal:price*2,total:price*2,discount:0,customer:{phone:'9999999999'}});
   assert.strictEqual(valid.total,price*2);
   await assert.rejects(()=>validateOrderPricing({items:[{id,size:'M',qty:1}],subtotal:1,total:1,customer:{phone:'9999999999'}}),/Prices have changed/);
 }
 const all=canonicalItems(cases.map(([id])=>({id,qty:1,size:'M'})));
 assert.strictEqual(all.subtotal,48500);
 const saved={items_json:all.items,subtotal:all.subtotal,total:all.subtotal,discount:0};
 assert.strictEqual(validateSavedOrder(saved).total,48500);
 assert.throws(()=>validateSavedOrder({...saved,total:1}),/Stored total/);
 assert.throws(()=>canonicalItems([{id:'non-existent',size:'M',qty:1}]),/not in the current catalogue/);
 const sold=CATALOG.find(p=>p.soldOut); if(sold)assert.throws(()=>canonicalItems([{id:sold.id,size:sold.sizes[0],qty:1}]),/not available/);
 const pending=CATALOG.find(p=>p.pricePending); if(pending)assert.throws(()=>canonicalItems([{id:pending.id,size:pending.sizes[0],qty:1}]),/not available/);
 console.log('PASS: 5 product prices/categories, subtotal ₹48,500, signed pricing logic, wrong prices, sold-out and pending blocks');
}
main().catch(e=>{console.error(e);process.exitCode=1});
