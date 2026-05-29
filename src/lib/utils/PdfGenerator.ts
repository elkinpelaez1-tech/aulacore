import { Evaluation } from '@/lib/data/evaluations-store';

export function downloadEvaluationPDF(evaluation: Evaluation) {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const docId = `EVAL-${evaluation.id.toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const content = `========================================================================================
[█]                                AULACORE SMART EVALUATION                        [█]
========================================================================================
SEDE: ${evaluation.campus.toUpperCase()}          | CURSO: ${evaluation.course}       | GRADO: ${evaluation.grade}°
MATERIA: ${evaluation.subject.toUpperCase()} | PERIODO: ${evaluation.period.toUpperCase()} | AUDITORÍA: IA-OMR
TIPO: ${evaluation.type.toUpperCase()}      | DIFICULTAD: ${evaluation.difficulty.toUpperCase()} | TIEMPO: ${evaluation.timeLimit} MIN
========================================================================================
CÓDIGO DE EVALUACIÓN: ${docId}
ID DE VERIFICACIÓN QR: [https://aulacore.edu/verify/${evaluation.id}]
----------------------------------------------------------------------------------------
DATOS DEL ESTUDIANTE (DILIGENCIAR EN BOLÍGRAFO NEGRO):
ESTUDIANTE: ____________________________________________________________________________
DOCUMENTO IDENTIDAD: ______________________________  FECHA: ____________________________
========================================================================================

INSTRUCCIONES:
1. Responda cada pregunta de forma clara. 
2. Para preguntas de opción múltiple, rellene COMPLETAMENTE el óvalo correspondiente en 
   la hoja de respuestas OMR de la parte inferior para habilitar la lectura óptica automática.
3. No haga marcas fuera de los recuadros de sincronía [█] ubicados en las esquinas.

----------------------------------------------------------------------------------------
                                 CUESTIONARIO PRINCIPAL
----------------------------------------------------------------------------------------

${evaluation.questions.length === 0 ? 'No hay preguntas cargadas en esta evaluación.' : evaluation.questions.map((q, idx) => {
  let qText = `${idx + 1}. (${q.points} pts) [${q.type.toUpperCase()}] ${q.text}\n`;
  if (q.options && q.options.length > 0) {
    const letters = ['A', 'B', 'C', 'D'];
    qText += q.options.map((opt, oIdx) => `   [ ] ${letters[oIdx] || oIdx + 1}. ${opt}`).join('\n') + '\n';
  } else if (q.type === 'verdadero_falso') {
    qText += `   [ ] A. Verdadero\n   [ ] B. Falso\n`;
  } else if (q.type === 'abierta') {
    qText += `   RESPUESTA ABIERTA:\n   __________________________________________________________________________________\n   __________________________________________________________________________________\n`;
    if (q.rubric) {
      qText += `   * ${q.rubric.split('\n')[0]} *\n`;
    }
  } else {
    qText += `   RESPUESTA:\n   __________________________________________________________________________________\n`;
  }
  return qText;
}).join('\n----------------------------------------------------------------------------------------\n')}

========================================================================================
[█]                        HOJA DE RESPUESTAS RÁPIDAS OMR                          [█]
========================================================================================
Rellene completamente los óvalos para lectura óptica ICFES / AulaCore OMR:

${evaluation.questions.map((q, idx) => {
  if (q.type === 'seleccion_multiple' || q.type === 'verdadero_falso' || q.type === 'matematica') {
    return `Pregunta ${idx + 1}:   ( A )   ( B )   ( C )   ( D )`;
  }
  return `Pregunta ${idx + 1}:   [ EVALUACIÓN ABIERTA / CALIFICACIÓN POR RÚBRICA ]`;
}).join('\n')}

========================================================================================
SOPORTE DE LECTURA ÓPTICA COMPILADO POR AULACORE AI - REGISTROS SINCRONÍA OK
[█]                                                                                    [█]
========================================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `evaluacion_impresion_${evaluation.title.replace(/\s+/g, '_')}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
