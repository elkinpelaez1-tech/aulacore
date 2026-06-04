'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BrainCircuit, CheckCircle, GraduationCap, Search, PenTool, Plus, Trash2, Settings, 
  Activity, FileText, Sparkles, Clock, ArrowLeft, AlertTriangle, Download, Eye, 
  ListFilter, CheckCircle2, X, Printer, ScanLine, Camera, Check, ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { MOCK_COURSES, CourseMockData } from '@/lib/data/mock-courses';
import { 
  INITIAL_EVALUATIONS, INITIAL_RESULTS, INITIAL_QUESTION_BANK, 
  Evaluation, Question, StudentResult, EvaluationType, QuestionType, DifficultyLevel 
} from '@/lib/data/evaluations-store';
import { downloadEvaluationPDF } from '@/lib/utils/PdfGenerator';
import { PrintPreviewModal } from '@/components/dashboard/PrintPreviewModal';

type TabType = 'dashboard' | 'builder' | 'bank' | 'grading' | 'student' | 'analytics';

export default function EvaluacionesIAPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [evaluations, setEvaluations] = useState<Evaluation[]>(INITIAL_EVALUATIONS);
  const [results, setResults] = useState<Record<string, StudentResult[]>>(INITIAL_RESULTS);
  const [questionBank, setQuestionBank] = useState<Question[]>(INITIAL_QUESTION_BANK);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('eval-1');
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'warning' } | null>(null);

  // Builder Draft States
  const [draftTitle, setDraftTitle] = useState('Nuevo Quiz de Álgebra y Ecuaciones');
  const [draftSubject, setDraftSubject] = useState('Matemáticas');
  const [draftCourse, setDraftCourse] = useState('9-B');
  const [draftCampus, setDraftCampus] = useState('Sede Principal');
  const [draftPeriod, setDraftPeriod] = useState('Periodo 3');
  const [draftType, setDraftType] = useState<EvaluationType>('Quiz rápido');
  const [draftDifficulty, setDraftDifficulty] = useState<DifficultyLevel>('Medio');
  const [draftTimeLimit, setDraftTimeLimit] = useState(15);
  const [draftWeight, setDraftWeight] = useState(15);
  const [draftQuestions, setDraftQuestions] = useState<Question[]>([]);

  // IA Generator & Quiz Express states
  const [aiPrompt, setAiPrompt] = useState('ecuaciones cuadráticas de segundo grado');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genProgressLabel, setGenProgressLabel] = useState('');

  // Student Simulated Mode States
  const [studentTimeLeft, setStudentTimeLeft] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [cheatingAlertActive, setCheatingAlertActive] = useState(false);
  const [cheatingAttempts, setCheatingAttempts] = useState(0);
  const [examFinished, setExamFinished] = useState(false);

  // Question Bank search / filters
  const [bankSearch, setBankSearch] = useState('');
  const [bankSubject, setBankSubject] = useState('Todas');
  const [bankDifficulty, setBankDifficulty] = useState('Todos');

  // OMR Scanner Simulator States
  const [omrScanning, setOmrScanning] = useState(false);
  const [omrCameraActive, setOmrCameraActive] = useState(false);
  const [omrProcessedCount, setOmrProcessedCount] = useState(0);
  const [omrProgress, setOmrProgress] = useState(0);

  // Selected student for open rubrics grading
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);

  // Sincronización cascading live state
  const [globalGpa9B, setGlobalGpa9B] = useState(2.8);
  const [alertCount9B, setAlertCount9B] = useState(2);
  const [dropoutRiskSofia, setDropoutRiskSofia] = useState('Alto');

  // Print Assessment Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewEvaluation, setPreviewEvaluation] = useState<Evaluation | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Student Secure Mode: detect window focus loss
  useEffect(() => {
    if (activeTab !== 'student' || examFinished) return;

    const handleBlur = () => {
      setCheatingAttempts(prev => {
        const next = prev + 1;
        setCheatingAlertActive(true);
        showToast(
          '⚠️ ALERTA DE CONDUCTA AI', 
          'Se detectó pérdida de foco en el examen (intento de cambio de pestaña o ventana).', 
          'warning'
        );
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [activeTab, examFinished]);

  // Timer countdown inside student mode
  useEffect(() => {
    if (activeTab !== 'student' || studentTimeLeft <= 0 || examFinished) return;

    const timer = setInterval(() => {
      setStudentTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishStudentQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, studentTimeLeft, examFinished]);

  const selectedEvaluation = evaluations.find(e => e.id === selectedEvaluationId) || evaluations[0];
  const selectedResults = results[selectedEvaluation.id] || [];

  // Start student quiz simulation
  const handleStartStudentQuiz = (evaluation: Evaluation) => {
    setSelectedEvaluationId(evaluation.id);
    setStudentTimeLeft(evaluation.timeLimit * 60);
    setStudentAnswers({});
    setCheatingAttempts(0);
    setCheatingAlertActive(false);
    setExamFinished(false);
    setActiveTab('student');
    showToast(
      'Entorno Seguro Activado',
      `Examen "${evaluation.title}" iniciado. La IA supervisa cambios de pantalla en tiempo real.`
    );
  };

  // Submit student simulated quiz
  const handleFinishStudentQuiz = (timeOut = false) => {
    setExamFinished(true);
    
    // Auto score multiple choice & true_false
    let scoreTotal = 0;
    let questionsCount = selectedEvaluation.questions.length;
    let rubricRequired = false;

    selectedEvaluation.questions.forEach(q => {
      const studentAns = studentAnswers[q.id];
      if (q.type === 'seleccion_multiple' || q.type === 'verdadero_falso' || q.type === 'matematica') {
        if (studentAns === q.correctAnswer) {
          scoreTotal += q.points;
        }
      } else if (q.type === 'abierta') {
        rubricRequired = true;
      }
    });

    // Score out of 5.0 scaled
    let baseScore = questionsCount > 0 ? (scoreTotal / selectedEvaluation.questions.reduce((a, b) => a + b.points, 0)) * 5 : 4.0;
    if (rubricRequired) {
      // open question needs teacher rubrics, set a temporary pending score
      baseScore = Math.min(5.0, baseScore + 0.5);
    }
    
    const finalScore = parseFloat(Math.max(1.0, Math.min(5.0, baseScore)).toFixed(1));

    // Update student result in local state
    const newResult: StudentResult = {
      studentId: 's-107', // Sofía Ramírez as the default student simulated
      studentName: 'Sofía Ramírez',
      studentGpaBefore: 2.8,
      score: finalScore,
      submissionType: 'En Línea',
      answers: studentAnswers,
      cheatingAlert: cheatingAttempts > 0,
      gradedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setResults(prev => {
      const currentList = prev[selectedEvaluation.id] || [];
      const filtered = currentList.filter(r => r.studentId !== 's-107');
      return {
        ...prev,
        [selectedEvaluation.id]: [...filtered, newResult]
      };
    });

    showToast(
      timeOut ? 'Tiempo Agotado' : 'Examen Enviado',
      `Respuestas enviadas con éxito. Nota preliminar autocalificada: ${finalScore}/5.0${cheatingAttempts > 0 ? ' (Alerta de copia registrada)' : ''}`
    );
  };

  // Run AI generator for questions (Step 2/3 / Quiz Express)
  const handleGenerateAIQuestions = (questionsCount = 5) => {
    setIsGenerating(true);
    setGenProgress(0);
    
    const steps = [
      { p: 20, l: 'AulaCore AI analizando plan curricular y grado...' },
      { p: 45, l: 'Estructurando taxonomía de Bloom y competencias...' },
      { p: 70, l: 'Diseñando distractores y respuestas de opción múltiple...' },
      { p: 90, l: 'Generando criterios de rúbricas automáticas para preguntas abiertas...' },
      { p: 100, l: 'Preguntas indexadas correctamente.' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setGenProgress(steps[currentStep].p);
        setGenProgressLabel(steps[currentStep].l);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);

        // Generate synthetic questions based on draftSubject and prompt
        const generated: Question[] = [];
        const subject = draftSubject;

        for (let i = 0; i < questionsCount; i++) {
          const pt = i === 0 ? 'seleccion_multiple' : i === 1 ? 'verdadero_falso' : i === 2 ? 'abierta' : i % 2 === 0 ? 'matematica' : 'seleccion_multiple';
          
          let text = '';
          let options: string[] | undefined;
          let correctAnswer = '';
          let rubric: string | undefined;

          if (subject === 'Matemáticas') {
            if (pt === 'seleccion_multiple') {
              text = `¿Cuál es el valor de la variable incógnita x en la ecuación cuadrática x² - 5x + 6 = 0?`;
              options = ['x = 2, x = 3', 'x = -2, x = -3', 'x = 1, x = 6', 'x = 5, x = 1'];
              correctAnswer = 'x = 2, x = 3';
            } else if (pt === 'verdadero_falso') {
              text = `La fórmula general de la ecuación de segundo grado permite hallar siempre soluciones reales, sin importar el valor del discriminante.`;
              options = ['Verdadero', 'Falso'];
              correctAnswer = 'Falso';
            } else if (pt === 'abierta') {
              text = `Resuelva paso a paso y explique analíticamente el método de factorización por trinomio de la forma x² + bx + c.`;
              correctAnswer = 'Procedimiento de descomposición factorial en dos factores lineales.';
              rubric = 'Rúbrica de Criterios AI:\n- 1.5 pts: Desarrolla el procedimiento algebraico y justifica los signos.\n- 1.0 pts: Factoriza bien pero no explica el porqué de los términos.\n- 0.0 pts: Error algebraico crítico o vacío.';
            } else {
              text = `Si el discriminante (b² - 4ac) de una ecuación cuadrática es igual a cero, ¿cuántas soluciones reales distintas tiene la ecuación?`;
              options = ['Una única solución real', 'Dos soluciones reales distintas', 'Ninguna solución real', 'Infinitas soluciones'];
              correctAnswer = 'Una única solución real';
            }
          } else if (subject === 'Lengua Castellana') {
            if (pt === 'seleccion_multiple') {
              text = `¿Cuál de las siguientes oraciones contiene un sujeto tácito o elíptico en su estructura sintáctica?`;
              options = ['Nosotros fuimos a la biblioteca de Europa.', 'Comieron deliciosas manzanas en el jardín.', 'Sofía lee un libro de gramática.', 'El Quijote es una obra cumbre.'];
              correctAnswer = 'Comieron deliciosas manzanas en el jardín.';
            } else if (pt === 'verdadero_falso') {
              text = `En el análisis morfosintáctico, la palabra "lenguaje" actúa siempre como un adverbio de modo y nunca como un sustantivo común.`;
              options = ['Verdadero', 'Falso'];
              correctAnswer = 'Falso';
            } else if (pt === 'abierta') {
              text = `Analice la influencia histórica de las lenguas romances de Europa (como el latín, el francés y el italiano) en el léxico del castellano moderno basándose en el tema: "${aiPrompt}".`;
              correctAnswer = 'Aportes léxicos, préstamos morfológicos e influencia histórica romance en el español.';
              rubric = 'Rúbrica de Criterios AI:\n- 1.5 pts: Detalla raíces romances medievales y préstamos modernos ilustrando con ejemplos.\n- 1.0 pts: Menciona el latín de forma vaga sin profundizar en terminología lingüística.\n- 0.0 pts: Respuesta incoherente o vacía.';
            } else {
              text = `Identifique la figura literaria principal presente en el siguiente fragmento lírico: "Tus cabellos de oro y tus ojos de lucero".`;
              options = ['Metáfora', 'Hipérbole', 'Símil o Comparación', 'Personificación'];
              correctAnswer = 'Metáfora';
            }
          } else if (subject === 'Ciencias Naturales y Educación Ambiental') {
            if (pt === 'seleccion_multiple') {
              text = `Un móvil se desplaza a una velocidad constante de 72 km/h. ¿Cuál es su velocidad equivalente medida en metros por segundo (m/s)?`;
              options = ['20 m/s', '15 m/s', '30 m/s', '10 m/s'];
              correctAnswer = '20 m/s';
            } else if (pt === 'verdadero_falso') {
              text = `Según la primera ley de Newton (Ley de Inercia), si la fuerza neta que actúa sobre un cuerpo es cero, este debe estar obligatoriamente inmóvil.`;
              options = ['Verdadero', 'Falso'];
              correctAnswer = 'Falso';
            } else if (pt === 'abierta') {
              text = `Explique detalladamente la diferencia conceptual entre masa y peso, y analice cómo cambian estas magnitudes físicas al llevar un cuerpo a la Luna basándose en: "${aiPrompt}".`;
              correctAnswer = 'La masa es la cantidad de materia (constante); el peso varía proporcionalmente a la gravedad local.';
              rubric = 'Rúbrica de Criterios AI:\n- 1.5 pts: Diferencia claramente masa y peso matemáticamente (P = mg) y analiza el factor de gravedad lunar.\n- 1.0 pts: Define masa y peso pero falla al explicar el cambio gravitacional local.\n- 0.0 pts: Vacío o erróneo.';
            } else {
              text = `¿Qué magnitud física escalar mide la rapidez con la que se realiza o consume un trabajo mecánico en un circuito?`;
              options = ['Potencia', 'Energía Cinética', 'Fuerza', 'Presión'];
              correctAnswer = 'Potencia';
            }
          } else {
            // Biología / Otro
            if (pt === 'seleccion_multiple') {
              text = `¿Qué orgánulo celular eucariota contiene su propio ADN y realiza la fosforilación oxidativa para producir ATP?`;
              options = ['Mitocondria', 'Cloroplasto', 'Aparato de Golgi', 'Lisosoma'];
              correctAnswer = 'Mitocondria';
            } else if (pt === 'verdadero_falso') {
              text = `La fotosíntesis es un proceso metabólico anabólico y endergónico que transforma energía lumínica en energía química estable.`;
              options = ['Verdadero', 'Falso'];
              correctAnswer = 'Verdadero';
            } else if (pt === 'abierta') {
              text = `Describa las principales diferencias metabólicas y funcionales entre la respiración aerobia y anaerobia enfocándose en: "${aiPrompt}".`;
              correctAnswer = 'Presencia de oxígeno, rendimiento de ATP, productos terminales.';
              rubric = 'Rúbrica de Criterios AI:\n- 1.5 pts: Detalla aceptores finales, balance de ATP exacto y subproductos.\n- 1.0 pts: Explica las diferencias generales de oxígeno sin detalles metabólicos.\n- 0.0 pts: Confusión teórica grave o vacío.';
            } else {
              text = `Durante la fase oscura de la fotosíntesis (Ciclo de Calvin), ¿qué enzima cataliza la fijación inicial del CO2 atmosférico?`;
              options = ['Rubisco', 'Fosfofructocinasa', 'ATP Sintasa', 'Catalasa'];
              correctAnswer = 'Rubisco';
            }
          }

          generated.push({
            id: `q-ai-${Date.now()}-${i}`,
            type: pt as QuestionType,
            text,
            options,
            correctAnswer,
            points: parseFloat((5 / questionsCount).toFixed(2)),
            rubric
          });
        }

        setDraftQuestions(generated);
        showToast(
          'Quiz Express IA Generado',
          `Se han creado ${questionsCount} preguntas profesionales sobre "${aiPrompt}" con métricas de dificultad, tiempo y rúbricas.`
        );
      }
    }, 400);
  };

  // Add question from bank to the current exam draft
  const handleAddFromBank = (question: Question) => {
    const isAlreadyAdded = draftQuestions.some(q => q.id === question.id);
    if (isAlreadyAdded) {
      showToast('Ya agregada', 'Esta pregunta ya se encuentra en tu borrador de examen.', 'warning');
      return;
    }

    setDraftQuestions(prev => [...prev, { ...question, id: `q-bank-${Date.now()}` }]);
    showToast('Pregunta Añadida', `"${question.text.slice(0, 30)}..." fue incorporada a tu borrador de evaluación.`);
  };

  // Save the evaluation draft
  const handleSaveEvaluation = () => {
    if (draftQuestions.length === 0) {
      showToast('Cuestionario Vacío', 'Debes añadir al menos una pregunta antes de guardar la evaluación.', 'warning');
      return;
    }

    const newEval: Evaluation = {
      id: `eval-${Date.now()}`,
      title: draftTitle,
      subject: draftSubject,
      course: draftCourse,
      grade: draftCourse.split('-')[0] || '9',
      campus: draftCampus,
      period: draftPeriod,
      type: draftType,
      difficulty: draftDifficulty,
      timeLimit: draftTimeLimit,
      weight: draftWeight,
      questions: draftQuestions,
      status: 'Activo',
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    // Initialize mock student results for this quiz
    const courseStudents = MOCK_STUDENTS.filter(s => s.group === draftCourse);
    const initialResultsList: StudentResult[] = courseStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentGpaBefore: student.gpa,
      score: null,
      submissionType: null
    }));

    setEvaluations(prev => [newEval, ...prev]);
    setResults(prev => ({
      ...prev,
      [newEval.id]: initialResultsList
    }));

    setSelectedEvaluationId(newEval.id);
    setActiveTab('dashboard');
    showToast(
      'Evaluación Creada con Éxito',
      `"${draftTitle}" ya está activa para el curso ${draftCourse}. Banco OMR calibrado.`
    );
  };

  // Download printable evaluation template from current draft questions
  const handleDownloadDraftPDF = () => {
    if (draftQuestions.length === 0) {
      showToast('Cuestionario Vacío', 'Debes añadir al menos una pregunta antes de descargar la evaluación.', 'warning');
      return;
    }

    const tempEval: Evaluation = {
      id: `draft-${Date.now()}`,
      title: draftTitle || 'Evaluación en Borrador',
      subject: draftSubject,
      course: draftCourse,
      grade: draftCourse.split('-')[0] || '9',
      campus: draftCampus,
      period: draftPeriod,
      type: draftType,
      difficulty: draftDifficulty,
      timeLimit: draftTimeLimit,
      weight: draftWeight,
      questions: draftQuestions,
      status: 'Borrador',
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    setPreviewEvaluation(tempEval);
    setIsPreviewOpen(true);
  };

  // Sincronización en cascada: updates GPA, active alerts, heatmap averages
  const handleSyncGrades = () => {
    // Get Sofía's grade for the selected exam
    const sofiaRes = selectedResults.find(r => r.studentId === 's-107');
    const newGrade = sofiaRes?.score || 4.2; // default high grade for test

    // Execute the cascade calculations
    setGlobalGpa9B(3.4); // Increases 9-B average from 2.8 to 3.4
    setAlertCount9B(1); // Clears one of Sofía's alerts (subjects failed Period 4 is resolved!)
    setDropoutRiskSofia('Medio'); // Risk drops from Alto to Medio!

    // Temporarily update MOCK_STUDENTS for local state consistency
    const sofia = MOCK_STUDENTS.find(s => s.id === 's-107');
    if (sofia) {
      sofia.gpa = 3.4;
      sofia.alerts = [{ id: 'a5', type: 'asistencia', message: 'Ausentismo recurrente (>20%)' }]; // Academico alert cleared!
      sofia.academicRisk = 'Medio';
    }

    // Recalculate 9-B Course mock details in MOCK_COURSES
    const course9B = MOCK_COURSES.find(c => c.name === '9-B') || MOCK_COURSES[1];
    if (course9B) {
      course9B.metrics.averageGpa = 3.4;
      course9B.metrics.activeAlerts = 2; // Alerts down
      course9B.metrics.studentsAtRisk = 1; // Down from 2
      course9B.academicRisk = 'Medio';
    }

    showToast(
      'Sincronización Cascading Completada',
      `El GPA de Sofía Ramírez subió a 3.4 (+0.6). Alerta "3 materias perdidas" RESUELTA. Promedio del curso 9-B subió a 3.4. IA Predictiva recalculó el riesgo a MEDIO.`
    );
  };

  // Simulate OMR Scanning
  const handleStartOMRScan = () => {
    setOmrScanning(true);
    setOmrCameraActive(true);
    setOmrProgress(0);

    const omrSteps = [
      { p: 30, l: 'Cargando lector óptico y calibrando cámara web...' },
      { p: 60, l: 'Buscando marcas de sincronía de esquina [█] y código QR...' },
      { p: 90, l: 'Lector óptico OMR procesando matriz de burbujas para Sofía Ramírez...' },
      { p: 100, l: 'Sincronía calibrada. Procesamiento exitoso.' }
    ];

    let current = 0;
    const timer = setInterval(() => {
      if (current < omrSteps.length) {
        setOmrProgress(omrSteps[current].p);
        current++;
      } else {
        clearInterval(timer);
        setOmrScanning(false);
        setOmrCameraActive(false);
        setOmrProcessedCount(prev => prev + 1);

        // Grade Sofía's physical exam using simulated optical reading
        const updatedResults = selectedResults.map(r => {
          if (r.studentId === 's-107') {
            return {
              ...r,
              score: 4.8, // Super high grade from paper exam
              submissionType: 'Físico (Papel)' as const,
              gradedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            };
          }
          return r;
        });

        setResults(prev => ({
          ...prev,
          [selectedEvaluation.id]: updatedResults
        }));

        showToast(
          'Lector Óptico OMR AI Exitoso',
          'El examen en papel de Sofía Ramírez fue calificado ópticamente: Nota 4.8. Respuestas cargadas.'
        );
      }
    }, 600);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold uppercase tracking-widest text-xs mb-1">
              <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" /> AulaCore Learning Intelligence
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Evaluaciones IA</h1>
            <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
              Constructor de Evaluaciones • Banco OMR • IA Generativa • Analítica por Habilidades
            </p>
          </div>
          
          {/* TAB SELECTOR */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'dashboard', label: 'Centro Evaluativo', icon: Activity },
              { id: 'builder', label: 'Constructor IA', icon: PenTool },
              { id: 'bank', label: 'Banco de Preguntas', icon: HelpCircle },
              { id: 'grading', label: 'Calificaciones', icon: CheckCircle2 },
              { id: 'student', label: 'Vista Examen', icon: Eye },
              { id: 'analytics', label: 'Analítica IA', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95",
                    isActive 
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------- VISTA 1: DASHBOARD / CENTRO EVALUATIVO ------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Evaluaciones Activas</span>
                  <span className="text-3xl font-black text-slate-800 mt-1 block">
                    {evaluations.filter(e => e.status === 'Activo').length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Exámenes en Papel</span>
                  <span className="text-3xl font-black text-slate-800 mt-1 block">3 Pendientes</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Promedio GPA Evaluativo</span>
                  <span className="text-3xl font-black text-emerald-600 mt-1 block">4.2 / 5.0</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Alertas Académicas IA</span>
                  <span className="text-3xl font-black text-rose-500 mt-1 block">{alertCount9B} Activas</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* MAIN LISTINGS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Evaluaciones en Curso */}
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evaluaciones del Periodo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Control de exámenes, quizes y guías activas</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setDraftQuestions([]);
                      setActiveTab('builder');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 rounded-xl shadow active:scale-95"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Diseñar Evaluación
                  </Button>
                </div>

                <div className="space-y-3">
                  {evaluations.map(e => (
                    <div 
                      key={e.id}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 hover:bg-slate-100/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                            e.difficulty === 'Alto' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                            e.difficulty === 'Medio' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          )}>
                            Dif: {e.difficulty}
                          </span>
                          <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md">
                            {e.type}
                          </span>
                          <span className="text-[8px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                            Pesa {e.weight}%
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-800">{e.title}</h4>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Curso: {e.course} • Asignatura: {e.subject} • Sede: {e.campus} • {e.questions.length} preguntas
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {/* Imprimir PDF */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreviewEvaluation(e);
                            setIsPreviewOpen(true);
                          }}
                          className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold h-8 rounded-lg flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" /> Imprimir
                        </Button>
                        
                        {/* Tomar en línea */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartStudentQuiz(e)}
                          className="bg-white border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold h-8 rounded-lg flex items-center gap-1 group"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-650" /> Test Seguro
                        </Button>

                        {/* Ingresar Notas */}
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedEvaluationId(e.id);
                            setActiveTab('grading');
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-8 rounded-lg"
                        >
                          Resultados
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* IA Assistant Box */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-550/10 rounded-full blur-3xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">Asistente Evaluativo IA</h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    AulaCore IA detecta que la evaluación <span className="text-white">"Quiz de Ecuaciones Lineales"</span> presenta un alto índice de respuestas incorrectas en la pregunta de desarrollo abierta para el curso 9-B.
                  </p>

                  <div className="mt-5 space-y-3.5">
                    <div className="flex gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <div className="w-1.5 h-auto bg-amber-500 rounded-full shrink-0"></div>
                      <div>
                        <h5 className="text-[11px] font-black text-slate-200">Recomendación de Refuerzo</h5>
                        <p className="text-[9px] text-slate-400 mt-1 font-semibold leading-relaxed">
                          La IA sugiere generar un Taller de Recuperación de 5 preguntas enfocado en despeje algebraico básico.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <div className="w-1.5 h-auto bg-indigo-500 rounded-full shrink-0"></div>
                      <div>
                        <h5 className="text-[11px] font-black text-slate-200">Carga OMR Calibrada</h5>
                        <p className="text-[9px] text-slate-400 mt-1 font-semibold leading-relaxed">
                          Hoja de lectura óptica lista para procesar exámenes físicos con la cámara de tu laptop.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setDraftTitle('Taller de Recuperación y Nivelación de Ecuaciones');
                    setDraftSubject('Matemáticas');
                    setDraftType('Recuperación');
                    setDraftCourse('9-B');
                    setDraftQuestions([]);
                    setAiPrompt('ejercicios sencillos de despejes de x');
                    setActiveTab('builder');
                  }}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-indigo-650/20 active:scale-95"
                >
                  Diseñar Plan de Recuperación AI
                </Button>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------- VISTA 2: CONSTRUCTOR DE EVALUACIONES IA ------------------------- */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            
            {/* Generating Overlay */}
            {isGenerating && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99999] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 max-w-sm text-center space-y-4 shadow-2xl relative">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-900/30 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin" />
                    <div className="absolute inset-3.5 rounded-full bg-slate-900 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-indigo-400 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Generador AI Evaluaciones</h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed px-4">{genProgressLabel}</p>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${genProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Parámetros & Formulario */}
              <div className="xl:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-650" /> Configuración de Evaluación
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Título del Examen</label>
                    <Input 
                      value={draftTitle} 
                      onChange={e => setDraftTitle(e.target.value)} 
                      placeholder="Ej. Quiz Ecuaciones" 
                      className="text-xs font-semibold placeholder:text-slate-400 border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Asignatura</label>
                      <select 
                        value={draftSubject} 
                        onChange={e => setDraftSubject(e.target.value)}
                        className="w-full text-xs font-bold text-slate-705 bg-slate-55 border border-slate-200 rounded-xl p-2.5 cursor-pointer outline-none focus:border-indigo-400"
                      >
                        <option value="Matemáticas">Matemáticas</option>
                        <option value="Tecnología e Informática">Tecnología e Informática</option>
                        <option value="Lengua Castellana">Lengua Castellana</option>
                        <option value="Ciencias Naturales y Educación Ambiental">Ciencias Naturales y Educación Ambiental</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Curso Asignado</label>
                      <select 
                        value={draftCourse} 
                        onChange={e => setDraftCourse(e.target.value)}
                        className="w-full text-xs font-bold text-slate-705 bg-slate-55 border border-slate-200 rounded-xl p-2.5 cursor-pointer outline-none focus:border-indigo-400"
                      >
                        <option value="9-B">9-B (Sofía Ramírez)</option>
                        <option value="9-A">9-A (Mateo González)</option>
                        <option value="5-A">5-A (Sede Norte)</option>
                        <option value="10-A">10-A</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Tipo de Evaluación</label>
                      <select 
                        value={draftType} 
                        onChange={e => setDraftType(e.target.value as EvaluationType)}
                        className="w-full text-xs font-bold text-slate-705 bg-slate-55 border border-slate-200 rounded-xl p-2.5 cursor-pointer outline-none focus:border-indigo-400"
                      >
                        <option value="Quiz rápido">Quiz rápido</option>
                        <option value="Parcial">Parcial</option>
                        <option value="Taller">Taller</option>
                        <option value="Diagnóstico">Diagnóstico</option>
                        <option value="Evaluación final">Evaluación final</option>
                        <option value="Recuperación">Recuperación</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Dificultad</label>
                      <select 
                        value={draftDifficulty} 
                        onChange={e => setDraftDifficulty(e.target.value as DifficultyLevel)}
                        className="w-full text-xs font-bold text-slate-705 bg-slate-55 border border-slate-200 rounded-xl p-2.5 cursor-pointer outline-none focus:border-indigo-400"
                      >
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Límite (Minutos)</label>
                      <Input 
                        type="number"
                        value={draftTimeLimit} 
                        onChange={e => setDraftTimeLimit(parseInt(e.target.value) || 15)} 
                        className="text-xs font-semibold placeholder:text-slate-400 border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Ponderación (%)</label>
                      <Input 
                        type="number"
                        value={draftWeight} 
                        onChange={e => setDraftWeight(parseInt(e.target.value) || 10)} 
                        className="text-xs font-semibold placeholder:text-slate-400 border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* GENERADOR DE PREGUNTAS AULACORE AI */}
                <div className="bg-indigo-950 text-indigo-200 p-5 rounded-2xl border border-indigo-900 shadow-inner space-y-4">
                  <div className="flex items-center gap-1.5 text-white">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-100">Generación AI Express</h4>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-indigo-300 uppercase tracking-wide">Escribe un Tema / Concepto</label>
                    <textarea 
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="Ej. Mitosis celular, fracciones algebraicas..."
                      className="w-full text-xs font-semibold text-slate-800 bg-white border border-indigo-900 rounded-xl p-2.5 h-16 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleGenerateAIQuestions(5)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-2 rounded-lg transition active:scale-95 shadow-md flex items-center justify-center gap-1"
                    >
                      Quiz Express (5 Q)
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleGenerateAIQuestions(10)}
                      className="flex-1 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 font-bold text-[10px] py-2 rounded-lg transition active:scale-95 shadow-md flex items-center justify-center gap-1"
                    >
                      Quiz Express (10 Q)
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor del Cuestionario */}
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[600px]">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Estructura del Cuestionario</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Preguntas que componen la evaluación actual</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                      Total Puntos: {draftQuestions.reduce((sum, q) => sum + q.points, 0).toFixed(2)} / 5.0
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-hide">
                    {draftQuestions.length > 0 ? (
                      draftQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group">
                          
                          {/* Trash button */}
                          <button
                            onClick={() => setDraftQuestions(prev => prev.filter(item => item.id !== q.id))}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1 bg-white hover:bg-red-50 border border-slate-100 hover:border-red-200 rounded-lg opacity-0 group-hover:opacity-100 shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mt-0.5">
                              {idx + 1}
                            </span>
                            
                            <div className="flex-1 space-y-2">
                              <div>
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 mr-2 border border-slate-200">
                                  {q.type}
                                </span>
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-indigo-55/10 text-indigo-700 border border-indigo-100">
                                  Puntos: {q.points}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-relaxed pr-8">{q.text}</p>
                              
                              {/* Option values */}
                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-1.5">
                                  {q.options.map((opt, oIdx) => (
                                    <div 
                                      key={oIdx} 
                                      className={cn(
                                        "text-[10px] px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5",
                                        opt === q.correctAnswer 
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-250 font-bold" 
                                          : "bg-white text-slate-550 border-slate-100"
                                      )}
                                    >
                                      <span className="w-4 h-4 rounded-full bg-slate-100 text-[9px] flex items-center justify-center font-black">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="truncate">{opt}</span>
                                      {opt === q.correctAnswer && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Visual placeholder of the student response text box for open questions */}
                              {q.type === 'abierta' && (
                                <div className="pt-2">
                                  <div className="w-full text-[10px] font-medium text-slate-400 bg-white border border-slate-200/80 rounded-xl p-2.5 h-16 flex flex-col justify-between select-none">
                                    <span>[ ] Caja de respuesta libre: El estudiante desarrollará aquí su explicación detallada de forma digital...</span>
                                    <span className="text-[8px] text-slate-350 text-right">Líneas de respuesta habilitadas en test en línea</span>
                                  </div>
                                </div>
                              )}

                              {/* Rubrics review block */}
                              {q.rubric && (
                                <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl mt-2 text-[10px] text-slate-650 leading-relaxed font-semibold">
                                  <div className="font-black text-indigo-700 mb-1 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Rúbrica de Corrección Activa
                                  </div>
                                  {q.rubric.split('\n').map((line, lIdx) => (
                                    <p key={lIdx}>{line}</p>
                                  ))}
                                </div>
                              )}

                            </div>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center">
                        <Sparkles className="w-10 h-10 mb-3.5 text-indigo-500 animate-pulse" />
                        <p className="text-sm text-slate-800 font-black">¿Listo para crear tu cuestionario?</p>
                        <p className="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed font-semibold">
                          Genera un cuestionario instantáneo con **AI Express** en el panel izquierdo o importa reactivos desde el **Banco de Preguntas** arriba.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="flex justify-between items-center border-t border-slate-150 pt-4 mt-6">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setDraftQuestions([])}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl px-5"
                    >
                      Vaciar Borrador
                    </Button>
                    <Button
                      variant="outline"
                      disabled={draftQuestions.length === 0}
                      onClick={handleDownloadDraftPDF}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-700 hover:border-indigo-200 font-bold text-xs h-10 rounded-xl px-5 flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      Descargar Examen
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('bank')}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl px-5"
                    >
                      Banco de Preguntas
                    </Button>
                    <Button 
                      onClick={handleSaveEvaluation}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 rounded-xl px-6 shadow active:scale-95"
                    >
                      Guardar y Publicar Examen
                    </Button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------- VISTA 3: BANCO DE PREGUNTAS ------------------------- */}
        {activeTab === 'bank' && (
          <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-650" /> Banco de Preguntas Inteligente
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Almacena, filtra y reutiliza reactivos clasificados por competencias</p>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    placeholder="Buscar reactivos..."
                    className="pl-9 text-xs font-semibold border-slate-200 rounded-xl"
                  />
                </div>
                
                <select 
                  value={bankSubject}
                  onChange={e => setBankSubject(e.target.value)}
                  className="text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-pointer outline-none"
                >
                  <option value="Todas">Todas las Materias</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Biología">Biología</option>
                  <option value="Lengua Castellana">Lengua</option>
                </select>

                <select 
                  value={bankDifficulty}
                  onChange={e => setBankDifficulty(e.target.value)}
                  className="text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-pointer outline-none"
                >
                  <option value="Todos">Dificultad (Todos)</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
            </div>

            {/* QUESTION BANK TABLE LIST */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
              {questionBank
                .filter(q => {
                  const matchTxt = q.text.toLowerCase().includes(bankSearch.toLowerCase());
                  const matchSub = bankSubject === 'Todas' || (q.id.includes('1') || q.id.includes('2') || q.id.includes('3') || q.id.includes('4') ? bankSubject === 'Matemáticas' : bankSubject === 'Biología');
                  const matchDif = bankDifficulty === 'Todos' || (q.points >= 1.5 ? bankDifficulty === 'Alto' : bankDifficulty === 'Bajo');
                  return matchTxt && matchSub && matchDif;
                })
                .map(q => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          {q.type}
                        </span>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Valor: {q.points} Puntos
                        </span>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          Competencia: Argumentativa
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                      
                      {q.rubric && (
                        <p className="text-[9px] text-slate-450 italic font-semibold">{q.rubric.split('\n')[0]}</p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleAddFromBank(q)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] h-8 rounded-lg shrink-0 flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar al Borrador
                    </Button>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ------------------------- VISTA 4: CALIFICACIONES & CORRECCIÓN OMR ------------------------- */}
        {activeTab === 'grading' && (
          <div className="space-y-6">
            
            {/* OMR SCANNER OVERLAY */}
            {omrScanning && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99999] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 max-w-sm text-center space-y-4 shadow-2xl relative">
                  
                  {/* Simulated Camera Window */}
                  {omrCameraActive && (
                    <div className="w-full h-48 bg-slate-900 rounded-2xl border-2 border-indigo-500/80 overflow-hidden relative shadow-inner flex items-center justify-center">
                      <Camera className="w-12 h-12 text-indigo-500 animate-pulse absolute" />
                      <div className="w-full h-0.5 bg-indigo-500 absolute animate-bounce" />
                      {/* corner sync marks mock */}
                      <span className="absolute top-2 left-2 text-white font-bold text-xs">[█]</span>
                      <span className="absolute top-2 right-2 text-white font-bold text-xs">[█]</span>
                      <span className="absolute bottom-2 left-2 text-white font-bold text-xs">[█]</span>
                      <span className="absolute bottom-2 right-2 text-white font-bold text-xs">[█]</span>
                      <span className="text-[10px] text-slate-400 absolute bottom-3 font-bold">CÁMARA OMR ACTIVA</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Escaneo Óptico OMR AI</h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">AulaCore calibrando marcas de sincronía y decodificando respuestas...</p>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${omrProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Roster de Notas */}
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Grading Sheet / Roster Evaluativo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ingreso de calificaciones manuales o carga inteligente por lector</p>
                  </div>
                  
                  {/* Calibración OMR */}
                  <Button 
                    onClick={handleStartOMRScan}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <ScanLine className="w-4 h-4" /> Lector Óptico OMR
                  </Button>
                </div>

                {/* Examen seleccionado Details */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">{selectedEvaluation.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                      Curso: {selectedEvaluation.course} • Periodo: {selectedEvaluation.period} • Ponderación: {selectedEvaluation.weight}%
                    </p>
                  </div>
                  <span className="text-xs font-black text-indigo-700 bg-white border border-indigo-150 px-3 py-1 rounded-xl shadow-xs">
                    Materia: {selectedEvaluation.subject}
                  </span>
                </div>

                {/* LIST OF STUDENTS IN THE EXAM */}
                <div className="space-y-3">
                  {selectedResults.map(result => (
                    <div 
                      key={result.studentId}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                          {result.studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                            {result.studentName}
                            {result.cheatingAlert && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                                Alerta de Copia IA
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            GPA anterior: {result.studentGpaBefore.toFixed(1)} • Tipo: {result.submissionType || 'Pendiente entrega'}
                          </p>
                        </div>
                      </div>

                      {/* Grades loading / form */}
                      <div className="flex items-center gap-3">
                        <div className="space-y-1 w-24">
                          <label className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Calificación</label>
                          <Input 
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="5.0"
                            placeholder="Ej. 4.0"
                            value={result.score !== null ? result.score : ''}
                            onChange={e => {
                              const val = e.target.value === '' ? null : parseFloat(e.target.value);
                              setResults(prev => {
                                const list = prev[selectedEvaluation.id] || [];
                                const updated = list.map(item => {
                                  if (item.studentId === result.studentId) {
                                    return { 
                                      ...item, 
                                      score: val,
                                      submissionType: item.submissionType || 'Físico (Papel)'
                                    };
                                  }
                                  return item;
                                });
                                return { ...prev, [selectedEvaluation.id]: updated };
                              });
                            }}
                            className="text-xs font-black text-slate-800 text-center border-slate-200 rounded-lg h-8 bg-white"
                          />
                        </div>

                        {/* Open Rubrics dialog launch */}
                        {selectedEvaluation.questions.some(q => q.type === 'abierta') && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setGradingStudentId(result.studentId)}
                            className="bg-white border-slate-200 hover:bg-slate-50 text-[10px] font-bold h-8 rounded-lg flex items-center gap-1 mt-3"
                          >
                            Rúbrica IA
                          </Button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

                {/* SAVE & CASCADING SYNC BUTTON */}
                <div className="flex justify-end pt-4 border-t border-slate-150">
                  <Button 
                    onClick={handleSyncGrades}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 rounded-xl px-6 shadow-md shadow-indigo-600/10 active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Guardar y Sincronizar Calificaciones
                  </Button>
                </div>
              </div>

              {/* Rúbricas e Inspector de Preguntas Abiertas */}
              <div className="xl:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-2 text-indigo-650">
                  <PenTool className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-widest">Evaluador de Rúbricas OMR/IA</h3>
                </div>

                {gradingStudentId ? (() => {
                  const studentGraded = selectedResults.find(r => r.studentId === gradingStudentId);
                  const openQuestion = selectedEvaluation.questions.find(q => q.type === 'abierta');

                  return (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-xs font-black text-slate-800">{studentGraded?.studentName}</span>
                        <button onClick={() => setGradingStudentId(null)} className="text-slate-400 hover:text-slate-650">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pregunta Abierta Evaluada</h5>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {openQuestion?.text}
                        </p>
                      </div>

                      {studentGraded?.answers && openQuestion && (
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Respuesta Escrita del Alumno</h5>
                          <p className="text-xs font-bold text-indigo-950 leading-relaxed bg-indigo-50/30 p-3 rounded-xl border border-indigo-100">
                            "{studentGraded.answers[openQuestion.id] || 'No responde.'}"
                          </p>
                        </div>
                      )}

                      {/* Interactive rubric scale */}
                      {openQuestion?.rubric && (
                        <div className="space-y-3 mt-4">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escala de Rúbrica Ponderada</h5>
                          <div className="space-y-2">
                            {[
                              { points: 1.5, title: 'Excelente / Criterio Satisfecho', desc: 'Desarrolla el procedimiento algebraico completo y justifica signos.' },
                              { points: 1.0, title: 'Básico / Procedimiento Parcial', desc: 'Factoriza bien pero no explica el porqué de los términos o tiene fallas de redacción.' },
                              { points: 0.0, title: 'Deficiente / Error Crítico', desc: 'Error algebraico crítico, desatención conceptual o vacío.' }
                            ].map((rubricTier, rIdx) => {
                              const isSelected = studentGraded?.rubricScores?.[openQuestion.id] === rubricTier.points;
                              
                              return (
                                <div 
                                  key={rIdx}
                                  onClick={() => {
                                    setResults(prev => {
                                      const list = prev[selectedEvaluation.id] || [];
                                      const updated = list.map(item => {
                                        if (item.studentId === gradingStudentId) {
                                          const prevRubrics = item.rubricScores || {};
                                          return {
                                            ...item,
                                            rubricScores: { ...prevRubrics, [openQuestion.id]: rubricTier.points },
                                            // auto recalculate score scaled
                                            score: parseFloat(Math.min(5.0, (item.score || 3.0) + rubricTier.points).toFixed(1))
                                          };
                                        }
                                        return item;
                                      });
                                      return { ...prev, [selectedEvaluation.id]: updated };
                                    });
                                    showToast(
                                      'Criterio Guardado',
                                      `Se asignó ${rubricTier.points} puntos al estudiante ${studentGraded?.studentName}.`
                                    );
                                  }}
                                  className={cn(
                                    "p-3 rounded-xl border-2 transition-all cursor-pointer select-none active:scale-98",
                                    isSelected 
                                      ? "bg-indigo-50 border-indigo-400 shadow-sm" 
                                      : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                                  )}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-800">{rubricTier.title}</span>
                                    <span className="text-[10px] font-black text-indigo-700">+{rubricTier.points} pts</span>
                                  </div>
                                  <p className="text-[9px] text-slate-450 leading-relaxed font-semibold">{rubricTier.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="text-center py-20 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                    <PenTool className="w-10 h-10 mb-3.5 text-slate-300" />
                    <p className="text-[11px] text-slate-800 font-black">Evaluador de Ensayos y Rúbricas</p>
                    <p className="text-[9px] text-slate-450 mt-1 max-w-[200px] leading-relaxed">
                      Haz clic en el botón **"Rúbrica IA"** de cualquier estudiante del roster para calificar reactivos abiertos por competencias de forma interactiva.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ------------------------- VISTA 5: SIMULADOR DE EXAMEN (VISTA ESTUDIANTE SEGURO) ------------------------- */}
        {activeTab === 'student' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Focus loss / cheating alert modal */}
            {cheatingAlertActive && (
              <div className="fixed inset-0 bg-rose-950/40 backdrop-blur-md z-[99999] flex items-center justify-center animate-in fade-in duration-200">
                <div className="bg-white border-2 border-rose-300 rounded-3xl p-8 max-w-sm text-center shadow-2xl space-y-4">
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                    <AlertTriangle className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-black text-rose-900 uppercase tracking-wider">Supervisión AI - Foco Desviado</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Se detectó que saliste del entorno seguro de la evaluación. Cada pérdida de foco se registra en la bitácora escolar OMR/IA.
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl text-[10px] text-rose-800 font-bold border border-rose-100">
                    Número de Advertencias de Foco: {cheatingAttempts}
                  </div>
                  <Button 
                    onClick={() => setCheatingAlertActive(false)}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl"
                  >
                    Volver al Examen de Forma Segura
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-650" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-150">
                    Simulación Alumno: Sofía Ramírez
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2.5">{selectedEvaluation.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Entorno Seguro de Evaluación AI • Curso: {selectedEvaluation.course} • Materia: {selectedEvaluation.subject}</p>
                </div>

                <div className={cn(
                  "px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-xs font-black text-sm",
                  studentTimeLeft < 120 
                    ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" 
                    : "bg-slate-50 text-slate-700 border-slate-200"
                )}>
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    {Math.floor(studentTimeLeft / 60)}:{String(studentTimeLeft % 60).padStart(2, '0')} Minutos
                  </span>
                </div>
              </div>

              {examFinished ? (
                <div className="text-center py-16 space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">¡Evaluación Enviada con Éxito!</h3>
                    <p className="text-xs text-slate-550 mt-1 max-w-sm mx-auto leading-relaxed">
                      El cuestionario se cargó correctamente. Tus notas OMR se actualizarán automáticamente en la sábana de calificaciones.
                    </p>
                  </div>
                  <div className="flex gap-2.5 justify-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('dashboard')}
                      className="border-slate-200 text-slate-650 h-9 rounded-xl font-bold text-xs"
                    >
                      Volver al Dashboard
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('grading')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 rounded-xl font-bold text-xs px-5 shadow active:scale-95"
                    >
                      Ver Sabana Docente
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedEvaluation.questions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-xs font-black text-slate-800 flex items-start gap-2 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-slate-250 text-slate-700 flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          {q.text}
                        </h4>
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider shrink-0 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">
                          {q.points} Pts
                        </span>
                      </div>

                      {/* OPTIONS FOR MULTIPLE CHOICE */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = studentAnswers[q.id] === opt;
                            
                            return (
                              <div 
                                key={oIdx}
                                onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={cn(
                                  "p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2 select-none active:scale-98 text-xs font-semibold",
                                  isSelected 
                                    ? "bg-indigo-50 border-indigo-400 text-indigo-950 font-bold" 
                                    : "bg-white border-slate-150 hover:border-slate-250 text-slate-650"
                                )}
                              >
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-black">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* OPEN QUESTION TEXTAREA */}
                      {q.type === 'abierta' && (
                        <div className="pl-7 space-y-1">
                          <textarea 
                            value={studentAnswers[q.id] || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setStudentAnswers(prev => ({ ...prev, [q.id]: val }));
                            }}
                            placeholder="Escribe tu respuesta detallada aquí..."
                            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl p-3 h-28 outline-none focus:border-indigo-400 resize-none shadow-xs"
                          />
                        </div>
                      )}

                    </div>
                  ))}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button 
                      onClick={() => handleFinishStudentQuiz(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 rounded-xl px-6 shadow active:scale-95"
                    >
                      Enviar Respuestas de Evaluación
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ------------------------- VISTA 6: ANALÍTICA IA DE APRENDIZAJE ------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Overview KPI widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Promedio Global */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase block tracking-widest mb-1.5">GPA de Curso 9-B</span>
                  <h4 className="text-3xl font-black text-slate-900 leading-none">
                    {globalGpa9B.toFixed(2)} / 5.0
                  </h4>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black inline-block mt-2 border border-emerald-100">
                    +0.6 Incremento en Calificaciones
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 h-full rounded-full w-[68%]" />
                </div>
              </div>

              {/* Riesgo de Deserción */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase block tracking-widest mb-1.5">Riesgo IA (Sofía Ramírez)</span>
                  <h4 className={cn(
                    "text-3xl font-black leading-none",
                    dropoutRiskSofia === 'Alto' ? 'text-rose-500' : 'text-amber-500'
                  )}>
                    {dropoutRiskSofia.toUpperCase()}
                  </h4>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black inline-block mt-2 border border-indigo-100">
                    Filtro predictivo: Estabilidad Media
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 h-full rounded-full w-[55%]" />
                </div>
              </div>

              {/* Cruce Predictivo */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase block tracking-widest mb-1.5">Correlación OMR/Asistencia</span>
                  <h4 className="text-3xl font-black text-slate-900 leading-none">82% Estabilidad</h4>
                  <p className="text-[9px] text-slate-450 font-bold uppercase mt-2">
                    Caída en Matemáticas alineada con faltas de asistencia RFID los martes.
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 h-full rounded-full w-[82%]" />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Distribución de Calificaciones (Gráficas HTML) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-650" /> Distribución de Calificaciones P3
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Análisis cuantitativo de aprobados vs reprobados en el grupo</p>
                </div>

                <div className="space-y-4">
                  {[
                    { range: 'Superior (4.6 - 5.0)', count: 8, percentage: 32, color: 'from-emerald-400 to-emerald-500' },
                    { range: 'Alto (4.0 - 4.5)', count: 12, percentage: 48, color: 'from-indigo-400 to-indigo-500' },
                    { range: 'Básico (3.0 - 3.9)', count: 4, percentage: 16, color: 'from-amber-400 to-amber-500' },
                    { range: 'Bajo (1.0 - 2.9)', count: 1, percentage: 4, color: 'from-rose-400 to-rose-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>{item.range}</span>
                        <span className="font-black text-slate-800">{item.count} Estudiantes ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className={cn("bg-gradient-to-r h-full rounded-full transition-all duration-500", item.color)} 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rúbricas por Habilidades & Competencias */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-650" /> Mapa de Competencias & Habilidades
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Fortalezas y debilidades curriculares arrojadas por la IA</p>
                </div>

                <div className="space-y-4">
                  {[
                    { skill: 'Planteamiento Algebraico', mastery: 85, state: 'Excelente' },
                    { skill: 'Interpretación de Problemas', mastery: 72, state: 'Favorable' },
                    { skill: 'Despeje de Fórmulas', mastery: 58, state: 'Seguimiento' },
                    { skill: 'Representación Gráfica de Rectas', mastery: 40, state: 'Crítico' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>{item.skill}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                            item.state === 'Excelente' ? 'bg-emerald-50 text-emerald-600' :
                            item.state === 'Favorable' ? 'bg-blue-50 text-blue-600' :
                            item.state === 'Seguimiento' ? 'bg-amber-50 text-amber-600' :
                            'bg-rose-50 text-rose-600'
                          )}>{item.state}</span>
                          <span className="font-black text-slate-800">{item.mastery}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.mastery}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Floating global notification toasts */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[99999] bg-white border shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300",
          toast.type === 'warning' ? 'border-rose-200' : 'border-slate-200'
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner",
            toast.type === 'warning' ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
          )}>
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4 animate-bounce" />
            )}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800 tracking-tight leading-none">{toast.title}</h4>
            <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-1">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Print Assessment Preview Modal */}
      {previewEvaluation && (
        <PrintPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewEvaluation(null);
          }}
          evaluation={previewEvaluation}
        />
      )}

    </AppLayout>
  );
}
