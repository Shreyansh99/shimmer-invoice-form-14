import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Search, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

// Mock data - replace with actual database fetch
const mockInvoices: InvoiceData[] = [
  {
    registrationNumber: 1001,
    dateTime: "2024-01-15 10:30:00",
    name: "John Doe",
    age: 35,
    roomNo: 101,
    address: "123 Main St",
    gender: "Male",
    department: "Cardiology",
    type: "Consultation"
  },
  {
    registrationNumber: 1002,
    dateTime: "2024-01-15 11:45:00",
    name: "Jane Smith",
    age: 28,
    roomNo: 102,
    address: "456 Oak Ave",
    gender: "Female",
    department: "Neurology",
    type: "Surgery"
  },
  {
    registrationNumber: 1003,
    dateTime: "2024-01-16 09:15:00",
    name: "Bob Johnson",
    age: 42,
    roomNo: 103,
    address: "789 Pine St",
    gender: "Male",
    department: "Orthopedics",
    type: "Follow-up"
  },
  {
    registrationNumber: 1004,
    dateTime: "2024-01-16 14:20:00",
    name: "Alice Wilson",
    age: 31,
    roomNo: 104,
    address: "321 Elm Dr",
    gender: "Female",
    department: "Cardiology",
    type: "Emergency"
  },
  {
    registrationNumber: 1005,
    dateTime: "2024-01-17 08:00:00",
    name: "Charlie Brown",
    age: 55,
    roomNo: 105,
    address: "654 Maple Rd",
    gender: "Male",
    department: "Neurology",
    type: "Consultation"
  }
];

const Invoices = () => {
  const { toast } = useToast();
  const [invoices] = useState<InvoiceData[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Filter data based on search and filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = searchTerm === "" || 
        invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.registrationNumber.toString().includes(searchTerm) ||
        invoice.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = genderFilter === "all" || invoice.gender === genderFilter;
      const matchesType = typeFilter === "all" || invoice.type === typeFilter;
      const matchesDepartment = departmentFilter === "all" || invoice.department === departmentFilter;

      return matchesSearch && matchesGender && matchesType && matchesDepartment;
    });
  }, [invoices, searchTerm, genderFilter, typeFilter, departmentFilter]);

  // Get unique values for filter options
  const genderOptions = [...new Set(invoices.map(inv => inv.gender))];
  const typeOptions = [...new Set(invoices.map(inv => inv.type))];
  const departmentOptions = [...new Set(invoices.map(inv => inv.department))];

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setGenderFilter("all");
    setTypeFilter("all");
    setDepartmentFilter("all");
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredInvoices);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
      
      // Style the header
      const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } }
        };
      }
      
      XLSX.writeFile(workbook, `invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({
        title: "Export Successful",
        description: `${filteredInvoices.length} records exported to Excel.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting to Excel.",
        variant: "destructive",
      });
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Invoice Reports', 20, 20);
      
      // Add export date
      doc.setFontSize(10);
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Records: ${filteredInvoices.length}`, 20, 35);

      // Prepare table data
      const tableHeaders = [
        'Reg No', 'Date/Time', 'Name', 'Age', 'Room', 'Gender', 'Department', 'Type'
      ];
      
      const tableData = filteredInvoices.map(invoice => [
        invoice.registrationNumber,
        invoice.dateTime,
        invoice.name,
        invoice.age,
        invoice.roomNo,
        invoice.gender,
        invoice.department,
        invoice.type
      ]);

      // Add table
      (doc as any).autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`invoices_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "Export Successful",
        description: `${filteredInvoices.length} records exported to PDF.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting to PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Invoice Management</h1>
          <p className="text-muted-foreground">View, filter, and export invoice data</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-1">
                <Input
                  placeholder="Search by name, ID, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Gender Filter */}
              <div>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentOptions.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInvoices.length} of {invoices.length} records
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No invoices found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.registrationNumber}>
                        <TableCell className="font-medium">
                          {invoice.registrationNumber}
                        </TableCell>
                        <TableCell>{invoice.dateTime}</TableCell>
                        <TableCell>{invoice.name}</TableCell>
                        <TableCell>{invoice.age}</TableCell>
                        <TableCell>{invoice.roomNo}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {invoice.address}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.gender === 'Male' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {invoice.gender}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {invoice.department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.type === 'Emergency' 
                              ? 'bg-red-100 text-red-800'
                              : invoice.type === 'Surgery'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.type}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;