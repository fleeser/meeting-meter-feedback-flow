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
import { supabase } from "@/integrations/supabase/client";

const departments = ["HR", "IT", "Marketing", "Sales", "Support", "Finance", "Operations", "Development", "Legal", "Executive"];

const Employees = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      // Map database profiles to User objects
      const mappedEmployees: User[] = data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as "Admin" | "Moderator" | "User",
        department: profile.department || undefined,
        active: profile.active,
        position: profile.position || undefined,
        joinDate: profile.join_date,
        profileImage: profile.profile_image || undefined
      }));
      
      setEmployees(mappedEmployees);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnten nicht geladen werden",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters and search
    let filtered = [...employees];
    
    // Filter by department
    if (departmentFilter !== "all") {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => 
        (statusFilter === "active" && emp.active) || 
        (statusFilter === "inactive" && !emp.active)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredEmployees(filtered);
  }, [searchQuery, employees, departmentFilter, statusFilter]);

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

  const handleSaveNewEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: "Fehler",
        description: "Name und E-Mail sind erforderlich",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a UUID for the new employee - this resolves the type error
      // as the profiles table requires an id field
      const uuid = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: uuid,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role as "Admin" | "Moderator" | "User",
          department: newEmployee.department,
          position: newEmployee.position,
          active: newEmployee.active || true,
          join_date: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      // Map the returned database record to User type
      if (data && data.length > 0) {
        const newUser: User = {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          role: data[0].role as "Admin" | "Moderator" | "User",
          department: data[0].department || undefined,
          active: data[0].active,
          position: data[0].position || undefined,
          joinDate: data[0].join_date,
          profileImage: data[0].profile_image || undefined
        };
        
        setEmployees([...employees, newUser]);
      }
      
      setOpenAddDialog(false);
      toast({
        description: `Mitarbeiter ${newEmployee.name} wurde hinzugefügt`,
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
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
        active: employee.active,
        position: employee.position
      });
      setOpenEditDialog(true);
    }
  };

  const handleSaveEditEmployee = async () => {
    if (!currentEmployee) return;
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: "Fehler",
        description: "Name und E-Mail sind erforderlich",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role as "Admin" | "Moderator" | "User",
          department: newEmployee.department,
          position: newEmployee.position,
          active: newEmployee.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentEmployee.id);

      if (error) throw error;

      const updatedEmployees = employees.map(emp => {
        if (emp.id === currentEmployee.id) {
          return {
            ...emp,
            name: newEmployee.name || emp.name,
            email: newEmployee.email || emp.email,
            role: newEmployee.role as "Admin" | "Moderator" | "User" || emp.role,
            department: newEmployee.department || emp.department,
            position: newEmployee.position || emp.position,
            active: newEmployee.active !== undefined ? newEmployee.active : emp.active,
          };
        }
        return emp;
      });
      
      setEmployees(updatedEmployees);
      setOpenEditDialog(false);
      toast({
        description: `Mitarbeiter ${newEmployee.name} wurde aktualisiert`,
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setCurrentEmployee(employee);
      setOpenDeleteDialog(true);
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!currentEmployee) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentEmployee.id);

      if (error) throw error;

      const updatedEmployees = employees.filter(emp => emp.id !== currentEmployee.id);
      setEmployees(updatedEmployees);
      setOpenDeleteDialog(false);
      toast({
        description: `Mitarbeiter ${currentEmployee.name} wurde gelöscht`,
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentActiveState: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !currentActiveState, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

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
    } catch (error) {
      console.error('Error toggling employee status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    const selected = document.querySelectorAll('input[name="select-employee"]:checked');
    if (selected.length === 0) {
      toast({
        title: "Keine Auswahl",
        description: "Bitte wählen Sie mindestens einen Mitarbeiter aus",
        variant: "destructive",
      });
      return;
    }
    
    const selectedIds = Array.from(selected).map(el => el.getAttribute('data-id'));
    
    try {
      // Update each selected profile
      for (const id of selectedIds) {
        if (id) {
          const { error } = await supabase
            .from('profiles')
            .update({ active: action === 'activate', updated_at: new Date().toISOString() })
            .eq('id', id);
            
          if (error) throw error;
        }
      }
      
      // Update local state
      const updatedEmployees = employees.map(emp => {
        if (selectedIds.includes(emp.id)) {
          return { ...emp, active: action === 'activate' };
        }
        return emp;
      });
      
      setEmployees(updatedEmployees);
      toast({
        description: `${selectedIds.length} Mitarbeiter wurden ${action === 'activate' ? 'aktiviert' : 'deaktiviert'}`,
      });
      
      // Reset checkboxes
      document.querySelectorAll('input[name="select-employee"]:checked').forEach(
        (el: any) => { el.checked = false; }
      );
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Fehler",
        description: "Aktion konnte nicht durchgeführt werden",
        variant: "destructive",
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
            Mitarbeiter erstellen, bearbeiten und verwalten
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
          <div className="flex flex-col md:flex-row gap-4 mb-4 mt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Nach Name, E-Mail oder Abteilung suchen"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Abteilung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Abteilungen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Stati</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
              <CheckCircle className="h-4 w-4 mr-2" /> Ausgewählte aktivieren
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
              <XCircle className="h-4 w-4 mr-2" /> Ausgewählte deaktivieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input type="checkbox" className="h-4 w-4" onChange={(e) => {
                      document.querySelectorAll('input[name="select-employee"]').forEach(
                        (el: any) => { el.checked = e.target.checked; }
                      );
                    }} />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Abteilung</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Keine Mitarbeiter gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          name="select-employee" 
                          data-id={employee.id} 
                          className="h-4 w-4" 
                        />
                      </TableCell>
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
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(employee.id, employee.active || false)}
                          title={employee.active ? "Deaktivieren" : "Aktivieren"}
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
                          title="Bearbeiten"
                        >
                          <Edit className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          title="Löschen"
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={newEmployee.position || ""}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
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
              <Label htmlFor="edit-position" className="text-right">
                Position
              </Label>
              <Input
                id="edit-position"
                value={newEmployee.position || ""}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
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
