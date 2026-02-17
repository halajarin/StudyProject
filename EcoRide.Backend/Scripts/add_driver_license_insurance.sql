-- Add has_driver_license and has_insurance columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS has_driver_license BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN NOT NULL DEFAULT FALSE;

-- Set existing drivers to true (they already confirmed when becoming driver)
UPDATE "user" SET has_driver_license = TRUE, has_insurance = TRUE
WHERE user_id IN (SELECT user_id FROM user_role WHERE role_id = 2);

-- Remove address and birth_date columns (no longer used)
ALTER TABLE "user" DROP COLUMN IF EXISTS address;
ALTER TABLE "user" DROP COLUMN IF EXISTS birth_date;
