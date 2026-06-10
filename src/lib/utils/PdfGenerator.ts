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

/**
 * Generates and triggers browser print of an institutional high fidelity report card (Boletín Académico).
 */
export function downloadBoletinPDF(studentName: string, grade: string, gpa: number, grades: any[], periodName: string) {
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const gradingScale = gpa >= 4.6 ? 'Superior' : gpa >= 4.0 ? 'Alto' : gpa >= 3.0 ? 'Básico' : 'Bajo';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Boletín Académico - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          background-color: #ffffff;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px double #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-logo {
          width: 70px;
          height: 70px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #0f172a;
        }
        .header-text p {
          margin: 3px 0 0 0;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .meta-grid {
          display: grid;
          grid-template-cols: 2fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
        }
        .meta-item:last-child {
          margin-bottom: 0;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .gpa-card {
          background: linear-gradient(135deg, #4f46e5, #3730a3);
          color: #ffffff;
          border: none;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .gpa-card h3 {
          color: #c7d2fe;
          margin-bottom: 5px;
        }
        .gpa-value {
          font-size: 38px;
          font-weight: 950;
          margin: 0;
          line-height: 1;
        }
        .gpa-scale {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 5px;
          background-color: rgba(255,255,255,0.15);
          padding: 3px 10px;
          border-radius: 20px;
        }
        .report-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .grades-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .grades-table th {
          background-color: #0f172a;
          color: #ffffff;
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .grades-table th:first-child {
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
        }
        .grades-table th:last-child {
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
          text-align: right;
        }
        .grades-table td {
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 1px solid #e2e8f0;
        }
        .grades-table tr:hover td {
          background-color: #f8fafc;
        }
        .grades-table td.grade-val {
          text-align: right;
          font-weight: 800;
          font-size: 14px;
        }
        .grade-pass {
          color: #10b981;
        }
        .grade-fail {
          color: #ef4444;
        }
        .observations-box {
          margin-top: 8px;
          font-size: 11px;
          color: #475569;
          background-color: #f1f5f9;
          padding: 8px 12px;
          border-radius: 8px;
          font-style: italic;
          font-weight: 400;
        }
        .signatures-container {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 60px;
          padding-top: 20px;
        }
        .signature-item {
          text-align: center;
        }
        .signature-line {
          width: 80%;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 10px auto;
        }
        .signature-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }
        .signature-stamp {
          height: 60px;
          margin-bottom: 10px;
          opacity: 0.85;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 60px;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>

      <div class="header-container">
        <!-- SVG Logo Crest -->
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Informe Oficial de Rendimiento Académico</p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <h3>Datos del Estudiante</h3>
          <div class="meta-item">
            <span>Estudiante:</span>
            <strong>${studentName}</strong>
          </div>
          <div class="meta-item">
            <span>Grado Académico:</span>
            <strong>${grade} (Educación Básica)</strong>
          </div>
          <div class="meta-item">
            <span>Período Escolar:</span>
            <strong>${periodName} (Año Lectivo 2026)</strong>
          </div>
          <div class="meta-item">
            <span>Fecha Emisión:</span>
            <strong>${dateStr}</strong>
          </div>
        </div>

        <div class="meta-card gpa-card">
          <h3>Promedio General</h3>
          <p class="gpa-value">${gpa.toFixed(2)}</p>
          <span class="gpa-scale">Desempeño ${gradingScale}</span>
        </div>
      </div>

      <div class="report-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        Sábana de Calificaciones Consolidadas
      </div>

      <table class="grades-table">
        <thead>
          <tr>
            <th>Materia / Asignatura</th>
            <th>Docente Encargado</th>
            <th style="text-align: right;">Nota Definitiva</th>
          </tr>
        </thead>
        <tbody>
          ${grades.map(g => {
            const isPass = g.average >= 3.0 || g.grade >= 3.0;
            const scoreVal = g.average || g.grade || 0;
            const concept = scoreVal >= 4.6 ? 'Superior' : scoreVal >= 4.0 ? 'Alto' : scoreVal >= 3.0 ? 'Básico' : 'Bajo';
            return `
              <tr>
                <td>
                  <strong style="color: #0f172a; font-weight: 700;">${g.subject}</strong>
                  ${g.comments || g.remarks ? `<div class="observations-box"><strong>Docente:</strong> "${g.comments || g.remarks}"</div>` : ''}
                </td>
                <td style="color: #475569; font-weight: 600;">${g.teacher || g.teacher_name || 'Profesor de Área'}</td>
                <td class="grade-val ${isPass ? 'grade-pass' : 'grade-fail'}">
                  ${scoreVal.toFixed(2)}
                  <span style="font-size: 9px; font-weight: 700; color: #94a3b8; display: block;">${concept}</span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="signatures-container">
        <div class="signature-item">
          <!-- Simulated stamp SVG -->
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(79, 70, 229, 0.45); margin: 0 auto;">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3" />
            <text x="50" y="45" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor">DIR. GRUPO</text>
            <path d="M30 60 Q50 40 70 60" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="50" y="70" font-size="6" text-anchor="middle" fill="currentColor">OK - VERIFICADO</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-title">${grades[0]?.teacher || grades[0]?.teacher_name || 'Director de Grupo'}</span><br/>
          <span class="signature-role">Director de Curso</span>
        </div>

        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(16, 185, 129, 0.45); margin: 0 auto;">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2.5" />
            <text x="50" y="45" font-size="8" font-weight="extrabold" text-anchor="middle" fill="currentColor">RECTORÍA</text>
            <path d="M 35 65 Q 48 20 65 65" fill="none" stroke="currentColor" stroke-width="2.5" />
            <text x="50" y="70" font-size="5" font-weight="bold" text-anchor="middle" fill="currentColor">REGISTRO OFICIAL</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-title">Dr. Ramírez Castillo</span><br/>
          <span class="signature-role">Rector General</span>
        </div>
      </div>

      <div class="footer">
        AulaCore Smart Systems &bull; ID Verificación: ${hash} &bull; Documento Generado Electrónicamente
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  // Open in a new tab and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official institutional certificate of enrollment (Certificado de Matrícula).
 */
export function downloadCertificadoMatriculaPDF(studentName: string, grade: string, enrollmentNumber: string) {
  const hash = `AC-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const dateObj = new Date();
  const day = dateObj.getDate();
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Certificado de Matrícula - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
        }
        .header-container {
          text-align: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 15px;
          margin-bottom: 40px;
        }
        .header-logo {
          width: 60px;
          height: 60px;
          color: #4f46e5;
          margin: 0 auto 10px auto;
          display: block;
        }
        .header-container h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-container p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .cert-body {
          font-size: 14px;
          text-align: justify;
          color: #334155;
          margin-bottom: 40px;
        }
        .cert-body p {
          margin-bottom: 25px;
          text-indent: 30px;
        }
        .highlight {
          color: #0f172a;
          font-weight: 800;
        }
        .signature-area {
          margin-top: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-stamp {
          height: 80px;
          margin-bottom: 10px;
          color: rgba(79, 70, 229, 0.5);
        }
        .signature-line {
          width: 250px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 10px auto;
        }
        .signature-name {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          position: absolute;
          bottom: 50px;
          left: 70px;
          right: 70px;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>

      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <h1>Colegio Anglo-Colombiano</h1>
        <p>Oficina de Admisiones y Registro Académico</p>
      </div>

      <div class="cert-title">
        Certificado de Matrícula Regular
      </div>

      <div class="cert-body">
        <p>
          La suscrita Secretaria General de la Oficina de Registro Académico del <span class="highlight">COLEGIO ANGLO-COLOMBIANO</span>, en uso de sus facultades legales y estatutarias,
        </p>
        
        <p style="text-align: center; text-indent: 0; font-weight: 900; font-size: 16px; margin: 30px 0; color: #0f172a; letter-spacing: 1px;">
          CERTIFICA:
        </p>

        <p>
          Que el estudiante <span class="highlight">${studentName.toUpperCase()}</span>, identificado en nuestros libros de registro escolar con el código único de matrícula número <span class="highlight">${enrollmentNumber}</span>, se encuentra formalmente <span class="highlight">MATRICULADO E INSCRITO</span> como alumno regular para cursar el Grado <span class="highlight">${grade} (Educación Básica Secundaria)</span> durante el presente año lectivo 2026.
        </p>

        <p>
          Se deja constancia de que el estudiante mantiene un estatus académico activo, asistiendo a sus clases presenciales reglamentarias y cumpliendo cabalmente con las normas convivenciales del manual de convivencia de la institución.
        </p>

        <p>
          Para constancia de lo anterior, se firma y se sella la presente certificación oficial a solicitud del interesado en la ciudad de Bogotá D.C., a los ${day} días del mes de ${monthName} de ${year}.
        </p>
      </div>

      <div class="signature-area">
        <!-- SVG Stamp -->
        <svg class="signature-stamp" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" />
          <text x="50" y="45" font-size="6" font-weight="900" text-anchor="middle" fill="currentColor">REGISTRO ESCOLAR</text>
          <path d="M25 60 C40 30, 60 30, 75 60" />
          <text x="50" y="70" font-size="5" font-weight="bold" text-anchor="middle" fill="currentColor">VALIDEZ LEGAL DIGITAL</text>
        </svg>
        <div class="signature-line"></div>
        <span class="signature-name">Dra. Elena Toro</span><br/>
        <span class="signature-role">Secretaria General y de Admisiones</span>
      </div>

      <div class="footer">
        AulaCore Smart Ledger &bull; Código Único de Registro: ${hash} &bull; Documento verificado criptográficamente en la base institucional
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  // Open in a new tab and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official PAE Funding Resource Allocation Certificate.
 */
export function downloadPaeResourcePDF(resource: any) {
  const hash = `PAE-RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date(resource.allocation_date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const valueFormatted = resource.allocated_value.toLocaleString('co-CO', { minimumFractionDigits: 2 });
  
  let valueInLetters = "Moneda Corriente Colombiana";
  if (resource.allocated_value === 125000000) {
    valueInLetters = "CIENTO VEINTICINCO MILLONES DE PESOS M/CTE";
  } else if (resource.allocated_value === 45000000) {
    valueInLetters = "CUARENTA Y CINCO MILLONES DE PESOS M/CTE";
  } else {
    valueInLetters = `${resource.allocated_value.toLocaleString('es-ES')} PESOS M/CTE`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Soporte Presupuestal PAE - ${resource.source_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
          position: relative;
        }
        .watermark {
          position: absolute;
          top: 35%;
          left: 15%;
          width: 70%;
          height: auto;
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
          position: relative;
          z-index: 10;
        }
        .header-logo {
          width: 65px;
          height: 65px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header-text p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0 25px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          position: relative;
          z-index: 10;
        }
        .meta-grid {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 20px;
          margin-bottom: 35px;
          position: relative;
          z-index: 10;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .cert-body {
          font-size: 13.5px;
          text-align: justify;
          color: #334155;
          margin-bottom: 35px;
          position: relative;
          z-index: 10;
        }
        .cert-body p {
          margin-bottom: 20px;
          text-indent: 30px;
        }
        .highlight {
          color: #0f172a;
          font-weight: 800;
        }
        .budget-table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 12px;
        }
        .budget-table th {
          background-color: #0f172a;
          color: #ffffff;
          text-align: left;
          padding: 10px 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .budget-table th:first-child {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        .budget-table th:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
          text-align: right;
        }
        .budget-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 500;
        }
        .budget-table td.val {
          text-align: right;
          font-weight: 700;
        }
        .signature-area {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 50px;
          position: relative;
          z-index: 10;
        }
        .signature-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-stamp {
          height: 70px;
          margin-bottom: 10px;
          color: rgba(79, 70, 229, 0.45);
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 8px auto;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 50px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          z-index: 10;
        }
      </style>
    </head>
    <body>
      <svg class="watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>

      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Oficina de Planeación y Programa PAE</p>
        </div>
      </div>

      <div class="cert-title">
        Resolución de Asignación y Registro Presupuestal PAE
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <h3>Detalles de la Fuente</h3>
          <div class="meta-item">
            <span>Fuente Financiación:</span>
            <strong>${resource.source_name}</strong>
          </div>
          <div class="meta-item">
            <span>Documento Soporte:</span>
            <strong>${resource.support_document}</strong>
          </div>
          <div class="meta-item">
            <span>Fecha de Registro:</span>
            <strong>${dateStr}</strong>
          </div>
        </div>

        <div class="meta-card">
          <h3>Control Financiero</h3>
          <div class="meta-item">
            <span>Valor Asignado:</span>
            <strong class="highlight">$${valueFormatted} COP</strong>
          </div>
          <div class="meta-item">
            <span>Vigencia Fiscal:</span>
            <strong>Año Lectivo 2026</strong>
          </div>
          <div class="meta-item">
            <span>Código de Validación:</span>
            <strong style="font-family: monospace;">${hash.slice(-8)}</strong>
          </div>
        </div>
      </div>

      <div class="cert-body">
        <p>
          La Dirección General del <span class="highlight">COLEGIO ANGLO-COLOMBIANO</span>, en coordinación con el Comité de Alimentación Escolar (CAE), hace constar el registro y la asignación presupuestaria correspondiente a los recursos del Programa de Alimentación Escolar (PAE) para la vigencia del año escolar actual, proveniente de la fuente <span class="highlight">${resource.source_name}</span>.
        </p>

        <p>
          Los recursos por un valor total de <span class="highlight">$${valueFormatted} COP (${valueInLetters})</span> han sido incorporados en el rubro especial de cofinanciación y alimentación estudiantil, y serán ejecutados con estricta sujeción a los lineamientos técnico-administrativos expedidos por el Ministerio de Educación Nacional de Colombia.
        </p>

        <p>
          A continuación se presenta la distribución presupuestaria estimada para la ejecución de dichos recursos en los diferentes componentes del programa:
        </p>

        <table class="budget-table">
          <thead>
            <tr>
              <th>Componente de Destinación</th>
              <th>Porcentaje</th>
              <th style="text-align: right;">Presupuesto Estimado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style="color: #0f172a;">Raciones Alimentarias / Materia Prima</strong></td>
              <td>70%</td>
              <td class="val">$${(resource.allocated_value * 0.70).toLocaleString('co-CO', { minimumFractionDigits: 2 })} COP</td>
            </tr>
            <tr>
              <td><strong style="color: #0f172a;">Logística, Cadena de Frío y Distribución</strong></td>
              <td>15%</td>
              <td class="val">$${(resource.allocated_value * 0.15).toLocaleString('co-CO', { minimumFractionDigits: 2 })} COP</td>
            </tr>
            <tr>
              <td><strong style="color: #0f172a;">Calidad, Análisis Nutricional y Supervisión</strong></td>
              <td>10%</td>
              <td class="val">$${(resource.allocated_value * 0.10).toLocaleString('co-CO', { minimumFractionDigits: 2 })} COP</td>
            </tr>
            <tr>
              <td><strong style="color: #0f172a;">Infraestructura Comedores y Menaje Escolar</strong></td>
              <td>5%</td>
              <td class="val">$${(resource.allocated_value * 0.05).toLocaleString('co-CO', { minimumFractionDigits: 2 })} COP</td>
            </tr>
          </tbody>
        </table>

        <p>
          Esta asignación presupuestal respalda los cupos proyectados del programa, asegurando la entrega de complementos alimentarios en las modalidades de ración industrializada y caliente para el beneficio de la comunidad estudiantil priorizada.
        </p>
      </div>

      <div class="signature-area">
        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(79, 70, 229, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2;">
            <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" />
            <text x="50" y="45" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor">DIR. FINANCIERA</text>
            <path d="M30 60 Q50 40 70 60" />
            <text x="50" y="70" font-size="5" text-anchor="middle" fill="currentColor">APROBADO PAE 2026</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Dra. Elena Toro</span><br/>
          <span class="signature-role">Dirección Administrativa y Financiera</span>
        </div>

        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(16, 185, 129, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2.5;">
            <circle cx="50" cy="50" r="40" />
            <text x="50" y="45" font-size="8" font-weight="extrabold" text-anchor="middle" fill="currentColor">RECTORÍA</text>
            <path d="M 35 65 Q 48 20 65 65" />
            <text x="50" y="70" font-size="5" font-weight="bold" text-anchor="middle" fill="currentColor">CERTIFICACIÓN PAE</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Dr. Ramírez Castillo</span><br/>
          <span class="signature-role">Rector General</span>
        </div>
      </div>

      <div class="footer">
        AulaCore PAE Ledger &bull; Código Criptográfico: ${hash} &bull; Documento Generado Electrónicamente
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official cycle menu nutritional card.
 */
export function downloadPaeMenuPDF(menu: any) {
  const hash = `PAE-MENU-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Minuta Patrón PAE - Semana ${menu.week_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
          position: relative;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-logo {
          width: 65px;
          height: 65px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header-text p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0 25px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
          margin-bottom: 30px;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .menu-details-box {
          background-color: #f8fafc;
          border-left: 4px solid #4f46e5;
          padding: 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          margin-bottom: 30px;
        }
        .nutritional-grid {
          display: grid;
          grid-template-cols: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 35px;
        }
        .nutri-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          background-color: #ffffff;
        }
        .nutri-val {
          font-size: 18px;
          font-weight: 800;
          color: #4f46e5;
        }
        .nutri-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 3px;
        }
        .signature-area {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 50px;
        }
        .signature-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-stamp {
          height: 70px;
          margin-bottom: 10px;
          color: rgba(79, 70, 229, 0.45);
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 8px auto;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 50px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Servicio de Alimentación Escolar (PAE)</p>
        </div>
      </div>

      <div class="cert-title">
        Ficha Técnica y Minuta Patrón Nutricional
      </div>

      <div class="meta-card">
        <h3>Detalles de la Programación</h3>
        <div class="meta-item">
          <span>Ciclo de Menú:</span>
          <strong>Semana número ${menu.week_number}</strong>
        </div>
        <div class="meta-item">
          <span>Vigencia:</span>
          <strong>Periodo Lectivo 2026</strong>
        </div>
        <div class="meta-item">
          <span>Normatividad:</span>
          <strong>Resolución 0335 de 2021 (MEN Colombia)</strong>
        </div>
      </div>

      <h4 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Componentes y Distribución del Menú</h4>
      <div class="menu-details-box">
        ${menu.menu_details}
      </div>

      <h4 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Aporte Nutricional Promedio Estimado (Ración Mañana/Tarde)</h4>
      <div class="nutritional-grid">
        <div class="nutri-item">
          <div class="nutri-val">380 kcal</div>
          <div class="nutri-label">Energía Total</div>
        </div>
        <div class="nutri-item">
          <div class="nutri-val">12 g</div>
          <div class="nutri-label">Proteína Neta</div>
        </div>
        <div class="nutri-item">
          <div class="nutri-val">10% / 15%</div>
          <div class="nutri-label">% Aporte de Calcio diario</div>
        </div>
      </div>

      <div class="signature-area">
        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(79, 70, 229, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2;">
            <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" />
            <text x="50" y="45" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor">NUTRICIÓN PAE</text>
            <path d="M30 60 Q50 40 70 60" />
            <text x="50" y="70" font-size="5" text-anchor="middle" fill="currentColor">CALIDAD VERIFICADA</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Lic. Sandra Milena Gómez</span><br/>
          <span class="signature-role">Nutricionista Dietista - R.P. 45102</span>
        </div>

        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(16, 185, 129, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2.5;">
            <circle cx="50" cy="50" r="40" />
            <text x="50" y="45" font-size="8" font-weight="extrabold" text-anchor="middle" fill="currentColor">RECTORÍA</text>
            <path d="M 35 65 Q 48 20 65 65" />
            <text x="50" y="70" font-size="5" font-weight="bold" text-anchor="middle" fill="currentColor">APROBACIÓN CAE</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Dr. Ramírez Castillo</span><br/>
          <span class="signature-role">Rector General</span>
        </div>
      </div>

      <div class="footer">
        Colegio Anglo-Colombiano &bull; Código Criptográfico: ${hash} &bull; Validado por el CAE Institucional
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official Committee Meeting Acta.
 */
export function downloadPaeCommitteePDF(meeting: any) {
  const hash = `PAE-COM-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date(meeting.meeting_date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Acta Comité PAE - ${meeting.committee_type}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
          position: relative;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-logo {
          width: 65px;
          height: 65px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header-text p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0 25px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
          margin-bottom: 30px;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .section-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 25px 0 10px 0;
          border-left: 3px solid #4f46e5;
          padding-left: 8px;
        }
        .agenda-box, .decisions-box {
          font-size: 13px;
          color: #334155;
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .members-list {
          font-size: 12px;
          color: #334155;
          margin-bottom: 30px;
          padding-left: 20px;
        }
        .signature-area {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 50px;
        }
        .signature-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-stamp {
          height: 70px;
          margin-bottom: 10px;
          color: rgba(79, 70, 229, 0.45);
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 8px auto;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 50px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Comités de Alimentación Escolar (CAE)</p>
        </div>
      </div>

      <div class="cert-title">
        Acta Oficial de Sesión de Comité PAE
      </div>

      <div class="meta-card">
        <h3>Datos de la Sesión</h3>
        <div class="meta-item">
          <span>Tipo de Comité:</span>
          <strong>${meeting.committee_type}</strong>
        </div>
        <div class="meta-item">
          <span>Fecha y Hora:</span>
          <strong>${dateStr} a las ${meeting.meeting_time}</strong>
        </div>
        <div class="meta-item">
          <span>Lugar / Sede:</span>
          <strong>${meeting.location}</strong>
        </div>
        <div class="meta-item">
          <span>Estado del Acta:</span>
          <strong>${meeting.status}</strong>
        </div>
      </div>

      <div class="section-title">Orden del Día y Temas Tratados</div>
      <div class="agenda-box">
        ${meeting.description}
      </div>

      ${meeting.decisions ? `
      <div class="section-title">Acuerdos y Decisiones Pautados</div>
      <div class="decisions-box">
        <strong>Detalles:</strong><br/>
        ${meeting.decisions}
      </div>
      ` : ''}

      <div class="section-title">Miembros Participantes del Comité</div>
      <ul class="members-list">
        ${meeting.members?.map((m: any) => `<li><strong>${m.name}</strong> - ${m.role}</li>`).join('')}
      </ul>

      <div class="signature-area">
        <div class="signature-item">
          <div class="signature-line" style="margin-top: 50px;"></div>
          <span class="signature-name">${meeting.members?.[0]?.name || 'Dr. Ramón Ramírez'}</span><br/>
          <span class="signature-role">${meeting.members?.[0]?.role || 'Presidente del Comité'}</span>
        </div>

        <div class="signature-item">
          <div class="signature-line" style="margin-top: 50px;"></div>
          <span class="signature-name">${meeting.members?.[1]?.name || 'Lic. Diana Reyes'}</span><br/>
          <span class="signature-role">${meeting.members?.[1]?.role || 'Secretaria del Comité'}</span>
        </div>
      </div>

      <div class="footer">
        Colegio Anglo-Colombiano &bull; Código Criptográfico: ${hash} &bull; Documento verificado ante la Secretaría de Educación
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official Mesa Pública Rendición de Cuentas Acta.
 */
export function downloadPaeMesaPDF(mesa: any) {
  const hash = `PAE-MESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date(mesa.meeting_date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Acta Mesa Pública PAE - Mesa ${mesa.mesa_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
          position: relative;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-logo {
          width: 65px;
          height: 65px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header-text p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0 25px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
          margin-bottom: 30px;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .compromisos-box {
          font-size: 13.5px;
          color: #334155;
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 35px;
        }
        .signature-area {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 50px;
        }
        .signature-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-stamp {
          height: 70px;
          margin-bottom: 10px;
          color: rgba(79, 70, 229, 0.45);
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 8px auto;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 50px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Mesa Pública de Participación Ciudadana (PAE)</p>
        </div>
      </div>

      <div class="cert-title">
        Acta de Mesa Pública de Rendición de Cuentas PAE
      </div>

      <div class="meta-card">
        <h3>Detalles del Evento de Control Social</h3>
        <div class="meta-item">
          <span>Vigencia:</span>
          <strong>Año Escolar ${mesa.vigencia_year}</strong>
        </div>
        <div class="meta-item">
          <span>Evento:</span>
          <strong>Mesa Pública Número ${mesa.mesa_number}</strong>
        </div>
        <div class="meta-item">
          <span>Fecha de Realización:</span>
          <strong>${dateStr}</strong>
        </div>
        <div class="meta-item">
          <span>Asistencia Ciudadana:</span>
          <strong>${mesa.attendees_count} Ciudadanos Registrados</strong>
        </div>
      </div>

      <h4 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Compromisos y Acuerdos de Mejoramiento Pactados</h4>
      <div class="compromisos-box">
        ${mesa.compromisos}
      </div>

      <div class="signature-area">
        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(79, 70, 229, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2;">
            <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" />
            <text x="50" y="45" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor">VEEDURÍA CIUDADANA</text>
            <path d="M30 60 Q50 40 70 60" />
            <text x="50" y="70" font-size="5" text-anchor="middle" fill="currentColor">CONTROL SOCIAL OK</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Ing. Diana Reyes</span><br/>
          <span class="signature-role">Secretaría del Comité CAE</span>
        </div>

        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(16, 185, 129, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2.5;">
            <circle cx="50" cy="50" r="40" />
            <text x="50" y="45" font-size="8" font-weight="extrabold" text-anchor="middle" fill="currentColor">RECTORÍA</text>
            <path d="M 35 65 Q 48 20 65 65" />
            <text x="50" y="70" font-size="5" font-weight="bold" text-anchor="middle" fill="currentColor">APROBACIÓN MESA</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Dr. Ramón Ramírez</span><br/>
          <span class="signature-role">Rector General</span>
        </div>
      </div>

      <div class="footer">
        Colegio Anglo-Colombiano &bull; Código Criptográfico: ${hash} &bull; Documento Generado Electrónicamente &bull; Ley 2046
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official Local Agricultural Purchase Invoice Receipt.
 */
export function downloadPaePurchasePDF(purchase: any) {
  const hash = `PAE-PUR-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date(purchase.purchase_date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const valueFormatted = purchase.purchase_value.toLocaleString('co-CO', { minimumFractionDigits: 2 });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Comprobante Compra Local PAE - ${purchase.supplier_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-logo {
          width: 65px;
          height: 65px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header-text p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0 25px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
          margin-bottom: 30px;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .purchase-body {
          font-size: 13.5px;
          text-align: justify;
          color: #334155;
          margin-bottom: 35px;
        }
        .highlight {
          color: #0f172a;
          font-weight: 800;
        }
        .signature-area {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 50px;
        }
        .signature-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-stamp {
          height: 70px;
          margin-bottom: 10px;
          color: rgba(79, 70, 229, 0.45);
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 8px auto;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 50px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Oficina del Programa PAE y Control Contable</p>
        </div>
      </div>

      <div class="cert-title">
        Comprobante de Adquisición Agrícola Local (Ley 2046)
      </div>

      <div class="meta-card">
        <h3>Detalles de la Transacción</h3>
        <div class="meta-item">
          <span>Proveedor Local:</span>
          <strong>${purchase.supplier_name}</strong>
        </div>
        <div class="meta-item">
          <span>Municipio de Origen:</span>
          <strong>${purchase.municipality}</strong>
        </div>
        <div class="meta-item">
          <span>Producto Adquirido:</span>
          <strong>${purchase.product_name}</strong>
        </div>
        <div class="meta-item">
          <span>Fecha de Adquisición:</span>
          <strong>${dateStr}</strong>
        </div>
        <div class="meta-item">
          <span>Valor Desembolsado:</span>
          <strong class="highlight">$${valueFormatted} COP</strong>
        </div>
      </div>

      <div class="purchase-body">
        <p>
          Se certifica formalmente la adquisición de suministros agrícolas detallados al pequeño productor regional <span class="highlight">${purchase.supplier_name}</span> del municipio de <span class="highlight">${purchase.municipality}</span>, en concordancia con los lineamientos de compras públicas locales dictados por la <span class="highlight">Ley 2046 de 2020</span> de la República de Colombia.
        </p>
        <p>
          Este comprobante sirve de soporte fiscal y contable que acredita el cumplimiento del porcentaje mínimo legal del 20% de compras agrícolas directas a productores de la región para el Programa de Alimentación Escolar (PAE) de nuestra institución.
        </p>
      </div>

      <div class="signature-area">
        <div class="signature-item">
          <svg class="signature-stamp" viewBox="0 0 100 100" style="color: rgba(79, 70, 229, 0.45); margin: 0 auto; fill: none; stroke: currentColor; stroke-width: 2;">
            <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" />
            <text x="50" y="45" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor">CONTROL LOCAL</text>
            <path d="M30 60 Q50 40 70 60" />
            <text x="50" y="70" font-size="5" text-anchor="middle" fill="currentColor">LEY 2046 REGISTRO OK</text>
          </svg>
          <div class="signature-line"></div>
          <span class="signature-name">Dra. Elena Toro</span><br/>
          <span class="signature-role">Dirección de Compras e Interventoría</span>
        </div>

        <div class="signature-item">
          <div class="signature-line" style="margin-top: 80px;"></div>
          <span class="signature-name">${purchase.supplier_name}</span><br/>
          <span class="signature-role">Firma del Proveedor / Productor</span>
        </div>
      </div>

      <div class="footer">
        Colegio Anglo-Colombiano &bull; Código Criptográfico: ${hash} &bull; Registro Transparencia PAE
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generates and triggers browser print of an official Visit Audit Acta.
 */
export function downloadPaeVisitPDF(visit: any) {
  const hash = `PAE-VST-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date(visit.control_date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Acta de Interventoría PAE - ${visit.inspector_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 50px 70px;
          background-color: #ffffff;
          line-height: 1.8;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-logo {
          width: 65px;
          height: 65px;
          color: #4f46e5;
        }
        .header-text {
          text-align: right;
        }
        .header-text h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          text-transform: uppercase;
        }
        .header-text p {
          margin: 4px 0 0 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cert-title {
          text-align: center;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 40px 0 25px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-grid {
          display: grid;
          grid-template-cols: 2fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .meta-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          background-color: #f8fafc;
        }
        .meta-card h3 {
          margin: 0 0 10px 0;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .meta-item span {
          color: #64748b;
        }
        .meta-item strong {
          color: #0f172a;
        }
        .score-card {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #ffffff;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: none;
        }
        .score-val {
          font-size: 32px;
          font-weight: 950;
          color: #10b981;
          margin: 5px 0;
        }
        .score-card h3 {
          color: #94a3b8;
        }
        .findings-box {
          font-size: 13px;
          color: #334155;
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }
        .signature-area {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 50px;
          margin-top: 50px;
        }
        .signature-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #94a3b8;
          margin: 0 auto 8px auto;
        }
        .signature-name {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .signature-role {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 50px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
        <div class="header-text">
          <h1>Colegio Anglo-Colombiano</h1>
          <p>Vigilancia y Supervisión Sanitaria PAE</p>
        </div>
      </div>

      <div class="cert-title">
        Acta de Visita Técnica e Inspección Externa PAE
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <h3>Datos de la Auditoría</h3>
          <div class="meta-item">
            <span>Inspector / Ente:</span>
            <strong>${visit.inspector_name}</strong>
          </div>
          <div class="meta-item">
            <span>Fecha de Visita:</span>
            <strong>${dateStr}</strong>
          </div>
          <div class="meta-item">
            <span>Tipo de Control:</span>
            <strong>${visit.control_type}</strong>
          </div>
        </div>

        <div class="meta-card score-card">
          <h3>Calificación Concepto</h3>
          <div class="score-val">${visit.score_percentage}%</div>
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 12px; color: #10b981;">
            ${visit.score_percentage >= 90 ? 'Concepto Favorable' : 'Favorable con Requerimientos'}
          </span>
        </div>
      </div>

      <h4 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Hallazgos y Observaciones Técnico-Sanitarias</h4>
      <div class="findings-box">
        ${visit.findings}
        ${visit.action_plan ? `<br/><br/><strong>Plan de Acción Requerido:</strong><br/>${visit.action_plan}` : ''}
      </div>

      <div class="signature-area">
        <div class="signature-item">
          <div class="signature-line" style="margin-top: 50px;"></div>
          <span class="signature-name">${visit.inspector_name}</span><br/>
          <span class="signature-role">Inspector Técnico Auditor</span>
        </div>

        <div class="signature-item">
          <div class="signature-line" style="margin-top: 50px;"></div>
          <span class="signature-name">Dr. Ramón Ramírez</span><br/>
          <span class="signature-role">Rector General</span>
        </div>
      </div>

      <div class="footer">
        Colegio Anglo-Colombiano &bull; Código Criptográfico: ${hash} &bull; Radicado ante la Entidad Territorial Certificada (ETC)
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

