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

export const INITIAL_QUESTION_BANK: Question[] = [
  {
    id: 'qb-1',
    type: 'seleccion_multiple',
    text: '¿Cuál es el valor de x en la ecuación lineal 3x - 7 = 14?',
    options: ['x = 7', 'x = 3', 'x = 21', 'x = 6'],
    correctAnswer: 'x = 7',
    points: 1.25
  },
  {
    id: 'qb-2',
    type: 'verdadero_falso',
    text: 'En una ecuación lineal, el exponente de la variable incógnita es siempre 1.',
    options: ['Verdadero', 'Falso'],
    correctAnswer: 'Verdadero',
    points: 1.0
  },
  {
    id: 'qb-3',
    type: 'abierta',
    text: 'Explica el método de reducción paso a paso para resolver un sistema de ecuaciones de 2x2.',
    correctAnswer: 'Procedimiento de igualar coeficientes de una variable y sumar/restar las ecuaciones.',
    points: 1.5,
    rubric: 'Rúbrica de Criterios:\n- 1.5 pts: Explica correctamente y da un ejemplo claro.\n- 1.0 pts: Explica el procedimiento pero omite detalles o no ejemplifica.\n- 0.5 pts: Noción vaga o confusa del método.\n- 0.0 pts: Incorrecto o respuesta vacía.'
  },
  {
    id: 'qb-4',
    type: 'matematica',
    text: 'Resuelve el siguiente sistema: x + y = 10 y 2x - y = 8. ¿Cuál es el valor de (x, y)?',
    options: ['(6, 4)', '(5, 5)', '(7, 3)', '(8, 2)'],
    correctAnswer: '(6, 4)',
    points: 1.25
  },
  {
    id: 'qb-5',
    type: 'seleccion_multiple',
    text: '¿Qué organelo celular es conocido como la central energética de la célula eucariota?',
    options: ['Mitocondria', 'Cloroplasto', 'Núcleo', 'Aparato de Golgi'],
    correctAnswer: 'Mitocondria',
    points: 1.0
  },
  {
    id: 'qb-6',
    type: 'seleccion_multiple',
    text: '¿Cuál de los siguientes es un cambio químico en la materia?',
    options: ['Evaporación del agua', 'Combustión de la madera', 'Fusión del hielo', 'Sublimación del yodo'],
    correctAnswer: 'Combustión de la madera',
    points: 1.0
  },
  {
    id: 'qb-7',
    type: 'abierta',
    text: 'Analiza el impacto del calentamiento global en los ecosistemas de páramo andino.',
    correctAnswer: 'Desplazamiento altitudinal de especies, pérdida de regulación hídrica, sequías.',
    points: 2.0,
    rubric: 'Rúbrica de Criterios:\n- 2.0 pts: Analiza efectos biológicos, hidrológicos y climáticos con rigurosidad.\n- 1.0 pts: Describe el impacto de forma básica sin profundizar en ecología.\n- 0.5 pts: Solo menciona calentamiento general.\n- 0.0 pts: Incoherente o vacío.'
  }
];

