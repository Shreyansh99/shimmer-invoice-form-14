import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
          <Link to="/invoices">
            <Button 
              variant={location.pathname === "/invoices" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Invoices
            </Button>
          </Link>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Invoice Management System
        </div>
      </div>
    </nav>
  );
}