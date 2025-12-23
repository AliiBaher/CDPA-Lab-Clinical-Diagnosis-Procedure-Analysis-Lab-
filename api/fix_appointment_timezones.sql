-- Fix Appointment Timezones
-- This script adjusts appointment times from local timezone (GMT+3) to UTC
-- Run this ONLY if your existing appointments were created with local times stored as UTC

-- IMPORTANT: Before running this, backup your database!
-- pg_dump -U your_username -d your_database_name > backup_before_timezone_fix.sql

-- Step 1: Check current appointments to verify the issue
SELECT 
    "Id",
    "StartTime",
    "EndTime",
    "StartTime" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baghdad' as "LocalStartTime",
    "EndTime" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baghdad' as "LocalEndTime",
    "Status"
FROM "Appointments"
ORDER BY "StartTime";

-- Step 2: If appointments were created with GMT+3 times but stored as UTC,
-- subtract 3 hours to get the correct UTC time
-- UNCOMMENT THE FOLLOWING LINES TO APPLY THE FIX:

/*
UPDATE "Appointments"
SET 
    "StartTime" = "StartTime" - INTERVAL '3 hours',
    "EndTime" = "EndTime" - INTERVAL '3 hours'
WHERE "StartTime" >= CURRENT_TIMESTAMP - INTERVAL '7 days'  -- Only fix recent appointments
  AND "Status" != 'cancelled';

-- Step 3: Verify the fix
SELECT 
    "Id",
    "StartTime",
    "EndTime",
    "StartTime" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baghdad' as "LocalStartTime",
    "EndTime" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baghdad' as "LocalEndTime",
    "Status"
FROM "Appointments"
ORDER BY "StartTime";
*/

-- Alternative: DELETE all existing appointments and let users rebook
-- UNCOMMENT THE FOLLOWING LINE IF YOU PREFER TO START FRESH:
/*
DELETE FROM "Appointments" WHERE "Status" != 'completed';
*/
