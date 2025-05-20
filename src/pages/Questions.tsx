
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Question } from "@/lib/types";
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
import { X, Save } from "lucide-react";

// Mock data for demonstration
const mockQuestions: Question[] = [
  {
    id: "q1",
    text: "Wie würden Sie die Klarheit der Kommunikation während des Meetings bewerten?",
    createdAt: "2025-04-10T14:30:00Z",
    updatedAt: "2025-04-10T14:30:00Z"
  },
  {
    id: "q2",
    text: "Wie effektiv war das Meeting bei der Behandlung der angegebenen Ziele?",
    createdAt: "2025-04-12T10:15:00Z",
    updatedAt: "2025-04-12T10:15:00Z"
  },
  {
    id: "q3",
    text: "Wie würden Sie die Effizienz der Zeitnutzung während des Meetings bewerten?",
    createdAt: "2025-04-15T09:45:00Z",
    updatedAt: "2025-04-15T09:45:00Z"
  },
  {
    id: "q4",
    text: "Wie gut wurde das Meeting moderiert oder geleitet?",
    createdAt: "2025-04-18T16:20:00Z",
    updatedAt: "2025-04-18T16:20:00Z"
  },
];

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    // This would be an API call in a real app
    setTimeout(() => {
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateQuestion = () => {
    setNewQuestionText("");
    setOpenCreateDialog(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setNewQuestionText(question.text);
    setOpenEditDialog(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setOpenDeleteDialog(true);
  };

  const handleSaveNewQuestion = () => {
    if (!newQuestionText.trim()) {
      toast({
        title: "Fehler",
        description: "Fragetext darf nicht leer sein",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: newQuestionText,
      createdAt: now,
      updatedAt: now
    };

    setQuestions([...questions, newQuestion]);
    setOpenCreateDialog(false);
    toast({
      description: "Frage wurde erstellt"
    });
  };

  const handleSaveEditedQuestion = () => {
    if (!currentQuestion || !newQuestionText.trim()) {
      toast({
        title: "Fehler",
        description: "Fragetext darf nicht leer sein",
        variant: "destructive",
      });
      return;
    }

    const updatedQuestions = questions.map(q => {
      if (q.id === currentQuestion.id) {
        return {
          ...q,
          text: newQuestionText,
          updatedAt: new Date().toISOString()
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    setOpenEditDialog(false);
    toast({
      description: "Frage wurde aktualisiert"
    });
  };

  const handleConfirmDelete = () => {
    if (!currentQuestion) return;

    const updatedQuestions = questions.filter(q => q.id !== currentQuestion.id);
    setQuestions(updatedQuestions);
    setOpenDeleteDialog(false);
    toast({
      description: "Frage wurde gelöscht"
    });
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
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
        <p className="text-lg">Fragen werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Fragensammlung</h1>
        <Button 
          onClick={handleCreateQuestion}
          className="bg-primary-blue hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Frage erstellen
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Fragen durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="flex-grow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Fragetext</TableHead>
                <TableHead>Erstellungsdatum</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-medium">Keine Fragen gefunden</h3>
                      <p className="mt-1 text-sm">
                        {searchQuery
                          ? "Versuchen Sie, Ihre Suchkriterien zu ändern." 
                          : "Erstellen Sie Ihre erste Frage, um zu beginnen."}
                      </p>
                      <Button 
                        onClick={handleCreateQuestion}
                        variant="outline" 
                        size="sm"
                        className="mt-4"
                      >
                        Frage erstellen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map(question => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.text}</TableCell>
                    <TableCell>{formatDate(question.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditQuestion(question)}>
                        <Edit className="h-4 w-4 mr-2" /> Bearbeiten
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-white hover:bg-red-500"
                        onClick={() => handleDeleteQuestion(question)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Löschen
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create Question Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neue Frage erstellen</DialogTitle>
            <DialogDescription>
              Geben Sie den Text für die neue Frage ein.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="question-text" className="mb-2 block">
                Fragetext
              </Label>
              <Textarea
                id="question-text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="resize-none"
                placeholder="Geben Sie Ihre Frage ein"
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
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Frage bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie den Text der ausgewählten Frage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-question-text" className="mb-2 block">
                Fragetext
              </Label>
              <Textarea
                id="edit-question-text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="resize-none"
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

      {/* Delete Question Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Frage löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie diese Frage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentQuestion && (
              <p className="text-center font-medium border p-3 rounded bg-gray-50">{currentQuestion.text}</p>
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

export default Questions;
