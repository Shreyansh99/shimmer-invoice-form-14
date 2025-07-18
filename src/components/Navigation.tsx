import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Stethoscope } from "lucide-react";

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-border px-4 py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Stethoscope className="h-6 w-6 text-medical-blue" />
          <span className="text-lg font-semibold text-medical-dark">Hospital Prescription System</span>
        </div>
        <div className="flex items-center space-x-1">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Prescription
            </Button>
          </Link>
          <Link to="/prescriptions">
            <Button 
              variant={location.pathname === "/prescriptions" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Prescriptions
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}