ALTER TABLE registrationData ADD COLUMN IF NOT EXISTS reference_code VARCHAR(4);
CREATE INDEX IF NOT EXISTS registrationdata_reference_code_idx ON registrationData (reference_code);
