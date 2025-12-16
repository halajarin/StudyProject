-- Table creation script for EcoRide
-- PostgreSQL

-- Connect to ecoride database
\c ecoride

-- Configuration table
CREATE TABLE configuration (
    id_configuration SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parameter table
CREATE TABLE parametre (
    parametre_id SERIAL PRIMARY KEY,
    property VARCHAR(50) NOT NULL,
    value VARCHAR(50) NOT NULL,
    id_configuration INTEGER NOT NULL,
    FOREIGN KEY (id_configuration) REFERENCES configuration(id_configuration) ON DELETE CASCADE
);

-- Role table
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE
);

-- User table
CREATE TABLE user (
    user_id SERIAL PRIMARY KEY,
    last_name VARCHAR(80) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    email VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(80) NOT NULL,
    phone VARCHAR(80),
    address VARCHAR(80),
    birth_date DATE,
    photo BYTEA,
    pseudo VARCHAR(80) NOT NULL UNIQUE,
    credit INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User role association table
CREATE TABLE user_role (
    user_role_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- Brand table
CREATE TABLE brand (
    brand_id SERIAL PRIMARY KEY,
    label VARCHAR(80) NOT NULL
);

-- Vehicle table
CREATE TABLE vehicle (
    vehicle_id SERIAL PRIMARY KEY,
    model VARCHAR(80) NOT NULL,
    registration_number VARCHAR(80) NOT NULL UNIQUE,
    energy_type VARCHAR(80) NOT NULL,
    color VARCHAR(80) NOT NULL,
    first_registration_date DATE,
    brand_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    seat_count INTEGER NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES brand(brand_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Carpool table
CREATE TABLE carpool (
    carpool_id SERIAL PRIMARY KEY,
    departure_date DATE NOT NULL,
    departure_time VARCHAR(80) NOT NULL,
    departure_location VARCHAR(80) NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time VARCHAR(80) NOT NULL,
    arrival_location VARCHAR(80) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    status VARCHAR(80) DEFAULT 'Pending',
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_person FLOAT NOT NULL,
    vehicle_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_duration_minutes INTEGER,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE RESTRICT
);

-- Carpool participation table
CREATE TABLE carpool_participation (
    participation_id SERIAL PRIMARY KEY,
    carpool_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    participation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Confirmed',
    credits_used INTEGER NOT NULL,
    trip_validated BOOLEAN,
    problem_comment TEXT,
    FOREIGN KEY (carpool_id) REFERENCES carpool(carpool_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    UNIQUE(carpool_id, user_id)
);

-- Review table
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    comment VARCHAR(500) NOT NULL,
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    status VARCHAR(80) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    carpool_id INTEGER,
    FOREIGN KEY (author_user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (carpool_id) REFERENCES carpool(carpool_id) ON DELETE SET NULL
);

-- Create indexes for performance improvement
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_pseudo ON "user"(pseudo);
CREATE INDEX idx_carpool_city ON carpool(departure_city, arrival_city, departure_date);
CREATE INDEX idx_vehicle_registration ON vehicle(registration_number);
CREATE INDEX idx_review_target ON review(target_user_id, status);
CREATE INDEX idx_participation_user ON carpool_participation(user_id);
CREATE INDEX idx_participation_carpool ON carpool_participation(carpool_id);

COMMENT ON TABLE "user" IS 'EcoRide platform users table';
COMMENT ON TABLE carpool IS 'Proposed carpool trips table';
COMMENT ON TABLE carpool_participation IS 'Carpool participations table';
COMMENT ON TABLE review IS 'User reviews table';
