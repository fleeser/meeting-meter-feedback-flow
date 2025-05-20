
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, MoveUp, MoveDown, Plus, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Template, Question } from "@/lib/types";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock template data
const mockTemplate: Template = {
  id: "1",
  name: "Meeting Feedback",
  questions: [
    { id: "q1", text: "Wie würden Sie die Kommunikationsklarheit während des Meetings bewerten?", createdAt: "", updatedAt: "" },
    { id: "q2", text: "Wie effektiv war das Meeting bei der Behandlung der angegebenen Ziele?", createdAt: "", updatedAt: "" },
    { id: "q3", text: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?", createdAt: "", updatedAt: "" },
    { id: "q4", text: "Wie gut wurde das Meeting moderiert oder erleichtert?", createdAt: "", updatedAt: "" },
  ],
  createdAt: "2025-04-15T14:30:00Z",
  updatedAt: "2025-04-15T14:30:00Z",
  isUsedInSurveys: false
};

const TemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [openEditNameDialog, setOpenEditNameDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddQuestionDialog, setOpenAddQuestionDialog] = useState(false);
  const [openEditQuestionDialog, setOpenEditQuestionDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setTemplate(mockTemplate);
      setTemplateName(mockTemplate.name);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleEditTemplate = () => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Eingeschränktes Bearbeiten",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Nur der Name kann geändert werden.",
        variant: "default",
      });
    }
    
    setOpenEditNameDialog(true);
  };

  const handleSaveTemplateName = () => {
    if (!templateName.trim()) {
      toast({
        title: "Fehler",
        description: "Der Vorlagenname darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }

    if (template) {
      setTemplate({
        ...template,
        name: templateName,
        updatedAt: new Date().toISOString()
      });
      toast({
        description: "Vorlagenname wurde aktualisiert.",
      });
      setOpenEditNameDialog(false);
    }
  };

  const handleDeleteTemplate = () => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Löschen nicht möglich",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet und kann nicht gelöscht werden.",
        variant: "destructive",
      });
      return;
    }
    
    setOpenDeleteDialog(true);
  };

  const confirmDeleteTemplate = () => {
    toast({
      description: "Vorlage wurde gelöscht. Sie werden zur Vorlagenliste umgeleitet.",
    });
    
    setTimeout(() => {
      navigate("/app/templates");
    }, 1500);
  };

  const handleAddQuestion = () => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Fragen können nicht geändert werden",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Fragen können nicht hinzugefügt werden.",
        variant: "destructive",
      });
      return;
    }
    
    setNewQuestionText("");
    setOpenAddQuestionDialog(true);
  };

  const handleSaveNewQuestion = () => {
    if (!newQuestionText.trim()) {
      toast({
        title: "Fehler",
        description: "Der Fragetext darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }

    if (template) {
      const newQuestion: Question = {
        id: `q${Date.now()}`,
        text: newQuestionText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTemplate({
        ...template,
        questions: [...template.questions, newQuestion],
        updatedAt: new Date().toISOString()
      });
      
      toast({
        description: "Neue Frage wurde hinzugefügt.",
      });
      
      setOpenAddQuestionDialog(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Fragen können nicht geändert werden",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Fragen können nicht bearbeitet werden.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentQuestion(question);
    setNewQuestionText(question.text);
    setOpenEditQuestionDialog(true);
  };

  const handleSaveEditedQuestion = () => {
    if (!newQuestionText.trim() || !currentQuestion) {
      toast({
        title: "Fehler",
        description: "Der Fragetext darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }

    if (template && currentQuestion) {
      const updatedQuestions = template.questions.map(q => {
        if (q.id === currentQuestion.id) {
          return {
            ...q,
            text: newQuestionText,
            updatedAt: new Date().toISOString()
          };
        }
        return q;
      });
      
      setTemplate({
        ...template,
        questions: updatedQuestions,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        description: "Frage wurde aktualisiert.",
      });
      
      setOpenEditQuestionDialog(false);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Fragen können nicht neu angeordnet werden",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Fragen können nicht neu angeordnet werden.",
        variant: "destructive",
      });
      return;
    }
    
    if (!template) return;
    
    const newQuestions = [...template.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newQuestions.length) return;
    
    // Swap questions
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    setTemplate({
      ...template,
      questions: newQuestions,
      updatedAt: new Date().toISOString()
    });
    
    toast({
      description: `Frage wurde nach ${direction === 'up' ? 'oben' : 'unten'} verschoben.`,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Fragen können nicht entfernt werden",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Fragen können nicht entfernt werden.",
        variant: "destructive",
      });
      return;
    }
    
    if (!template) return;
    
    const newQuestions = template.questions.filter((_, i) => i !== index);
    
    setTemplate({
      ...template,
      questions: newQuestions,
      updatedAt: new Date().toISOString()
    });
    
    toast({
      description: "Frage wurde entfernt.",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Vorlage wird geladen...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg text-red-500">Vorlage nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{template.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            {template.isUsedInSurveys && (
              <Badge className="bg-primary-blue">
                In Umfragen verwendet
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {template.questions.length} Fragen
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEditTemplate}
          >
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-survey-closed hover:text-white hover:bg-survey-closed"
                disabled={template.isUsedInSurveys}
              >
                <Trash className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vorlage löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie diese Vorlage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-red-600 hover:bg-red-700">
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fragen</CardTitle>
            <CardDescription>
              In dieser Vorlage enthaltene Fragen
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            disabled={template.isUsedInSurveys}
          >
            <Plus className="h-4 w-4 mr-2" />
            Frage hinzufügen
          </Button>
        </CardHeader>
        
        <CardContent>
          {template.questions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
              <p className="text-gray-500">
                Dieser Vorlage wurden noch keine Fragen hinzugefügt.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-4"
                onClick={handleAddQuestion}
                disabled={template.isUsedInSurveys}
              >
                <Plus className="h-4 w-4 mr-2" />
                Frage hinzufügen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {template.questions.map((question, index) => (
                <div key={question.id} className="flex items-start p-4 border rounded-md">
                  <div className="flex-grow">
                    <p>
                      <span className="font-medium mr-2">{index + 1}.</span>
                      {question.text}
                    </p>
                  </div>
                  
                  <div className="flex space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={template.isUsedInSurveys || index === 0}
                      onClick={() => handleMoveQuestion(index, 'up')}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={template.isUsedInSurveys || index === template.questions.length - 1}
                      onClick={() => handleMoveQuestion(index, 'down')}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={template.isUsedInSurveys}
                      onClick={() => handleEditQuestion(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-survey-closed"
                      disabled={template.isUsedInSurveys}
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Template Name Dialog */}
      <Dialog open={openEditNameDialog} onOpenChange={setOpenEditNameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vorlagennamen bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie den Namen der Umfragevorlage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveTemplateName}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={openAddQuestionDialog} onOpenChange={setOpenAddQuestionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neue Frage hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie eine neue Frage zu dieser Vorlage hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="question-text" className="text-right">
                Fragetext
              </Label>
              <Textarea
                id="question-text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="col-span-3 resize-none"
                placeholder="Geben Sie den Text der Frage ein"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNewQuestion}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={openEditQuestionDialog} onOpenChange={setOpenEditQuestionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Frage bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie den Text dieser Frage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-question-text" className="text-right">
                Fragetext
              </Label>
              <Textarea
                id="edit-question-text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="col-span-3 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" /> Abbrechen
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEditedQuestion}>
              <Save className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateDetails;
