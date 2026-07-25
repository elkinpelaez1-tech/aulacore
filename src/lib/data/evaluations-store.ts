export type EvaluationType = 'Quiz rápido' | 'Parcial' | 'Taller' | 'Diagnóstico' | 'Evaluación final' | 'Recuperación';
export type QuestionType = 'seleccion_multiple' | 'verdadero_falso' | 'relacionar' | 'completar' | 'abierta' | 'matematica';
export type DifficultyLevel = 'Bajo' | 'Medio' | 'Alto';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  rubric?: string; // Support for evaluation rubrics in open-ended questions
}

export interface Evaluation {
  id: string;
  title: string;
  subject: string;
  course: string;
  grade: string;
  campus: string;
  period: string;
  type: EvaluationType;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes
  weight: number; // percentage in the course notes
  questions: Question[];
  status: 'Borrador' | 'Activo' | 'Completado';
  createdAt: string;
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  studentGpaBefore: number;
  score: number | null; // null if not graded/submitted yet
  submissionType: 'Físico (Papel)' | 'En Línea' | null;
  answers?: Record<string, string>; // questionId -> studentAnswer
  cheatingAlert?: boolean; // Cheating / focus loss detected
  gradedAt?: string;
  rubricScores?: Record<string, number>; // Rubric sub-scores for open questions
}

export interface EvaluationResults {
  evaluationId: string;
  results: StudentResult[];
}

export const INITIAL_QUESTION_BANK: Question[] = [];

export const INITIAL_EVALUATIONS: Evaluation[] = [];

export const INITIAL_RESULTS: Record<string, StudentResult[]> = {};
