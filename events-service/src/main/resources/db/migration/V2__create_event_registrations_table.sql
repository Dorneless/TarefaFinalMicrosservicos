CREATE TABLE event_registrations (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT false,
    attended_at TIMESTAMP,
    registered_by VARCHAR(255) NOT NULL,
    CONSTRAINT uk_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_registrations_user_email ON event_registrations(user_email);
CREATE INDEX idx_registrations_attended ON event_registrations(attended);
