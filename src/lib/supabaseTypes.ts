
/**
 * This file contains custom type definitions that work with the Supabase-generated types
 * but does not modify the read-only generated types file.
 */
import type { Database } from '@/integrations/supabase/types';

// Export convenient type aliases from the generated types
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type QuestionRow = Database['public']['Tables']['questions']['Row'];
export type TemplateRow = Database['public']['Tables']['templates']['Row'];
export type SurveyRow = Database['public']['Tables']['surveys']['Row'];
export type SurveyResponseRow = Database['public']['Tables']['survey_responses']['Row'];
export type ResponseAnswerRow = Database['public']['Tables']['response_answers']['Row'];

// Additional type definitions for the application can be added here
