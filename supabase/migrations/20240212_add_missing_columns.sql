-- Add missing columns to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS whatsapp_message text DEFAULT 'Olá! Tenho interesse em uma moto.',
ADD COLUMN IF NOT EXISTS navbar_cta text DEFAULT 'Premium Motorcycle Marketplace';

-- Verify the columns were added (optional, but good for confirmation)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stores';
