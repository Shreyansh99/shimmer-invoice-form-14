import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, ArrowLeft, Edit, Stethoscope } from "lucide-react";
import type { PrescriptionData } from "@/types/prescription";

interface PrescriptionTemplateProps {
  prescriptionData: PrescriptionData;
  onBack: () => void;
  onEdit: () => void;
}

export const PrescriptionTemplate = ({ prescriptionData, onBack, onEdit }: PrescriptionTemplateProps) => {
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
                  max-width: 210mm;
                  margin: 0 auto;
                  padding: 15mm;
                  line-height: 1.4;
                  font-size: 12px;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  border-bottom: 2px solid #2563eb;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
                }
                .hospital-info {
                  text-align: left;
                }
                .hospital-info .hospital-name {
                  font-size: 18px;
                  font-weight: bold;
                  color: #2563eb;
                  margin-bottom: 5px;
                }
                .hospital-info .hospital-subtitle {
                  font-size: 12px;
                  color: #666;
                }
                .reg-number {
                  text-align: right;
                  font-size: 12px;
                  color: #666;
                }
                .title-section {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .title-section h1 {
                  font-size: 24px;
                  font-weight: bold;
                  color: #1a1a1a;
                  margin: 0;
                }
                .date-info {
                  text-align: center;
                  margin-bottom: 20px;
                  font-size: 12px;
                  color: #666;
                }
                .patient-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                }
                .patient-left, .patient-right {
                  width: 48%;
                }
                .section-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #2563eb;
                  margin-bottom: 8px;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 3px;
                }
                .info-item {
                  margin-bottom: 6px;
                  font-size: 12px;
                  display: flex;
                }
                .info-label {
                  font-weight: 600;
                  color: #374151;
                  width: 80px;
                  flex-shrink: 0;
                }
                .info-value {
                  color: #000;
                }
                .prescription-area {
                  min-height: 150px;
                  border: 2px dashed #d1d5db;
                  border-radius: 8px;
                  padding: 15px;
                  margin: 20px 0;
                  background: #f9fafb;
                }
                .prescription-area h3 {
                  color: #2563eb;
                  margin-bottom: 10px;
                  font-size: 14px;
                }
                .footer {
                  margin-top: 30px;
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
                  margin-bottom: 3px;
                  height: 30px;
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
                  body { 
                    margin: 0; 
                    padding: 10mm; 
                    font-size: 11px;
                  }
                  .prescription-area {
                    min-height: 120px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="hospital-info">
                  <div class="hospital-name">City General Hospital</div>
                  <div class="hospital-subtitle">Healthcare Excellence Since 1985</div>
                </div>
                <div class="reg-number">
                  <strong>NO. ${String(prescriptionData.registration_number).padStart(6, '0')}</strong>
                </div>
              </div>
              
              <div class="title-section">
                <h1>PRESCRIPTION</h1>
              </div>
              
              <div class="date-info">
                <strong>Date:</strong> ${formatDate(prescriptionData.created_at)}
              </div>
              
              <div class="patient-section">
                <div class="patient-left">
                  <h3 class="section-title">Patient Information</h3>
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${prescriptionData.name}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Age:</span>
                    <span class="info-value">${prescriptionData.age} years</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">${prescriptionData.gender.charAt(0).toUpperCase() + prescriptionData.gender.slice(1)}</span>
                  </div>
                  ${prescriptionData.mobile_number ? `
                    <div class="info-item">
                      <span class="info-label">Mobile:</span>
                      <span class="info-value">${prescriptionData.mobile_number}</span>
                    </div>
                  ` : ''}
                </div>
                
                <div class="patient-right">
                  <h3 class="section-title">Medical Information</h3>
                  <div class="info-item">
                    <span class="info-label">Department:</span>
                    <span class="info-value">${prescriptionData.department}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span class="info-value type-badge type-${prescriptionData.type.toLowerCase()}">${prescriptionData.type}</span>
                  </div>
                  ${prescriptionData.aadhar_number ? `
                    <div class="info-item">
                      <span class="info-label">Aadhar:</span>
                      <span class="info-value">${prescriptionData.aadhar_number}</span>
                    </div>
                  ` : ''}
                  ${prescriptionData.address ? `
                    <div class="info-item">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${prescriptionData.address}</span>
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
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={onEdit}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit Prescription
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="h-4 w-4" />
              Print Prescription
            </Button>
          </div>
        </div>

        {/* Prescription Template */}
        <Card className="shadow-lg border-gray-200 bg-white" id="prescription-print-area">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">City General Hospital</h1>
                  <p className="text-sm text-gray-600">Healthcare Excellence Since 1985</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">
                  NO. {String(prescriptionData.registration_number).padStart(6, '0')}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-3">PRESCRIPTION</div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Date:</span> {formatDate(prescriptionData.created_at)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Patient Information in Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Patient Information
                </h3>
                
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{prescriptionData.name}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Age:</span>
                    <span className="text-sm font-semibold text-gray-900">{prescriptionData.age} years</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Gender:</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">{prescriptionData.gender}</span>
                  </div>
                  
                  {prescriptionData.mobile_number && (
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Mobile:</span>
                      <span className="text-sm text-gray-900">{prescriptionData.mobile_number}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Medical Information
                </h3>
                
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Department:</span>
                    <span className="text-sm font-semibold text-gray-900">{prescriptionData.department}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Type:</span>
                    <Badge className={`text-xs font-medium ${getTypeColor(prescriptionData.type)}`}>
                      {prescriptionData.type}
                    </Badge>
                  </div>
                  
                  {prescriptionData.aadhar_number && (
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Aadhar:</span>
                      <span className="text-sm text-gray-900">{prescriptionData.aadhar_number}</span>
                    </div>
                  )}
                  
                  {prescriptionData.address && (
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">Address:</span>
                      <span className="text-sm text-gray-900">{prescriptionData.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prescription Details Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Prescription Details</h3>
              <div className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-gray-600 text-center italic text-sm">
                  Prescription details and medications will be filled by the doctor.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <p>Generated on {new Date().toLocaleString()}</p>
                <p>This is a computer-generated prescription.</p>
              </div>
              <div className="text-right space-y-1">
                <div className="w-40 border-b border-gray-300 pb-1 h-8">
                  <p className="text-xs text-gray-600">Doctor's Signature</p>
                </div>
                <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};