
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  useEffect(() => {
    // Fetch both templates and questions from the database
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch templates with their questions
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select(`
            *,
            template_questions(
              id, 
              order_position,
              question:question_id(*)
            )
          `)
          .order('created_at', { ascending: false });

        if (templatesError) throw templatesError;

        // Fetch all questions for the question bank
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('text');

        if (questionsError) throw questionsError;

        // Format the templates data
        const formattedTemplates: Template[] = templatesData.map((template) => {
          // Sort questions by order_position
          const sortedTemplateQuestions = template.template_questions
            ? [...template.template_questions].sort((a, b) => 
                (a.order_position || 0) - (b.order_position || 0))
            : [];
            
          // Map the questions to the format expected by the UI
          const templateQuestions: Question[] = sortedTemplateQuestions.map(tq => ({
            id: tq.question.id,
            text: tq.question.text,
            createdAt: tq.question.created_at,
            updatedAt: tq.question.updated_at
          }));

          return {
            id: template.id,
            name: template.name,
            questions: templateQuestions,
            createdAt: template.created_at,
            updatedAt: template.updated_at,
            isUsedInSurveys: template.is_used_in_surveys
          };
        });

        // Format the questions data
        const formattedQuestions: Question[] = questionsData.map(question => ({
          id: question.id,
          text: question.text,
          createdAt: question.created_at,
          updatedAt: question.updated_at
        }));

        setTemplates(formattedTemplates);
        setAvailableQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Fehler",
          description: "Daten konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

  const handleSaveTemplate = async () => {
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

    try {
      // First, create the template
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .insert({
          name: newTemplate.name,
          created_by: user?.id || null,
          is_used_in_surveys: false
        })
        .select()
        .single();

      if (templateError) throw templateError;
      
      // Then, create the template_questions connections
      const templateQuestionInserts = (newTemplate.questions || []).map((question, index) => ({
        template_id: templateData.id,
        question_id: question.id,
        order_position: index
      }));
      
      const { error: templateQuestionsError } = await supabase
        .from('template_questions')
        .insert(templateQuestionInserts);
        
      if (templateQuestionsError) throw templateQuestionsError;
      
      // Create the complete template object for the UI
      const template: Template = {
        id: templateData.id,
        name: templateData.name,
        questions: newTemplate.questions as Question[],
        createdAt: templateData.created_at,
        updatedAt: templateData.updated_at,
        isUsedInSurveys: false
      };

      setTemplates([template, ...templates]);
      setOpenCreateDialog(false);
      toast({
        description: `Vorlage "${template.name}" wurde erstellt`,
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Fehler",
        description: "Vorlage konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
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

  const handleAddNewQuestion = async () => {
    if (!newQuestion.trim()) {
      toast({
        description: "Bitte geben Sie eine Frage ein",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First, create the new question in the database
      const { data, error } = await supabase
        .from('questions')
        .insert({
          text: newQuestion,
          created_by: user?.id || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newQuestionObj: Question = {
        id: data.id,
        text: data.text,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Add to available questions list
      setAvailableQuestions([...availableQuestions, newQuestionObj]);
      
      // Add to current template
      setNewTemplate({
        ...newTemplate,
        questions: [...(newTemplate.questions || []), newQuestionObj]
      });
      
      setNewQuestion("");
      
      toast({
        description: "Neue Frage erstellt und hinzugefügt",
      });
    } catch (error) {
      console.error('Error creating new question:', error);
      toast({
        title: "Fehler",
        description: "Frage konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
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
