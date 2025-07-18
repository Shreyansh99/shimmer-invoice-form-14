import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, FileSpreadsheet, FileText, Loader2, Database, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PrescriptionData } from "@/types/prescription";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPrescriptions((data || []) as PrescriptionData[]);
      toast({
        title: "Success",
        description: "Prescriptions loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prescriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      const matchesSearch = prescription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prescription.registration_number.toString().includes(searchTerm);
      const matchesGender = !genderFilter || prescription.gender === genderFilter;
      const matchesType = !typeFilter || prescription.type === typeFilter;
      const matchesDepartment = !departmentFilter || prescription.department === departmentFilter;
      
      return matchesSearch && matchesGender && matchesType && matchesDepartment;
    });
  }, [prescriptions, searchTerm, genderFilter, typeFilter, departmentFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPrescriptions.map(prescription => ({
      'Registration Number': prescription.registration_number,
      'Date & Time': new Date(prescription.created_at).toLocaleString(),
      'Patient Name': prescription.name,
      'Age': prescription.age,
      'Gender': prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
      'Department': prescription.department,
      'Type': prescription.type,
      'Address': prescription.address || 'N/A',
      'Aadhar Number': prescription.aadhar_number || 'N/A',
      'Mobile Number': prescription.mobile_number || 'N/A'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patient Prescriptions");
    
    // Style the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "4F46E5" } }
      };
    }
    
    XLSX.writeFile(workbook, `patient_prescriptions_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Prescriptions exported to Excel successfully",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // medical-blue
    doc.text('Hospital Prescription Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Records: ${filteredPrescriptions.length}`, 20, 45);
    
    // Prepare table data
    const tableData = filteredPrescriptions.map(prescription => [
      prescription.registration_number.toString(),
      new Date(prescription.created_at).toLocaleDateString(),
      prescription.name,
      prescription.age.toString(),
      prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
      prescription.department,
      prescription.type,
      prescription.mobile_number || 'N/A'
    ]);

    autoTable(doc, {
      head: [['Reg No', 'Date', 'Patient Name', 'Age', 'Gender', 'Department', 'Type', 'Mobile']],
      body: tableData,
      startY: 60,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: 60 }
    });

    doc.save(`patient_prescriptions_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Export Successful",
      description: "Prescriptions exported to PDF successfully",
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

  const departments = Array.from(new Set(prescriptions.map(p => p.department))).sort();

  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter("");
    setTypeFilter("");
    setDepartmentFilter("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-medical-blue" />
              <p className="text-medical-gray">Loading patient prescriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-lg border-border/40">
          <CardHeader className="bg-gradient-to-r from-medical-blue/5 to-medical-blue-light/5 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-medical-blue" />
                <div>
                  <CardTitle className="text-2xl font-bold text-medical-dark">Patient Prescriptions</CardTitle>
                  <CardDescription className="text-medical-gray">
                    Search, filter, and export patient prescription data
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={fetchPrescriptions}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-medical-gray" />
                <Input
                  placeholder="Search by patient name or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md border-border/60 focus:border-medical-blue"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value === "all-genders" ? "" : value)}>
                  <SelectTrigger className="w-[180px] border-border/60 focus:border-medical-blue">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-genders">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value === "all-types" ? "" : value)}>
                  <SelectTrigger className="w-[180px] border-border/60 focus:border-medical-blue">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="ANC">ANC</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="JSSK">JSSK</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value === "all-departments" ? "" : value)}>
                  <SelectTrigger className="w-[200px] border-border/60 focus:border-medical-blue">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-departments">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={filteredPrescriptions.length === 0}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                
                <Button
                  onClick={exportToPDF}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={filteredPrescriptions.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-center p-4 bg-muted/20 rounded-lg mb-6">
              <p className="text-lg text-medical-gray">
                Showing {paginatedPrescriptions.length} of {filteredPrescriptions.length} prescriptions
                {filteredPrescriptions.length !== prescriptions.length && (
                  <span className="text-medical-blue"> (filtered from {prescriptions.length} total)</span>
                )}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/20">
                    <TableHead className="text-medical-dark font-semibold">Reg. No.</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Date & Time</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Patient Name</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Age</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Gender</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Department</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Type</TableHead>
                    <TableHead className="text-medical-dark font-semibold">Mobile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id} className="border-border/40 hover:bg-muted/10">
                      <TableCell className="font-medium text-medical-blue">
                        #{prescription.registration_number}
                      </TableCell>
                      <TableCell className="text-medical-gray">
                        {new Date(prescription.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-medical-dark">{prescription.name}</TableCell>
                      <TableCell className="text-medical-gray">{prescription.age}</TableCell>
                      <TableCell className="capitalize text-medical-gray">{prescription.gender}</TableCell>
                      <TableCell className="text-medical-gray">{prescription.department}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(prescription.type)}>
                          {prescription.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-medical-gray">{prescription.mobile_number || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPrescriptions.length === 0 && (
              <div className="text-center p-8">
                <p className="text-medical-gray">No prescriptions found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-medical-gray">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prescriptions;