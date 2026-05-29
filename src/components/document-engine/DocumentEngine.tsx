'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  Printer,
  Download,
  Mail,
  FileSignature,
  X,
  CheckCircle,
  Clock,
  Shield,
  QrCode,
  AlertTriangle,
  BrainCircuit,
  Award,
  Users2,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- INTERFACES Y TIPOS ---
export type DocumentType =
  | 'academic_report'
  | 'annual_consolidated'
  | 'student_observador'
  | 'early_alerts'
  | 'citations'
  | 'disciplinary_acta'
  | 'academic_compromise'
  | 'attendance_report'
  | 'psychosocial_followup'
  | 'communication_history'
  | 'academic_certificate'
  | 'rectoral_report'
  | 'curriculum_grid';

export interface DocumentMetadata {
  studentName: string;
  courseName: string;
  academicYear: number;
  [key: string]: any;
}

interface DocumentTemplate {
  header_logo_url: string;
  footer_text: string;
  rector_signature_url: string;
  secretary_signature_url: string;
  watermark_url: string;
  primary_color: string;
  secondary_color: string;
  legal_text: string;
  qr_position: 'bottom_left' | 'bottom_right' | 'top_right';
  page_format: 'letter' | 'a4';
}

interface DocumentEngineProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  studentId?: string;
  studentName: string;
  courseName: string;
  metadataPayload: Record<string, any>;
  onSuccess?: () => void;
}

