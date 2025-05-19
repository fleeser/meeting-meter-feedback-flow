
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle, Search, X, Save, Plus, Trash2 } from "lucide-react";
import { Template, Question } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data for demonstration
const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Meeting Feedback",
    questions: [
      { id: "q1", text: "Wie würden Sie die Kommunikationsklarheit während des Meetings bewerten?", createdAt: "", updatedAt: "" },
      { id: "q2", text: "Wie effektiv war das Meeting bei der Behandlung der angegebenen Ziele?", createdAt: "", updatedAt: "" },
      { id: "q3", text: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?", createdAt: "", updatedAt: "" },
    ],
    createdAt: "2025-04-15T14:30:00Z",
    updatedAt: "2025-04-15T14:30:00Z",
    isUsedInSurveys: true
  },
  {
    id: "2",
    name: "Team Meeting",
    questions: [
      { id: "q1", text: "Wie würden Sie die Kommunikationsklarheit während des Meetings bewerten?", createdAt: "", updatedAt: "" },
      { id: "q4", text: "Wie gut wurde das Meeting moderiert oder erleichtert?", createdAt: "", updatedAt: "" },
    ],
    createdAt: "2025-04-18T10:15:00Z",
    updatedAt: "2025-04-18T10:15:00Z",
    isUsedInSurveys: false
  },
];

// Mock questions for the question bank
const mockQuestionBank: Question[] = [
  { id: "q1", text: "Wie würden Sie die Kommunikationsklarheit während des Meetings bewerten?", createdAt: "", updatedAt: "" },
  { id: "q2", text: "Wie effektiv war das Meeting bei der Behandlung der angegebenen Ziele?", createdAt: "", updatedAt: "" },
  { id: "q3", text: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?", createdAt: "", updatedAt: "" },
  { id: "q4", text: "Wie gut wurde das Meeting moderiert oder erleichtert?", createdAt: "", updatedAt: "" },
  { id: "q5", text: "Wie zufrieden sind Sie mit der Teamleistung?", createdAt: "", updatedAt: "" },
  { id: "q6", text: "Wie würden Sie die Arbeitsbedingungen bewerten?", createdAt: "", updatedAt: "" },
  { id: "q7", text: "Wie zufrieden sind Sie mit der Kommunikation in Ihrem Team?", createdAt: "", updatedAt: "" },
];

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: "",
    questions: []
  });
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState<string>("");

  useEffect(() => {
    // This would be an API call in a real app
    setTimeout(() => {
      setTemplates(mockTemplates);
      setAvailableQuestions(mockQuestionBank);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = () => {
    setNewTemplate({
      name: "",
      questions: []
    });
    setOpenCreateDialog(true);
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name) {
      toast({
        title: "Fehler",
        description: "Vorlagenname ist erforderlich",
        variant: "destructive",
      });
      return;
    }

    if (!newTemplate.questions || newTemplate.questions.length === 0) {
      toast({
        title: "Fehler",
        description: "Mindestens eine Frage ist erforderlich",
        variant: "destructive",
      });
      return;
    }

    const id = `${templates.length + 1}`;
    const now = new Date().toISOString();
    const template: Template = {
      id,
      name: newTemplate.name,
      questions: newTemplate.questions as Question[],
      createdAt: now,
      updatedAt: now,
      isUsedInSurveys: false
    };

    setTemplates([...templates, template]);
    setOpenCreateDialog(false);
    toast({
      description: `Vorlage "${template.name}" wurde erstellt`,
    });
  };

  const handleAddExistingQuestion = () => {
    if (!selectedQuestion) return;
    
    const question = availableQuestions.find(q => q.id === selectedQuestion);
    if (!question) return;
    
    if (newTemplate.questions?.some(q => q.id === question.id)) {
      toast({
        description: "Diese Frage ist bereits in der Vorlage enthalten",
        variant: "destructive",
      });
      return;
    }
    
    setNewTemplate({
      ...newTemplate,
      questions: [...(newTemplate.questions || []), question]
    });
    
    setSelectedQuestion("");
  };

  const handleAddNewQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        description: "Bitte geben Sie eine Frage ein",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date().toISOString();
    const newQuestionObj: Question = {
      id: `new-${Date.now()}`,
      text: newQuestion,
      createdAt: now,
      updatedAt: now
    };
    
    setNewTemplate({
      ...newTemplate,
      questions: [...(newTemplate.questions || []), newQuestionObj]
    });
    
    setNewQuestion("");
  };

  const handleRemoveQuestion = (questionId: string) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions?.filter(q => q.id !== questionId) || []
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Vorlagen werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Umfragevorlagen</h1>
        <Button 
          onClick={handleCreateTemplate}
          className="bg-primary-blue hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Vorlage erstellen
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Vorlagen durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Keine Vorlagen gefunden</h3>
            <p className="mt-1">
              {searchQuery
                ? "Versuchen Sie, Ihre Suchkriterien zu ändern." 
                : "Erstellen Sie Ihre erste Vorlage, um zu beginnen."}
            </p>
            <Button 
              onClick={handleCreateTemplate}
              variant="outline" 
              className="mt-4"
            >
              Vorlage erstellen
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <Link key={template.id} to={`/app/templates/${template.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <h3 className="font-medium text-lg">{template.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">
                    {template.questions.length} Fragen
                  </p>
                  <p className="text-sm text-gray-500">
                    {template.isUsedInSurveys ? "In Umfragen verwendet" : "Nicht in Umfragen verwendet"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Neue Vorlage erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Umfragevorlage mit Fragen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Name
              </Label>
              <Input
                id="template-name"
                value={newTemplate.name || ""}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="col-span-3"
                placeholder="Namen der Vorlage eingeben"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Fragen hinzufügen</h3>
              
              <div className="mb-4">
                <Label htmlFor="existing-question" className="mb-1 block">
                  Bestehende Frage auswählen
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedQuestion}
                    onValueChange={setSelectedQuestion}
                  >
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder="Frage auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuestions.map(question => (
                        <SelectItem key={question.id} value={question.id}>
                          {question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddExistingQuestion} disabled={!selectedQuestion}>
                    <Plus className="mr-1 h-4 w-4" /> Hinzufügen
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="new-question" className="mb-1 block">
                  Neue Frage erstellen
                </Label>
                <div className="flex flex-col gap-2">
                  <Textarea
                    id="new-question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Neue Frage eingeben"
                    className="resize-none"
                  />
                  <Button type="button" onClick={handleAddNewQuestion} disabled={!newQuestion.trim()} className="self-end">
                    <Plus className="mr-1 h-4 w-4" /> Frage erstellen
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Ausgewählte Fragen ({newTemplate.questions?.length || 0})</h3>
              
              {(!newTemplate.questions || newTemplate.questions.length === 0) ? (
                <p className="text-gray-500 text-sm">Noch keine Fragen ausgewählt.</p>
              ) : (
                <div className="space-y-2">
                  {newTemplate.questions?.map((question, index) => (
                    <div key={question.id} className="flex justify-between items-center border p-2 rounded-md">
                      <span className="text-sm mr-2 flex-grow">
                        <span className="font-medium mr-1">{index + 1}.</span> {question.text}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
