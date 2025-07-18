import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Hash, 
  Building2, 
  Activity,
  Printer,
  Download,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface InvoiceSummaryProps {
  invoiceData: InvoiceData;
  onBack: () => void;
}

export function InvoiceSummary({ invoiceData, onBack }: InvoiceSummaryProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Medical Invoice #${invoiceData.registrationNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white;
                color: #000;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
              }
              .logo-section {
                flex: 1;
              }
              .logo-text {
                font-size: 18px;
                font-weight: 600;
                color: #666;
              }
              .invoice-title {
                font-size: 72px;
                font-weight: 900;
                color: #000;
                letter-spacing: -2px;
                margin: 20px 0 10px 0;
              }
              .invoice-number {
                font-size: 16px;
                color: #666;
                text-align: right;
              }
              .invoice-content {
                margin-bottom: 40px;
              }
              .invoice-meta {
                margin-bottom: 30px;
              }
              .date-section {
                margin-bottom: 30px;
              }
              .date-label {
                font-weight: 600;
                margin-bottom: 5px;
              }
              .billing-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
              }
              .billing-header {
                font-weight: 600;
                margin-bottom: 10px;
                font-size: 16px;
              }
              .billing-details {
                line-height: 1.6;
                color: #333;
              }
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              .invoice-table th {
                background: #f5f5f5;
                padding: 15px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid #ddd;
              }
              .invoice-table td {
                padding: 15px;
                border-bottom: 1px solid #eee;
              }
              .invoice-table th:last-child,
              .invoice-table td:last-child {
                text-align: right;
              }
              .service-details {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 15px;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
              }
              .total-section {
                text-align: right;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #000;
              }
              .total-row {
                display: flex;
                justify-content: flex-end;
                gap: 40px;
                font-size: 18px;
                font-weight: 600;
              }
              .footer-section {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              .payment-method {
                margin-bottom: 15px;
              }
              .note {
                font-style: italic;
                color: #666;
              }
              @media print {
                body { margin: 0; padding: 15mm; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div class="logo-section">
                <div class="logo-text">MEDICAL CENTER</div>
              </div>
              <div class="invoice-number">NO. ${String(invoiceData.registrationNumber).padStart(6, '0')}</div>
            </div>

            <div class="invoice-title">INVOICE</div>

            <div class="invoice-content">
              <div class="date-section">
                <div class="date-label">Date:</div>
                <div>${new Date(invoiceData.dateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>

              <div class="billing-section">
                <div>
                  <div class="billing-header">Patient Information:</div>
                  <div class="billing-details">
                    ${invoiceData.name}<br>
                    Age: ${invoiceData.age} years<br>
                    Gender: ${invoiceData.gender}<br>
                    Room No: ${invoiceData.roomNo}<br>
                    ${invoiceData.address}
                  </div>
                </div>
                <div>
                  <div class="billing-header">Service Details:</div>
                  <div class="billing-details">
                    Department: ${invoiceData.department}<br>
                    Service Type: ${invoiceData.type}<br>
                    Registration: #${invoiceData.registrationNumber}
                  </div>
                </div>
              </div>

              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Medical Consultation</td>
                    <td>${invoiceData.department}</td>
                    <td>${invoiceData.type}</td>
                    <td>Completed</td>
                  </tr>
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-row">
                  <span>Registration Complete</span>
                  <span>✓</span>
                </div>
              </div>

              <div class="footer-section">
                <div class="note">
                  This is a computer-generated medical registration invoice.<br>
                  Generated on ${new Date().toLocaleString()}
                </div>
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

    toast({
      title: "Print Ready",
      description: "Invoice is ready for printing",
    });
  };

  const handleSaveToDatabase = async () => {
    try {
      // Placeholder for database save functionality
      // In a real application, you would call your API here
      console.log("Saving to database:", invoiceData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Saved Successfully",
        description: "Invoice has been saved to the database",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save invoice to database",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ANC": return "bg-green-100 text-green-800 border-green-200";
      case "General": return "bg-blue-100 text-blue-800 border-blue-200";
      case "JSSK": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Form</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </Button>
          
          <Button 
            onClick={handleSaveToDatabase}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Save to Database</span>
          </Button>
        </div>
      </div>

      {/* Professional Invoice Template */}
      <Card className="shadow-2xl border-0 bg-white max-w-4xl mx-auto">
        <CardContent className="p-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start p-8 border-b-2 border-gray-900">
            <div>
              <div className="text-lg font-semibold text-gray-600 mb-2">MEDICAL CENTER</div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 text-sm">NO. {String(invoiceData.registrationNumber).padStart(6, '0')}</div>
            </div>
          </div>

          {/* Large INVOICE Title */}
          <div className="px-8 pt-6">
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-6">INVOICE</h1>
          </div>

          <div className="px-8 pb-8 space-y-8">
            {/* Date */}
            <div>
              <div className="font-semibold mb-1">Date:</div>
              <div className="text-gray-700">
                {new Date(invoiceData.dateTime).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Billing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="font-semibold mb-3 text-gray-900">Patient Information:</div>
                <div className="space-y-1 text-gray-700 leading-relaxed">
                  <div className="font-medium">{invoiceData.name}</div>
                  <div>Age: {invoiceData.age} years</div>
                  <div>Gender: {invoiceData.gender}</div>
                  <div>Room No: {invoiceData.roomNo}</div>
                  <div>{invoiceData.address}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-3 text-gray-900">Service Details:</div>
                <div className="space-y-1 text-gray-700 leading-relaxed">
                  <div>Department: {invoiceData.department}</div>
                  <div>Service Type: {invoiceData.type}</div>
                  <div>Registration: #{invoiceData.registrationNumber}</div>
                </div>
              </div>
            </div>

            {/* Service Table */}
            <div className="mt-8">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b-2 border-gray-200">Service</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b-2 border-gray-200">Department</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b-2 border-gray-200">Type</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900 border-b-2 border-gray-200">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-4 text-gray-700">Medical Consultation</td>
                      <td className="px-4 py-4 text-gray-700">{invoiceData.department}</td>
                      <td className="px-4 py-4">
                        <Badge className={`${getTypeColor(invoiceData.type)} border`}>
                          {invoiceData.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right text-green-600 font-medium">✓ Completed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-end mt-6 pt-6 border-t-2 border-gray-900">
              <div className="flex items-center space-x-8 text-lg font-semibold text-gray-900">
                <span>Registration Complete</span>
                <span className="text-green-600 text-xl">✓</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500 italic">
              <p>This is a computer-generated medical registration invoice.</p>
              <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}