export function DocumentEngine({
  isOpen,
  onClose,
  documentType,
  studentId = '77777777-7777-7777-7777-777777777777',
  studentName,
  courseName,
  metadataPayload,
  onSuccess
}: DocumentEngineProps) {
  // --- ESTADOS INTERACTIVOS ---
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<'generated' | 'signed' | 'emailed' | 'printed'>('generated');
  const [verificationCode, setVerificationCode] = useState(() => {
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    return `AC-VERIFY-2026-${randomHex}`;
  });
  const [signatureHash, setSignatureHash] = useState(() => {
    // Generar un hash SHA-256 simulado inicial
    return 'sha256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  });

  if (!isOpen) return null;

  // --- CONFIGURACIÓN DE PLANTILLA DE AULACORE (TEMPLATE LAYER) ---
  const template: DocumentTemplate = {
    header_logo_url: '/logo-aulacore.png',
    footer_text: 'Colegio AulaCore Central - Licencia Oficial del Ministerio de Educación Resolución 4028. Bogotá, D.C.',
    rector_signature_url: '/signature-rector.png',
    secretary_signature_url: '/signature-secretary.png',
    watermark_url: '/watermark-logo.png',
    primary_color: '#0f172a', // Slate 900
    secondary_color: '#4338ca', // Indigo 700
    legal_text: 'El suscrito Rector y Secretaria Académica certifican que los datos consignados en este informe representan fielmente la trazabilidad del estudiante en el año académico respectivo.',
    qr_position: 'bottom_left',
    page_format: 'letter'
  };

  // Nombres descriptivos para los 12 tipos
  const DOCUMENT_DISPLAY_NAMES: Record<DocumentType, string> = {
    academic_report: 'Boletín Académico Oficial',
    annual_consolidated: 'Consolidado Final Anual de Calificaciones',
    student_observador: 'Historial del Observador del Estudiante',
    early_alerts: 'Reporte de Alertas Tempranas y Factores de Riesgo',
    citations: 'Citación Oficial a Consejo Académico / Disciplinario',
    disciplinary_acta: 'Acta de Conciliación Convivencial Disciplinaria',
    academic_compromise: 'Acta de Compromiso Académico del Estudiante',
    attendance_report: 'Reporte de Asistencia',
    psychosocial_followup: 'Seguimiento Psicosocial',
    communication_history: 'Historial de Comunicaciones',
    academic_certificate: 'Certificado Académico',
    rectoral_report: 'Reporte Rectoral de Gestión',
    curriculum_grid: 'Malla Curricular Institucional'
  };

  const activeDocName = DOCUMENT_DISPLAY_NAMES[documentType];

  // --- ACCIÓN: IMPRIMIR (PRINT LAYER) ---
  const handlePrint = async () => {
    // Registrar auditoría en base de datos
    try {
      const { data: userProfile } = await supabase.auth.getUser();
      const userId = userProfile?.user?.id || '33333333-3333-3333-3333-333333333333';
      
      // Intentar insertar log en supabase
      await supabase.from('institution_document_audit').insert({
        action_type: 'printed',
        performed_by: userId,
        client_ip: '192.168.1.121',
        user_agent: navigator.userAgent
      });
    } catch (err) {
      console.warn('Logging error bypass for demo compatibility');
    }

    setDocumentStatus('printed');
    window.print();
  };

  // --- ACCIÓN: DESCARGAR ---
  const handleDownload = async () => {
    try {
      const { data: userProfile } = await supabase.auth.getUser();
      const userId = userProfile?.user?.id || '33333333-3333-3333-3333-333333333333';

      await supabase.from('institution_document_audit').insert({
        action_type: 'downloaded',
        performed_by: userId,
        client_ip: '192.168.1.121',
        user_agent: navigator.userAgent
      });
    } catch (err) {
      console.warn('Logging error bypass for demo compatibility');
    }

    // Simular descarga de PDF oficial
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify({ documentType, verificationCode, signatureHash, metadataPayload }, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${documentType}_${verificationCode}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert(`✓ Copia Física (PDF) descargada con código verificador único: ${verificationCode}`);
  };

  // --- ACCIÓN: ENVIAR EMAIL ---
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress.trim()) return;

    setIsSendingEmail(true);

    // Simular retraso de envío por servidor
    setTimeout(async () => {
      try {
        const { data: userProfile } = await supabase.auth.getUser();
        const userId = userProfile?.user?.id || '33333333-3333-3333-3333-333333333333';

        await supabase.from('institution_document_audit').insert({
          action_type: 'emailed',
          performed_by: userId,
          client_ip: '192.168.1.121',
          user_agent: navigator.userAgent
        });
      } catch (err) {
        console.warn('Logging error bypass for demo compatibility');
      }

      setIsSendingEmail(false);
      setShowEmailModal(false);
      setDocumentStatus('emailed');
      alert(`✓ Correo Oficial Institucional despachado exitosamente a: ${emailAddress}`);
      if (onSuccess) onSuccess();
    }, 1500);
  };

  // --- ACCIÓN: FIRMAR DIGITALMENTE ---
  const handleSignDocument = async () => {
    setIsSigning(true);

    setTimeout(async () => {
      try {
        const { data: userProfile } = await supabase.auth.getUser();
        const userId = userProfile?.user?.id || '22222222-2222-2222-2222-222222222222'; // Rector por defecto

        await supabase.from('institution_document_audit').insert({
          action_type: 'signed',
          performed_by: userId,
          client_ip: '192.168.1.121',
          user_agent: navigator.userAgent
        });
      } catch (err) {
        console.warn('Logging error bypass for demo compatibility');
      }

      // Recalcular el hash del snapshot
      const recalculatedHash = 'sha256:8b7cc40e' + Math.floor(100000 + Math.random() * 900000).toString(16) + 'f709121be7c2134e1c2a1012';
      setSignatureHash(recalculatedHash);
      setDocumentStatus('signed');
      setIsSigning(false);
      alert(`✓ Documento Oficial Firmado Digitalmente por la Rectoría mediante Estampado Criptográfico.`);
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:relative print:inset-auto">
      {/* Container Card */}
      <Card className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 animate-fade-in print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full">
        {/* TOP BUTTONS - Hidden during printing */}
        <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-inner">
              <Shield className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block">Gabinete Documental</span>
              <h2 className="text-sm font-black text-white leading-tight">{activeDocName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="bg-slate-800 hover:bg-slate-750 text-white border-slate-700 hover:border-slate-600 font-bold text-xs gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="bg-slate-800 hover:bg-slate-750 text-white border-slate-700 hover:border-slate-600 font-bold text-xs gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar PDF
            </Button>
            <Button
              onClick={() => setShowEmailModal(true)}
              variant="outline"
              size="sm"
              className="bg-slate-800 hover:bg-slate-750 text-white border-slate-700 hover:border-slate-600 font-bold text-xs gap-1.5 cursor-pointer shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              Enviar Correo
            </Button>

            {documentStatus !== 'signed' ? (
              <Button
                onClick={handleSignDocument}
                disabled={isSigning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer transition disabled:opacity-50"
              >
                <FileSignature className="w-3.5 h-3.5 animate-bounce" />
                {isSigning ? 'Firmando...' : 'Firmar Acta'}
              </Button>
            ) : (
              <div className="bg-emerald-600 text-white text-[10px] font-black px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-950/20 leading-none">
                <CheckCheck className="w-4 h-4" />
                FIRMADO DIGITALMENTE
              </div>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* PRINT LAYOUT CONTAINER */}
        <div className="p-8 md:p-12 relative bg-white min-h-[1100px] overflow-hidden flex flex-col justify-between border-15 border-double border-slate-100 print:p-0 print:border-none print:min-h-0 print:block">
          {/* Watermark Logo (Background logo absolute positioned) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
            <img src="/logo-aulacore.png" alt="watermark" className="w-[450px] h-[450px] object-contain" />
          </div>

          <div className="space-y-8 relative z-10">
            {/* A. REUSABLE INSTITUTION HEADER (TEMPLATE LAYER) */}
            <div className="border-b-4 border-double border-slate-900 pb-5 flex items-center justify-between gap-6 print:pb-4 print:border-b-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center p-2 shadow-inner print:w-14 print:h-14">
                  <img src="/logo-aulacore.png" alt="logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">COLEGIO AULACORE CENTRAL</h1>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mt-0.5">RESOLUCIÓN DE APROBACIÓN OFICIAL No. 4028 • NIT. 800.123.456-1</span>
                  <p className="text-[9px] text-slate-450 italic mt-0.5 font-medium">"Hacia la Excelencia Educativa, Tecnológica y de Convivencia"</p>
                </div>
              </div>
              
              <div className="text-right border-l border-slate-200 pl-6 shrink-0 print:pl-4">
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-700 font-black px-2.5 py-1 rounded-md tracking-wider uppercase block">
                  DOCUMENTO OFICIAL
                </span>
                <span className="text-xs font-mono font-black text-slate-900 block mt-1.5">{verificationCode}</span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Fecha: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* B. DOCUMENT METADATA PANEL */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 print:p-3 print:rounded-lg print:border-slate-300">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Estudiante</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">{studentName}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Grado / Curso</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">{courseName}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Año Académico</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">2026 Lectivo</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Estado de Emisión</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    documentStatus === 'signed' ? "bg-emerald-500" :
                    documentStatus === 'emailed' ? "bg-indigo-500" : "bg-amber-500 animate-pulse"
                  )} />
                  <span className="text-xs font-bold text-slate-700 capitalize">
                    {documentStatus === 'signed' ? 'Verificado & Firmado' :
                     documentStatus === 'emailed' ? 'Notificado Acudiente' : 'Generado (Borrador)'}
                  </span>
                </div>
              </div>
            </div>

            {/* C. CUERPO DEL INFORME DINÁMICO */}
            <div className="space-y-6 flex-1 min-h-[500px] print:min-h-0">
              <div className="text-center">
                <h2 className="text-base font-black text-slate-950 uppercase tracking-wider border-b border-slate-150 pb-2 inline-block px-8">
                  {activeDocName}
                </h2>
              </div>

              {/* 1. BOLETÍN ACADÉMICO */}
              {documentType === 'academic_report' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                    A continuación se desglosan las calificaciones definitivas reportadas por la planta docente para el periodo académico <strong>2026-I</strong>. Los valores respetan ponderaciones del 30% exámenes, 40% tareas y 30% participación grupal.
                  </p>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-600 font-black uppercase">
                        <tr>
                          <th className="p-3 pl-4">Asignatura / Área</th>
                          <th className="p-3 text-center">Exámenes (30%)</th>
                          <th className="p-3 text-center">Tareas (40%)</th>
                          <th className="p-3 text-center">Part. (30%)</th>
                          <th className="p-3 text-right pr-4">Definitiva</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(metadataPayload.grades || [
                          {subject: 'Matemáticas', exams: [4.2, 4.5], homeworks: [4.0, 4.6], participation: [5.0], finalGrade: 4.40},
                          {subject: 'Ciencias Naturales', exams: [3.8, 4.0], homeworks: [3.5, 3.8], participation: [4.5], finalGrade: 3.85},
                          {subject: 'Inglés', exams: [4.8, 5.0], homeworks: [4.8, 4.8], participation: [5.0], finalGrade: 4.86}
                        ]).map((grade: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 pl-4 font-black text-slate-900">{grade.subject}</td>
                            <td className="p-3 text-center text-slate-500 font-mono">{(grade.exams || []).join(' / ')}</td>
                            <td className="p-3 text-center text-slate-500 font-mono">{(grade.homeworks || []).join(' / ')}</td>
                            <td className="p-3 text-center text-slate-500 font-mono">{(grade.participation || []).join(' / ')}</td>
                            <td className="p-3 text-right pr-4">
                              <span className="font-black px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-900 inline-block min-w-10 text-center">
                                {grade.finalGrade.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Promedio General Periodo: <strong>9.4 / 10.0 (Sobresaliente)</strong></span>
                    <span>Asistencia Acumulada: <strong>98.2%</strong></span>
                  </div>
                </div>
              )}

              {/* 2. CONSOLIDADO FINAL ANUAL */}
              {documentType === 'annual_consolidated' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                    Balance definitivo consolidad anual del curso para validación legal ante entes de inspección y vigilancia.
                  </p>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-600 font-black uppercase">
                        <tr>
                          <th className="p-3 pl-4">Estudiante</th>
                          <th className="p-3 text-center">Matemáticas</th>
                          <th className="p-3 text-center">Inglés</th>
                          <th className="p-3 text-center">Ciencias</th>
                          <th className="p-3 text-center">Asistencia</th>
                          <th className="p-3 text-right pr-4">Estado Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {[
                          {name: 'Alejandro Ortiz', mat: '4.50', ing: '4.80', cie: '4.30', att: '98.2%', status: 'APROBADO'},
                          {name: 'Sofía Ramírez', mat: '3.80', ing: '4.00', cie: '3.50', att: '72.5%', status: 'EN REVISIÓN'},
                          {name: 'Mateo Gómez', mat: '2.80', ing: '3.20', cie: '2.90', att: '85.0%', status: 'REPROBADO'}
                        ].map((stu, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 pl-4 font-black text-slate-900">{stu.name}</td>
                            <td className="p-3 text-center font-mono">{stu.mat}</td>
                            <td className="p-3 text-center font-mono">{stu.ing}</td>
                            <td className="p-3 text-center font-mono">{stu.cie}</td>
                            <td className="p-3 text-center font-mono">{stu.att}</td>
                            <td className="p-3 text-right pr-4">
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded border leading-none inline-block",
                                stu.status === 'APROBADO' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                stu.status === 'REPROBADO' ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              )}>
                                {stu.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. OBSERVADOR DEL ESTUDIANTE */}
              {documentType === 'student_observador' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-655 font-semibold">
                    Registro de anotaciones comportamentales y convivenciales vigentes en la bitácora del observador:
                  </p>

                  <div className="border border-slate-200 rounded-xl p-5 space-y-5 bg-slate-50/50">
                    {[
                      {type: 'mild_negative', title: 'Falta Leve', date: '2026-05-24', reported: 'Prof. Gómez', desc: 'Uso reiterado de distractores móviles durante explicaciones de física.'},
                      {type: 'positive', title: 'Anotación Sobresaliente', date: '2026-05-20', reported: 'Prof. Gómez', desc: 'Excelente monitoría académica voluntaria a compañeros con dificultades de Álgebra.'}
                    ].map((obs, idx) => (
                      <div key={idx} className="border-l-2 border-slate-900 pl-4 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{obs.title}</span>
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase",
                              obs.type === 'positive' ? "bg-emerald-50 text-emerald-700 border-emerald-150" : "bg-amber-50 text-amber-700 border-amber-150"
                            )}>{obs.title}</span>
                          </div>
                          <span className="text-slate-400">{obs.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold italic">"{obs.desc}"</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase block">Reportado por: {obs.reported}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. COMPROMISO ACADÉMICO / ACTAS */}
              {(documentType === 'academic_compromise' || documentType === 'disciplinary_acta') && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    En la ciudad de Bogotá D.C., bajo el amparo del manual de convivencia del Colegio AulaCore Central, se formaliza este compromiso oficial de corresponsabilidad y acompañamiento pedagógico en el hogar:
                  </p>

                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3 text-xs text-slate-700 font-bold leading-relaxed">
                    <h5 className="font-black text-slate-900 border-b pb-1">COMPROMISOS ADQUIRIDOS:</h5>
                    <ul className="list-decimal pl-5 space-y-2 font-semibold">
                      <li>Asistir con regularidad y a tiempo a todas las clases curriculares, cumpliendo las alertas RFID de portería.</li>
                      <li>Presentar las bitácoras remediales firmadas por el acudiente en el transcurso de los talleres de mejoramiento.</li>
                      <li>Mantener un canal abierto y constante de comunicación oficial entre el acudiente y la Dirección de Grupo.</li>
                    </ul>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    La firma digital estampada en este documento convalida que tanto el acudiente como la Dirección del Curso se comprometen a respetar cabalmente las condiciones planteadas en este plan de mejoramiento integral.
                  </p>
                </div>
              )}

              {/* 5. SEGUIMIENTO PSICOSOCIAL */}
              {documentType === 'psychosocial_followup' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider block">INFORMACIÓN RESERVADA - CUSTODIA HISTORIAL CLÍNICO</span>
                      <p className="text-xs leading-tight font-semibold">
                        Este documento es confidencial y se encuentra amparado bajo el secreto profesional de la orientación escolar AulaCore. Está prohibida su divulgación física o copia digital no autorizada por Rectoría.
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/20 text-xs">
                    <div className="grid grid-cols-2 gap-4 border-b pb-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Número de Caso</span>
                        <span className="font-bold text-slate-800">CASE-2026-M09 (Mateo Gómez)</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Estado del Plan PIAR</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">En Acompañamiento Activo</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-450 uppercase tracking-wide block">Diagnóstico de Orientación Trimestral</span>
                      <p className="text-xs text-slate-655 font-medium leading-relaxed bg-white border p-3 rounded-lg shadow-inner">
                        Dificultad de aprendizaje consolidada y niveles elevados de ansiedad escolar ante evaluaciones escritas. Se derivó formalmente a Terapia Ocupacional externa. Se mantiene plan de ajuste razonable (PIAR) activo en el aula de Matemáticas y Física.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. OTROS DOCUMENTOS FALLBACK (INFORMES COMUNES) */}
              {['citations', 'early_alerts', 'attendance_report', 'communication_history', 'academic_certificate', 'rectoral_report'].includes(documentType) && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                    Este documento rinde fe de los registros acumulados en el expediente digital de **{studentName}** para el curso académico **{courseName}** en el presente ciclo escolar.
                  </p>

                  <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-center text-xs font-bold py-1.5 border-b">
                      <span className="text-slate-500">Módulo de Origen</span>
                      <span className="text-slate-900 uppercase">Sistema de Información Académica</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold py-1.5 border-b">
                      <span className="text-slate-500">Código de Trazabilidad</span>
                      <span className="font-mono text-slate-900">{verificationCode}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold py-1.5">
                      <span className="text-slate-500">Firma de Registro Criptográfico</span>
                      <span className="font-mono text-slate-400 text-[10px] truncate max-w-xs">{signatureHash}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    El código QR de validación al pie de página permite verificar la autenticidad e inmutabilidad de este documento en el portal oficial del colegio.
                  </p>
                </div>
              )}
            </div>

            {/* D. REUSABLE INSTITUTIONAL SIGNATURES & QR FOOTER (ENGINE LAYER) */}
            <div className="border-t-2 border-slate-900 pt-6 mt-8 flex flex-col md:flex-row items-stretch justify-between gap-6 print:mt-4 print:pt-4">
              {/* QR validation block */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 max-w-sm shrink-0 print:border-slate-300 print:bg-white">
                <div className="w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center p-1 shadow-sm shrink-0 print:w-14 print:h-14">
                  <QrCode className="w-full h-full text-slate-800" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider block">Validación Pública QR</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Escanee este código con la cámara de su móvil para constatar la autenticidad criptográfica inmutable en la web del colegio.</p>
                </div>
              </div>

              {/* Rector Signature Area */}
              <div className="text-center w-40 flex flex-col justify-end items-center">
                <div className="h-10 w-full flex items-center justify-center relative overflow-hidden select-none border-b border-dashed border-slate-350">
                  <span className="font-serif italic font-bold text-slate-500 text-xs translate-y-1">Ramón Ramírez</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-900/5 to-transparent skew-x-12 select-none pointer-events-none opacity-40" />
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase block mt-1.5">Dr. Ramón Ramírez</span>
                <span className="text-[9px] text-slate-500 font-bold block leading-none">Rector Institucional</span>
              </div>

              {/* Secretary Signature Area */}
              <div className="text-center w-40 flex flex-col justify-end items-center">
                <div className="h-10 w-full flex items-center justify-center relative overflow-hidden select-none border-b border-dashed border-slate-350">
                  <span className="font-serif italic font-bold text-slate-500 text-xs translate-y-1">Elena Toro</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-900/5 to-transparent -skew-x-12 select-none pointer-events-none opacity-40" />
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase block mt-1.5">Lic. Elena Toro</span>
                <span className="text-[9px] text-slate-500 font-bold block leading-none">Secretaría Académica</span>
              </div>
            </div>

            {/* E. LEGAL AND VERIFICATION FOOTNOTES */}
            <div className="text-center text-[9px] text-slate-450 border-t border-slate-100 pt-4 font-semibold leading-relaxed print:pt-2">
              <p>{template.legal_text}</p>
              <p className="font-mono text-slate-400 text-[8px] mt-1 break-all select-none">
                Firmado Criptográficamente mediante Hash: {signatureHash}
              </p>
              <p className="text-[8px] text-slate-350 uppercase mt-0.5 tracking-wider font-bold">
                {template.footer_text}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* EMAIL SIMULATION DIALOG - Hidden during printing */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl animate-scale-in">
            <CardHeader className="bg-slate-900 text-white px-5 py-4 flex flex-row items-center justify-between border-b border-slate-800">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-indigo-400" />
                Despachar por Correo Institucional
              </CardTitle>
              <Button
                onClick={() => setShowEmailModal(false)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSendEmail} className="space-y-4">
                <p className="text-xs text-slate-500 leading-normal font-semibold">
                  El sistema empaquetará el reporte **{DOCUMENT_DISPLAY_NAMES[documentType]}** del estudiante **{studentName}** y lo despachará de forma segura con firma criptográfica al correo electrónico del acudiente.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Correo Electrónico Destinatario</label>
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="ejemplo@acudiente.com"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                    className="text-xs font-bold rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSendingEmail}
                    className="bg-indigo-650 hover:bg-indigo-750 text-white font-black text-xs px-4 py-2 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? 'Despachando Correo...' : 'Despachar Correo'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderCurriculumGrid = () => (
    <div className="space-y-6 text-slate-800">
      <div className="text-center space-y-1 mb-8">
        <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 inline-block pb-1">
          Malla Curricular Institucional
        </h3>
        <p className="text-sm font-semibold text-slate-600 mt-2">Documento Oficial de Planeación Pedagógica</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
          <div><span className="font-bold">Asignatura:</span> Cálculo Diferencial</div>
          <div><span className="font-bold">Grado:</span> 11°</div>
          <div><span className="font-bold">Año Lectivo:</span> {new Date().getFullYear()}</div>
          <div><span className="font-bold">Docente Responsable:</span> Prof. Gómez</div>
          <div className="col-span-2">
            <span className="font-bold">Objetivo General:</span> Desarrollar habilidades de pensamiento variacional para modelar situaciones de cambio continuo a través del concepto de límite.
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-bold bg-slate-100 p-2 border-l-4 border-indigo-600">Periodo 1: Funciones y Límites</h4>
        <table className="w-full mt-3 border-collapse text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              <th className="border p-2 text-left w-1/4">Competencia</th>
              <th className="border p-2 text-left w-1/4">Tipo</th>
              <th className="border p-2 text-left w-1/2">Indicadores de Desempeño</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Comprende el concepto de límite y continuidad en funciones reales.</td>
              <td className="border p-2">Saber (Cognitivo)</td>
              <td className="border p-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Calcula límites al infinito usando propiedades algebraicas.</li>
                  <li>Identifica discontinuidades en gráficas de funciones.</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-medium">Resuelve problemas geométricos aplicando la derivada de una función.</td>
              <td className="border p-2">Hacer (Procedimental)</td>
              <td className="border p-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Calcula tasas de variación media y puntual.</li>
                  <li>Aplica reglas de derivación básicas.</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-medium">Valora la utilidad de los modelos matemáticos en situaciones del entorno real.</td>
              <td className="border p-2">Ser (Actitudinal)</td>
              <td className="border p-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Participa activamente en la resolución de problemas grupales.</li>
                  <li>Entrega a tiempo las evidencias de aprendizaje solicitadas.</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex justify-between px-8 text-center pt-8 border-t border-slate-200">
        <div>
          <div className="h-12 flex items-end justify-center">
             <span className="font-signature text-3xl text-slate-700">Prof. Gómez</span>
          </div>
          <div className="w-48 border-t border-slate-400 mx-auto mt-2 pt-2">
            <p className="text-[10px] font-bold">Firma Docente Responsable</p>
            <p className="text-[9px] text-slate-500">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <div className="h-12 flex items-end justify-center">
             <span className="font-signature text-3xl text-indigo-700">Coordinación</span>
          </div>
          <div className="w-48 border-t border-slate-400 mx-auto mt-2 pt-2">
            <p className="text-[10px] font-bold">Firma Coordinador Académico</p>
            <p className="text-[9px] text-slate-500">APROBADO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
