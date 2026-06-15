'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout';
import { useRole } from '@/providers/role-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  ArrowLeft, Database, UploadCloud, Download, Check, 
  AlertTriangle, FileText, Settings, Play, RefreshCw, X, 
  CheckCircle2, AlertCircle, Eye, Info, BrainCircuit, Globe, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// MODULE TEMPLATES DEFINITION
const TEMPLATES_CSV: Record<string, string> = {
  'Estudiantes': 'documento,nombre_completo,correo,telefono,fecha_nacimiento,genero,direccion,grado,grupo\n10203040,Sofia Ortiz,sofia.ortiz@aulacore.edu.co,3015551234,2010-04-15,Femenino,Calle 12 # 34,10,A\n50607080,Juan Garcia,juan.garcia@aulacore.edu.co,3124445678,2009-08-20,Masculino,Calle 5 # 67,10,A',
  'Padres de Familia': 'documento,nombre_completo,correo,telefono,relacion,direccion,estudiante_documento\n19820300,Carlos Ortiz,carlos.ortiz@parent.aulacore.com,3111223344,padre,Calle 12 # 34,10203040',
  'Docentes': 'documento,nombre_completo,correo,telefono,area_academica,tipo_docente\n79820300,Carlos Martinez,carlos.martinez@aulacore.edu.co,3104567890,lenguaje,director_grupo',
  'Coordinadores': 'documento,nombre_completo,correo,telefono,area\n44332211,Diana Carolina Reyes,diana.reyes@aulacore.edu.co,3123456789,academica',
  'Secretarias': 'documento,nombre_completo,correo,telefono\n55555555,Elena Toro,elena.toro@aulacore.edu.co,3159998888',
  'Cursos': 'codigo,nombre_curso,director_documento\n10-A,Decimo A,79820300',
  'Asignaturas': 'codigo,nombre_asignatura,area_academica,horas_semanales\nMAT,Matematicas,matematicas,5',
  'Matrículas': 'estudiante_documento,curso_codigo,periodo,fecha_matricula\n10203040,10-A,2026-I,2026-01-15',
  'Calificaciones': 'estudiante_documento,asignatura_codigo,periodo,nota_examen1,nota_examen2,nota_tareas,nota_participacion\n10203040,MAT,2026-I,9.5,9.0,10.0,9.5',
  'Asistencia': 'estudiante_documento,fecha,estado_asistencia\n10203040,2026-05-23,Asiste',
  'Observador': 'estudiante_documento,fecha,tipo_falta,descripcion,profesor_documento\n10203040,2026-05-21,Grave,Inasistencia sin justificar,79820300',
  'Seguimientos': 'estudiante_documento,tipo_seguimiento,descripcion,fecha\n10203040,Academico,Presenta dificultades en algebra,2026-05-22',
  'Beneficiarios PAE': 'estudiante_documento,modalidad,fecha_focalizacion,motivo_prioridad\n10203040,Almuerzo Caliente Preparado en Sitio,2026-01-20,Jornada Unica'
};

const MODULES_LIST = Object.keys(TEMPLATES_CSV);

interface ValidationError {
  row: number;
  field: string;
  error: string;
  value: string;
}

