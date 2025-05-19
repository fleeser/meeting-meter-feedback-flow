
import { Calendar, Users } from "lucide-react";
import { Survey } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SurveyCardProps {
  survey: Survey;
}

const SurveyCard = ({ survey }: SurveyCardProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

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

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-300 cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg line-clamp-2">{survey.name}</h3>
          <Badge className={getStatusColor(survey.status)}>
            {survey.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm text-gray-600">
          <p className="mb-1">Template: {survey.template.name}</p>
          
          <div className="flex items-center mt-3 text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Created {formatDate(survey.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-gray-500" />
          <div className="flex -space-x-2">
            {survey.assignedEmployees.slice(0, 3).map(employee => (
              <Avatar key={employee.id} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-xs bg-primary-blue text-white">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {survey.assignedEmployees.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                +{survey.assignedEmployees.length - 3}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">{survey.responses}</span> responses
        </div>
      </CardFooter>
    </Card>
  );
};

export default SurveyCard;
