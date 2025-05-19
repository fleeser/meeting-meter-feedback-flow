
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FileText, 
  BarChart, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Settings,
  UserRound 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: UserType | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("surveyToolUser");
    navigate("/");
  };

  const navItems = [
    { icon: FileText, label: "Umfragen", path: "/app" },
    { icon: Users, label: "Vorlagen", path: "/app/templates" },
    { icon: Settings, label: "Fragen", path: "/app/questions" },
    { icon: BarChart, label: "Berichte", path: "/app/reports" },
    { icon: UserRound, label: "Mitarbeiter", path: "/app/employees" },
  ];

  return (
    <div 
      className={cn(
        "bg-secondary-dark text-white flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className={cn("font-bold", collapsed ? "hidden" : "text-xl")}>
          Umfrage-Tool
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-gray-700 rounded-full"
        >
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>

      <div className="flex-grow py-6">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Tooltip key={item.path} delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-primary-blue text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-blue flex items-center justify-center">
            <UserRound className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-gray-300 hover:text-white flex items-center mt-1"
              >
                <LogOut className="h-3 w-3 mr-1" /> Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
