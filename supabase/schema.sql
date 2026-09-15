-- Fable by Kavita Anu — Supabase schema
-- Run this in Supabase SQL Editor.

create table if not exists public.orders (
  id text primary key,
  source text,
  status text default 'enquiry_received',
  payment_status text default 'not_paid',
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_city text,
  customer_address text,
  note text,
  subtotal integer default 0,
  discount integer default 0,
  total integer default 0,
  discount_label text,
  items_json jsonb default '[]'::jsonb,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fable_orders_created_at on public.orders(created_at desc);
create index if not exists idx_fable_orders_customer_phone on public.orders(customer_phone);
create index if not exists idx_fable_orders_customer_email on public.orders(customer_email);
create index if not exists idx_fable_orders_payment_status on public.orders(payment_status);

create table if not exists public.subscribers (
  id text primary key,
  name text,
  raw_phone text,
  phone text unique not null,
  source_page text,
  status text default 'Subscribed',
  discount_eligible boolean default true,
  discount_used_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fable_subscribers_created_at on public.subscribers(created_at desc);
create index if not exists idx_fable_subscribers_phone on public.subscribers(phone);

alter table public.orders enable row level security;
alter table public.subscribers enable row level security;

-- No public RLS policies are required because the browser does NOT talk to Supabase directly.
-- Vercel API functions use the server-side SUPABASE_SERVICE_ROLE_KEY / secret key.
