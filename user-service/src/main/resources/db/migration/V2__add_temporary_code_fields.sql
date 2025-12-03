ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

ALTER TABLE users ADD COLUMN temporary_code VARCHAR(6);
ALTER TABLE users ADD COLUMN temporary_code_expires_at TIMESTAMP;

CREATE INDEX idx_users_temporary_code ON users(temporary_code) WHERE temporary_code IS NOT NULL;
