import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, User, MapPin, Hash } from "lucide-react";
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

interface InvoiceFormProps {
  onSubmit: (data: InvoiceData) => void;
}

export function InvoiceForm({ onSubmit }: InvoiceFormProps) {
  const { toast } = useToast();
  const [registrationNumber, setRegistrationNumber] = useState<number>(1001);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    roomNo: "",
    address: "",
    gender: "",
    department: "",
    type: "",
  });

  // Update date/time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-increment registration number
  useEffect(() => {
    const lastRegNumber = localStorage.getItem("lastRegistrationNumber");
    if (lastRegNumber) {
      setRegistrationNumber(parseInt(lastRegNumber) + 1);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.age || parseInt(formData.age) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid age",
        variant: "destructive",
      });
      return;
    }

    if (!formData.roomNo || parseInt(formData.roomNo) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid room number",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Address is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gender) {
      toast({
        title: "Validation Error",
        description: "Please select gender",
        variant: "destructive",
      });
      return;
    }

    if (!formData.department) {
      toast({
        title: "Validation Error",
        description: "Please select department",
        variant: "destructive",
      });
      return;
    }

    if (!formData.type) {
      toast({
        title: "Validation Error",
        description: "Please select type",
        variant: "destructive",
      });
      return;
    }

    const invoiceData: InvoiceData = {
      registrationNumber,
      dateTime: currentDateTime,
      name: formData.name,
      age: parseInt(formData.age),
      roomNo: parseInt(formData.roomNo),
      address: formData.address,
      gender: formData.gender,
      department: formData.department,
      type: formData.type,
    };

    // Save to localStorage and increment
    localStorage.setItem("lastRegistrationNumber", registrationNumber.toString());
    
    onSubmit(invoiceData);
    
    // Reset form
    setFormData({
      name: "",
      age: "",
      roomNo: "",
      address: "",
      gender: "",
      department: "",
      type: "",
    });
    setRegistrationNumber(registrationNumber + 1);

    toast({
      title: "Invoice Generated",
      description: "Invoice has been successfully created!",
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold text-foreground">
            Invoice Generator
          </CardTitle>
        </div>
        <p className="text-muted-foreground">
          Fill in the details below to generate an invoice
        </p>
        <Separator />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-filled fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regNumber" className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-primary" />
                <span>Registration Number</span>
              </Label>
              <Input
                id="regNumber"
                value={registrationNumber}
                readOnly
                className="bg-muted font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTime" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Date & Time</span>
              </Label>
              <Input
                id="dateTime"
                value={currentDateTime}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* User input fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary" />
                <span>Full Name *</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNo">Room No *</Label>
                <Input
                  id="roomNo"
                  type="number"
                  placeholder="Enter room number"
                  value={formData.roomNo}
                  onChange={(e) => updateFormData("roomNo", e.target.value)}
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Address *</span>
              </Label>
              <Input
                id="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => updateFormData("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANC">ANC (Antenatal Care)</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="JSSK">JSSK (Janani Shishu Suraksha Karyakram)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            Generate Invoice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}