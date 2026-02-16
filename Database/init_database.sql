-- EcoRide Database Initialization Script
-- PostgreSQL - Idempotent and safe to re-run
-- This script combines all initialization steps in proper order

-- ==============================================================================
-- STEP 1: Create migration tracking table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- STEP 2: Create tables (idempotent)
-- ==============================================================================

-- Configuration table
CREATE TABLE IF NOT EXISTS configuration (
    id_configuration SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parameter table
CREATE TABLE IF NOT EXISTS parametre (
    parametre_id SERIAL PRIMARY KEY,
    property VARCHAR(50) NOT NULL,
    value VARCHAR(50) NOT NULL,
    id_configuration INTEGER NOT NULL,
    CONSTRAINT fk_parametre_configuration FOREIGN KEY (id_configuration)
        REFERENCES configuration(id_configuration) ON DELETE CASCADE
);

-- Role table
CREATE TABLE IF NOT EXISTS role (
    role_id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE
);

-- User table
CREATE TABLE IF NOT EXISTS "user" (
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
CREATE TABLE IF NOT EXISTS user_role (
    user_role_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id)
        REFERENCES "user"(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id)
        REFERENCES role(role_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE(user_id, role_id)
);

-- Brand table
CREATE TABLE IF NOT EXISTS brand (
    brand_id SERIAL PRIMARY KEY,
    label VARCHAR(80) NOT NULL
);

-- Vehicle table
CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id SERIAL PRIMARY KEY,
    model VARCHAR(80) NOT NULL,
    registration_number VARCHAR(80) NOT NULL UNIQUE,
    energy_type VARCHAR(80) NOT NULL,
    color VARCHAR(80) NOT NULL,
    first_registration_date DATE,
    brand_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    seat_count INTEGER NOT NULL,
    CONSTRAINT fk_vehicle_brand FOREIGN KEY (brand_id)
        REFERENCES brand(brand_id) ON DELETE RESTRICT,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id)
        REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Carpool table
CREATE TABLE IF NOT EXISTS carpool (
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
    CONSTRAINT fk_carpool_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicle(vehicle_id) ON DELETE RESTRICT,
    CONSTRAINT fk_carpool_user FOREIGN KEY (user_id)
        REFERENCES "user"(user_id) ON DELETE RESTRICT
);

-- Carpool participation table
CREATE TABLE IF NOT EXISTS carpool_participation (
    participation_id SERIAL PRIMARY KEY,
    carpool_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    participation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Confirmed',
    credits_used INTEGER NOT NULL,
    trip_validated BOOLEAN,
    problem_comment TEXT,
    CONSTRAINT fk_participation_carpool FOREIGN KEY (carpool_id)
        REFERENCES carpool(carpool_id) ON DELETE CASCADE,
    CONSTRAINT fk_participation_user FOREIGN KEY (user_id)
        REFERENCES "user"(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_participation UNIQUE(carpool_id, user_id)
);

-- Review table
CREATE TABLE IF NOT EXISTS review (
    review_id SERIAL PRIMARY KEY,
    comment VARCHAR(500) NOT NULL,
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    status VARCHAR(80) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    carpool_id INTEGER,
    CONSTRAINT fk_review_author FOREIGN KEY (author_user_id)
        REFERENCES "user"(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_target FOREIGN KEY (target_user_id)
        REFERENCES "user"(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_carpool FOREIGN KEY (carpool_id)
        REFERENCES carpool(carpool_id) ON DELETE SET NULL
);

-- ==============================================================================
-- STEP 3: Create indexes (idempotent)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_pseudo ON "user"(pseudo);
CREATE INDEX IF NOT EXISTS idx_carpool_city ON carpool(departure_city, arrival_city, departure_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_registration ON vehicle(registration_number);
CREATE INDEX IF NOT EXISTS idx_review_target ON review(target_user_id, status);
CREATE INDEX IF NOT EXISTS idx_participation_user ON carpool_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_participation_carpool ON carpool_participation(carpool_id);

-- ==============================================================================
-- STEP 4: Insert initial data (migration v1)
-- ==============================================================================
DO $$
BEGIN
    -- Check if migration v1 already executed
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 1) THEN

        -- Insert roles
        INSERT INTO role (role_id, label) VALUES
        (1, 'Passenger'),
        (2, 'Driver'),
        (3, 'Employee'),
        (4, 'Administrator')
        ON CONFLICT (label) DO NOTHING;

        -- Insert vehicle brands
        INSERT INTO brand (brand_id, label) VALUES
        (1, 'Renault'),
        (2, 'Peugeot'),
        (3, 'Citroën'),
        (4, 'Tesla'),
        (5, 'Volkswagen'),
        (6, 'Toyota'),
        (7, 'BMW'),
        (8, 'Mercedes')
        ON CONFLICT DO NOTHING;

        -- Insert test users (password: Password123!)
        INSERT INTO "user" (user_id, last_name, first_name, email, password, phone, pseudo, credit, is_active) VALUES
        (1, 'Dupont', 'Jean', 'jean.dupont@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0601020304', 'jeandu', 50, TRUE),
        (2, 'Martin', 'Marie', 'marie.martin@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0605060708', 'mariema', 30, TRUE),
        (3, 'Durand', 'Pierre', 'pierre.durand@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0609101112', 'pierredu', 45, TRUE),
        (4, 'Bernard', 'Sophie', 'sophie.bernard@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0613141516', 'sophieb', 25, TRUE),
        (5, 'Admin', 'EcoRide', 'admin@ecoride.fr', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0700000000', 'admin', 1000, TRUE),
        (6, 'Employee', 'Support', 'support@ecoride.fr', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0700000001', 'support', 0, TRUE)
        ON CONFLICT (email) DO NOTHING;

        -- Insert user roles
        INSERT INTO user_role (user_id, role_id) VALUES
        (1, 1), (1, 2),
        (2, 1), (2, 2),
        (3, 1), (3, 2),
        (4, 1),
        (5, 4),
        (6, 3)
        ON CONFLICT (user_id, role_id) DO NOTHING;

        -- Insert vehicles (green energy only: Electric, Hybrid, LPG)
        INSERT INTO vehicle (vehicle_id, model, registration_number, energy_type, color, first_registration_date, brand_id, user_id, seat_count) VALUES
        (1, 'Zoé', 'AB-123-CD', 'Electric', 'White', '2021-03-15', 1, 1, 4),
        (2, 'e-308', 'EF-456-GH', 'Electric', 'Black', '2020-06-20', 2, 2, 4),
        (3, 'Model 3', 'IJ-789-KL', 'Electric', 'Red', '2022-01-10', 4, 3, 4),
        (4, 'ë-C3', 'MN-012-OP', 'Electric', 'Blue', '2019-09-05', 3, 1, 4)
        ON CONFLICT (registration_number) DO NOTHING;

        -- Insert carpools
        INSERT INTO carpool (carpool_id, departure_date, departure_time, departure_location, departure_city, arrival_date, arrival_time, arrival_location, arrival_city, status, total_seats, available_seats, price_per_person, vehicle_id, user_id, estimated_duration_minutes) VALUES
        (1, '2025-12-20', '08:00', 'Gare Montparnasse', 'Paris', '2025-12-20', '12:30', 'Gare Bordeaux Saint-Jean', 'Bordeaux', 'Pending', 3, 2, 35, 1, 1, 270),
        (2, '2025-12-21', '14:00', 'Place Bellecour', 'Lyon', '2025-12-21', '18:00', 'Gare de Marseille', 'Marseille', 'Pending', 3, 3, 30, 2, 2, 240),
        (3, '2025-12-22', '09:00', 'Centre-ville', 'Lille', '2025-12-22', '14:00', 'Gare Centrale', 'Bruxelles', 'Pending', 3, 3, 25, 3, 3, 300),
        (4, '2025-12-23', '07:00', 'Aéroport Charles de Gaulle', 'Paris', '2025-12-23', '10:30', 'Gare de Strasbourg', 'Strasbourg', 'Pending', 3, 1, 40, 4, 1, 210),
        (5, '2025-12-18', '10:00', 'Gare de Lyon', 'Paris', '2025-12-18', '13:00', 'Gare Part-Dieu', 'Lyon', 'Completed', 3, 0, 30, 1, 1, 180)
        ON CONFLICT DO NOTHING;

        -- Insert participations
        INSERT INTO carpool_participation (participation_id, carpool_id, user_id, status, credits_used, trip_validated) VALUES
        (1, 1, 4, 'Confirmed', 35, NULL),
        (2, 4, 2, 'Confirmed', 40, NULL),
        (3, 4, 3, 'Confirmed', 40, NULL),
        (4, 5, 2, 'Validated', 30, TRUE),
        (5, 5, 3, 'Validated', 30, TRUE),
        (6, 5, 4, 'Validated', 30, TRUE)
        ON CONFLICT (carpool_id, user_id) DO NOTHING;

        -- Insert reviews
        INSERT INTO review (review_id, comment, note, status, author_user_id, target_user_id, carpool_id) VALUES
        (1, 'Excellent driver, very punctual and friendly!', 5, 'Validated', 2, 1, 5),
        (2, 'Pleasant trip, good atmosphere in the car.', 5, 'Validated', 3, 1, 5),
        (3, 'Nice driver but a bit late at departure.', 4, 'Validated', 4, 1, 5),
        (4, 'Great experience, I recommend!', 5, 'Pending', 1, 2, NULL)
        ON CONFLICT DO NOTHING;

        -- Reset sequences to correct values
        PERFORM setval('role_role_id_seq', (SELECT COALESCE(MAX(role_id), 1) FROM role));
        PERFORM setval('brand_brand_id_seq', (SELECT COALESCE(MAX(brand_id), 1) FROM brand));
        PERFORM setval('user_user_id_seq', (SELECT COALESCE(MAX(user_id), 1) FROM "user"));
        PERFORM setval('vehicle_vehicle_id_seq', (SELECT COALESCE(MAX(vehicle_id), 1) FROM vehicle));
        PERFORM setval('carpool_carpool_id_seq', (SELECT COALESCE(MAX(carpool_id), 1) FROM carpool));
        PERFORM setval('carpool_participation_participation_id_seq', (SELECT COALESCE(MAX(participation_id), 1) FROM carpool_participation));
        PERFORM setval('review_review_id_seq', (SELECT COALESCE(MAX(review_id), 1) FROM review));

        -- Mark migration as executed
        INSERT INTO schema_migrations (version, description) VALUES (1, 'Initial database schema and test data');

        RAISE NOTICE 'Migration v1: Initial database schema and test data - EXECUTED';
    ELSE
        RAISE NOTICE 'Migration v1: Initial database schema and test data - ALREADY EXECUTED, SKIPPED';
    END IF;
END $$;

-- ==============================================================================
-- STEP 5: Language preference migration (v2)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 2) THEN
        -- Add language column if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'user' AND column_name = 'language_preference'
        ) THEN
            ALTER TABLE "user" ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en';
            RAISE NOTICE 'Added language_preference column to user table';
        END IF;

        INSERT INTO schema_migrations (version, description) VALUES (2, 'Add language preference to users');
        RAISE NOTICE 'Migration v2: Add language preference - EXECUTED';
    ELSE
        RAISE NOTICE 'Migration v2: Add language preference - ALREADY EXECUTED, SKIPPED';
    END IF;
END $$;

-- ==============================================================================
-- STEP 6: Fix energy types migration (v3)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 3) THEN
        -- Standardize energy type values (green only: Electric, Hybrid, LPG)
        UPDATE vehicle SET energy_type = 'Electric' WHERE energy_type IN ('Électrique', 'electric', 'ELECTRIC', 'Electrique', 'Gasoline', 'Essence', 'essence', 'ESSENCE', 'Diesel', 'diesel', 'DIESEL', 'Gasoil', 'CNG', 'GNV', 'gnv');
        UPDATE vehicle SET energy_type = 'Hybrid' WHERE energy_type IN ('Hybride', 'hybrid', 'HYBRID');
        UPDATE vehicle SET energy_type = 'LPG' WHERE energy_type IN ('GPL', 'gpl');

        INSERT INTO schema_migrations (version, description) VALUES (3, 'Standardize energy type values (green only)');
        RAISE NOTICE 'Migration v3: Fix energy types - EXECUTED';
    ELSE
        RAISE NOTICE 'Migration v3: Fix energy types - ALREADY EXECUTED, SKIPPED';
    END IF;
END $$;

-- ==============================================================================
-- STEP 7: Add realistic seed data for testing (v4)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 4) THEN

        -- Insert more realistic test users (password: Password123!)
        INSERT INTO "user" (last_name, first_name, email, password, phone, pseudo, credit, is_active, birth_date, address) VALUES
        ('Moreau', 'Julie', 'julie.moreau@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0620304050', 'juliem', 75, TRUE, '1992-05-15', '12 Rue de la Paix, Paris'),
        ('Leroy', 'Thomas', 'thomas.leroy@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0621304051', 'thomasL', 60, TRUE, '1988-08-22', '45 Avenue des Champs, Lyon'),
        ('Simon', 'Emma', 'emma.simon@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0622304052', 'emmaS', 85, TRUE, '1995-03-10', '8 Boulevard Victor Hugo, Marseille'),
        ('Laurent', 'Lucas', 'lucas.laurent@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0623304053', 'lucasL', 40, TRUE, '1990-11-30', '23 Rue Nationale, Lille'),
        ('Michel', 'Chloé', 'chloe.michel@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0624304054', 'chloeM', 95, TRUE, '1993-07-18', '56 Cours de la Libération, Bordeaux'),
        ('Lefebvre', 'Hugo', 'hugo.lefebvre@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0625304055', 'hugoLef', 55, TRUE, '1987-12-05', '34 Rue du Commerce, Toulouse'),
        ('Roux', 'Léa', 'lea.roux@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0626304056', 'leaR', 70, TRUE, '1994-04-25', '15 Place Stanislas, Nancy'),
        ('David', 'Nathan', 'nathan.david@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0627304057', 'nathanD', 45, TRUE, '1991-09-14', '67 Avenue de la République, Nantes'),
        ('Bertrand', 'Camille', 'camille.bertrand@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0628304058', 'camilleB', 80, TRUE, '1989-06-08', '89 Rue Saint-Michel, Strasbourg'),
        ('Robert', 'Alexandre', 'alex.robert@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0629304059', 'alexR', 65, TRUE, '1996-02-20', '12 Quai des Belges, Marseille'),
        ('Richard', 'Sarah', 'sarah.richard@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0630304060', 'sarahR', 50, TRUE, '1992-10-12', '45 Rue de la Gare, Rennes'),
        ('Petit', 'Maxime', 'maxime.petit@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0631304061', 'maxP', 90, TRUE, '1985-01-28', '78 Avenue Jean Jaurès, Grenoble'),
        ('Garnier', 'Manon', 'manon.garnier@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0632304062', 'manonG', 35, TRUE, '1997-05-03', '23 Place Bellecour, Lyon'),
        ('Rousseau', 'Antoine', 'antoine.rousseau@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0633304063', 'antoineR', 100, TRUE, '1986-11-16', '56 Boulevard Haussmann, Paris'),
        ('Blanc', 'Laura', 'laura.blanc@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0634304064', 'lauraB', 55, TRUE, '1993-08-09', '34 Rue Foch, Nice'),
        ('Girard', 'Julien', 'julien.girard@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0635304065', 'julienG', 70, TRUE, '1990-03-27', '89 Cours Vitton, Lyon'),
        ('Fontaine', 'Clara', 'clara.fontaine@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0636304066', 'claraF', 45, TRUE, '1994-12-19', '12 Allée des Platanes, Montpellier'),
        ('Lopez', 'Nicolas', 'nicolas.lopez@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0637304067', 'nicolasL', 85, TRUE, '1988-07-04', '45 Rue de Rome, Marseille'),
        ('Bonnet', 'Océane', 'oceane.bonnet@email.com', '$2a$11$L/bUzUM58HcAshB.wHPh.uZsCsxfHs8wzUUWjHJ1/7M/.wsUwnbv2', '0638304068', 'oceaneB', 60, TRUE, '1995-09-21', '67 Avenue Wilson, Toulouse')
        ON CONFLICT (email) DO NOTHING;

        -- Assign roles to new users (mix of passengers and drivers)
        INSERT INTO user_role (user_id, role_id)
        SELECT u.user_id, 1 FROM "user" u WHERE u.email LIKE '%@email.com' AND u.user_id > 6
        ON CONFLICT (user_id, role_id) DO NOTHING;

        INSERT INTO user_role (user_id, role_id)
        SELECT u.user_id, 2 FROM "user" u WHERE u.email IN (
            'julie.moreau@email.com', 'thomas.leroy@email.com', 'emma.simon@email.com',
            'lucas.laurent@email.com', 'chloe.michel@email.com', 'hugo.lefebvre@email.com',
            'lea.roux@email.com', 'maxime.petit@email.com', 'antoine.rousseau@email.com',
            'julien.girard@email.com', 'nicolas.lopez@email.com'
        )
        ON CONFLICT (user_id, role_id) DO NOTHING;

        -- Insert more vehicles
        INSERT INTO vehicle (model, registration_number, energy_type, color, first_registration_date, brand_id, user_id, seat_count)
        SELECT model, registration, energy, color, reg_date::date, brand_id, user_id, seats
        FROM (VALUES
            ('Clio E-Tech', 'QR-567-ST', 'Hybrid', 'Red', '2020-05-10', 1, 7, 4),
            ('e-2008', 'UV-890-WX', 'Electric', 'Grey', '2021-02-15', 2, 8, 4),
            ('ID.3', 'YZ-234-AB', 'Electric', 'Blue', '2019-11-20', 5, 9, 5),
            ('Corolla Hybrid', 'CD-678-EF', 'Hybrid', 'White', '2022-04-05', 6, 10, 4),
            ('iX3', 'GH-012-IJ', 'Electric', 'Black', '2021-08-12', 7, 11, 5),
            ('EQA', 'KL-345-MN', 'Electric', 'Silver', '2020-10-25', 8, 12, 4),
            ('Mégane E-Tech', 'OP-789-QR', 'Electric', 'Green', '2022-01-30', 1, 13, 4),
            ('e-3008', 'ST-123-UV', 'Electric', 'Red', '2019-07-18', 2, 14, 5),
            ('ë-C4', 'WX-456-YZ', 'Electric', 'White', '2021-03-22', 3, 15, 4),
            ('Captur E-Tech', 'AB-890-CD', 'Hybrid', 'Orange', '2022-06-14', 1, 16, 4),
            ('Model S', 'EF-234-GH', 'Electric', 'Black', '2021-12-08', 4, 17, 5),
            ('ID.4', 'IJ-567-KL', 'Electric', 'Grey', '2020-09-03', 5, 18, 5),
            ('Yaris Hybrid', 'MN-901-OP', 'Hybrid', 'Blue', '2022-02-19', 6, 19, 4),
            ('i4', 'QR-345-ST', 'Electric', 'White', '2019-12-27', 7, 20, 4),
            ('EQB', 'UV-678-WX', 'Electric', 'Silver', '2021-05-11', 8, 21, 5)
        ) AS v(model, registration, energy, color, reg_date, brand_id, user_id, seats)
        WHERE NOT EXISTS (SELECT 1 FROM vehicle WHERE registration_number = v.registration)
        ON CONFLICT (registration_number) DO NOTHING;

        -- Insert many more carpools (past, present, future)
        INSERT INTO carpool (departure_date, departure_time, departure_location, departure_city, arrival_date, arrival_time, arrival_location, arrival_city, status, total_seats, available_seats, price_per_person, vehicle_id, user_id, estimated_duration_minutes)
        SELECT dep_date::date, dep_time, dep_loc, dep_city, arr_date::date, arr_time, arr_loc, arr_city, status, total, avail, price, veh_id, usr_id, duration
        FROM (VALUES
            -- Future carpools
            ('2026-02-15', '08:00', 'Gare Saint-Lazare', 'Paris', '2026-02-15', '12:00', 'Gare de Nantes', 'Nantes', 'Pending', 3, 3, 28, 5, 7, 240),
            ('2026-02-16', '14:30', 'Place Kléber', 'Strasbourg', '2026-02-16', '18:00', 'Gare de Lyon', 'Paris', 'Pending', 4, 4, 45, 6, 8, 210),
            ('2026-02-17', '07:00', 'Aéroport de Lyon', 'Lyon', '2026-02-17', '11:30', 'Gare de Grenoble', 'Grenoble', 'Pending', 3, 2, 20, 7, 9, 270),
            ('2026-02-18', '09:00', 'Gare Matabiau', 'Toulouse', '2026-02-18', '13:30', 'Centre-ville', 'Montpellier', 'Pending', 4, 4, 22, 8, 10, 270),
            ('2026-02-19', '16:00', 'Place Stanislas', 'Nancy', '2026-02-19', '19:30', 'Gare Centrale', 'Luxembourg', 'Pending', 3, 3, 18, 9, 11, 210),
            ('2026-02-20', '10:00', 'Gare Saint-Charles', 'Marseille', '2026-02-20', '14:00', 'Gare de Nice', 'Nice', 'Pending', 4, 3, 25, 10, 12, 240),
            ('2026-02-21', '08:30', 'Gare Part-Dieu', 'Lyon', '2026-02-21', '12:00', 'Gare de Genève', 'Genève', 'Pending', 3, 3, 30, 11, 13, 210),
            ('2026-02-22', '15:00', 'Place du Capitole', 'Toulouse', '2026-02-22', '19:30', 'Centre-ville', 'Bordeaux', 'Pending', 4, 4, 24, 12, 14, 270),
            ('2026-02-23', '07:30', 'Gare de Lille', 'Lille', '2026-02-23', '10:00', 'Gare du Nord', 'Paris', 'Pending', 3, 2, 26, 13, 15, 150),
            ('2026-02-24', '11:00', 'Aéroport de Marseille', 'Marseille', '2026-02-24', '15:30', 'Centre-ville', 'Toulouse', 'Pending', 4, 4, 35, 14, 16, 270),
            -- Recent past (completed)
            ('2026-01-25', '08:00', 'Gare Montparnasse', 'Paris', '2026-01-25', '11:30', 'Gare de Rennes', 'Rennes', 'Completed', 3, 0, 32, 15, 17, 210),
            ('2026-01-26', '14:00', 'Place Bellecour', 'Lyon', '2026-01-26', '17:30', 'Gare de Dijon', 'Dijon', 'Completed', 4, 0, 20, 16, 18, 210),
            ('2026-01-27', '09:30', 'Gare de Bordeaux', 'Bordeaux', '2026-01-27', '14:00', 'Centre-ville', 'La Rochelle', 'Completed', 3, 0, 18, 17, 19, 270),
            ('2026-01-28', '07:00', 'Gare de Toulouse', 'Toulouse', '2026-01-28', '11:30', 'Aéroport de Barcelone', 'Barcelone', 'Completed', 4, 0, 55, 18, 20, 270),
            ('2026-01-29', '16:00', 'Place de la Comédie', 'Montpellier', '2026-01-29', '19:00', 'Gare de Nîmes', 'Nîmes', 'Completed', 3, 0, 12, 19, 21, 180),
            ('2026-01-20', '10:00', 'Gare de Strasbourg', 'Strasbourg', '2026-01-20', '13:30', 'Gare de Mulhouse', 'Mulhouse', 'Completed', 4, 0, 15, 5, 7, 210),
            ('2026-01-21', '08:30', 'Centre-ville', 'Nice', '2026-01-21', '12:00', 'Gare de Monaco', 'Monaco', 'Completed', 3, 0, 20, 6, 8, 210),
            ('2026-01-22', '15:00', 'Gare Part-Dieu', 'Lyon', '2026-01-22', '18:30', 'Gare de Valence', 'Valence', 'Completed', 4, 0, 16, 7, 9, 210),
            ('2026-01-23', '07:30', 'Aéroport de Nantes', 'Nantes', '2026-01-23', '11:00', 'Centre-ville', 'Angers', 'Completed', 3, 0, 14, 8, 10, 210),
            ('2026-01-24', '12:00', 'Gare de Lille', 'Lille', '2026-01-24', '15:30', 'Centre-ville', 'Amiens', 'Completed', 4, 0, 18, 9, 11, 210),
            -- Older completed trips
            ('2026-01-10', '09:00', 'Gare de Lyon', 'Paris', '2026-01-10', '12:30', 'Gare Part-Dieu', 'Lyon', 'Completed', 3, 0, 30, 10, 12, 210),
            ('2026-01-11', '14:30', 'Place Kléber', 'Strasbourg', '2026-01-11', '18:00', 'Centre-ville', 'Colmar', 'Completed', 4, 0, 12, 11, 13, 210),
            ('2026-01-12', '08:00', 'Gare de Bordeaux', 'Bordeaux', '2026-01-12', '12:30', 'Centre-ville', 'Toulouse', 'Completed', 3, 0, 28, 12, 14, 270),
            ('2026-01-13', '16:00', 'Aéroport de Marseille', 'Marseille', '2026-01-13', '19:30', 'Gare d''Aix', 'Aix-en-Provence', 'Completed', 4, 0, 10, 13, 15, 210),
            ('2026-01-14', '10:30', 'Gare de Rennes', 'Rennes', '2026-01-14', '14:00', 'Centre-ville', 'Saint-Malo', 'Completed', 3, 0, 16, 14, 16, 210),
            ('2026-01-15', '07:00', 'Place Stanislas', 'Nancy', '2026-01-15', '11:30', 'Gare de Metz', 'Metz', 'Completed', 4, 0, 14, 15, 17, 270)
        ) AS c(dep_date, dep_time, dep_loc, dep_city, arr_date, arr_time, arr_loc, arr_city, status, total, avail, price, veh_id, usr_id, duration);

        -- Insert participations for completed carpools
        INSERT INTO carpool_participation (carpool_id, user_id, status, credits_used, trip_validated)
        SELECT c.carpool_id, u.user_id, 'Validated',
               CAST(c.price_per_person AS INTEGER),
               TRUE
        FROM carpool c
        CROSS JOIN LATERAL (
            SELECT user_id FROM "user"
            WHERE user_id != c.user_id
            AND user_id BETWEEN 7 AND 25
            ORDER BY RANDOM()
            LIMIT (c.total_seats - c.available_seats)
        ) u
        WHERE c.status = 'Completed'
        AND c.carpool_id > 5
        ON CONFLICT (carpool_id, user_id) DO NOTHING;

        -- Insert participations for upcoming carpools
        INSERT INTO carpool_participation (carpool_id, user_id, status, credits_used, trip_validated)
        SELECT c.carpool_id, u.user_id, 'Confirmed',
               CAST(c.price_per_person AS INTEGER),
               NULL
        FROM carpool c
        CROSS JOIN LATERAL (
            SELECT user_id FROM "user"
            WHERE user_id != c.user_id
            AND user_id BETWEEN 7 AND 25
            ORDER BY RANDOM()
            LIMIT (c.total_seats - c.available_seats)
        ) u
        WHERE c.status = 'Pending'
        AND c.carpool_id > 5
        AND c.available_seats < c.total_seats
        ON CONFLICT (carpool_id, user_id) DO NOTHING;

        -- Insert reviews for completed trips
        INSERT INTO review (comment, note, status, author_user_id, target_user_id, carpool_id)
        SELECT
            comments[floor(random() * array_length(comments, 1) + 1)],
            floor(random() * 2 + 4)::integer,
            CASE WHEN random() > 0.2 THEN 'Validated' ELSE 'Pending' END,
            cp.user_id,
            c.user_id,
            c.carpool_id
        FROM carpool_participation cp
        JOIN carpool c ON cp.carpool_id = c.carpool_id
        CROSS JOIN (VALUES (ARRAY[
            'Excellent conducteur, très ponctuel !',
            'Super trajet, ambiance conviviale.',
            'Très agréable, je recommande !',
            'Conduite prudente et sûre.',
            'Bon voyage, rien à redire.',
            'Sympathique mais un peu en retard.',
            'Trajet agréable et confortable.',
            'Très professionnel, parfait !',
            'Belle expérience de covoiturage.',
            'Conducteur avenant et courtois.'
        ])) AS t(comments)
        WHERE c.status = 'Completed'
        AND cp.trip_validated = TRUE
        AND c.carpool_id > 5
        AND random() > 0.3
        ON CONFLICT DO NOTHING;

        -- Mark migration as executed
        INSERT INTO schema_migrations (version, description) VALUES (4, 'Add realistic seed data for production-like testing');

        RAISE NOTICE 'Migration v4: Add realistic seed data - EXECUTED';
    ELSE
        RAISE NOTICE 'Migration v4: Add realistic seed data - ALREADY EXECUTED, SKIPPED';
    END IF;
END $$;

-- ==============================================================================
-- Summary
-- ==============================================================================
DO $$
DECLARE
    migration_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migration_count FROM schema_migrations;
    RAISE NOTICE '==============================================================================';
    RAISE NOTICE 'EcoRide Database Initialization Complete';
    RAISE NOTICE 'Total migrations executed: %', migration_count;
    RAISE NOTICE '==============================================================================';
END $$;
