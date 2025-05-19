
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
import { useToast } from "@/components/ui/use-toast";

// Mock questions for demo
const mockQuestions = [
  {
    id: "q1",
    text: "How would you rate the clarity of communication during the meeting?",
  },
  {
    id: "q2",
    text: "How effective was the meeting at addressing its stated objectives?",
  },
  {
    id: "q3",
    text: "How would you rate the efficiency of time usage during the meeting?",
  },
  {
    id: "q4",
    text: "How well was the meeting facilitated or moderated?",
  },
];

const SurveyResponse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [surveyName, setSurveyName] = useState("");
  const [questions, setQuestions] = useState<{ id: string; text: string }[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call to fetch the survey
    setTimeout(() => {
      setSurveyName("Project Kickoff Meeting Feedback");
      setQuestions(mockQuestions);
      
      // Check if this survey was already submitted by this user
      const hasSubmitted = localStorage.getItem(`survey_submitted_${id}`);
      if (hasSubmitted) {
        setSubmitted(true);
      }
      
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleRatingSelect = (questionId: string, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: rating,
    }));
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Incomplete Survey",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would be an API call to submit the survey
    setLoading(true);
    
    setTimeout(() => {
      // Mark as submitted in localStorage to prevent multiple submissions
      localStorage.setItem(`survey_submitted_${id}`, "true");
      
      setSubmitted(true);
      setLoading(false);
      
      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback!",
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl">Loading survey...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl text-primary-blue">Thank You!</CardTitle>
            <CardDescription>
              Your feedback has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your responses will help us improve future meetings.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline"
              onClick={() => window.close()}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-primary-blue">{surveyName}</CardTitle>
            <CardDescription className="mt-2">
              Your feedback is anonymous and will help us improve our meetings.
              <br />
              Please rate each aspect from 1 (poor) to 4 (excellent).
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-medium">{question.text}</h3>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4].map((rating) => (
                      <Button
                        key={rating}
                        variant={answers[question.id] === rating ? "default" : "outline"}
                        className={
                          answers[question.id] === rating 
                          ? "bg-primary-blue flex-1" 
                          : "flex-1"
                        }
                        onClick={() => handleRatingSelect(question.id, rating)}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Poor</span>
                    <span className="ml-auto">Excellent</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              className="bg-primary-blue hover:bg-primary-dark"
            >
              Submit Feedback
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SurveyResponse;
