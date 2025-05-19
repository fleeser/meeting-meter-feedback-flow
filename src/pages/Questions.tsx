
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import { Question } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockQuestions: Question[] = [
  {
    id: "q1",
    text: "How would you rate the clarity of communication during the meeting?",
    createdAt: "2025-04-10T14:30:00Z",
    updatedAt: "2025-04-10T14:30:00Z"
  },
  {
    id: "q2",
    text: "How effective was the meeting at addressing its stated objectives?",
    createdAt: "2025-04-12T10:15:00Z",
    updatedAt: "2025-04-12T10:15:00Z"
  },
  {
    id: "q3",
    text: "How would you rate the efficiency of time usage during the meeting?",
    createdAt: "2025-04-15T09:45:00Z",
    updatedAt: "2025-04-15T09:45:00Z"
  },
  {
    id: "q4",
    text: "How well was the meeting facilitated or moderated?",
    createdAt: "2025-04-18T16:20:00Z",
    updatedAt: "2025-04-18T16:20:00Z"
  },
];

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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
    toast({
      title: "Create Question",
      description: "This would open the question creation form in a real application",
    });
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Question Repository</h1>
        <Button 
          onClick={handleCreateQuestion}
          className="bg-primary-blue hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Question
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search questions..."
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
                <TableHead className="w-[60%]">Question Text</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-medium">No questions found</h3>
                      <p className="mt-1 text-sm">
                        {searchQuery
                          ? "Try changing your search criteria." 
                          : "Create your first question to get started."}
                      </p>
                      <Button 
                        onClick={handleCreateQuestion}
                        variant="outline" 
                        size="sm"
                        className="mt-4"
                      >
                        Create Question
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map(question => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.text}</TableCell>
                    <TableCell>{formatDate(question.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Questions;
