export interface PrescriptionData {
  id: string;
  registration_number: number;
  created_at: string;
  updated_at: string;
  name: string;
  age: number;
  gender: "male" | "female" | "others";
  department: string;
  type: "ANC" | "General" | "JSSK";
  address?: string | null;
  aadhar_number?: string | null;
  mobile_number?: string | null;
}