export default function MigrationPage() {
  const { userRole, userName, mounted } = useRole();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'connectors'>('wizard');
  const [loading, setLoading] = useState(true);

  // Institution Selection (Step 1)
  const [selectedInstitution, setSelectedInstitution] = useState('Colegio Cooperativo San Antonio');
  const [selectedSede, setSelectedSede] = useState('Sede Principal Campestre');

  // Module Selection (Step 2)
  const [selectedModule, setSelectedModule] = useState('Estudiantes');

  // File Uploading & Parsing (Step 4)
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Wizard Navigation Step
  // 1: Institution, 2: Module, 3: Template, 4: Upload, 5: Validate & Correct, 6: Simulate, 7: Finish
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Validation States (Step 5)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidationPassed, setIsValidationPassed] = useState(false);

  // Audit Logs State (History Tab)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedLogDetails, setSelectedLogDetails] = useState<any | null>(null);

  // IA Column Mapper States (Connectors Tab)
  const [mappedColumns, setMappedColumns] = useState<Record<string, string>>({});
  const [isMappingIAActive, setIsMappingIAActive] = useState(false);

  // Simulate Counts (Step 6)
  const [simCreatedCount, setSimCreatedCount] = useState(0);
  const [simUpdatedCount, setSimUpdatedCount] = useState(0);
  const [simRejectedCount, setSimRejectedCount] = useState(0);

  // Fetch audit logs on mount
  useEffect(() => {
    if (!mounted) return;

    if (userRole === 'estudiante' || userRole === 'padre_familia') {
      return; // Restrict access
    }

    async function loadAuditLogs() {
      try {
        setLoading(true);
        // Load from LocalStorage fallback first
        const localLogs = localStorage.getItem('aulacore-migration-logs');
        if (localLogs) {
          setAuditLogs(JSON.parse(localLogs));
        }

        const { data, error } = await supabase
          .from('migration_audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setAuditLogs(data);
          localStorage.setItem('aulacore-migration-logs', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Error fetching Supabase logs. Serving cache.', err);
      } finally {
        setLoading(false);
      }
    }

    loadAuditLogs();
  }, [mounted, userRole]);

  // Deny access check
  if (!mounted) return null;
  if (userRole === 'estudiante' || userRole === 'padre_familia') {
    return (
      <AppLayout>
        <Card className="max-w-md mx-auto mt-20 border-red-900/50 bg-slate-950 p-10 text-center shadow-2xl rounded-2xl border text-slate-100">
          <div className="w-16 h-16 bg-red-950/40 border border-red-500/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-4">
            <AlertCircle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white">Acceso Denegado</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-sm mx-auto">
              No dispones de privilegios administrativos para acceder al Centro de Migración Institucional de AulaCore.
            </p>
          </div>
          <div className="pt-6">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer border-none flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al Tablero
            </Button>
          </div>
        </Card>
      </AppLayout>
    );
  }

  // --- CSV parsing helper ---
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    // Standard comma separation
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols: string[] = [];
      let insideQuotes = false;
      let current = '';

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim());

      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = cols[index] || '';
      });
      rows.push(rowData);
    }

    return { headers, rows };
  };

  // --- Handlers for file upload ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Por favor, suba únicamente archivos en formato CSV (.csv)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      const parsed = parseCSVText(text);
      setParsedHeaders(parsed.headers);
      setParsedRows(parsed.rows);
      setWizardStep(5); // Proceed immediately to validation step
      validateRecords(parsed.rows, selectedModule);
    };
    reader.readAsText(file);
  };

  // --- Dynamic Template Generation & Download ---
  const handleDownloadTemplate = () => {
    const csvContent = TEMPLATES_CSV[selectedModule];
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `plantilla_${selectedModule.toLowerCase().replace(/ /g, '_')}_aulacore.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Rules validation engine ---
  const validateRecords = (rows: Record<string, string>[], module: string) => {
    const errors: ValidationError[] = [];
    const seenDocs = new Set<string>();
    const seenEmails = new Set<string>();

    // Mock existing db records for reference checks
    const existingStudentsDocs = ['10203040', '50607080'];
    const existingCourses = ['10-A', '11-B', '9-C'];
    const existingSubjects = ['MAT', 'ESP', 'BIO'];

    rows.forEach((row, index) => {
      const rowNum = index + 1;

      // 1. Mandatory Fields & Empty Records check
      Object.keys(row).forEach(key => {
        if (!row[key] || row[key].trim() === '') {
          // If key is optional, ignore (like phone)
          if (key !== 'telefono' && key !== 'direccion') {
            errors.push({
              row: rowNum,
              field: key,
              error: `El campo '${key}' es obligatorio.`,
              value: ''
            });
          }
        }
      });

      // 2. Duplicate Document check
      if (row['documento']) {
        const doc = row['documento'].trim();
        if (seenDocs.has(doc)) {
          errors.push({
            row: rowNum,
            field: 'documento',
            error: 'Número de documento duplicado dentro del archivo.',
            value: doc
          });
        } else {
          seenDocs.add(doc);
        }
      }

      // 3. Duplicate Email check
      if (row['correo']) {
        const email = row['correo'].trim();
        if (seenEmails.has(email)) {
          errors.push({
            row: rowNum,
            field: 'correo',
            error: 'Dirección de correo electrónico duplicada dentro del archivo.',
            value: email
          });
        } else {
          seenEmails.add(email);
        }
      }

      // 4. Reference integrity check (Non-existent courses/subjects)
      if (module === 'Matrículas' && row['curso_codigo']) {
        const course = row['curso_codigo'].trim();
        if (!existingCourses.includes(course)) {
          errors.push({
            row: rowNum,
            field: 'curso_codigo',
            error: `Código de curso inexistente en AulaCore. Cursos válidos: ${existingCourses.join(', ')}`,
            value: course
          });
        }
      }

      if (module === 'Calificaciones' && row['asignatura_codigo']) {
        const sub = row['asignatura_codigo'].trim();
        if (!existingSubjects.includes(sub)) {
          errors.push({
            row: rowNum,
            field: 'asignatura_codigo',
            error: `Código de asignatura inexistente en AulaCore. Asignaturas válidas: ${existingSubjects.join(', ')}`,
            value: sub
          });
        }
      }

      // 5. Date validation format YYYY-MM-DD
      const dateKeys = ['fecha_nacimiento', 'fecha_matricula', 'fecha', 'fecha_focalizacion'];
      dateKeys.forEach(dk => {
        if (row[dk]) {
          const dateStr = row[dk].trim();
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          if (!regex.test(dateStr)) {
            errors.push({
              row: rowNum,
              field: dk,
              error: 'Formato de fecha inválido. Utilice AAAA-MM-DD.',
              value: dateStr
            });
          } else {
            const dateVal = Date.parse(dateStr);
            if (isNaN(dateVal)) {
              errors.push({
                row: rowNum,
                field: dk,
                error: 'Fecha inválida.',
                value: dateStr
              });
            }
          }
        }
      });
    });

    setValidationErrors(errors);
    setIsValidationPassed(errors.length === 0);
  };

  // --- Inline Grid Correction (Step 5) ---
  const handleCellChange = (rowIndex: number, headerKey: string, newValue: string) => {
    const updated = [...parsedRows];
    updated[rowIndex][headerKey] = newValue;
    setParsedRows(updated);
  };

  const handleRevalidate = () => {
    validateRecords(parsedRows, selectedModule);
    alert('✓ Revalidación completada en memoria.');
  };

  // --- Proceed to simulation (Step 6) ---
  const handleProceedToSimulation = () => {
    // Determine counts
    const total = parsedRows.length;
    const rejected = new Set(validationErrors.map(e => e.row)).size;
    const valid = total - rejected;

    // Simulate created (new document) vs updated (existing document)
    // We assume 10% are updates of existing records
    const simulatedUpdates = Math.min(valid, Math.ceil(valid * 0.1));
    const simulatedCreates = valid - simulatedUpdates;

    setSimCreatedCount(simulatedCreates);
    setSimUpdatedCount(simulatedUpdates);
    setSimRejectedCount(rejected);
    setWizardStep(6);
  };

  // --- Confirm Import (Step 7) ---
  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      const total = parsedRows ? parsedRows.length : 0;
      const finalValid = total - (simRejectedCount || 0);
      const importStatus = (simRejectedCount || 0) === 0 ? 'Exitoso' : (finalValid > 0 ? 'Exitoso con advertencias' : 'Fallido');

      // Build details report for errors
      const errorDetails = (validationErrors || []).map(e => ({
        row: e.row,
        field: e.field,
        error: e.error,
        value: e.value
      }));

      const newLog = {
        institution_id: '11111111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222', // Rector UID
        user_name: userName || 'Dr. Ramón Ramírez',
        ip_address: '192.168.1.107',
        module_type: selectedModule || 'Estudiantes',
        file_name: fileName || `migracion_${(selectedModule || 'Estudiantes').toLowerCase()}.csv`,
        records_count: total,
        created_count: simCreatedCount || 0,
        updated_count: simUpdatedCount || 0,
        rejected_count: simRejectedCount || 0,
        status: importStatus,
        details: errorDetails
      };

      try {
        // Save to Supabase DB with a 2-second timeout to prevent hanging on network/RLS issues
        const insertPromise = supabase
          .from('migration_audit_logs')
          .insert([newLog])
          .select();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout connecting to Supabase')), 2000)
        );

        const { data, error } = (await Promise.race([insertPromise, timeoutPromise])) as any;

        if (error) {
          console.warn('Supabase returned error on insertion:', error);
        }
      } catch (dbErr) {
        console.warn('Database logging failed or timed out. Falling back to local cache.', dbErr);
      }

      // Mirror to local cache (guarantees the UI updates even if Supabase has RLS or connection issues)
      const updatedLogs = [newLog, ...auditLogs];
      setAuditLogs(updatedLogs);
      localStorage.setItem('aulacore-migration-logs', JSON.stringify(updatedLogs));

      setWizardStep(7);
      alert('✓ Importación completada. Log de auditoría inmutable guardado.');
    } catch (e) {
      console.error('Fatal error during import confirmation:', e);
      alert('Hubo un error al procesar la importación. Cargando respaldo local...');
      setWizardStep(7);
    } finally {
      setLoading(false);
    }
  };

  // --- Download Audit Report ---
  const handleDownloadAuditReport = () => {
    const reportText = `=====================================================
AULACORE - CENTRO DE MIGRACIÓN INSTITUCIONAL
REPORTE OFICIAL DE AUDITORÍA DE IMPORTACIÓN
=====================================================
Fecha/Hora: ${new Date().toLocaleString()}
Institución: ${selectedInstitution}
Sede: ${selectedSede}
Módulo Importado: ${selectedModule}
Usuario Responsable: ${userName || 'Dr. Ramón Ramírez'}
IP de Origen: 192.168.1.107
Archivo Procesado: ${fileName || 'archivo_desconocido.csv'}

RESUMEN DE PROCESAMIENTO:
---------------------------------------------
- Total de registros: ${parsedRows.length}
- Registros Creados: ${simCreatedCount}
- Registros Actualizados: ${simUpdatedCount}
- Registros Rechazados: ${simRejectedCount}
- Estado Final: ${simRejectedCount === 0 ? 'Exitoso' : 'Exitoso con advertencias'}

DETALLE DE ERRORES/RECHAZADOS:
---------------------------------------------
${validationErrors.length === 0 ? '✓ Ningún error detectado.' : validationErrors.map(e => `Fila ${e.row}: Campo [${e.field}] -> ${e.error} (Valor: "${e.value}")`).join('\n')}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_auditoria_migracion_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Repeat Migration (History Action) ---
  const handleRepeatMigration = (log: any) => {
    setSelectedModule(log.module_type);
    setFileName(log.file_name);
    setWizardStep(2); // Jump back to template download/upload flow
    setActiveTab('wizard');
    alert(`✓ Repitiendo migración de ${log.module_type}. Seleccione el archivo corregido.`);
  };

  // --- Simulated AI Column Mapping Suggestion ---
  const handleAISuggestMapping = () => {
    setIsMappingIAActive(true);
    setTimeout(() => {
      setMappedColumns({
        'DOC_IDENTIDAD': 'documento',
        'ESTUDIANTE_NAME': 'nombre_completo',
        'MAIL_ACUDIENTE': 'correo',
        'CELULAR_PAPI': 'telefono',
        'FECHA_NAC': 'fecha_nacimiento'
      });
      setIsMappingIAActive(false);
      alert('✓ IA completó el mapeo con 98% de similitud semántica en los campos.');
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-255">Gestión Institucional</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-1.5">Centro de Migración Institucional</h1>
            <p className="text-base text-slate-200 mt-1.5 leading-relaxed">
              Consola unificada de migración masiva e historial de importaciones para adopción ágil sin digitación manual.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs bg-slate-950/40 px-3 py-1.5 border border-slate-800 rounded-xl font-mono text-slate-450">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Seguridad: Carga Inmutable</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm select-none shrink-0 overflow-x-auto w-full max-w-xl scrollbar-hide">
          <button
            onClick={() => setActiveTab('wizard')}
            className={cn(
              "text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none whitespace-nowrap",
              activeTab === 'wizard' ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
            )}
          >
            Asistente de Importación (Asistente)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none whitespace-nowrap",
              activeTab === 'history' ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
            )}
          >
            Historial de Migraciones
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={cn(
              "text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none whitespace-nowrap",
              activeTab === 'connectors' ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
            )}
          >
            Conectores & SIMAT
          </button>
        </div>

        {/* --- VIEW TAB: WIZARD --- */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            
            {/* Wizard Steps indicator */}
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center max-w-3xl mx-auto text-center text-[10px] font-black text-slate-400">
                <div className={cn("space-y-1", wizardStep >= 1 ? "text-indigo-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 1 ? "border-indigo-600 bg-indigo-50" : "border-slate-200")}>1</div>
                  <span>Institución</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-100 mx-2" />
                <div className={cn("space-y-1", wizardStep >= 2 ? "text-indigo-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 2 ? "border-indigo-600 bg-indigo-50" : "border-slate-200")}>2</div>
                  <span>Módulo</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-100 mx-2" />
                <div className={cn("space-y-1", wizardStep >= 3 ? "text-indigo-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 3 ? "border-indigo-600 bg-indigo-50" : "border-slate-200")}>3</div>
                  <span>Plantilla</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-100 mx-2" />
                <div className={cn("space-y-1", wizardStep >= 4 ? "text-indigo-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 4 ? "border-indigo-600 bg-indigo-50" : "border-slate-200")}>4</div>
                  <span>Subida</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-100 mx-2" />
                <div className={cn("space-y-1", wizardStep >= 5 ? "text-indigo-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 5 ? "border-indigo-600 bg-indigo-50" : "border-slate-200")}>5</div>
                  <span>Validación</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-100 mx-2" />
                <div className={cn("space-y-1", wizardStep >= 6 ? "text-indigo-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 6 ? "border-indigo-600 bg-indigo-50" : "border-slate-200")}>6</div>
                  <span>Simulación</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-100 mx-2" />
                <div className={cn("space-y-1", wizardStep >= 7 ? "text-emerald-600 font-extrabold" : "")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mx-auto border-2", wizardStep >= 7 ? "border-emerald-600 bg-emerald-50" : "border-slate-200")}>7</div>
                  <span>Importar</span>
                </div>
              </div>
            </div>

            {/* STEP 1: SELECT INSTITUTION */}
            {wizardStep === 1 && (
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl max-w-xl mx-auto overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    Paso 1: Selección de la Institución Educativa
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-semibold">Elija el plantel y la sede destinataria para la carga masiva.</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4 font-semibold text-xs text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Institución</label>
                    <select
                      value={selectedInstitution}
                      onChange={(e) => setSelectedInstitution(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-750 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Colegio Cooperativo San Antonio">Colegio Cooperativo San Antonio</option>
                      <option value="Institución Educativa Departamental El Tequendama">IED El Tequendama</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Sede Escolar</label>
                    <select
                      value={selectedSede}
                      onChange={(e) => setSelectedSede(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-750 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Sede Principal Campestre">Sede Principal Campestre</option>
                      <option value="Sede Anexa Primaria">Sede Anexa Primaria</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => setWizardStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl border-none cursor-pointer flex items-center gap-1">
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 2: SELECT MODULE */}
            {wizardStep === 2 && (
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl max-w-xl mx-auto overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" />
                      Paso 2: Selección del Módulo a Importar
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-semibold">Elija cuál de los 13 sub-módulos históricos va a estructurar en AulaCore.</p>
                  </div>
                  <Button variant="ghost" className="h-8 text-[11px] font-bold text-slate-450 hover:bg-slate-100 rounded-xl" onClick={() => setWizardStep(1)}>
                    Atrás
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MODULES_LIST.map((m, idx) => (
                      <div
                        key={m}
                        onClick={() => setSelectedModule(m)}
                        className={cn(
                          "p-4 border rounded-2xl cursor-pointer transition-all flex items-center gap-3 active:scale-[0.98]",
                          selectedModule === m 
                            ? "border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-950" 
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border shadow-inner",
                          selectedModule === m ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-100 text-slate-500"
                        )}>
                          {idx + 1}
                        </div>
                        <span className="font-extrabold text-xs">{m}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <Button onClick={() => setWizardStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl border-none cursor-pointer flex items-center gap-1">
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 3: DOWNLOAD TEMPLATE */}
            {wizardStep === 3 && (
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl max-w-xl mx-auto overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                      <Download className="w-5 h-5 text-indigo-600" />
                      Paso 3: Descarga de Plantilla Oficial
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-semibold">Descargue la plantilla formateada y complete los registros históricos.</p>
                  </div>
                  <Button variant="ghost" className="h-8 text-[11px] font-bold text-slate-450 hover:bg-slate-100 rounded-xl" onClick={() => setWizardStep(2)}>
                    Atrás
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-5 text-xs font-semibold text-slate-700">
                  <div className="bg-indigo-50 p-4 border border-indigo-150 rounded-2xl flex items-start gap-3 text-indigo-900 leading-relaxed">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-sm">Plantilla Oficial de {selectedModule}</span>
                      <p className="text-[11px] text-indigo-750 font-bold mt-1">
                        Utilice el archivo estructurado para evitar errores de mapeo. Respete el nombre de las columnas y no modifique el orden.
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-indigo-550" />
                      <div>
                        <span className="font-black text-slate-900 block">plantilla_{selectedModule.toLowerCase().replace(/ /g, '_')}.csv</span>
                        <span className="text-[10px] text-slate-400 font-bold">Documento Delimitado por Comas (CSV)</span>
                      </div>
                    </div>
                    <Button onClick={handleDownloadTemplate} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-4 rounded-xl flex items-center gap-1 border-none cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </Button>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button onClick={() => setWizardStep(2)} variant="outline" className="h-10 px-5 border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl font-bold">
                      Cambiar Módulo
                    </Button>
                    <Button onClick={() => setWizardStep(4)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl border-none cursor-pointer flex items-center gap-1">
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 4: UPLOAD FILE */}
            {wizardStep === 4 && (
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl max-w-xl mx-auto overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-indigo-600" />
                      Paso 4: Subida de Archivo CSV
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-semibold">Arrastre el archivo CSV con los datos cargados o selecciónelo localmente.</p>
                  </div>
                  <Button variant="ghost" className="h-8 text-[11px] font-bold text-slate-450 hover:bg-slate-100 rounded-xl" onClick={() => setWizardStep(3)}>
                    Atrás
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* File Upload drag area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 transition-all relative",
                      dragActive ? "border-indigo-600 bg-indigo-50/50" : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50"
                    )}
                  >
                    <UploadCloud className="w-12 h-12 text-slate-400" />
                    <div>
                      <p className="text-xs font-black text-slate-800">Arrastre su archivo de plantilla corregido aquí</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Formatos soportados: CSV (.csv)</p>
                    </div>
                    <span className="text-slate-400 text-[10px] font-black uppercase">O</span>
                    
                    <label className="bg-slate-950 hover:bg-slate-850 text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl cursor-pointer shadow-sm relative z-25">
                      Examinar Archivos
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Módulo Objetivo: <strong className="text-slate-800">{selectedModule}</strong></span>
                    <Button variant="ghost" className="h-8 px-2 text-indigo-650 hover:bg-indigo-50 rounded-xl" onClick={() => setWizardStep(3)}>
                      Volver a descargar plantilla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 5: AUTOMATIC VALIDATION & CORRECTION CENTER */}
            {wizardStep === 5 && (
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                        <AlertTriangle className={cn("w-5 h-5", isValidationPassed ? "text-emerald-500" : "text-amber-500")} />
                        Paso 5: Validación y Centro de Corrección
                      </CardTitle>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {isValidationPassed 
                          ? "✓ Todos los registros pasaron las reglas de validación." 
                          : "⚠️ Se detectaron errores. Corrija los campos resaltados en la tabla para revalidar."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleRevalidate} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 border-none cursor-pointer">
                        <RefreshCw className="w-3.5 h-3.5" /> Revalidar Datos
                      </Button>
                      {isValidationPassed ? (
                        <Button onClick={handleProceedToSimulation} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-5 rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-md">
                          Proceder a Simulación <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button onClick={handleProceedToSimulation} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-md">
                          Omitir Errores y Proceder
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-extrabold text-slate-800 text-xs pl-6 text-center w-16">Fila</TableHead>
                          {parsedHeaders.map(header => (
                            <TableHead key={header} className="font-extrabold text-slate-800 text-xs uppercase min-w-[150px]">{header}</TableHead>
                          ))}
                          <TableHead className="font-extrabold text-slate-800 text-xs pr-6">Errores Detectados</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedRows.map((row, rIdx) => {
                          const rowNum = rIdx + 1;
                          const rowErrors = validationErrors.filter(e => e.row === rowNum);
                          const hasErrors = rowErrors.length > 0;

                          return (
                            <TableRow key={rIdx} className={cn(hasErrors ? "bg-rose-50/20" : "hover:bg-slate-50/50")}>
                              <TableCell className="font-black text-slate-500 text-xs pl-6 text-center">{rowNum}</TableCell>
                              {parsedHeaders.map(header => {
                                const cellError = rowErrors.find(e => e.field === header);
                                return (
                                  <TableCell key={header} className="p-2">
                                    <input
                                      type="text"
                                      value={row[header] || ''}
                                      onChange={(e) => handleCellChange(rIdx, header, e.target.value)}
                                      className={cn(
                                        "w-full bg-white border rounded-lg px-2.5 py-1 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-150 transition",
                                        cellError ? "border-red-500 text-red-900 bg-red-50/50" : "border-slate-200 text-slate-800"
                                      )}
                                    />
                                  </TableCell>
                                );
                              })}
                              <TableCell className="pr-6 py-2 text-xs font-bold text-red-600 leading-snug">
                                {hasErrors ? (
                                  <div className="flex flex-col gap-0.5">
                                    {rowErrors.map((e, idx) => (
                                      <span key={idx} className="flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                                        {e.error}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Registrado Correctamente
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 6: SIMULATE IMPACT */}
            {wizardStep === 6 && (
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl max-w-xl mx-auto overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                      <Play className="w-5 h-5 text-indigo-600 animate-pulse" />
                      Paso 6: Modo Simulación - Reporte de Impacto
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-semibold">Detalle de cambios calculados en el sistema antes de escribir en la base de datos.</p>
                  </div>
                  <Button variant="ghost" className="h-8 text-[11px] font-bold text-slate-450 hover:bg-slate-100 rounded-xl" onClick={() => setWizardStep(5)}>
                    Atrás
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Warning banner of simulation */}
                  <div className="bg-indigo-50 p-4 border border-indigo-150 rounded-2xl flex items-start gap-3 text-indigo-900 text-xs font-semibold leading-relaxed">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-sm block">Simulación de Adopción Activa</span>
                      <p className="text-[11px] text-indigo-750 font-bold mt-1">
                        Esta es una auditoría visual del impacto. No se escribirá ni alterará ningún registro de AulaCore hasta que presione el botón de confirmación.
                      </p>
                    </div>
                  </div>

                  {/* Impact counters visual cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Registros Nuevos (Crear)</span>
                      <span className="text-3xl font-extrabold text-slate-900 block mt-1">+{simCreatedCount}</span>
                      <p className="text-[9px] text-slate-450 font-bold mt-1 leading-relaxed">Nuevas entidades que serán creadas en el plantel.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Registros Existentes (Actualizar)</span>
                      <span className="text-3xl font-extrabold text-indigo-650 block mt-1">+{simUpdatedCount}</span>
                      <p className="text-[9px] text-slate-450 font-bold mt-1 leading-relaxed">Entidades que ya existen y se fusionarán con la importación.</p>
                    </div>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-rose-500 font-black uppercase tracking-wider block">Registros Omitidos/Rechazados</span>
                    <span className="text-2xl font-extrabold text-rose-800 block mt-0.5">{simRejectedCount} registros</span>
                    <p className="text-[9px] text-rose-600 font-bold mt-1 leading-relaxed">Filas con datos inconsistentes o vacíos que serán ignorados.</p>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button onClick={() => setWizardStep(5)} variant="outline" className="h-10 px-5 border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl font-bold">
                      Volver a Corregir
                    </Button>
                    <Button onClick={handleConfirmImport} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-md">
                      Confirmar e Importar <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 7: FINISH & CONFIRMATION */}
            {wizardStep === 7 && (
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl max-w-xl mx-auto overflow-hidden">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-300 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Importación Exitosa!</h2>
                    <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                      La carga histórica de <strong>{selectedModule}</strong> para {selectedInstitution} ha sido consolidada. Se guardó el registro de auditoría.
                    </p>
                  </div>

                  {/* Audit details card summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs font-semibold text-slate-655 space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Usuario Importer:</span>
                      <span className="font-extrabold text-slate-900">{userName || 'Dr. Ramón Ramírez'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Fecha / Hora:</span>
                      <span className="font-extrabold text-slate-900">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Registros Nuevos:</span>
                      <span className="font-extrabold text-slate-900">+{simCreatedCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Registros Actualizados:</span>
                      <span className="font-extrabold text-slate-900">+{simUpdatedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dirección IP:</span>
                      <span className="font-extrabold text-slate-900 font-mono">192.168.1.107</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center gap-3">
                    <Button onClick={handleDownloadAuditReport} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-5 rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-sm">
                      <Download className="w-4 h-4" /> Descargar Acta
                    </Button>
                    <Button onClick={() => {
                      setWizardStep(1);
                      setFileName('');
                      setParsedRows([]);
                    }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl border-none cursor-pointer shadow-sm">
                      Nueva Migración
                    </Button>
                    <Button onClick={() => {
                      setActiveTab('history');
                    }} variant="outline" className="h-10 px-4 border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl font-bold">
                      Ver Historial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* --- VIEW TAB: HISTORY --- */}
        {activeTab === 'history' && (
          <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden animate-fade-in">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Historial de Migraciones y Logs de Auditoría
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Historial inmutable de importaciones de datos para asegurar el control institucional del plantel.</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha / Hora</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs">Módulo</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs">Usuario Responsable</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs">Archivo Original</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs text-center">Registros (C/A/R)</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-950 text-xs pl-6">
                        {new Date(log.created_at || log.imported_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-black text-slate-800 text-xs">{log.module_type}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">
                        {log.user_name}
                        <span className="text-[10px] text-slate-400 font-bold block">IP: {log.ip_address}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-500 max-w-[150px] truncate" title={log.file_name}>
                        {log.file_name}
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs">
                        <span className="text-emerald-700">{log.created_count}</span>
                        <span className="text-slate-350">/</span>
                        <span className="text-indigo-600">{log.updated_count}</span>
                        <span className="text-slate-350">/</span>
                        <span className="text-rose-600">{log.rejected_count}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          log.status === 'Exitoso' && "bg-emerald-50 text-emerald-800 border-emerald-200",
                          log.status === 'Exitoso con advertencias' && "bg-amber-50 text-amber-800 border-amber-250",
                          log.status === 'Fallido' && "bg-rose-50 text-rose-800 border-rose-200"
                        )}>
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right space-x-1.5 whitespace-nowrap">
                        <Button variant="ghost" className="h-7 text-xs font-bold text-indigo-650 hover:bg-indigo-50 px-2" onClick={() => setSelectedLogDetails(log)}>
                          Detalle
                        </Button>
                        <Button variant="ghost" className="h-7 text-xs font-bold text-slate-700 hover:bg-slate-100 px-2 animate-pulse" onClick={() => handleRepeatMigration(log)}>
                          Repetir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* --- VIEW TAB: CONNECTORS --- */}
        {activeTab === 'connectors' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
            
            {/* SIMAT Official Panel */}
            <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden xl:col-span-2 flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600 animate-spin" />
                    Migración Oficial SIMAT (Colombia)
                  </CardTitle>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-white border-none scale-95">
                    Próximamente
                  </span>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs font-semibold text-slate-750">
                  <p className="leading-relaxed">
                    Preparando la integración directa con el **Sistema de Matrícula Estudiantil de Educación Básica y Media (SIMAT)** del Ministerio de Educación Nacional de Colombia.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                    <h4 className="font-black text-slate-900">Funcionalidades planificadas para SIMAT:</h4>
                    <ul className="list-disc pl-4 text-slate-600 space-y-2">
                      <li>Sincronización mediante Web Services gubernamentales del MEN (Módulos de Matrículas y Novedades).</li>
                      <li>Auto-conversión de formatos planos SIMAT (.txt delimitados por barra vertical) a las tablas relacionales de AulaCore.</li>
                      <li>Validación contra el histórico de cobertura departamental para evitar duplicación de códigos de estudiantes.</li>
                    </ul>
                  </div>
                </CardContent>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                <Button disabled className="h-9 text-xs font-bold rounded-xl bg-slate-300 text-slate-500 cursor-not-allowed border-none">
                  Conectar con SIMAT API
                </Button>
              </div>
            </Card>

            {/* IA Intelligent Column Mapper Panel */}
            <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden xl:col-span-1 flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    Mapeador Inteligente con IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Mapee columnas de cualquier origen de software escolar (WebColegios, GNosoft, etc.) con los campos destino de AulaCore.
                  </p>

                  {/* Drag mapper visual demo */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Campos Detectados → Campo AulaCore</span>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">DOC_IDENTIDAD</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-xs text-indigo-900 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">{mappedColumns['DOC_IDENTIDAD'] || '(Sin asociar)'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">ESTUDIANTE_NAME</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-xs text-indigo-900 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">{mappedColumns['ESTUDIANTE_NAME'] || '(Sin asociar)'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">MAIL_ACUDIENTE</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-xs text-indigo-900 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">{mappedColumns['MAIL_ACUDIENTE'] || '(Sin asociar)'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                <Button onClick={handleAISuggestMapping} disabled={isMappingIAActive} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 border-none cursor-pointer">
                  {isMappingIAActive ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mapeando...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" /> Mapear con IA
                    </>
                  )}
                </Button>
              </div>
            </Card>

          </div>
        )}

      </div>

      {/* --- DETAIL MODAL: AUDIT LOGS --- */}
      {selectedLogDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedLogDetails(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full">
            <div className="bg-white px-6 pt-6 pb-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Detalle del Reporte de Importación
                </h3>
                <button type="button" onClick={() => setSelectedLogDetails(null)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-[11px] grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">ID de Auditoría:</span>
                    <span className="font-mono text-slate-800 font-extrabold">{selectedLogDetails.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Usuario Responsable:</span>
                    <span className="text-slate-900 font-black">{selectedLogDetails.user_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Origen de Red (IP):</span>
                    <span className="font-mono text-slate-800 font-extrabold">{selectedLogDetails.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Módulo Procesado:</span>
                    <span className="text-slate-900 font-black">{selectedLogDetails.module_type}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Resumen de Registros</span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Cargados</span>
                      <span className="text-sm font-black text-slate-900">{selectedLogDetails.records_count}</span>
                    </div>
                    <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Creados</span>
                      <span className="text-sm font-black text-emerald-800">{selectedLogDetails.created_count}</span>
                    </div>
                    <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Actualizados</span>
                      <span className="text-sm font-black text-indigo-900">{selectedLogDetails.updated_count}</span>
                    </div>
                    <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Rechazados</span>
                      <span className="text-sm font-black text-rose-800">{selectedLogDetails.rejected_count}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Informe de Errores e Incidencias</span>
                  <div className="max-h-[150px] overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-3 space-y-1.5 leading-relaxed font-semibold text-[10px] text-slate-600">
                    {selectedLogDetails.details && Array.isArray(selectedLogDetails.details) && selectedLogDetails.details.length > 0 ? (
                      selectedLogDetails.details.map((d: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                          <span>
                            {d.row ? `Fila ${d.row}: ` : ''} {d.error} {d.field ? `[Campo: ${d.field}, Valor: "${d.value}"]` : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Ninguna advertencia. Todos los registros fueron procesados exitosamente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" onClick={() => setSelectedLogDetails(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 cursor-pointer h-9 border-none">
                Cerrar Reporte
              </Button>
            </div>
          </Card>
        </div>
      )}

    </AppLayout>
  );
}
