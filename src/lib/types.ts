
export type SurveyStatus = "Draft" | "Active" | "Closed";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: "Admin" | "Moderator" | "User";
  department?: string;
  active?: boolean;
  position?: string;
  joinDate?: string;
  profileImage?: string;
  assignedSurveys?: string[];
  completedSurveys?: string[];
}

export interface Question {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isUsedInSurveys: boolean;
}

export interface Survey {
  id: string;
  name: string;
  status: SurveyStatus;
  template: Template;
  questions: Question[];
  assignedEmployees: User[];
  responses: number;
  createdAt: string;
  updatedAt: string;
  shareLink: string;
  dueDate?: string;
  description?: string;
  isAnonymous?: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId?: string;
  answers: {
    questionId: string;
    rating: number;
    comment?: string;
  }[];
  submittedAt: string;
}

export interface SurveyReport {
  averageRating: number;
  totalResponses: number;
  questionRatings: {
    questionId: string;
    questionText: string;
    averageRating: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
    };
  }[];
  employeeRatings: {
    employeeId: string;
    employeeName: string;
    averageRating: number;
  }[];
  progressOverTime?: {
    date: string;
    averageRating: number;
  }[];
  departmentComparison?: {
    department: string;
    averageRating: number;
    responseRate: number;
  }[];
}

export const translateSurveyStatus = (status: SurveyStatus): string => {
  switch (status) {
    case "Draft": return "Entwurf";
    case "Active": return "Aktiv";
    case "Closed": return "Geschlossen";
    default: return status;
  }
};

export const getStatusColor = (status: SurveyStatus): string => {
  switch (status) {
    case "Draft": return "bg-amber-100 text-amber-800";
    case "Active": return "bg-green-100 text-green-800";
    case "Closed": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
