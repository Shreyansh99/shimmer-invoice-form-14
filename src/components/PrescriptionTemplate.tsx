import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Printer, ArrowLeft, Building2, Calendar, User, Phone, MapPin, CreditCard, Stethoscope } from "lucide-react";
import type { PrescriptionData } from "@/types/prescription";

interface PrescriptionTemplateProps {
  prescriptionData: PrescriptionData;
  onEdit: () => void;
  onBack: () => void;
}

export const PrescriptionTemplate = ({ prescriptionData, onEdit, onBack }: PrescriptionTemplateProps) => {
  const handlePrint = () => {
    const printContent = document.getElementById('prescription-print-area');
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Patient Prescription #${prescriptionData.registration_number}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: 'Arial', sans-serif;
                  background: white;
                  color: #000;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  line-height: 1.6;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #4F46E5;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .hospital-name {
                  font-size: 24px;
                  font-weight: bold;
                  color: #4F46E5;
                  margin-bottom: 5px;
                }
                .hospital-subtitle {
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 15px;
                }
                .prescription-title {
                  font-size: 28px;
                  font-weight: bold;
                  color: #1a1a1a;
                  margin-bottom: 10px;
                }
                .reg-info {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                  font-size: 14px;
                }
                .patient-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  margin-bottom: 30px;
                }
                .info-section h3 {
                  font-size: 16px;
                  font-weight: bold;
                  color: #4F46E5;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 5px;
                }
                .info-item {
                  margin-bottom: 8px;
                  font-size: 14px;
                }
                .info-label {
                  font-weight: 600;
                  color: #374151;
                }
                .prescription-area {
                  min-height: 200px;
                  border: 2px dashed #d1d5db;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
                  background: #f9fafb;
                }
                .prescription-area h3 {
                  color: #4F46E5;
                  margin-bottom: 15px;
                  font-size: 18px;
                }
                .footer {
                  margin-top: 50px;
                  display: flex;
                  justify-content: space-between;
                  align-items: end;
                }
                .signature-area {
                  text-align: right;
                }
                .signature-line {
                  width: 200px;
                  border-bottom: 1px solid #000;
                  margin-bottom: 5px;
                  height: 40px;
                }
                .type-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                }
                .type-anc { background: #dcfce7; color: #166534; }
                .type-general { background: #dbeafe; color: #1e40af; }
                .type-jssk { background: #e9d5ff; color: #7c3aed; }
                @media print {
                  body { margin: 0; padding: 15mm; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="hospital-name">City General Hospital</div>
                <div class="hospital-subtitle">Healthcare Excellence Since 1985</div>
                <div class="prescription-title">PRESCRIPTION</div>
              </div>
              
              <div class="reg-info">
                <div><strong>Registration No:</strong> #${prescriptionData.registration_number}</div>
                <div><strong>Date:</strong> ${formatDate(prescriptionData.created_at)}</div>
              </div>
              
              <div class="patient-info">
                <div class="info-section">
                  <h3>Patient Information</h3>
                  <div class="info-item">
                    <span class="info-label">Name:</span> ${prescriptionData.name}
                  </div>
                  <div class="info-item">
                    <span class="info-label">Age:</span> ${prescriptionData.age} years
                  </div>
                  <div class="info-item">
                    <span class="info-label">Gender:</span> ${prescriptionData.gender.charAt(0).toUpperCase() + prescriptionData.gender.slice(1)}
                  </div>
                  ${prescriptionData.mobile_number ? `
                    <div class="info-item">
                      <span class="info-label">Mobile:</span> ${prescriptionData.mobile_number}
                    </div>
                  ` : ''}
                  ${prescriptionData.address ? `
                    <div class="info-item">
                      <span class="info-label">Address:</span> ${prescriptionData.address}
                    </div>
                  ` : ''}
                </div>
                
                <div class="info-section">
                  <h3>Medical Information</h3>
                  <div class="info-item">
                    <span class="info-label">Department:</span> ${prescriptionData.department}
                  </div>
                  <div class="info-item">
                    <span class="info-label">Visit Type:</span> 
                    <span class="type-badge type-${prescriptionData.type.toLowerCase()}">${prescriptionData.type}</span>
                  </div>
                  ${prescriptionData.aadhar_number ? `
                    <div class="info-item">
                      <span class="info-label">Aadhar:</span> ${prescriptionData.aadhar_number}
                    </div>
                  ` : ''}
                </div>
              </div>
              
              <div class="prescription-area">
                <h3>Prescription Details</h3>
                <p style="color: #6b7280; font-style: italic;">
                  Prescription details and medications will be filled by the doctor.
                </p>
              </div>
              
              <div class="footer">
                <div>
                  <small style="color: #6b7280;">
                    Generated on ${new Date().toLocaleString()}<br>
                    This is a computer-generated prescription.
                  </small>
                </div>
                <div class="signature-area">
                  <div class="signature-line"></div>
                  <div style="font-size: 14px; color: #374151;">Doctor's Signature</div>
                  <div style="font-size: 12px; color: #6b7280;">Date: ${new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
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
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
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
        <Card className="shadow-lg border-border/40 bg-white" id="prescription-print-area">
          <CardHeader className="text-center bg-gradient-to-r from-medical-blue/5 to-medical-blue-light/5 border-b border-border/40">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Stethoscope className="h-8 w-8 text-medical-blue" />
              <div>
                <h1 className="text-2xl font-bold text-medical-dark">City General Hospital</h1>
                <p className="text-sm text-medical-gray">Healthcare Excellence Since 1985</p>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-medical-dark mb-4">PRESCRIPTION</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
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
              <div className="min-h-[200px] border-2 border-dashed border-border/60 rounded-lg p-6 bg-muted/10">
                <p className="text-medical-gray text-center italic">
                  Prescription details and medications will be filled by the doctor.
                </p>
              </div>
            </div>

            {/* Doctor Signature Section */}
            <Separator className="my-6" />
            <div className="flex justify-between items-end">
              <div className="text-xs text-medical-gray">
                <p>Generated on {new Date().toLocaleString()}</p>
                <p>This is a computer-generated prescription.</p>
              </div>
              <div className="text-right space-y-2">
                <div className="w-48 border-b border-border/60 pb-2 h-12">
                  <p className="text-sm text-medical-gray">Doctor's Signature</p>
                </div>
                <p className="text-xs text-medical-gray">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};