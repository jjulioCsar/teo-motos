-- Add condition and warranty fields to motorcycles table
-- Condition values: 'Nova', 'Seminova', 'Repasse'

ALTER TABLE motorcycles
ADD COLUMN IF NOT EXISTS condition text DEFAULT 'Seminova',
ADD COLUMN IF NOT EXISTS has_warranty boolean DEFAULT false;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload schema';
