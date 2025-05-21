
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
import { supabase } from "@/integrations/supabase/client";

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
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  useEffect(() => {
    async function fetchTemplateDetails() {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch template with its questions
        const { data: templateData, error: templateError } = await supabase
          .from('templates')
          .select(`
            *,
            template_questions(
              id,
              order_position,
              question:question_id(*)
            )
          `)
          .eq('id', id)
          .single();

        if (templateError) throw templateError;

        // Fetch all questions for adding to template
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('text');

        if (questionsError) throw questionsError;

        // Sort questions by order_position
        const sortedTemplateQuestions = templateData.template_questions
          ? [...templateData.template_questions].sort((a, b) => 
              (a.order_position || 0) - (b.order_position || 0))
          : [];
          
        // Map the questions to the format expected by the UI
        const templateQuestions: Question[] = sortedTemplateQuestions.map(tq => ({
          id: tq.question.id,
          text: tq.question.text,
          createdAt: tq.question.created_at,
          updatedAt: tq.question.updated_at
        }));

        // Format all available questions
        const formattedQuestions: Question[] = questionsData.map(question => ({
          id: question.id,
          text: question.text,
          createdAt: question.created_at,
          updatedAt: question.updated_at
        }));

        const formattedTemplate: Template = {
          id: templateData.id,
          name: templateData.name,
          questions: templateQuestions,
          createdAt: templateData.created_at,
          updatedAt: templateData.updated_at,
          isUsedInSurveys: templateData.is_used_in_surveys
        };

        setTemplate(formattedTemplate);
        setTemplateName(formattedTemplate.name);
        setAvailableQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error fetching template details:', error);
        toast({
          title: "Fehler",
          description: "Vorlagendetails konnten nicht geladen werden",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTemplateDetails();
  }, [id, toast]);

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

  const handleSaveTemplateName = async () => {
    if (!templateName.trim() || !template) {
      toast({
        title: "Fehler",
        description: "Der Vorlagenname darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('templates')
        .update({ 
          name: templateName,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);
        
      if (error) throw error;

      setTemplate({
        ...template,
        name: templateName,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        description: "Vorlagenname wurde aktualisiert.",
      });
      setOpenEditNameDialog(false);
    } catch (error) {
      console.error('Error updating template name:', error);
      toast({
        title: "Fehler",
        description: "Vorlagenname konnte nicht aktualisiert werden",
        variant: "destructive",
      });
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

  const confirmDeleteTemplate = async () => {
    if (!template) return;
    
    try {
      // Delete the template (template_questions will be deleted automatically via cascade)
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id);
        
      if (error) throw error;
      
      toast({
        description: "Vorlage wurde gelöscht. Sie werden zur Vorlagenliste umgeleitet.",
      });
      
      setTimeout(() => {
        navigate("/app/templates");
      }, 1500);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Fehler",
        description: "Vorlage konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
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
    setSelectedQuestionId("");
    setOpenAddQuestionDialog(true);
  };

  const handleSaveNewQuestion = async () => {
    if (!template) return;
    
    try {
      if (selectedQuestionId) {
        // Using existing question
        const question = availableQuestions.find(q => q.id === selectedQuestionId);
        if (!question) return;
        
        // Check if question is already in template
        if (template.questions.some(q => q.id === question.id)) {
          toast({
            title: "Fehler",
            description: "Diese Frage ist bereits in der Vorlage enthalten.",
            variant: "destructive",
          });
          return;
        }
        
        // Add to template_questions
        const { error } = await supabase
          .from('template_questions')
          .insert({
            template_id: template.id,
            question_id: question.id,
            order_position: template.questions.length
          });
          
        if (error) throw error;
        
        const updatedTemplate = {
          ...template,
          questions: [...template.questions, question],
          updatedAt: new Date().toISOString()
        };
        
        setTemplate(updatedTemplate);
        
        toast({
          description: "Bestehende Frage wurde hinzugefügt.",
        });
      } else if (newQuestionText.trim()) {
        // Create new question
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            text: newQuestionText
          })
          .select()
          .single();
          
        if (questionError) throw questionError;
        
        // Add to template_questions
        const { error: templateQuestionError } = await supabase
          .from('template_questions')
          .insert({
            template_id: template.id,
            question_id: questionData.id,
            order_position: template.questions.length
          });
          
        if (templateQuestionError) throw templateQuestionError;
        
        const newQuestion: Question = {
          id: questionData.id,
          text: questionData.text,
          createdAt: questionData.created_at,
          updatedAt: questionData.updated_at
        };
        
        // Update available questions
        setAvailableQuestions([...availableQuestions, newQuestion]);
        
        const updatedTemplate = {
          ...template,
          questions: [...template.questions, newQuestion],
          updatedAt: new Date().toISOString()
        };
        
        setTemplate(updatedTemplate);
        
        toast({
          description: "Neue Frage wurde erstellt und hinzugefügt.",
        });
      } else {
        toast({
          title: "Fehler",
          description: "Bitte wählen Sie eine Frage aus oder erstellen Sie eine neue.",
          variant: "destructive",
        });
        return;
      }
      
      setOpenAddQuestionDialog(false);
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Fehler",
        description: "Frage konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
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

  const handleSaveEditedQuestion = async () => {
    if (!newQuestionText.trim() || !currentQuestion || !template) {
      toast({
        title: "Fehler",
        description: "Der Fragetext darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .update({
          text: newQuestionText,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentQuestion.id)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedQuestions = template.questions.map(q => {
        if (q.id === currentQuestion.id) {
          return {
            ...q,
            text: data.text,
            updatedAt: data.updated_at
          };
        }
        return q;
      });
      
      setTemplate({
        ...template,
        questions: updatedQuestions,
        updatedAt: new Date().toISOString()
      });
      
      // Update in available questions as well
      const updatedAvailableQuestions = availableQuestions.map(q => {
        if (q.id === currentQuestion.id) {
          return {
            ...q,
            text: data.text,
            updatedAt: data.updated_at
          };
        }
        return q;
      });
      
      setAvailableQuestions(updatedAvailableQuestions);
      
      toast({
        description: "Frage wurde aktualisiert.",
      });
      
      setOpenEditQuestionDialog(false);
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Fehler",
        description: "Frage konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (!template || template.isUsedInSurveys) {
      toast({
        title: "Fragen können nicht neu angeordnet werden",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Fragen können nicht neu angeordnet werden.",
        variant: "destructive",
      });
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= template.questions.length) return;
    
    try {
      // Get the two template_questions entries we need to update
      const { data: templateQuestionsData, error: fetchError } = await supabase
        .from('template_questions')
        .select('id, question_id, order_position')
        .eq('template_id', template.id)
        .in('question_id', [template.questions[index].id, template.questions[newIndex].id]);
        
      if (fetchError) throw fetchError;
      
      // Find the entries for both questions
      const sourceQuestionEntry = templateQuestionsData.find(
        tq => tq.question_id === template.questions[index].id
      );
      
      const targetQuestionEntry = templateQuestionsData.find(
        tq => tq.question_id === template.questions[newIndex].id
      );
      
      if (!sourceQuestionEntry || !targetQuestionEntry) {
        throw new Error('Could not find question entries');
      }
      
      // Swap the order positions
      const { error: updateError1 } = await supabase
        .from('template_questions')
        .update({ order_position: targetQuestionEntry.order_position })
        .eq('id', sourceQuestionEntry.id);
        
      if (updateError1) throw updateError1;
      
      const { error: updateError2 } = await supabase
        .from('template_questions')
        .update({ order_position: sourceQuestionEntry.order_position })
        .eq('id', targetQuestionEntry.id);
        
      if (updateError2) throw updateError2;
      
      // Update the local state
      const newQuestions = [...template.questions];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      
      setTemplate({
        ...template,
        questions: newQuestions,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        description: `Frage wurde nach ${direction === 'up' ? 'oben' : 'unten'} verschoben.`,
      });
    } catch (error) {
      console.error('Error moving question:', error);
      toast({
        title: "Fehler",
        description: "Frage konnte nicht verschoben werden",
        variant: "destructive",
      });
    }
  };

  const handleRemoveQuestion = async (index: number) => {
    if (!template || template.isUsedInSurveys) {
      toast({
        title: "Fragen können nicht entfernt werden",
        description: "Diese Vorlage wird in aktiven oder geschlossenen Umfragen verwendet. Fragen können nicht entfernt werden.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find the template_question entry to delete
      const { data, error: fetchError } = await supabase
        .from('template_questions')
        .select('id')
        .eq('template_id', template.id)
        .eq('question_id', template.questions[index].id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the entry
      const { error: deleteError } = await supabase
        .from('template_questions')
        .delete()
        .eq('id', data.id);
        
      if (deleteError) throw deleteError;
      
      // Update order positions for remaining questions
      const remainingQuestions = template.questions.filter((_, i) => i !== index);
      
      // Only need to update order positions if there are multiple questions
      if (remainingQuestions.length > 1) {
        for (let i = 0; i < remainingQuestions.length; i++) {
          const { error: updateError } = await supabase
            .from('template_questions')
            .update({ order_position: i })
            .eq('template_id', template.id)
            .eq('question_id', remainingQuestions[i].id);
            
          if (updateError) {
            console.error('Error updating order position:', updateError);
            // Continue even if this fails
          }
        }
      }
      
      // Update local state
      setTemplate({
        ...template,
        questions: remainingQuestions,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        description: "Frage wurde entfernt.",
      });
    } catch (error) {
      console.error('Error removing question:', error);
      toast({
        title: "Fehler",
        description: "Frage konnte nicht entfernt werden",
        variant: "destructive",
      });
    }
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
