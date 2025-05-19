
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
import { Edit, Trash, MoveUp, MoveDown, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Template } from "@/lib/types";

// Mock template data
const mockTemplate: Template = {
  id: "1",
  name: "Meeting Feedback",
  questions: [
    { id: "q1", text: "How would you rate the clarity of communication during the meeting?", createdAt: "", updatedAt: "" },
    { id: "q2", text: "How effective was the meeting at addressing its stated objectives?", createdAt: "", updatedAt: "" },
    { id: "q3", text: "How would you rate the efficiency of time usage during the meeting?", createdAt: "", updatedAt: "" },
    { id: "q4", text: "How well was the meeting facilitated or moderated?", createdAt: "", updatedAt: "" },
  ],
  createdAt: "2025-04-15T14:30:00Z",
  updatedAt: "2025-04-15T14:30:00Z",
  isUsedInSurveys: true
};

const TemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setTemplate(mockTemplate);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleEditTemplate = () => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Limited Editing",
        description: "This template is used in active or closed surveys. Only the name can be modified.",
        variant: "default",
      });
    }
    
    toast({
      title: "Edit Template",
      description: "This would open the template editor in a real application",
    });
  };

  const handleDeleteTemplate = () => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Cannot Delete",
        description: "This template is used in active or closed surveys and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      description: "This would show a delete confirmation in a real application",
    });
  };

  const handleAddQuestion = () => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Cannot Modify Questions",
        description: "This template is used in active or closed surveys. Questions cannot be added.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Add Question",
      description: "This would open the question selector or creation form",
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Cannot Reorder Questions",
        description: "This template is used in active or closed surveys. Questions cannot be reordered.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Move Question",
      description: `This would move the question ${direction} in a real application`,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (template?.isUsedInSurveys) {
      toast({
        title: "Cannot Remove Questions",
        description: "This template is used in active or closed surveys. Questions cannot be removed.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Remove Question",
      description: "This would remove the question after confirmation",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Loading template...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg text-red-500">Template not found</p>
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
                Used in Surveys
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {template.questions.length} questions
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
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-survey-closed hover:text-white hover:bg-survey-closed"
            onClick={handleDeleteTemplate}
            disabled={template.isUsedInSurveys}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Questions included in this template
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            disabled={template.isUsedInSurveys}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardHeader>
        
        <CardContent>
          {template.questions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
              <p className="text-gray-500">
                No questions added to this template yet.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-4"
                onClick={handleAddQuestion}
                disabled={template.isUsedInSurveys}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
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
    </div>
  );
};

export default TemplateDetails;
