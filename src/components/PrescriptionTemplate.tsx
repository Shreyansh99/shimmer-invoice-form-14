import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Printer, ArrowLeft, Building2, Calendar, User, Phone, MapPin, CreditCard } from "lucide-react";
import type { PrescriptionData } from "@/types/prescription";

interface PrescriptionTemplateProps {
  prescriptionData: PrescriptionData;
  onEdit: () => void;
  onBack: () => void;
}

export const PrescriptionTemplate = ({ prescriptionData, onEdit, onBack }: PrescriptionTemplateProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handlePrint = () => {
    const printContent = document.getElementById('prescription-print-area');
    if (printContent) {
      const originalBody = document.body.innerHTML;
      const printBody = printContent.innerHTML;
      
      document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          ${printBody}
        </div>
      `;
      
      window.print();
      document.body.innerHTML = originalBody;
      window.location.reload();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANC': return 'bg-green-100 text-green-800 border-green-200';
      case 'General': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'JSSK': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 border-border/60 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Form
        </Button>
        
        <div className="flex gap-3">
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex items-center gap-2 border-border/60 hover:bg-muted/50"
          >
            <Edit className="h-4 w-4" />
            Edit Prescription
          </Button>
          
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-medical-blue hover:bg-medical-blue/90 text-white"
          >
            <Printer className="h-4 w-4" />
            Print Prescription
          </Button>
        </div>
      </div>

      {/* Prescription Template */}
      <Card className="shadow-lg border-border/40" id="prescription-print-area">
        <CardHeader className="text-center bg-gradient-to-r from-medical-blue/5 to-medical-blue-light/5 border-b border-border/40">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-medical-blue" />
            <div>
              <h1 className="text-2xl font-bold text-medical-dark">City General Hospital</h1>
              <p className="text-sm text-medical-gray">Healthcare Excellence Since 1985</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-medical-dark">Registration No:</span>
              <span className="text-lg font-bold text-medical-blue">#{prescriptionData.registration_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-medical-gray" />
              <span className="text-sm text-medical-gray">{formatDate(prescriptionData.created_at)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Patient Information Header */}
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-medical-blue" />
            <h2 className="text-xl font-semibold text-medical-dark">Patient Information</h2>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-medical-gray">Patient Name</label>
              <p className="text-lg font-semibold text-medical-dark">{prescriptionData.name}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-medical-gray">Age</label>
              <p className="text-lg font-semibold text-medical-dark">{prescriptionData.age} years</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-medical-gray">Gender</label>
              <p className="text-lg font-semibold text-medical-dark capitalize">{prescriptionData.gender}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-medical-gray">Department</label>
              <p className="text-lg font-semibold text-medical-dark">{prescriptionData.department}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-medical-gray">Visit Type</label>
              <Badge className={`text-sm font-medium ${getTypeColor(prescriptionData.type)}`}>
                {prescriptionData.type}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          {(prescriptionData.mobile_number || prescriptionData.address || prescriptionData.aadhar_number) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-medical-dark flex items-center gap-2">
                  <Phone className="h-4 w-4 text-medical-blue" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prescriptionData.mobile_number && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-medical-gray">Mobile Number</label>
                      <p className="text-base text-medical-dark">{prescriptionData.mobile_number}</p>
                    </div>
                  )}
                  
                  {prescriptionData.aadhar_number && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-medical-gray flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Aadhar Number
                      </label>
                      <p className="text-base text-medical-dark">{prescriptionData.aadhar_number}</p>
                    </div>
                  )}
                  
                  {prescriptionData.address && (
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-medical-gray flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Address
                      </label>
                      <p className="text-base text-medical-dark">{prescriptionData.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Prescription Details Section */}
          <Separator className="my-6" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-medical-dark">Prescription Details</h3>
            <div className="min-h-[200px] border-2 border-dashed border-border/60 rounded-lg p-4 bg-muted/20">
              <p className="text-medical-gray text-center">
                Prescription details and medications will be filled by the doctor.
              </p>
            </div>
          </div>

          {/* Doctor Signature Section */}
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="text-right space-y-2">
              <div className="w-48 border-b border-border/60 pb-2">
                <p className="text-sm text-medical-gray">Doctor's Signature</p>
              </div>
              <p className="text-xs text-medical-gray">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};