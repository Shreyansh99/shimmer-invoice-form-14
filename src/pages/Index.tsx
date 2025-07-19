import { useState } from "react";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { PrescriptionTemplate } from "@/components/PrescriptionTemplate";
import type { PrescriptionData } from "@/types/prescription";

const Index = () => {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFormSubmit = (data: PrescriptionData) => {
    setPrescriptionData(data);
    setIsEditing(false);
  };

  const handleBack = () => {
    setPrescriptionData(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (prescriptionData && !isEditing) {
    return (
      <PrescriptionTemplate 
        prescriptionData={prescriptionData} 
        onBack={handleBack} 
        onEdit={handleEdit}
      />
    );
  }

  return <PrescriptionForm onSubmit={handleFormSubmit} />;
};

export default Index;