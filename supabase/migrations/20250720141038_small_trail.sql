/*
  # Add Room Number to Prescriptions

  1. Schema Changes
    - Add `room_number` column to prescriptions table
    - Update the column to allow text values for room numbers

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add room_number column to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN room_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.prescriptions.room_number IS 'Patient room number or ward designation';