export const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    title: 'Quiz de Ecuaciones Lineales y Gráficas',
    subject: 'Matemáticas',
    course: '9-B',
    grade: '9',
    campus: 'Sede Principal',
    period: 'Periodo 3',
    type: 'Quiz rápido',
    difficulty: 'Medio',
    timeLimit: 15,
    weight: 15,
    status: 'Activo',
    createdAt: '25/05/2026',
    questions: [
      {
        id: 'q-1.1',
        type: 'seleccion_multiple',
        text: 'Resuelve 2x + 5 = 15. ¿Cuál es el valor de x?',
        options: ['x = 5', 'x = 10', 'x = 3', 'x = 7'],
        correctAnswer: 'x = 5',
        points: 1.5
      },
      {
        id: 'q-1.2',
        type: 'verdadero_falso',
        text: 'La pendiente de la recta y = -3x + 8 es positiva.',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 'Falso',
        points: 1.0
      },
      {
        id: 'q-1.3',
        type: 'abierta',
        text: 'Describe qué representa físicamente la pendiente en una gráfica de distancia vs tiempo.',
        correctAnswer: 'Representa la velocidad constante o tasa de cambio de la distancia por unidad de tiempo.',
        points: 1.5,
        rubric: 'Rúbrica de Criterios:\n- 1.5 pts: Vincula de forma directa y explícita la pendiente con la velocidad.\n- 1.0 pts: Menciona tasa de cambio pero sin explicar la relación física.\n- 0.5 pts: Noción incorrecta de aceleración o espacio.\n- 0.0 pts: Vacío o erróneo.'
      },
      {
        id: 'q-1.4',
        type: 'matematica',
        text: 'Determina la pendiente de la recta que pasa por los puntos (2, 3) y (5, 9).',
        options: ['m = 2', 'm = 3', 'm = -2', 'm = 1/2'],
        correctAnswer: 'm = 2',
        points: 1.0
      }
    ]
  },
  {
    id: 'eval-2',
    title: 'Parcial de Estructura Celular y Mitosis',
    subject: 'Ciencias Naturales y Educación Ambiental',
    course: '9-A',
    grade: '9',
    campus: 'Sede Principal',
    period: 'Periodo 3',
    type: 'Parcial',
    difficulty: 'Alto',
    timeLimit: 45,
    weight: 25,
    status: 'Completado',
    createdAt: '18/05/2026',
    questions: [
      {
        id: 'q-2.1',
        type: 'seleccion_multiple',
        text: '¿En qué fase de la mitosis los cromosomas se alinean en el plano ecuatorial?',
        options: ['Profase', 'Metafase', 'Anafase', 'Telofase'],
        correctAnswer: 'Metafase',
        points: 1.5
      },
      {
        id: 'q-2.2',
        type: 'verdadero_falso',
        text: 'Las células procariotas tienen mitocondrias en su citoplasma.',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 'Falso',
        points: 1.5
      }
    ]
  },
  {
    id: 'eval-3',
    title: 'Taller Diagnóstico: Comprensión Lectora',
    subject: 'Lengua Castellana',
    course: '5-A',
    grade: '5',
    campus: 'Sede Norte',
    period: 'Periodo 3',
    type: 'Taller',
    difficulty: 'Bajo',
    timeLimit: 30,
    weight: 10,
    status: 'Borrador',
    createdAt: '28/05/2026',
    questions: []
  }
];

export const INITIAL_RESULTS: Record<string, StudentResult[]> = {
  'eval-1': [
    {
      studentId: 's-107',
      studentName: 'Sofía Ramírez',
      studentGpaBefore: 2.8,
      score: null,
      submissionType: null,
      cheatingAlert: false
    },
    {
      studentId: 's-108',
      studentName: 'Mateo López',
      studentGpaBefore: 3.4,
      score: 4.5,
      submissionType: 'En Línea',
      answers: {
        'q-1.1': 'x = 5',
        'q-1.2': 'Falso',
        'q-1.3': 'Representa la velocidad, es la distancia recorrida sobre el tiempo transcurrido.',
        'q-1.4': 'm = 2'
      },
      gradedAt: '26/05/2026 10:14:00',
      rubricScores: {
        'q-1.3': 1.5
      }
    },
    {
      studentId: 's-110',
      studentName: 'Andrés Gómez',
      studentGpaBefore: 3.2,
      score: null,
      submissionType: null,
      cheatingAlert: false
    }
  ],
  'eval-2': [
    {
      studentId: 's-102',
      studentName: 'Valentina Silva Martínez',
      studentGpaBefore: 2.8,
      score: 3.0,
      submissionType: 'Físico (Papel)',
      gradedAt: '19/05/2026 14:30:00'
    },
    {
      studentId: 's-101',
      studentName: 'Mateo González Rojas',
      studentGpaBefore: 4.5,
      score: 5.0,
      submissionType: 'En Línea',
      answers: {
        'q-2.1': 'Metafase',
        'q-2.2': 'Falso'
      },
      gradedAt: '19/05/2026 09:42:00'
    }
  ]
};
