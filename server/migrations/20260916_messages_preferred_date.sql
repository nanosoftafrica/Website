-- Migration: Add preferred_date and preferred_time to Messages table
-- Date: September 16, 2026
-- Purpose: Fix "column preferred_date does not exist" runtime error when loading Messages / Dashboard.

DO $$
BEGIN
  -- Check and update "Messages" table (quoted identifier created by Sequelize)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Messages') THEN
    ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS preferred_date DATE;
    ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(50);
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Messages' AND column_name = 'preferredDate') THEN
      UPDATE "Messages" SET preferred_date = "preferredDate" WHERE preferred_date IS NULL AND "preferredDate" IS NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Messages' AND column_name = 'preferredTime') THEN
      UPDATE "Messages" SET preferred_time = "preferredTime" WHERE preferred_time IS NULL AND "preferredTime" IS NOT NULL;
    END IF;
  END IF;

  -- Check and update lowercase "messages" table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS preferred_date DATE;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(50);

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'preferredDate') THEN
      UPDATE messages SET preferred_date = "preferredDate" WHERE preferred_date IS NULL AND "preferredDate" IS NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'preferredTime') THEN
      UPDATE messages SET preferred_time = "preferredTime" WHERE preferred_time IS NULL AND "preferredTime" IS NOT NULL;
    END IF;
  END IF;
END $$;
