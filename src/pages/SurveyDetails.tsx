
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download,
  Link as LinkIcon,
  QrCode,
  Users,
  BarChart,
  Edit,
  Trash,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Survey } from "@/lib/types";

// Define the COLORS array for rating visualization
const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71'];

// Mock survey data
const mockSurvey: Survey = {
  id: "1",
  name: "Project Kickoff Meeting Feedback",
  status: "Active",
  template: { 
    id: "1", 
    name: "Meeting Feedback", 
    questions: [], 
    createdAt: "2025-05-10", 
    updatedAt: "2025-05-10", 
    isUsedInSurveys: true 
  },
  questions: [
    { id: "q1", text: "How would you rate the clarity of communication during the meeting?", createdAt: "", updatedAt: "" },
    { id: "q2", text: "How effective was the meeting at addressing its stated objectives?", createdAt: "", updatedAt: "" },
    { id: "q3", text: "How would you rate the efficiency of time usage during the meeting?", createdAt: "", updatedAt: "" },
    { id: "q4", text: "How well was the meeting facilitated or moderated?", createdAt: "", updatedAt: "" },
  ],
  assignedEmployees: [
    { id: "1", name: "John Smith", email: "john@example.com" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com" }
  ],
  responses: 12,
  createdAt: "2025-05-10T10:00:00Z",
  updatedAt: "2025-05-10T10:00:00Z",
  shareLink: "https://survey.example.com/s/1"
};

// Mock report data
const mockReport = {
  averageRating: 3.4,
  totalResponses: 12,
  questionRatings: [
    {
      questionId: "q1",
      questionText: "How would you rate the clarity of communication during the meeting?",
      averageRating: 3.8,
      distribution: { 1: 0, 2: 1, 3: 4, 4: 7 }
    },
    {
      questionId: "q2",
      questionText: "How effective was the meeting at addressing its stated objectives?",
      averageRating: 3.2,
      distribution: { 1: 1, 2: 2, 3: 5, 4: 4 }
    },
    {
      questionId: "q3",
      questionText: "How would you rate the efficiency of time usage during the meeting?",
      averageRating: 3.0,
      distribution: { 1: 1, 2: 3, 3: 5, 4: 3 }
    },
    {
      questionId: "q4",
      questionText: "How well was the meeting facilitated or moderated?",
      averageRating: 3.5,
      distribution: { 1: 0, 2: 1, 3: 6, 4: 5 }
    }
  ],
  employeeRatings: [
    { employeeId: "1", employeeName: "John Smith", averageRating: 3.6 },
    { employeeId: "2", employeeName: "Sarah Johnson", averageRating: 3.2 }
  ]
};

const SurveyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setSurvey(mockSurvey);
      setReport(mockReport);
      setLoading(false);
    }, 1000);
  }, [id]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-survey-draft text-white";
      case "active":
        return "bg-survey-active text-white";
      case "closed":
        return "bg-survey-closed text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleCopyLink = () => {
    if (!survey) return;
    
    navigator.clipboard.writeText(survey.shareLink);
    setCopySuccess(true);
    toast({
      title: "Link copied!",
      description: "Survey link copied to clipboard.",
    });
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const handleDownloadQR = () => {
    toast({
      title: "QR Code",
      description: "QR Code download functionality would be implemented here",
    });
  };

  const handleEditSurvey = () => {
    if (survey?.status !== "Draft") {
      toast({
        title: "Cannot Edit",
        description: "Only surveys in Draft status can be fully edited.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Edit Survey",
      description: "This would open the survey editor in a real application",
    });
  };

  const handleDeleteSurvey = () => {
    if (survey?.status !== "Draft") {
      toast({
        title: "Cannot Delete",
        description: "Only surveys in Draft status can be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      description: "This would show a delete confirmation in a real application",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Loading survey...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg text-red-500">Survey not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{survey.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <Badge className={getStatusColor(survey.status)}>
              {survey.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Based on: {survey.template.name}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEditSurvey}
            disabled={survey.status !== "Draft"}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-survey-closed hover:text-white hover:bg-survey-closed"
            onClick={handleDeleteSurvey}
            disabled={survey.status !== "Draft"}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="flex-grow">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="results" disabled={survey.responses === 0}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Assigned Employees</h3>
                <div className="flex mt-2 space-x-2">
                  {survey.assignedEmployees.map(employee => (
                    <div key={employee.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs bg-primary-blue text-white">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{employee.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Questions</h3>
                <div className="mt-2 space-y-2">
                  {survey.questions.map((question, index) => (
                    <div key={question.id} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        {question.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Survey</CardTitle>
              <CardDescription>
                Distribute this survey to customers for feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Survey Link</h3>
                <div className="flex items-center">
                  <div className="flex-grow p-2 bg-gray-50 rounded-l-md truncate text-sm">
                    {survey.shareLink}
                  </div>
                  <Button 
                    className={copySuccess ? "rounded-l-none bg-green-600" : "rounded-l-none bg-primary-blue"}
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">QR Code</h3>
                <div className="flex justify-center p-6 bg-gray-50 rounded-md">
                  <div className="w-40 h-40 bg-white p-2 flex items-center justify-center">
                    <QrCode size={120} />
                  </div>
                </div>
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadQR}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {report && (
            <>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {report.averageRating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Out of 4.0 maximum</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {report.totalResponses}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-blue">
                      {/* This would be calculated in a real app */}
                      100%
                    </div>
                    <p className="text-sm text-gray-500 mt-1">All respondents completed survey</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Question Ratings</CardTitle>
                  <CardDescription>
                    Average ratings and distribution by question
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {report.questionRatings.map((q: any) => (
                    <div key={q.questionId} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium">{q.questionText}</h3>
                        <span className="text-lg font-bold text-primary-blue">
                          {q.averageRating.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map(rating => {
                          const count = q.distribution[rating];
                          const percentage = (count / report.totalResponses) * 100;
                          
                          return (
                            <div 
                              key={rating} 
                              className="h-8 flex-grow"
                              style={{ 
                                background: COLORS[rating - 1],
                                width: `${percentage}%`,
                                minWidth: count > 0 ? '1rem' : '0'
                              }}
                              title={`Rating ${rating}: ${count} responses (${percentage.toFixed(1)}%)`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Poor (1)</span>
                        <span>Excellent (4)</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Employee Ratings</CardTitle>
                  <CardDescription>
                    Average ratings for assigned employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.employeeRatings.map((er: any) => (
                      <div key={er.employeeId} className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-primary-blue text-white">
                            {er.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-medium">{er.employeeName}</span>
                            <span className="font-bold text-primary-blue">
                              {er.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-blue h-2 rounded-full"
                              style={{ width: `${(er.averageRating / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyDetails;
