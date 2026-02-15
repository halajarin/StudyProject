-- Add deactivated_at column to track account closure date
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
