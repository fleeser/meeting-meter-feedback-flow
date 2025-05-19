
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
import { 
  UserRound, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  X,
  Save
} from "lucide-react";
import { User } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

// Mock data for employees
const mockEmployees: User[] = [
  { id: "1", name: "Maria Schmidt", email: "maria.schmidt@example.com", role: "Admin", department: "HR", active: true },
  { id: "2", name: "Thomas Müller", email: "thomas.mueller@example.com", role: "Moderator", department: "IT", active: true },
  { id: "3", name: "Anna Weber", email: "anna.weber@example.com", role: "User", department: "Marketing", active: true },
  { id: "4", name: "Max Becker", email: "max.becker@example.com", role: "User", department: "Sales", active: false },
  { id: "5", name: "Sophie Wagner", email: "sophie.wagner@example.com", role: "User", department: "Support", active: true },
];

const departments = ["HR", "IT", "Marketing", "Sales", "Support", "Finance", "Operations"];

const Employees = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<User | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "User",
    department: "HR",
    active: true
  });
  const { toast } = useToast();

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
    setNewEmployee({
      name: "",
      email: "",
      role: "User",
      department: "HR",
      active: true
    });
    setOpenAddDialog(true);
  };

  const handleSaveNewEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: "Fehler",
        description: "Name und E-Mail sind erforderlich",
        variant: "destructive",
      });
      return;
    }

    const id = `${employees.length + 1}`;
    const employee: User = {
      id,
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role as "Admin" | "Moderator" | "User",
      department: newEmployee.department,
      active: newEmployee.active
    };

    setEmployees([...employees, employee]);
    setOpenAddDialog(false);
    toast({
      description: `Mitarbeiter ${employee.name} wurde hinzugefügt`,
    });
  };

  const handleEditEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setCurrentEmployee(employee);
      setNewEmployee({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        active: employee.active
      });
      setOpenEditDialog(true);
    }
  };

  const handleSaveEditEmployee = () => {
    if (!currentEmployee) return;
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: "Fehler",
        description: "Name und E-Mail sind erforderlich",
        variant: "destructive",
      });
      return;
    }

    const updatedEmployees = employees.map(emp => {
      if (emp.id === currentEmployee.id) {
        return {
          ...emp,
          name: newEmployee.name || emp.name,
          email: newEmployee.email || emp.email,
          role: newEmployee.role as "Admin" | "Moderator" | "User" || emp.role,
          department: newEmployee.department || emp.department,
          active: newEmployee.active !== undefined ? newEmployee.active : emp.active
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    setOpenEditDialog(false);
    toast({
      description: `Mitarbeiter ${newEmployee.name} wurde aktualisiert`,
    });
  };

  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setCurrentEmployee(employee);
      setOpenDeleteDialog(true);
    }
  };

  const confirmDeleteEmployee = () => {
    if (!currentEmployee) return;
    
    const updatedEmployees = employees.filter(emp => emp.id !== currentEmployee.id);
    setEmployees(updatedEmployees);
    setOpenDeleteDialog(false);
    toast({
      description: `Mitarbeiter ${currentEmployee.name} wurde gelöscht`,
    });
  };

  const handleToggleActive = (id: string, currentActiveState: boolean) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, active: !currentActiveState };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      toast({
        description: `Status von ${employee.name} wurde auf ${!currentActiveState ? 'aktiv' : 'inaktiv'} gesetzt`,
      });
    }
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
                        <Badge variant="outline" className="bg-green-100 text-green-800">
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

      {/* Add Employee Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neuen Mitarbeiter hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie einen neuen Mitarbeiter zum System hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newEmployee.name || ""}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email || ""}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rolle
              </Label>
              <Select 
                value={newEmployee.role} 
                onValueChange={(value) => setNewEmployee({...newEmployee, role: value as "Admin" | "Moderator" | "User"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">Benutzer</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Abteilung
              </Label>
              <Select 
                value={newEmployee.department} 
                onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Abteilung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={newEmployee.active ? "active" : "inactive"} 
                onValueChange={(value) => setNewEmployee({...newEmployee, active: value === "active"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNewEmployee}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Informationen des Mitarbeiters.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={newEmployee.name || ""}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                E-Mail
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={newEmployee.email || ""}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rolle
              </Label>
              <Select 
                value={newEmployee.role} 
                onValueChange={(value) => setNewEmployee({...newEmployee, role: value as "Admin" | "Moderator" | "User"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">Benutzer</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-department" className="text-right">
                Abteilung
              </Label>
              <Select 
                value={newEmployee.department} 
                onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Abteilung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select 
                value={newEmployee.active ? "active" : "inactive"} 
                onValueChange={(value) => setNewEmployee({...newEmployee, active: value === "active"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEditEmployee}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mitarbeiter löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Mitarbeiter wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentEmployee && (
              <p className="text-center font-medium">{currentEmployee.name} ({currentEmployee.email})</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={confirmDeleteEmployee}>
              <Trash2 className="mr-2 h-4 w-4" /> Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
