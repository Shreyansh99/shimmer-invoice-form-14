export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

<<<<<<< HEAD
export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      prescriptions: {
        Row: {
          aadhar_number: string | null
          address: string | null
          age: number
          created_at: string
          department: string
          gender: string
          id: string
          mobile_number: string | null
          name: string
          registration_number: number
          room_number: string | null
          updated_at: string
        }
        Insert: {
          aadhar_number?: string | null
          address?: string | null
          age: number
          created_at?: string
          department: string
          gender: string
          id?: string
          mobile_number?: string | null
          name: string
          registration_number?: number
          room_number?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          aadhar_number?: string | null
          address?: string | null
          age?: number
          created_at?: string
          department?: string
          gender?: string
          id?: string
          mobile_number?: string | null
          name?: string
          registration_number?: number
          room_number?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
=======
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
>>>>>>> parent of 29c7e77 (Add room number field and improve filters)
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

<<<<<<< HEAD
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
=======
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

  useEffect(() => {
    const fetchNextRegistrationNumber = async () => {
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .select("registration_number")
          .order("registration_number", { ascending: false })
          .limit(1);

        if (error) throw error;

        const nextNumber = data && data.length > 0 ? data[0].registration_number + 1 : 1;
        setNextRegistrationNumber(nextNumber);
      } catch (error) {
        console.error("Error fetching registration number:", error);
        setNextRegistrationNumber(1);
      }
    };

    fetchNextRegistrationNumber();
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
      setNextRegistrationNumber(prev => prev ? prev + 1 : 1);
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
>>>>>>> parent of 29c7e77 (Add room number field and improve filters)
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

<<<<<<< HEAD
export const Constants = {
  public: {
    Enums: {},
  },
} as const
=======
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">Department *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                    <FormLabel className="text-gray-900 font-medium">Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                    <FormLabel className="text-gray-900 font-medium">Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter mobile number"
                        {...field}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    <FormLabel className="text-gray-900 font-medium">Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter address"
                        className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    <FormLabel className="text-gray-900 font-medium">Aadhar Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Aadhar number"
                        {...field}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
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
    </div>
  );
};
>>>>>>> parent of 29c7e77 (Add room number field and improve filters)
