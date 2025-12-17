-- EcoRide Database Initialization Script for Docker
-- PostgreSQL

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
CREATE TABLE "user" (
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
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(5) DEFAULT 'en'
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

-- Comments
COMMENT ON TABLE "user" IS 'EcoRide platform users table';
COMMENT ON TABLE carpool IS 'Proposed carpool trips table';
COMMENT ON TABLE carpool_participation IS 'Carpool participations table';
COMMENT ON TABLE review IS 'User reviews table';

-- Insert roles
INSERT INTO role (role_id, label) VALUES
(1, 'Passenger'),
(2, 'Driver'),
(3, 'Employee'),
(4, 'Administrator');

-- Insert vehicle brands
INSERT INTO brand (brand_id, label) VALUES
(1, 'Renault'),
(2, 'Peugeot'),
(3, 'Citroën'),
(4, 'Tesla'),
(5, 'Volkswagen'),
(6, 'Toyota'),
(7, 'BMW'),
(8, 'Mercedes');

-- Insert users (password: Password123!)
-- BCrypt hash for Password123!: $2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC
INSERT INTO "user" (user_id, last_name, first_name, email, password, phone, pseudo, credit, is_active) VALUES
(1, 'Dupont', 'Jean', 'jean.dupont@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0601020304', 'jeandu', 50, TRUE),
(2, 'Martin', 'Marie', 'marie.martin@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0605060708', 'mariema', 30, TRUE),
(3, 'Durand', 'Pierre', 'pierre.durand@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0609101112', 'pierredu', 45, TRUE),
(4, 'Bernard', 'Sophie', 'sophie.bernard@email.com', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0613141516', 'sophieb', 25, TRUE),
(5, 'Admin', 'EcoRide', 'admin@ecoride.fr', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0700000000', 'admin', 1000, TRUE),
(6, 'Employee', 'Support', 'support@ecoride.fr', '$2a$11$xOVKJvJIZ7y9H5cjYwX9Q.YJz1FqVmXRPz7tN9xYjHnOqPbU2U3IC', '0700000001', 'support', 0, TRUE);

-- Insert user roles
INSERT INTO user_role (user_id, role_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1), (3, 2),
(4, 1),
(5, 4),
(6, 3);

-- Insert vehicles
INSERT INTO vehicle (vehicle_id, model, registration_number, energy_type, color, first_registration_date, brand_id, user_id, seat_count) VALUES
(1, 'Zoé', 'AB-123-CD', 'Electric', 'White', '2021-03-15', 1, 1, 4),
(2, '308', 'EF-456-GH', 'Diesel', 'Black', '2020-06-20', 2, 2, 4),
(3, 'Model 3', 'IJ-789-KL', 'Electric', 'Red', '2022-01-10', 4, 3, 4),
(4, 'C3', 'MN-012-OP', 'Gasoline', 'Blue', '2019-09-05', 3, 1, 4);

-- Insert carpools
INSERT INTO carpool (carpool_id, departure_date, departure_time, departure_location, departure_city, arrival_date, arrival_time, arrival_location, arrival_city, status, total_seats, available_seats, price_per_person, vehicle_id, user_id, estimated_duration_minutes) VALUES
(1, '2025-12-20', '08:00', 'Gare Montparnasse', 'Paris', '2025-12-20', '12:30', 'Gare Bordeaux Saint-Jean', 'Bordeaux', 'Pending', 3, 2, 35, 1, 1, 270),
(2, '2025-12-21', '14:00', 'Place Bellecour', 'Lyon', '2025-12-21', '18:00', 'Gare de Marseille', 'Marseille', 'Pending', 3, 3, 30, 2, 2, 240),
(3, '2025-12-22', '09:00', 'Centre-ville', 'Lille', '2025-12-22', '14:00', 'Gare Centrale', 'Bruxelles', 'Pending', 3, 3, 25, 3, 3, 300),
(4, '2025-12-23', '07:00', 'Aéroport Charles de Gaulle', 'Paris', '2025-12-23', '10:30', 'Gare de Strasbourg', 'Strasbourg', 'Pending', 3, 1, 40, 4, 1, 210),
(5, '2025-12-18', '10:00', 'Gare de Lyon', 'Paris', '2025-12-18', '13:00', 'Gare Part-Dieu', 'Lyon', 'Completed', 3, 0, 30, 1, 1, 180);

-- Insert participations
INSERT INTO carpool_participation (participation_id, carpool_id, user_id, status, credits_used, trip_validated) VALUES
(1, 1, 4, 'Confirmed', 35, NULL),
(2, 4, 2, 'Confirmed', 40, NULL),
(3, 4, 3, 'Confirmed', 40, NULL),
(4, 5, 2, 'Validated', 30, TRUE),
(5, 5, 3, 'Validated', 30, TRUE),
(6, 5, 4, 'Validated', 30, TRUE);

-- Insert reviews
INSERT INTO review (review_id, comment, note, status, author_user_id, target_user_id, carpool_id) VALUES
(1, 'Excellent driver, very punctual and friendly!', 5, 'Validated', 2, 1, 5),
(2, 'Pleasant trip, good atmosphere in the car.', 5, 'Validated', 3, 1, 5),
(3, 'Nice driver but a bit late at departure.', 4, 'Validated', 4, 1, 5),
(4, 'Great experience, I recommend!', 5, 'Pending', 1, 2, NULL);

-- Reset sequences
SELECT setval('role_role_id_seq', (SELECT MAX(role_id) FROM role));
SELECT setval('brand_brand_id_seq', (SELECT MAX(brand_id) FROM brand));
SELECT setval('user_user_id_seq', (SELECT MAX(user_id) FROM "user"));
SELECT setval('vehicle_vehicle_id_seq', (SELECT MAX(vehicle_id) FROM vehicle));
SELECT setval('carpool_carpool_id_seq', (SELECT MAX(carpool_id) FROM carpool));
SELECT setval('carpool_participation_participation_id_seq', (SELECT MAX(participation_id) FROM carpool_participation));
SELECT setval('review_review_id_seq', (SELECT MAX(review_id) FROM review));
