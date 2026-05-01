create extension if not exists "pgcrypto";

-- Mobile parcel BFF support. Cross-table IDs intentionally remain plain uuid
-- columns without FK constraints, matching the Garnet mobile API contract.

create table if not exists public.parcel_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tracking_number text unique,
  status text not null default 'submitted',
  pickup_address text,
  pickup_lat numeric,
  pickup_lng numeric,
  delivery_address text,
  delivery_lat numeric,
  delivery_lng numeric,
  distance_text text,
  duration_text text,
  sender_name text,
  sender_phone text,
  receiver_name text,
  receiver_phone text,
  service_id text,
  service_price numeric,
  delivery_mode text,
  drop_off_point_id text,
  payment_method text,
  assigned_driver_id uuid,
  device_lat numeric,
  device_lng numeric,
  qr_code_url text,
  cancel_reason text,
  tracking_current_location text,
  tracking_progress_label text,
  tracking_progress_percentage integer not null default 0,
  step_completed integer not null default 5,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.parcel_drafts
  add column if not exists pickup_lat numeric,
  add column if not exists pickup_lng numeric,
  add column if not exists delivery_lat numeric,
  add column if not exists delivery_lng numeric,
  add column if not exists device_lat numeric,
  add column if not exists device_lng numeric,
  add column if not exists payment_method text,
  add column if not exists assigned_driver_id uuid,
  add column if not exists qr_code_url text,
  add column if not exists cancel_reason text,
  add column if not exists tracking_current_location text,
  add column if not exists tracking_progress_label text,
  add column if not exists tracking_progress_percentage integer not null default 0;

create index if not exists parcel_drafts_user_status_created_idx
  on public.parcel_drafts (user_id, status, created_at desc);

create table if not exists public.parcel_draft_items (
  id uuid primary key default gen_random_uuid(),
  parcel_draft_id uuid not null,
  size text,
  weight_text text,
  item_type text,
  delivery_guarantee text,
  quantity integer not null default 1,
  photo_url text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.parcel_draft_items
  add column if not exists photo_url text;

create index if not exists parcel_draft_items_draft_idx
  on public.parcel_draft_items (parcel_draft_id);

create table if not exists public.parcel_reviews (
  id uuid primary key default gen_random_uuid(),
  parcel_draft_id uuid not null,
  customer_user_id uuid not null,
  hub_id uuid,
  tracking_number text,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (parcel_draft_id, customer_user_id)
);

alter table public.parcel_reviews
  alter column hub_id drop not null;

create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_notifications_user_created_idx
  on public.customer_notifications (user_id, created_at desc);

create table if not exists public.driver_profiles (
  driver_user_id uuid primary key,
  vehicle_type text,
  license_number text,
  delivery_mode text not null default 'direct',
  is_online boolean not null default false,
  acceptance_rate numeric not null default 1,
  documents_status text not null default 'pending',
  profile_picture text,
  license_document_url text,
  registration_document_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.driver_jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null unique,
  parcel_draft_id uuid,
  customer_user_id uuid,
  driver_user_id uuid,
  pickup_address text not null,
  dropoff_address text not null,
  distance_text text,
  earnings_amount numeric not null default 0,
  status text not null default 'available',
  parcel_status text,
  customer_name text not null,
  customer_phone text,
  package_description text,
  special_instructions text,
  time_limit_text text,
  accepted_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists driver_jobs_status_idx
  on public.driver_jobs (status, updated_at desc);

create index if not exists driver_jobs_driver_status_idx
  on public.driver_jobs (driver_user_id, status, updated_at desc);

create table if not exists public.driver_job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  driver_user_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.driver_earnings (
  job_id uuid primary key,
  driver_user_id uuid not null,
  job_number text,
  amount numeric not null default 0,
  earned_at timestamptz not null default timezone('utc', now())
);

create index if not exists driver_earnings_driver_earned_idx
  on public.driver_earnings (driver_user_id, earned_at desc);

create table if not exists public.operator_hubs (
  id uuid primary key default gen_random_uuid(),
  operator_user_id uuid not null unique,
  hub_name text,
  hub_address text,
  lat numeric,
  lng numeric,
  storage_capacity integer not null default 0,
  is_active boolean not null default true,
  geofence_active boolean not null default false,
  profile_picture text,
  business_document_url text,
  documents_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.operator_earnings (
  id uuid primary key default gen_random_uuid(),
  operator_user_id uuid not null,
  hub_id uuid,
  earning_type text,
  amount numeric not null default 0,
  parcel_tracking_number text,
  earned_at timestamptz not null default timezone('utc', now())
);

create index if not exists operator_earnings_operator_earned_idx
  on public.operator_earnings (operator_user_id, earned_at desc);

create table if not exists public.operator_incentives (
  id uuid primary key default gen_random_uuid(),
  operator_user_id uuid not null,
  hub_id uuid,
  incentive_type text not null,
  title text not null,
  amount numeric not null default 0,
  awarded_at timestamptz not null default timezone('utc', now()),
  notes text
);

create index if not exists operator_incentives_operator_awarded_idx
  on public.operator_incentives (operator_user_id, awarded_at desc);
