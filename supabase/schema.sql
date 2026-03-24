-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table to store additional user/partner info
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text unique,
  email text unique,
  role text check (role in ('user', 'partner')),
  city text,
  zone text,
  kyc_status text default 'pending' check (kyc_status in ('pending', 'approved', 'rejected')),
  status text default 'offline' check (status in ('online', 'ontrip', 'offline')),
  is_online boolean default false,
  experience text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings table (Shared with user app)
create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  partner_id uuid references auth.users on delete set null,
  vehicle_number text,
  vehicle_type text,
  pickup_location text,
  parking_location text,
  status text default 'searching' check (status in ('searching', 'accepted', 'valet_enroute_pickup', 'valet_arrived_pickup', 'valet_enroute_drop', 'parked', 'valet_enroute_return', 'completed', 'cancelled')),
  cost decimal(10, 2) default 0,
  distance text,
  duration text,
  parked_at timestamp with time zone,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Parking Locations (Partner's managed spots)
create table if not exists parking_locations (
  id uuid default uuid_generate_v4() primary key,
  partner_id uuid references auth.users on delete cascade,
  name text,
  address text,
  total_slots integer default 0,
  available_slots integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table parking_locations enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Bookings Policies
create policy "Bookings are viewable by involved parties." on bookings for select using (auth.uid() = user_id or auth.uid() = partner_id);
create policy "Users can insert bookings." on bookings for insert with check (auth.uid() = user_id);
create policy "Involved parties can update bookings." on bookings for update using (auth.uid() = user_id or auth.uid() = partner_id);

-- Parking Locations Policies
create policy "Parking locations are viewable by everyone." on parking_locations for select using (true);
create policy "Partners can manage their own locations." on parking_locations for all using (auth.uid() = partner_id);

-- Support Tickets table
create table if not exists support_tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  subject text,
  category text,
  description text,
  status text default 'open' check (status in ('open', 'resolved', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table (Chat)
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings on delete cascade,
  sender_id uuid references auth.users on delete cascade,
  text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Support Tickets
alter table support_tickets enable row level security;
create policy "Users can manage their own tickets." on support_tickets for all using (auth.uid() = user_id);

-- RLS for Messages
alter table messages enable row level security;
create policy "Messages are viewable by involved parties." on messages for select using (
  exists (
    select 1 from bookings 
    where bookings.id = messages.booking_id 
    and (bookings.user_id = auth.uid() or bookings.partner_id = auth.uid())
  )
);
create policy "Users can insert their own messages." on messages for insert with check (auth.uid() = sender_id);
