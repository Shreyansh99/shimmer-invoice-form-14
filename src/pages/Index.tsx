import { useState } from "react";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { PrescriptionTemplate } from "@/components/PrescriptionTemplate";
import type { PrescriptionData } from "@/types/prescription";

const Index = () => {
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handlePrescriptionSubmit = (data: PrescriptionData) => {
    setCurrentPrescription(data);
    setIsEditing(false);
  };

  const handleBackToForm = () => {
    setCurrentPrescription(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-medical-blue/5 py-8 px-4">
      <div className="container mx-auto">
        {currentPrescription && !isEditing ? (
          <PrescriptionTemplate 
            prescriptionData={currentPrescription} 
            onEdit={handleEdit}
            onBack={handleBackToForm}
          />
        ) : (
          <PrescriptionForm onSubmit={handlePrescriptionSubmit} />
        )}
      </div>
    </div>
  );
};

export default Index;
