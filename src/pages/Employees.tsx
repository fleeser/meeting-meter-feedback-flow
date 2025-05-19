
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserRound, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { User } from "@/lib/types";

// Mock data for employees
const mockEmployees: User[] = [
  { id: "1", name: "Maria Schmidt", email: "maria.schmidt@example.com", role: "Admin", department: "HR", active: true },
  { id: "2", name: "Thomas Müller", email: "thomas.mueller@example.com", role: "Moderator", department: "IT", active: true },
  { id: "3", name: "Anna Weber", email: "anna.weber@example.com", role: "User", department: "Marketing", active: true },
  { id: "4", name: "Max Becker", email: "max.becker@example.com", role: "User", department: "Sales", active: false },
  { id: "5", name: "Sophie Wagner", email: "sophie.wagner@example.com", role: "User", department: "Support", active: true },
];

const Employees = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const handleAddEmployee = () => {
    // This would open a modal dialog in a real implementation
    console.log("Add employee button clicked");
  };

  const handleEditEmployee = (id: string) => {
    // This would open a modal dialog in a real implementation
    console.log("Edit employee with ID:", id);
  };

  const handleDeleteEmployee = (id: string) => {
    // This would open a confirmation dialog in a real implementation
    console.log("Delete employee with ID:", id);
  };

  const handleToggleActive = (id: string, currentActiveState: boolean) => {
    // This would update the employee status in a real implementation
    console.log(`Toggle active status for employee ID ${id} from ${currentActiveState} to ${!currentActiveState}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Mitarbeiter werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mitarbeiterverwaltung</h1>
          <p className="text-gray-500 mt-1">
            Mitarbeiter erstellen, bearbeiten und zuweisen
          </p>
        </div>
        <Button onClick={handleAddEmployee}>
          <Plus className="mr-2 h-4 w-4" /> Mitarbeiter hinzufügen
        </Button>
      </div>

      <Card className="flex-grow">
        <CardHeader className="pb-2">
          <CardTitle>Mitarbeiterliste</CardTitle>
          <CardDescription>
            Gesamtzahl der Mitarbeiter: {employees.length} 
            ({employees.filter(e => e.active).length} aktiv, {employees.filter(e => !e.active).length} inaktiv)
          </CardDescription>
          <div className="flex items-center mb-4 mt-2">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              placeholder="Nach Name, E-Mail oder Abteilung suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Abteilung</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <UserRound className="h-5 w-5 text-blue-600" />
                        </div>
                        {employee.name}
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          employee.role === "Admin"
                            ? "destructive"
                            : employee.role === "Moderator"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      {employee.active ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(employee.id, employee.active || false)}
                      >
                        {employee.active ? (
                          <XCircle className="h-5 w-5 text-gray-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEmployee(employee.id)}
                      >
                        <Edit className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Keine Mitarbeiter gefunden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
