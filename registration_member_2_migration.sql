ALTER TABLE registrationData
    ADD COLUMN IF NOT EXISTS member_2_email TEXT,
    ADD COLUMN IF NOT EXISTS member_2_phonenumber TEXT,
    ADD COLUMN IF NOT EXISTS member_2_department TEXT,
    ADD COLUMN IF NOT EXISTS member_2_university TEXT;
