
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import { Template } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Meeting Feedback",
    questions: [
      { id: "q1", text: "How would you rate the clarity of communication during the meeting?", createdAt: "", updatedAt: "" },
      { id: "q2", text: "How effective was the meeting at addressing its stated objectives?", createdAt: "", updatedAt: "" },
      { id: "q3", text: "How would you rate the efficiency of time usage during the meeting?", createdAt: "", updatedAt: "" },
    ],
    createdAt: "2025-04-15T14:30:00Z",
    updatedAt: "2025-04-15T14:30:00Z",
    isUsedInSurveys: true
  },
  {
    id: "2",
    name: "Team Meeting",
    questions: [
      { id: "q1", text: "How would you rate the clarity of communication during the meeting?", createdAt: "", updatedAt: "" },
      { id: "q4", text: "How well was the meeting facilitated or moderated?", createdAt: "", updatedAt: "" },
    ],
    createdAt: "2025-04-18T10:15:00Z",
    updatedAt: "2025-04-18T10:15:00Z",
    isUsedInSurveys: false
  },
];

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // This would be an API call in a real app
    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = () => {
    toast({
      title: "Create Template",
      description: "This would open the template creation form in a real application",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Survey Templates</h1>
        <Button 
          onClick={handleCreateTemplate}
          className="bg-primary-blue hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
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
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="mt-1">
              {searchQuery
                ? "Try changing your search criteria." 
                : "Create your first template to get started."}
            </p>
            <Button 
              onClick={handleCreateTemplate}
              variant="outline" 
              className="mt-4"
            >
              Create Template
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
                    {template.questions.length} questions
                  </p>
                  <p className="text-sm text-gray-500">
                    {template.isUsedInSurveys ? "Used in surveys" : "Not used in any survey"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
