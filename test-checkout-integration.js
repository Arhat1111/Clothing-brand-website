'use strict';
const assert=require('assert'); const crypto=require('crypto');
process.env.SUPABASE_URL='https://fake-supabase.test';process.env.SUPABASE_SERVICE_ROLE_KEY='test-secret';process.env.RAZORPAY_KEY_ID='rzp_test_dummy';process.env.RAZORPAY_KEY_SECRET='secret-test';
const stored=new Map();let paymentOrder=null, paymentAmount=null;
const response=(data,status=200)=>({ok:status>=200&&status<300,status,async json(){return data},async text(){return JSON.stringify(data)}});
global.fetch=async(url,options={})=>{
 const u=new URL(url);const method=options.method||'GET';
 if(u.hostname==='fake-supabase.test'&&u.pathname==='/rest/v1/orders'){
  if(method==='POST'){let r=JSON.parse(options.body);stored.set(r.id,r);return response([r]);}
  if(method==='GET'){let id=u.searchParams.get('id'); id=id?.replace(/^eq\./,'');const found=stored.get(id);return response(found?[found]:[]);}
  if(method==='PATCH'){
   const id=u.searchParams.get('id')?.replace(/^eq\./,'');let row=stored.get(id);if(!row)return response([]);
   for(let [k,v] of u.searchParams.entries()){
    if(k==='id'||k==='select')continue;
    if(v.startsWith('eq.') && String(row[k]??'')!==v.slice(3))return response([]);
   }
   row={...row,...JSON.parse(options.body)};stored.set(id,row);return response([row]);
  }
 }
 if(u.hostname==='api.razorpay.com'&&u.pathname==='/v1/orders'&&method==='POST'){
  const body=JSON.parse(options.body);paymentAmount=body.amount;paymentOrder={id:'order_rzp_test',amount:body.amount,currency:'INR'};return response(paymentOrder);
 }
 if(u.hostname==='api.razorpay.com'&&u.pathname==='/v1/payments/pay_test')return response({id:'pay_test',order_id:paymentOrder.id,amount:paymentAmount,currency:'INR',status:'captured'});
 throw Error('Unexpected request '+method+' '+url);
};
function res(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(x){this.body=JSON.parse(x)}}};
async function req(handler,body){const r=res();await handler({method:'POST',headers:{origin:'https://example.test'},body},r);return r;}
const save=require('./api/orders'); const create=require('./api/razorpay-create-order');const verify=require('./api/razorpay-verify-payment');
async function run(){
 const ids=['cobalt-blue-patchwork-tie-front-shirt','scarlet-structured-sleeve-midi-dress','midnight-gold-embellished-mini-dress','tangerine-ruffle-two-piece-set','powder-blue-asymmetric-two-piece-set'];
 const items=ids.map(id=>({id,qty:1,size:'M',unitPrice:1,lineTotal:1,image:'data:image/png;base64,HUGE'}));
 let input={items,subtotal:48500,total:48500,discount:0,customer:{name:'Test',email:'test@example.org',phone:'9999999999',city:'Surat',address:'Test'},paymentStatus:'paid'};
 let response=await req(save,input); assert.equal(response.statusCode,200,JSON.stringify(response.body));
 let order=response.body.order;assert.equal(order.total,48500);assert.equal(order.paymentStatus,'payment_pending');assert.equal(order.items[0].unitPrice,7500);assert.equal(order.items[0].image,'');
 let tampered=await req(save,{...input,total:20,subtotal:20});assert.equal(tampered.statusCode,400);
 let forged=await req(create,{local_order_id:order.id,amount:100});assert.equal(forged.statusCode,200,JSON.stringify(forged.body));assert.equal(forged.body.order.amount,4850000);
 let fake=await req(verify,{local_order_id:'fable-fake-id-12345',razorpay_order_id:'order_rzp_test',razorpay_payment_id:'pay_test',razorpay_signature:'abc'});assert.equal(fake.statusCode,400);
 const sig=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update('order_rzp_test|pay_test').digest('hex');
 let paid=await req(verify,{local_order_id:order.id,razorpay_order_id:'order_rzp_test',razorpay_payment_id:'pay_test',razorpay_signature:sig});assert.equal(paid.statusCode,200,JSON.stringify(paid.body));assert.equal(paid.body.order.paymentStatus,'paid');
 let another=await req(create,{local_order_id:order.id});assert.equal(another.statusCode,409);
 console.log('PASS: full mock flow Supabase pending → Razorpay ₹48,500 → payment verification → Supabase paid');
 console.log('PASS: browser amount ignored, forged subtotal rejected, payment signature checked, replay blocked');
}
run().catch(e=>{console.error(e);process.exitCode=1});
