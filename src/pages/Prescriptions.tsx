import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { PrescriptionData } from "@/types/prescription";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockData: PrescriptionData[] = [
      {
        id: "1",
        registration_number: "REG001",
        name: "John Doe",
        age: 35,
        gender: "male",
        department: "Cardiology",
        type: "General",
        address: "123 Main St, City",
        aadhar_number: "1234-5678-9012",
        mobile_number: "+91-9876543210",
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        registration_number: "REG002",
        name: "Jane Smith",
        age: 28,
        gender: "female",
        department: "Gynecology",
        type: "ANC",
        address: "456 Oak Ave, Town",
        aadhar_number: "2345-6789-0123",
        mobile_number: "+91-9876543211",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        registration_number: "REG003",
        name: "Bob Johnson",
        age: 42,
        gender: "male",
        department: "Orthopedics",
        type: "JSSK",
        address: "789 Pine Rd, Village",
        aadhar_number: "3456-7890-1234",
        mobile_number: "+91-9876543212",
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    setTimeout(() => {
      setPrescriptions(mockData);
      setFilteredPrescriptions(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter prescriptions based on search and filters
  useEffect(() => {
    let filtered = prescriptions.filter(prescription => {
      const matchesSearch = prescription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prescription.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = !genderFilter || prescription.gender === genderFilter;
      const matchesDepartment = !departmentFilter || prescription.department === departmentFilter;
      const matchesType = !typeFilter || prescription.type === typeFilter;
      
      return matchesSearch && matchesGender && matchesDepartment && matchesType;
    });
    
    setFilteredPrescriptions(filtered);
    setCurrentPage(1);
  }, [prescriptions, searchTerm, genderFilter, departmentFilter, typeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter("");
    setDepartmentFilter("");
    setTypeFilter("");
  };

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Data refreshed",
        description: "Prescription data has been updated.",
      });
    }, 1000);
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredPrescriptions.map(prescription => ({
        'Registration Number': prescription.registration_number,
        'Patient Name': prescription.name,
        'Age': prescription.age,
        'Gender': prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
        'Department': prescription.department,
        'Type': prescription.type,
        'Mobile Number': prescription.mobile_number || 'N/A',
        'Address': prescription.address || 'N/A',
        'Aadhar Number': prescription.aadhar_number || 'N/A',
        'Created Date': new Date(prescription.created_at).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths
      const colWidths = [
        { wch: 18 }, // Registration Number
        { wch: 20 }, // Patient Name
        { wch: 8 },  // Age
        { wch: 10 }, // Gender
        { wch: 15 }, // Department
        { wch: 10 }, // Type
        { wch: 15 }, // Mobile Number
        { wch: 30 }, // Address
        { wch: 18 }, // Aadhar Number
        { wch: 12 }  // Created Date
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Prescriptions");
      XLSX.writeFile(wb, `prescriptions_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export successful",
        description: "Prescriptions exported to Excel file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export prescriptions to Excel.",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text('Hospital Prescription System', 20, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Prescriptions Report', 20, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
      doc.text(`Total Records: ${filteredPrescriptions.length}`, 20, 52);

      // Prepare table data
      const tableData = filteredPrescriptions.map(prescription => [
        prescription.registration_number,
        prescription.name,
        prescription.age.toString(),
        prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
        prescription.department,
        prescription.type,
        prescription.mobile_number || 'N/A',
        new Date(prescription.created_at).toLocaleDateString()
      ]);

      // Add table
      (doc as any).autoTable({
        head: [['Reg. No.', 'Patient Name', 'Age', 'Gender', 'Department', 'Type', 'Mobile', 'Date']],
        body: tableData,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 30 },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 },
        },
      });

      doc.save(`prescriptions_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export successful",
        description: "Prescriptions exported to PDF file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export prescriptions to PDF.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANC': return 'bg-green-100 text-green-800 border-green-200';
      case 'General': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'JSSK': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrescriptions = filteredPrescriptions.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <p className="text-medical-gray">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-medical-dark">Prescriptions</h1>
            <p className="text-medical-gray">Manage and view all patient prescriptions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Gynecology">Gynecology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANC">ANC</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="JSSK">JSSK</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={clearFilters} variant="outline" className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary & Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-medical-gray">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
          </p>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Prescriptions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-32 text-center">Registration No.</TableHead>
                    <TableHead className="min-w-48">Patient Name</TableHead>
                    <TableHead className="w-20 text-center">Age</TableHead>
                    <TableHead className="w-24 text-center">Gender</TableHead>
                    <TableHead className="min-w-32">Department</TableHead>
                    <TableHead className="w-24 text-center">Type</TableHead>
                    <TableHead className="w-32 text-center">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-medical-gray">
                        No prescriptions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id} className="hover:bg-gray-50">
                        <TableCell className="text-center font-mono text-sm">
                          #{prescription.registration_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {prescription.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {prescription.age}
                        </TableCell>
                        <TableCell className="text-center capitalize">
                          {prescription.gender}
                        </TableCell>
                        <TableCell>
                          {prescription.department}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${getTypeColor(prescription.type)}`}>
                            {prescription.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-medical-gray">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={currentPage === page ? "bg-medical-blue hover:bg-medical-blue/90" : ""}
              >
                {page}
              </Button>
            ))}
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;