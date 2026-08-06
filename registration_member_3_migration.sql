ALTER TABLE registrationData
    ADD COLUMN IF NOT EXISTS member_3 TEXT,
    ADD COLUMN IF NOT EXISTS member_3_email TEXT,
    ADD COLUMN IF NOT EXISTS member_3_phonenumber TEXT,
    ADD COLUMN IF NOT EXISTS member_3_department TEXT,
    ADD COLUMN IF NOT EXISTS member_3_university TEXT;
