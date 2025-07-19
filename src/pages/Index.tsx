import { useState } from "react";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { PrescriptionTemplate } from "@/components/PrescriptionTemplate";
import type { PrescriptionData } from "@/types/prescription";

const Index = () => {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);

  const handleFormSubmit = (data: PrescriptionData) => {
    setPrescriptionData(data);
  };

  const handleBack = () => {
    setPrescriptionData(null);
  };

  if (prescriptionData) {
    return (
      <PrescriptionTemplate 
        prescriptionData={prescriptionData} 
        onBack={handleBack} 
      />
    );
  }

  return <PrescriptionForm onSubmit={handleFormSubmit} />;
};

export default Index;