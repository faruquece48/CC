CREATE TABLE IF NOT EXISTS singleRegistrationData (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES registrationData(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phonenumber TEXT NOT NULL,
    department TEXT NOT NULL,
    university TEXT NOT NULL,
    events TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teamRegistrationData (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES registrationData(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    teamname TEXT NOT NULL,
    delivery_address TEXT NOT NULL DEFAULT '',
    members JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS single_registration_parent_idx
    ON singleRegistrationData(registration_id);

CREATE INDEX IF NOT EXISTS team_registration_parent_idx
    ON teamRegistrationData(registration_id);
