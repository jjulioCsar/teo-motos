-- Add dynamic text fields for Contact Page
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS contact_title text DEFAULT 'Fale Conosco',
ADD COLUMN IF NOT EXISTS contact_subtitle text DEFAULT 'Vamos começar uma nova jornada?',
ADD COLUMN IF NOT EXISTS address_title text DEFAULT 'Nossa Loja',
ADD COLUMN IF NOT EXISTS address_description text DEFAULT 'Venha tomar um café conosco e conhecer nosso showroom exclusivo.',
ADD COLUMN IF NOT EXISTS channels_title text DEFAULT 'Canais Diretos',
ADD COLUMN IF NOT EXISTS channels_description text DEFAULT 'Atendimento ágil e personalizado para tirar todas as suas dúvidas.',
ADD COLUMN IF NOT EXISTS hours_title text DEFAULT 'Horários',
ADD COLUMN IF NOT EXISTS hours_description text DEFAULT 'Estamos prontos para te receber nos seguintes horários:',
ADD COLUMN IF NOT EXISTS hours_weekdays text DEFAULT 'Segunda à Sexta 08:00 - 18:00',
ADD COLUMN IF NOT EXISTS hours_saturday text DEFAULT 'Sábado 08:00 - 13:00';

-- Force cache reload
NOTIFY pgrst, 'reload schema';
