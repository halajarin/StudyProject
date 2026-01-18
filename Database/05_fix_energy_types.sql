-- Fix energy type values from French to English
-- This script converts French energy type values to match the EnergyType enum

\c ecoride

-- Update French values to English enum values
UPDATE vehicle
SET energy_type = CASE
    WHEN energy_type = 'Essence' THEN 'Gasoline'
    WHEN energy_type = 'Diesel' THEN 'Diesel'
    WHEN energy_type = 'Électrique' THEN 'Electric'
    WHEN energy_type = 'Electrique' THEN 'Electric'
    WHEN energy_type = 'Hybride' THEN 'Hybrid'
    WHEN energy_type = 'GPL' THEN 'LPG'
    WHEN energy_type = 'GNC' THEN 'CNG'
    ELSE energy_type
END
WHERE energy_type IN ('Essence', 'Électrique', 'Electrique', 'Hybride', 'GPL', 'GNC');

-- Display the results
SELECT energy_type, COUNT(*) as count
FROM vehicle
GROUP BY energy_type
ORDER BY energy_type;
