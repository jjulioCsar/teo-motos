-- Migration: Update stores table and create leads table
-- Date: 2024-02-11

-- Extend Stores table with customization fields
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#4f46e5',
ADD COLUMN IF NOT EXISTS tertiary_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS is_dark_mode boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_financing boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_title text,
ADD COLUMN IF NOT EXISTS hero_subtitle text,
ADD COLUMN IF NOT EXISTS hero_image text,
ADD COLUMN IF NOT EXISTS about_text text,
ADD COLUMN IF NOT EXISTS about_subtitle text,
ADD COLUMN IF NOT EXISTS about_image text,
ADD COLUMN IF NOT EXISTS about_paragraphs text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS our_values text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS financing_text text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS map_url text;

-- Create LEADS table
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    motorcycle_id uuid REFERENCES public.motorcycles(id) ON DELETE SET NULL,
    name text NOT NULL,
    phone text NOT NULL,
    source text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads Policies
CREATE POLICY "Public can insert leads"
ON public.leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners and admins can view leads for their store"
ON public.leads FOR SELECT
USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() 
        and profiles.store_id = public.leads.store_id
    )
);

-- Ensure all profiles can view store data (for customization)
DROP POLICY IF EXISTS "Owners can update their own store" ON public.stores;
CREATE POLICY "Owners and admins can update their store"
ON public.stores FOR UPDATE
USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() 
        and profiles.store_id = public.stores.id
        and profiles.role in ('owner', 'admin')
    )
);
