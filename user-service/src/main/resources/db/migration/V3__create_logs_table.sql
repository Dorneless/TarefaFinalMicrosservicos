CREATE TABLE logs (
    id UUID PRIMARY KEY,
    user_email VARCHAR(255),
    timestamp TIMESTAMP,
    body TEXT,
    status_code INTEGER,
    method VARCHAR(255),
    service VARCHAR(255),
    ip VARCHAR(255),
    path VARCHAR(255)
);
