import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, FileText, RefreshCw, X, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PrescriptionData } from "@/types/prescription";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
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
      
      const matchesGender = genderFilter.length === 0 || genderFilter.includes(prescription.gender);
      const matchesDepartment = departmentFilter === "all" || prescription.department === departmentFilter;
      const matchesType = typeFilter.length === 0 || typeFilter.includes(prescription.type);
      
      // Date filtering
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const prescriptionDate = new Date(prescription.created_at);
        const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
        const toDate = dateToFilter ? new Date(dateToFilter + 'T23:59:59') : null;
        
        if (fromDate && prescriptionDate < fromDate) matchesDateRange = false;
        if (toDate && prescriptionDate > toDate) matchesDateRange = false;
      }
      
      return matchesSearch && matchesGender && matchesDepartment && matchesType && matchesDateRange;
    });
    
    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, genderFilter, departmentFilter, typeFilter, dateFromFilter, dateToFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter([]);
    setDepartmentFilter("all");
    setTypeFilter([]);
    setDateFromFilter("");
    setDateToFilter("");
  };

  const refreshData = () => {
    fetchPrescriptions();
    toast({
      title: "Data refreshed",
      description: "Prescription data has been updated.",
    });
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235); // Blue color
      doc.text('Hospital Prescriptions Report', 20, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray color
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 28);
      doc.text(`Total Records: ${filteredPrescriptions.length}`, 20, 34);

      // Prepare table data
      const tableData = filteredPrescriptions.map(prescription => [
        String(prescription.registration_number).padStart(6, '0'),
        prescription.name,
        prescription.age.toString(),
        prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
        prescription.room_number || 'N/A',
        prescription.department,
        prescription.type,
        prescription.mobile_number || 'N/A',
        new Date(prescription.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        })
      ]);

      // Create table
      autoTable(doc, {
        head: [['Reg. No.', 'Patient Name', 'Age', 'Gender', 'Room', 'Department', 'Type', 'Mobile', 'Date']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235], // Blue background
          textColor: [255, 255, 255], // White text
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' }, // Reg. No.
          1: { cellWidth: 40, halign: 'left' },   // Patient Name
          2: { cellWidth: 12, halign: 'center' }, // Age
          3: { cellWidth: 16, halign: 'center' }, // Gender
          4: { cellWidth: 14, halign: 'center' }, // Room
          5: { cellWidth: 26, halign: 'left' },   // Department
          6: { cellWidth: 14, halign: 'center' }, // Type
          7: { cellWidth: 20, halign: 'center' }, // Mobile
          8: { cellWidth: 18, halign: 'center' }  // Date
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // Light gray for alternate rows
        },
        margin: { top: 40, right: 20, bottom: 20, left: 20 },
        tableWidth: 'auto',
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        }
      });

      // Save the PDF
      const fileName = `Hospital_Prescriptions_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Export Successful",
        description: `${filteredPrescriptions.length} prescriptions exported to ${fileName}`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "PDF Export Failed",
        description: "Failed to export prescriptions to PDF.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredPrescriptions.map(prescription => ({
        'Registration Number': String(prescription.registration_number).padStart(6, '0'),
        'Patient Name': prescription.name,
        'Age': prescription.age,
        'Gender': prescription.gender.charAt(0).toUpperCase() + prescription.gender.slice(1),
        'Room Number': prescription.room_number || 'N/A',
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
        { wch: 25 }, // Patient Name
        { wch: 8 },  // Age
        { wch: 10 }, // Gender
        { wch: 12 }, // Room Number
        { wch: 20 }, // Department
        { wch: 10 }, // Type
        { wch: 15 }, // Mobile Number
        { wch: 35 }, // Address
        { wch: 18 }, // Aadhar Number
        { wch: 15 }  // Created Date
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Prescriptions");
      
      const fileName = `Hospital_Prescriptions_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Excel Export Successful",
        description: `${filteredPrescriptions.length} prescriptions exported to ${fileName}`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Excel Export Failed",
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
            <p className="text-gray-600">View and export all patient prescriptions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="text-lg text-gray-900">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Search and Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Multi-select Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="male"
                      checked={genderFilter.includes('male')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGenderFilter([...genderFilter, 'male']);
                        } else {
                          setGenderFilter(genderFilter.filter(g => g !== 'male'));
                        }
                      }}
                    />
                    <label htmlFor="male" className="text-sm text-gray-700">Male</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="female"
                      checked={genderFilter.includes('female')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGenderFilter([...genderFilter, 'female']);
                        } else {
                          setGenderFilter(genderFilter.filter(g => g !== 'female'));
                        }
                      }}
                    />
                    <label htmlFor="female" className="text-sm text-gray-700">Female</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="others"
                      checked={genderFilter.includes('others')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGenderFilter([...genderFilter, 'others']);
                        } else {
                          setGenderFilter(genderFilter.filter(g => g !== 'others'));
                        }
                      }}
                    />
                    <label htmlFor="others" className="text-sm text-gray-700">Others</label>
                  </div>
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
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
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anc"
                      checked={typeFilter.includes('ANC')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTypeFilter([...typeFilter, 'ANC']);
                        } else {
                          setTypeFilter(typeFilter.filter(t => t !== 'ANC'));
                        }
                      }}
                    />
                    <label htmlFor="anc" className="text-sm text-gray-700">ANC</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="general"
                      checked={typeFilter.includes('General')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTypeFilter([...typeFilter, 'General']);
                        } else {
                          setTypeFilter(typeFilter.filter(t => t !== 'General'));
                        }
                      }}
                    />
                    <label htmlFor="general" className="text-sm text-gray-700">General</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jssk"
                      checked={typeFilter.includes('JSSK')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTypeFilter([...typeFilter, 'JSSK']);
                        } else {
                          setTypeFilter(typeFilter.filter(t => t !== 'JSSK'));
                        }
                      }}
                    />
                    <label htmlFor="jssk" className="text-sm text-gray-700">JSSK</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={clearFilters} variant="outline" className="border-gray-300 hover:bg-gray-50">
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary & Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''}
            {filteredPrescriptions.length !== prescriptions.length && ` (filtered from ${prescriptions.length} total)`}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={exportToPDF} 
              variant="outline" 
              size="sm"
              disabled={filteredPrescriptions.length === 0}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF ({filteredPrescriptions.length})
            </Button>
            <Button 
              onClick={exportToExcel} 
              variant="outline" 
              size="sm"
              disabled={filteredPrescriptions.length === 0}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Excel ({filteredPrescriptions.length})
            </Button>
          </div>
        </div>

        {/* Prescriptions Table */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 border-b border-gray-200">
                    <TableHead className="w-32 text-center font-semibold text-gray-900">Registration No.</TableHead>
                    <TableHead className="min-w-48 font-semibold text-gray-900">Patient Name</TableHead>
                    <TableHead className="w-20 text-center font-semibold text-gray-900">Age</TableHead>
                    <TableHead className="w-24 text-center font-semibold text-gray-900">Gender</TableHead>
                    <TableHead className="w-24 text-center font-semibold text-gray-900">Room No.</TableHead>
                    <TableHead className="min-w-32 font-semibold text-gray-900">Department</TableHead>
                    <TableHead className="w-24 text-center font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="w-32 text-center font-semibold text-gray-900">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-600">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <p className="text-lg font-medium">No prescriptions found</p>
                          <p className="text-sm">Try adjusting your search criteria or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPrescriptions.map((prescription, index) => (
                      <TableRow 
                        key={prescription.id} 
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <TableCell className="text-center font-mono text-sm font-medium text-blue-600">
                          #{String(prescription.registration_number).padStart(6, '0')}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {prescription.name}
                        </TableCell>
                        <TableCell className="text-center text-gray-700">
                          {prescription.age}
                        </TableCell>
                        <TableCell className="text-center capitalize text-gray-700">
                          {prescription.gender}
                        </TableCell>
                        <TableCell className="text-center text-gray-700">
                          {prescription.room_number || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {prescription.department}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs font-medium ${getTypeColor(prescription.type)}`}>
                            {prescription.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {new Date(prescription.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        {filteredPrescriptions.length > 0 && (
          <div className="text-center text-sm text-gray-500 py-4">
            All {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} displayed on this page
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;