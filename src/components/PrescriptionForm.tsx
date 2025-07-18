import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText } from "lucide-react";
import type { PrescriptionData } from "@/types/prescription";

const prescriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(1, "Age must be greater than 0").max(150, "Age must be valid"),
  gender: z.enum(["male", "female", "others"], { required_error: "Please select gender" }),
  department: z.string().min(1, "Department is required"),
  type: z.enum(["ANC", "General", "JSSK"], { required_error: "Please select type" }),
  address: z.string().optional(),
  aadhar_number: z.string().optional(),
  mobile_number: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  onSubmit: (data: PrescriptionData) => void;
}

const departments = [
  "Cardiology", "Dermatology", "Emergency", "ENT", "Gastroenterology",
  "General Medicine", "Gynecology", "Neurology", "Oncology", "Orthopedics",
  "Pediatrics", "Psychiatry", "Radiology", "Surgery", "Urology"
];

export const PrescriptionForm = ({ onSubmit }: PrescriptionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { toast } = useToast();

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      name: "",
      age: undefined,
      gender: undefined,
      department: "",
      type: undefined,
      address: "",
      aadhar_number: "",
      mobile_number: "",
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      const { data: prescription, error } = await supabase
        .from("prescriptions")
        .insert([{
          name: data.name,
          age: data.age,
          gender: data.gender,
          department: data.department,
          type: data.type,
          address: data.address || null,
          aadhar_number: data.aadhar_number || null,
          mobile_number: data.mobile_number || null,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully!",
      });

      onSubmit(prescription as PrescriptionData);
      form.reset();
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-border/40 shadow-lg">
      <CardHeader className="text-center border-b border-border/40 bg-gradient-to-r from-medical-blue/5 to-medical-blue-light/5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-medical-blue" />
          <CardTitle className="text-2xl font-bold text-medical-dark">
            Hospital Prescription Form
          </CardTitle>
        </div>
        <CardDescription className="text-medical-gray">
          Fill out patient information to generate a prescription
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-medical-gray">Registration Number:</span>
            <p className="text-lg font-semibold text-medical-dark">Auto-generated</p>
          </div>
          <div>
            <span className="text-sm font-medium text-medical-gray">Date & Time:</span>
            <p className="text-lg font-semibold text-medical-dark">
              {currentDateTime.toLocaleString()}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">
                      Patient Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter patient name" 
                        {...field}
                        className="border-border/60 focus:border-medical-blue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Age *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter age"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                        className="border-border/60 focus:border-medical-blue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Gender *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-border/60 focus:border-medical-blue">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Department *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-border/60 focus:border-medical-blue">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-border/60 focus:border-medical-blue">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ANC">ANC</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="JSSK">JSSK</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter mobile number"
                        {...field}
                        className="border-border/60 focus:border-medical-blue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter address"
                        className="min-h-[100px] border-border/60 focus:border-medical-blue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aadhar_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-medical-dark font-medium">Aadhar Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Aadhar number"
                        {...field}
                        className="border-border/60 focus:border-medical-blue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-medical-blue hover:bg-medical-blue/90 text-white font-semibold shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Prescription...
                  </>
                ) : (
                  "Create Prescription"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};