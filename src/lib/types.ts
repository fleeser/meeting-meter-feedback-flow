export type SurveyStatus = "Draft" | "Active" | "Closed";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: "Admin" | "Moderator" | "User";
  department?: string;
  active?: boolean;
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
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: {
    questionId: string;
    rating: number;
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
}
