
-- Create a table for patient prescriptions
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_number SERIAL UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'others')),
  department TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ANC', 'General', 'JSSK')),
  address TEXT,
  aadhar_number TEXT,
  mobile_number TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to control access
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust based on your authentication needs)
CREATE POLICY "Allow public access to prescriptions" 
  ON public.prescriptions 
  FOR ALL 
  USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_prescriptions_updated_at 
  BEFORE UPDATE ON public.prescriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
