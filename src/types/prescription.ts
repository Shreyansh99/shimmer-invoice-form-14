export interface PrescriptionData {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  age: number;
  gender: "male" | "female" | "others";
  department: string;
  type: "ANC" | "General" | "JSSK";
  room_number?: string | null;
  address?: string | null;
  aadhar_number?: string | null;
  mobile_number?: string | null;
}