-- Add language preference column to user table
-- PostgreSQL

\c ecoride

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add comment
COMMENT ON COLUMN "user".preferred_language IS 'User''s preferred interface language (en, fr, etc.)';

-- Create index for faster filtering by language
CREATE INDEX IF NOT EXISTS idx_user_preferred_language ON "user"(preferred_language);

-- Update existing users to default language based on their profile
-- (optional: could set to 'fr' based on other criteria)
UPDATE "user" SET preferred_language = 'en' WHERE preferred_language IS NULL;
