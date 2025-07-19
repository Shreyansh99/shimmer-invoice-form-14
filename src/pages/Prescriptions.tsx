import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
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

  // Fetch prescriptions from Supabase
  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPrescriptions(data || []);
      setFilteredPrescriptions(data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch prescriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions based on search and filters
  useEffect(() => {
    let filtered = prescriptions.filter(prescription => {
      const matchesSearch = prescription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(prescription.registration_number).includes(searchTerm);
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
    fetchPrescriptions();
    toast({
      title: "Data refreshed",
      description: "Prescription data has been updated.",
    });
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredPrescriptions.map(prescription => ({
        'Registration Number': String(prescription.registration_number).padStart(6, '0'),
        'Patient Name': prescription.name,
        'Age': prescription.age,
        'Gender': prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
        'Department': prescription.department,
        'Type': prescription.type,
        'Mobile Number': prescription.mobile_number || 'N/A',
        'Address': prescription.address || 'N/A',
        'Aadhar Number': prescription.aadhar_number || 'N/A',
        'Created Date': new Date(prescription.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        })
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
      
      // Add header styling
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2563EB" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      XLSX.utils.book_append_sheet(wb, ws, "Prescriptions");
      
      const fileName = `Hospital_Prescriptions_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Export successful",
        description: `${filteredPrescriptions.length} prescriptions exported to ${fileName}`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export prescriptions to Excel.",
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600">Manage and view all patient prescriptions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200">
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
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="ENT">ENT</SelectItem>
                  <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                  <SelectItem value="Gynecology">Gynecology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Oncology">Oncology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Urology">Urology</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
          </p>
          <Button 
            onClick={exportToExcel} 
            variant="outline" 
            size="sm"
            disabled={filteredPrescriptions.length === 0}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export to Excel ({filteredPrescriptions.length} records)
          </Button>
        </div>

        {/* Prescriptions Table */}
        <Card className="border-gray-200">
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
                      <TableCell colSpan={7} className="text-center py-8 text-gray-600">
                        No prescriptions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id} className="hover:bg-gray-50">
                        <TableCell className="text-center font-mono text-sm">
                          #{String(prescription.registration_number).padStart(6, '0')}
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
                        <TableCell className="text-center text-sm text-gray-600">
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
                className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
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