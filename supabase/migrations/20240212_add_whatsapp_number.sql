-- Add missing whatsapp_number column to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Optional: Copy data from old 'whatsapp' column if it exists to preserve data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'whatsapp') THEN
        UPDATE public.stores SET whatsapp_number = whatsapp WHERE whatsapp_number IS NULL;
    END IF;
END $$;

NOTIFY pgrst, 'reload config';
