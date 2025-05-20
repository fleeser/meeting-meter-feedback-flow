
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Calendar, Users, X, Save, Trash2 } from "lucide-react";
import { Survey, Template, User } from "@/lib/types";
import SurveyCard from "@/components/surveys/SurveyCard";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Mock data for demonstration
const mockSurveys: Survey[] = [
  {
    id: "1",
    name: "Projekt Kickoff Meeting Feedback",
    status: "Active",
    template: { id: "1", name: "Meeting Feedback", questions: [], createdAt: "2025-05-10", updatedAt: "2025-05-10", isUsedInSurveys: true },
    questions: [],
    assignedEmployees: [
      { id: "1", name: "John Smith", email: "john@example.com" },
      { id: "2", name: "Sarah Johnson", email: "sarah@example.com" }
    ],
    responses: 12,
    createdAt: "2025-05-10T10:00:00Z",
    updatedAt: "2025-05-10T10:00:00Z",
    shareLink: "https://survey.example.com/s/1"
  },
  {
    id: "2",
    name: "Wöchentliches Team-Sync Evaluation",
    status: "Draft",
    template: { id: "2", name: "Team Meeting", questions: [], createdAt: "2025-05-09", updatedAt: "2025-05-09", isUsedInSurveys: true },
    questions: [],
    assignedEmployees: [
      { id: "1", name: "John Smith", email: "john@example.com" }
    ],
    responses: 0,
    createdAt: "2025-05-09T14:30:00Z",
    updatedAt: "2025-05-09T14:30:00Z",
    shareLink: "https://survey.example.com/s/2"
  },
  {
    id: "3",
    name: "Kundenpräsentation Feedback",
    status: "Closed",
    template: { id: "1", name: "Meeting Feedback", questions: [], createdAt: "2025-05-01", updatedAt: "2025-05-01", isUsedInSurveys: true },
    questions: [],
    assignedEmployees: [
      { id: "3", name: "Mike Wilson", email: "mike@example.com" },
      { id: "4", name: "Emma Davis", email: "emma@example.com" }
    ],
    responses: 8,
    createdAt: "2025-05-01T09:15:00Z",
    updatedAt: "2025-05-08T17:00:00Z",
    shareLink: "https://survey.example.com/s/3"
  }
];

// Mock templates for survey creation
const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Meeting Feedback",
    questions: [
      { id: "q1", text: "Wie würden Sie die Kommunikationsklarheit während des Meetings bewerten?", createdAt: "", updatedAt: "" },
      { id: "q2", text: "Wie effektiv war das Meeting bei der Behandlung der angegebenen Ziele?", createdAt: "", updatedAt: "" },
    ],
    createdAt: "2025-05-01",
    updatedAt: "2025-05-01",
    isUsedInSurveys: true
  },
  {
    id: "2",
    name: "Team Meeting",
    questions: [
      { id: "q1", text: "Wie würden Sie die Kommunikationsklarheit während des Meetings bewerten?", createdAt: "", updatedAt: "" },
      { id: "q4", text: "Wie gut wurde das Meeting moderiert oder erleichtert?", createdAt: "", updatedAt: "" },
    ],
    createdAt: "2025-05-01",
    updatedAt: "2025-05-01",
    isUsedInSurveys: true
  }
];

// Mock employees for survey assignment
const mockEmployees: User[] = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "User", department: "Marketing", active: true },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "User", department: "Sales", active: true },
  { id: "3", name: "Mike Wilson", email: "mike@example.com", role: "User", department: "IT", active: true },
  { id: "4", name: "Emma Davis", email: "emma@example.com", role: "User", department: "HR", active: true },
  { id: "5", name: "David Brown", email: "david@example.com", role: "User", department: "Finance", active: true },
];

interface SurveyFormData {
  name: string;
  templateId: string;
  description: string;
  dueDate: string;
  isAnonymous: boolean;
  employees: string[];
}

const Dashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const { toast } = useToast();

  const form = useForm<SurveyFormData>({
    defaultValues: {
      name: "",
      templateId: "",
      description: "",
      dueDate: "",
      isAnonymous: false,
      employees: []
    },
  });

  useEffect(() => {
    // This would be API calls in a real app
    setTimeout(() => {
      setSurveys(mockSurveys);
      setTemplates(mockTemplates);
      setEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSurveys = surveys
    .filter(survey => 
      statusFilter === "all" || survey.status.toLowerCase() === statusFilter.toLowerCase()
    )
    .filter(survey =>
      survey.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateSurvey = () => {
    form.reset({
      name: "",
      templateId: "",
      description: "",
      dueDate: "",
      isAnonymous: false,
      employees: []
    });
    setSelectedEmployees([]);
    setOpenCreateDialog(true);
  };

  const handleDeleteSurvey = (survey: Survey) => {
    setCurrentSurvey(survey);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!currentSurvey) return;

    const updatedSurveys = surveys.filter(s => s.id !== currentSurvey.id);
    setSurveys(updatedSurveys);
    setOpenDeleteDialog(false);
    toast({
      description: `Umfrage "${currentSurvey.name}" wurde gelöscht.`,
    });
  };

  const handleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const onSubmit = (data: SurveyFormData) => {
    const selectedTemplate = templates.find(t => t.id === data.templateId);
    
    if (!selectedTemplate) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Vorlage aus",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedEmployees.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie mindestens einen Mitarbeiter aus",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const assignedEmployees = employees.filter(e => selectedEmployees.includes(e.id));
    
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      name: data.name,
      status: "Draft",
      template: selectedTemplate,
      questions: [...selectedTemplate.questions],
      assignedEmployees,
      responses: 0,
      createdAt: now,
      updatedAt: now,
      shareLink: `https://survey.example.com/s/${Date.now()}`,
      description: data.description,
      dueDate: data.dueDate,
      isAnonymous: data.isAnonymous
    };

    setSurveys([newSurvey, ...surveys]);
    setOpenCreateDialog(false);
    toast({
      description: `Umfrage "${data.name}" wurde erfolgreich erstellt.`,
    });
  };

  const formatDate = (dateString: string) => {
    // Format date for display
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Umfragen werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Umfragen</h1>
        <Button 
          onClick={handleCreateSurvey}
          className="bg-primary-blue hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Umfrage erstellen
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Umfragen durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nach Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="closed">Geschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSurveys.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Keine Umfragen gefunden</h3>
            <p className="mt-1">
              {searchQuery || statusFilter !== "all" 
                ? "Versuchen Sie Ihre Suchkriterien oder Filter anzupassen." 
                : "Erstellen Sie Ihre erste Umfrage."}
            </p>
            <Button 
              onClick={handleCreateSurvey}
              variant="outline" 
              className="mt-4"
            >
              Umfrage erstellen
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredSurveys.map(survey => (
            <div key={survey.id} className="relative group">
              <Button
                variant="outline" 
                size="icon"
                className="absolute top-2 right-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteSurvey(survey);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
              <Link to={`/app/surveys/${survey.id}`}>
                <SurveyCard survey={survey} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Survey Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Umfrage erstellen</DialogTitle>
            <DialogDescription>
              Füllen Sie die Details aus, um eine neue Umfrage zu erstellen.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Umfrage Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name der Umfrage eingeben" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorlage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie eine Vorlage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.questions.length} Fragen)
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Beschreiben Sie den Zweck der Umfrage" 
                        className="resize-none" 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fälligkeitsdatum</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Anonyme Umfrage</FormLabel>
                      <FormDescription>
                        Die Antworten der Mitarbeiter werden anonym erfasst.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="text-base">Mitarbeiter auswählen</Label>
                <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-gray-500">Keine Mitarbeiter verfügbar.</p>
                  ) : (
                    <div className="space-y-2">
                      {employees.map(employee => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`employee-${employee.id}`}
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={() => handleEmployeeSelection(employee.id)}
                          />
                          <label 
                            htmlFor={`employee-${employee.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {employee.name} ({employee.email})
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedEmployees.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {selectedEmployees.length} Mitarbeiter ausgewählt
                  </p>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    <X className="mr-2 h-4 w-4" /> Abbrechen
                  </Button>
                </DialogClose>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Speichern
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Survey Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Umfrage löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie diese Umfrage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentSurvey && (
              <div className="text-center">
                <p className="font-medium">{currentSurvey.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: {currentSurvey.status}, {currentSurvey.assignedEmployees.length} Mitarbeiter zugewiesen
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
