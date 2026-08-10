ALTER TABLE teamRegistrationData
ADD COLUMN IF NOT EXISTS delivery_address TEXT NOT NULL DEFAULT '';
