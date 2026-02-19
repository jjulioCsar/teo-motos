-- PRODUCTION SCHEMA EXPANSION FOR DREAMMOTOS
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Expand STORES table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS whatsapp_message text,
ADD COLUMN IF NOT EXISTS financing_title text,
ADD COLUMN IF NOT EXISTS financing_subtitle text,
ADD COLUMN IF NOT EXISTS financing_hero_image text,
ADD COLUMN IF NOT EXISTS financing_main_title text,
ADD COLUMN IF NOT EXISTS financing_secondary_image text,
ADD COLUMN IF NOT EXISTS navbar_cta text,
ADD COLUMN IF NOT EXISTS contact_title text,
ADD COLUMN IF NOT EXISTS contact_subtitle text,
ADD COLUMN IF NOT EXISTS address_title text,
ADD COLUMN IF NOT EXISTS address_description text,
ADD COLUMN IF NOT EXISTS channels_title text,
ADD COLUMN IF NOT EXISTS channels_description text,
ADD COLUMN IF NOT EXISTS hours_title text,
ADD COLUMN IF NOT EXISTS hours_description text,
ADD COLUMN IF NOT EXISTS hours_weekdays text,
ADD COLUMN IF NOT EXISTS hours_saturday text,
ADD COLUMN IF NOT EXISTS feature1_title text,
ADD COLUMN IF NOT EXISTS feature1_desc text,
ADD COLUMN IF NOT EXISTS feature2_title text,
ADD COLUMN IF NOT EXISTS feature2_desc text,
ADD COLUMN IF NOT EXISTS feature3_title text,
ADD COLUMN IF NOT EXISTS feature3_desc text,
ADD COLUMN IF NOT EXISTS featured_title text,
ADD COLUMN IF NOT EXISTS about_teaser_title text,
ADD COLUMN IF NOT EXISTS about_teaser_text text;

-- 2. Expand MOTORCYCLES table
ALTER TABLE public.motorcycles
ADD COLUMN IF NOT EXISTS condition text,
ADD COLUMN IF NOT EXISTS has_warranty boolean DEFAULT false;

-- 3. Update comments for clarity
COMMENT ON COLUMN public.stores.contact_subtitle IS 'Subtitle for the contact page with optional ? line break';
COMMENT ON COLUMN public.motorcycles.condition IS 'Condition: New, Used, etc';
