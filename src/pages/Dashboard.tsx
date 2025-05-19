
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
import { PlusCircle, Search } from "lucide-react";
import { Survey } from "@/lib/types";
import SurveyCard from "@/components/surveys/SurveyCard";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockSurveys: Survey[] = [
  {
    id: "1",
    name: "Project Kickoff Meeting Feedback",
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
    name: "Weekly Team Sync Evaluation",
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
    name: "Client Presentation Feedback",
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

const Dashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    // This would be an API call in a real app
    setTimeout(() => {
      setSurveys(mockSurveys);
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
    toast({
      title: "Create Survey",
      description: "This would open the survey creation form in a real application",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Loading surveys...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Surveys</h1>
        <Button 
          onClick={handleCreateSurvey}
          className="bg-primary-blue hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search surveys..."
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
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSurveys.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No surveys found</h3>
            <p className="mt-1">
              {searchQuery || statusFilter !== "all" 
                ? "Try changing your search or filter criteria." 
                : "Create your first survey to get started."}
            </p>
            <Button 
              onClick={handleCreateSurvey}
              variant="outline" 
              className="mt-4"
            >
              Create Survey
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredSurveys.map(survey => (
            <Link key={survey.id} to={`/app/surveys/${survey.id}`}>
              <SurveyCard survey={survey} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
