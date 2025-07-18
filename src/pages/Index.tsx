import { useState } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceSummary } from "@/components/InvoiceSummary";

interface InvoiceData {
  registrationNumber: number;
  dateTime: string;
  name: string;
  age: number;
  roomNo: number;
  address: string;
  gender: string;
  department: string;
  type: string;
}

const Index = () => {
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);

  const handleInvoiceSubmit = (data: InvoiceData) => {
    setCurrentInvoice(data);
  };

  const handleBackToForm = () => {
    setCurrentInvoice(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 py-8 px-4">
      <div className="container mx-auto">
        {currentInvoice ? (
          <InvoiceSummary 
            invoiceData={currentInvoice} 
            onBack={handleBackToForm}
          />
        ) : (
          <InvoiceForm onSubmit={handleInvoiceSubmit} />
        )}
      </div>
    </div>
  );
};

export default Index;
