-- Fix energy type values — green energy only: Electric, Hybrid, LPG
-- Converts all legacy/French values and removes non-green types

\c ecoride

-- Convert all non-green types to Electric, standardize French values
UPDATE vehicle
SET energy_type = CASE
    WHEN energy_type IN ('Électrique', 'Electrique', 'electric', 'ELECTRIC') THEN 'Electric'
    WHEN energy_type IN ('Hybride', 'hybrid', 'HYBRID') THEN 'Hybrid'
    WHEN energy_type IN ('GPL', 'gpl') THEN 'LPG'
    WHEN energy_type IN ('Essence', 'Gasoline', 'Diesel', 'Gasoil', 'CNG', 'GNV', 'GNC') THEN 'Electric'
    ELSE energy_type
END
WHERE energy_type NOT IN ('Electric', 'Hybrid', 'LPG');

-- Display the results
SELECT energy_type, COUNT(*) as count
FROM vehicle
GROUP BY energy_type
ORDER BY energy_type;
