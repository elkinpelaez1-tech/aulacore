'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Printer, Download, Eye, Sparkles, Check, CheckCircle2, ChevronRight, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Evaluation } from '@/lib/data/evaluations-store';
import { cn } from '@/lib/utils';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation;
  onSaveAndPublish?: () => void;
}

export function PrintPreviewModal({ isOpen, onClose, evaluation, onSaveAndPublish }: PrintPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [includeOMR, setIncludeOMR] = useState(true);
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'Gimnasio Campestre AulaCore',
    logoPrincipal: '/logo-aulacore.png',
    slogan: 'Liderazgo, Ciencia y Excelencia',
    primaryColor: '#4f46e5',
    nit: '901.234.567-8',
    rectorName: 'Dr. Ramírez',
    daneCode: '111001032541'
  });

  // Load institutional settings from localStorage if available
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('aulacore-institucion-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSchoolSettings(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          logoPrincipal: (parsed.logoPrincipal && parsed.logoPrincipal !== 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120') ? parsed.logoPrincipal : prev.logoPrincipal,
          slogan: parsed.slogan || prev.slogan,
          primaryColor: parsed.primaryColor || prev.primaryColor,
          nit: parsed.nit || prev.nit,
          rectorName: parsed.rectorName || prev.rectorName,
          daneCode: parsed.daneCode || prev.daneCode
        }));
      } catch (e) {
        console.error('Error loading institutional settings in print preview', e);
      }
    }
  }, []);

  if (!isOpen) return null;

  const examCode = `EVAL-${evaluation.id ? evaluation.id.toString().slice(-6).toUpperCase() : 'NEW'}-${Date.now().toString().slice(-4)}`;
  const qrValidationUrl = `https://aulacore.edu.co/verify/${evaluation.id || 'temp'}`;

  // Execute print function
  const handlePrint = (withOMR: boolean) => {
    // Save state of OMR inclusion momentarily for native printing
    setIncludeOMR(withOMR);
    
    // Tiny delay to let react state flush and classes render
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
      
      {/* SCOPED CSS PRINT RULES */}
      <style jsx global>{`
        @media print {
          /* Hides everything under the body except our print portal wrapper */
          body > *:not(#aulacore-print-area) {
            display: none !important;
          }
          
          /* Styles the print container to flow naturally */
          #aulacore-print-area {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Unclipping all parent containers for multi-page native print routing */
          html, body {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            min-height: 0 !important;
            background: white !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-height: 25cm !important;
            height: auto !important;
            box-sizing: border-box !important;
            position: relative !important;
          }
          
          .print-no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 w-full max-w-[1250px] h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold uppercase tracking-widest text-[10px] mb-0.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Vista Previa de Examen Premium
            </div>
            <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              {schoolSettings.name}
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.8 rounded-xl cursor-pointer text-xs font-bold text-slate-300 select-none">
              <input 
                type="checkbox" 
                checked={includeOMR} 
                onChange={(e) => setIncludeOMR(e.target.checked)} 
                className="w-4 h-4 accent-indigo-600 rounded border-slate-700 cursor-pointer"
              />
              <span>Incluir Hoja OMR</span>
            </label>

            <Button
              onClick={() => handlePrint(false)}
              variant="outline"
              className="bg-transparent border-slate-800 hover:bg-slate-850 hover:text-white text-slate-200 text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Examen Solo
            </Button>

            <Button
              onClick={() => handlePrint(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black h-10 px-4.5 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-md shadow-indigo-650/20 border-none outline-none"
            >
              <Download className="w-4 h-4" />
              Descargar PDF + OMR
            </Button>

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition cursor-pointer border-none outline-none shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (PREVIEW SHEET GRID) */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex justify-center items-start gap-8 select-none">
          
          <div className="max-w-[800px] w-full space-y-8 no-print">
            
            {/* INSTRUCTIONS CARD */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 flex gap-3 text-xs leading-relaxed text-slate-400 max-w-3xl mx-auto shadow-sm">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">ℹ️ Formato de Impresión Assessment</strong>
                Esta vista previa replica con precisión absoluta las dimensiones reales del papel físico (A4 / Carta). Para guardarlo como archivo digital, haz clic en **"Descargar PDF + OMR"** y selecciona **"Guardar como PDF"** en el cuadro de diálogo de impresión de tu navegador.
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="space-y-12">
              
              {/* PAGE 1: EXAM SHEET */}
              <div className="bg-white border border-slate-200 w-[21cm] min-h-[29.7cm] p-[2cm] mx-auto rounded-xl shadow-2xl text-black font-serif relative overflow-hidden flex flex-col justify-between" style={{ minWidth: '21cm' }}>
                <div>
                  {/* Cambridge-style elegant Header border-box */}
                  <div className="border-[2.5px] border-black p-5 flex items-stretch justify-between gap-4 font-sans select-text">
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[14px] font-black tracking-tight leading-none text-slate-800" style={{ color: schoolSettings.primaryColor }}>
                          {schoolSettings.name.toUpperCase()}
                        </h4>
                        <p className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase mt-1">
                          {schoolSettings.slogan}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-[10px] font-bold text-slate-700">
                        <div><span className="text-slate-450 font-medium">NIT:</span> {schoolSettings.nit}</div>
                        <div><span className="text-slate-450 font-medium">AÑO LECTIVO:</span> {new Date().getFullYear()}</div>
                        <div><span className="text-slate-450 font-medium">SEDE:</span> {evaluation.campus}</div>
                        <div><span className="text-slate-450 font-medium">DANE:</span> {schoolSettings.daneCode}</div>
                      </div>
                    </div>
                    
                    <div className="w-[1px] bg-slate-300 self-stretch my-1" />
                    
                    <div className="w-32 shrink-0 flex flex-col items-center justify-center text-center">
                      <img 
                        src={schoolSettings.logoPrincipal} 
                        alt="Logo Colegio" 
                        className="h-16 w-auto object-contain max-h-16"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo-aulacore.png';
                        }}
                      />
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase mt-2">Sello Oficial</span>
                    </div>
                  </div>

                  {/* Exam details Banner */}
                  <div className="mt-6 border-b-[1.5px] border-black pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 select-text">
                    <div className="font-sans">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Evaluación Escrita Oficial</span>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">{evaluation.title}</h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-650 mt-2">
                        <div>Materia: <span className="font-extrabold text-slate-900">{evaluation.subject}</span></div>
                        <div>Curso: <span className="font-extrabold text-slate-900">{evaluation.course}</span></div>
                        <div>Docente: <span className="font-extrabold text-slate-900">{schoolSettings.rectorName}</span></div>
                        <div>Límite: <span className="font-extrabold text-slate-900">{evaluation.timeLimit} Minutos</span></div>
                      </div>
                    </div>

                    <div className="font-mono text-right shrink-0 flex flex-col items-end">
                      {/* Premium Vector Mock QR Code */}
                      <div className="w-16 h-16 border border-slate-350 p-1 rounded-lg bg-white flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 29 29" shapeRendering="crispEdges" className="text-black fill-current">
                          <path d="M0 0h7v7H0zM22 0h7v7h-7zM0 22h7v7H0zM2 2h3v3H2zM24 2h3v3h-3zM2 24h3v3H2zM9 0h1v1H9zM12 0h2v1h-2zM15 0h2v1h-2zM18 0h3v1h-3zM9 2h1v1H9zM13 2h2v1h-2zM17 2h1v1h-1zM20 2h1v1H20zM9 4h2v1H9zM12 4h1v1h-1zM15 4h1v1h-1zM18 4h3v1h-3zM9 6h1v1H9zM11 6h1v1h-1zM13 6h4v1h-4zM18 6h1v1h-1zM20 6h1v1H20zM0 9h1v2H0zM2 9h4v1H2zM9 9h2v1H9zM13 9h3v1h-3zM18 9h1v1h-1zM20 9h2v1h-2zM23 9h2v1h-2zM26 9h3v1h-3z" />
                        </svg>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{examCode}</span>
                    </div>
                  </div>

                  {/* Elegant Student Identification Fields */}
                  <div className="mt-5 bg-slate-50/60 border border-slate-200 rounded-xl p-4.5 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-[11px] font-sans font-bold text-slate-800">
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="text-slate-450 uppercase tracking-wider shrink-0">Estudiante:</span>
                      <div className="flex-1 border-b border-dashed border-slate-350 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-450 uppercase tracking-wider shrink-0">Documento:</span>
                      <div className="flex-1 border-b border-dashed border-slate-350 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-450 uppercase tracking-wider shrink-0">Curso / Grupo:</span>
                      <div className="flex-1 border-b border-dashed border-slate-350 h-5" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="text-slate-450 uppercase tracking-wider shrink-0">Fecha:</span>
                      <div className="flex-1 border-b border-dashed border-slate-350 h-5" />
                    </div>
                  </div>

                  {/* CUESTIONARIO DE PREGUNTAS */}
                  <div className="mt-8 space-y-6 text-xs leading-relaxed select-text pr-2">
                    {evaluation.questions.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 italic">
                        No hay preguntas estructuradas en el borrador de evaluación.
                      </div>
                    ) : (
                      evaluation.questions.map((q, idx) => {
                        const isMC = q.type === 'seleccion_multiple';
                        const isTF = q.type === 'verdadero_falso';
                        const isMath = q.type === 'matematica';
                        const isOpen = q.type === 'abierta';

                        return (
                          <div key={q.id || idx} className="print-no-break space-y-2">
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="font-extrabold text-slate-900 text-sm leading-snug flex-1">
                                <span className="font-sans font-black mr-1 text-indigo-750">{idx + 1}.</span> {q.text}
                              </h4>
                              <span className="font-sans font-black text-[10px] text-slate-400 uppercase tracking-widest shrink-0 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                                {q.points} PTS
                              </span>
                            </div>

                            {/* Opciones de respuesta para Seleccion Multiple */}
                            {(isMC || isMath) && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 font-sans font-semibold text-slate-700 pl-4 mt-2.5">
                                {q.options.map((opt, oIdx) => {
                                  const letter = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
                                  return (
                                    <div key={oIdx} className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                                      <div className="w-5 h-5 rounded-full border-[1.5px] border-slate-400 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 select-none bg-slate-50/50">
                                        {letter}
                                      </div>
                                      <span className="text-[12.5px] leading-tight truncate" title={opt}>{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Opciones de respuesta para Verdadero / Falso */}
                            {isTF && (
                              <div className="flex gap-8 font-sans font-bold text-slate-700 pl-4 mt-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full border-[1.5px] border-slate-400 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                    V
                                  </div>
                                  <span className="text-[12.5px]">Verdadero</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full border-[1.5px] border-slate-400 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                    F
                                  </div>
                                  <span className="text-[12.5px]">Falso</span>
                                </div>
                              </div>
                            )}

                            {/* Líneas de escritura para Preguntas Abiertas */}
                            {isOpen && (
                              <div className="pl-4 pt-2.5 space-y-3">
                                <div className="border-b border-dashed border-slate-350 h-5.5 w-full" />
                                <div className="border-b border-dashed border-slate-350 h-5.5 w-full" />
                                <div className="border-b border-dashed border-slate-350 h-5.5 w-full" />
                                <div className="border-b border-dashed border-slate-350 h-5.5 w-full" />
                                {q.rubric && (
                                  <span className="text-[9px] font-sans font-bold text-slate-400 block tracking-wide italic mt-2">
                                    * {q.rubric.split('\n')[0] || 'Criterio de Evaluación Aplicado'} *
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Footer del examen físico */}
                <div className="border-t border-slate-300 pt-3.5 mt-8 flex justify-between items-center text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest">
                  <span>Generado digitalmente por AulaCore AI</span>
                  <span>Hoja 1 de {includeOMR ? '2' : '1'}</span>
                </div>
              </div>

              {/* PAGE 2: OMR SHEET (IF SELECTED) */}
              {includeOMR && (
                <div className="bg-white border border-slate-200 w-[21cm] min-h-[29.7cm] p-[2cm] mx-auto rounded-xl shadow-2xl text-black font-sans relative overflow-hidden flex flex-col justify-between" style={{ minWidth: '21cm' }}>
                  
                  {/* Optical Alignment corner markers ■ */}
                  <div className="absolute top-[0.8cm] left-[0.8cm] w-3 h-3 bg-black" />
                  <div className="absolute top-[0.8cm] right-[0.8cm] w-3 h-3 bg-black" />
                  <div className="absolute bottom-[0.8cm] left-[0.8cm] w-3 h-3 bg-black" />
                  <div className="absolute bottom-[0.8cm] right-[0.8cm] w-3 h-3 bg-black" />

                  <div className="space-y-6">
                    {/* OMR Header banner block */}
                    <div className="border-b-2 border-black pb-4.5 flex items-stretch justify-between gap-4">
                      <div>
                        <span className="text-[9.5px] font-black uppercase tracking-wider" style={{ color: schoolSettings.primaryColor }}>
                          {schoolSettings.name.toUpperCase()}
                        </span>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">HOJA DE RESPUESTAS OFICIAL OMR</h2>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-md leading-relaxed uppercase tracking-wider">
                          Rellene completamente los óvalos con bolígrafo negro para habilitar la calificación óptica biométrica.
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end shrink-0 justify-center">
                        <div className="w-14 h-14 border border-slate-350 p-1 bg-white rounded-lg flex items-center justify-center">
                          <svg width="44" height="44" viewBox="0 0 29 29" shapeRendering="crispEdges" className="text-black fill-current">
                            <path d="M0 0h7v7H0zM22 0h7v7h-7zM0 22h7v7H0zM2 2h3v3H2zM24 2h3v3h-3zM2 24h3v3H2zM9 0h1v1H9zM12 0h2v1h-2zM15 0h2v1h-2zM18 0h3v1h-3zM9 2h1v1H9zM13 2h2v1h-2z" />
                          </svg>
                        </div>
                        <span className="text-[7.5px] font-bold text-slate-400 mt-1 tracking-widest">{examCode}</span>
                      </div>
                    </div>

                    {/* Student Info Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-[10.5px] font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 uppercase tracking-wider shrink-0">Estudiante:</span>
                        <div className="flex-1 border-b border-slate-350 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 uppercase tracking-wider shrink-0">Documento:</span>
                        <div className="flex-1 border-b border-slate-350 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 uppercase tracking-wider shrink-0">Evaluación:</span>
                        <span className="text-slate-900 font-extrabold truncate">{evaluation.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 uppercase tracking-wider shrink-0">Código ID:</span>
                        <span className="text-slate-900 font-mono font-extrabold tracking-wider">{evaluation.id || 'EVAL-TEMP'}</span>
                      </div>
                    </div>

                    {/* Optical bubble instructions card */}
                    <div className="border border-slate-200 bg-white rounded-xl p-3.5 flex gap-4 text-[10.5px] leading-snug text-slate-600 font-bold">
                      <div className="shrink-0 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
                          <span className="text-[10px] text-emerald-600">Correcto</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-450 flex items-center justify-center font-bold text-[8px] bg-slate-100/50">✖</div>
                          <span className="text-[10px] text-rose-600">Incorrecto</span>
                        </div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        1. Utilice únicamente bolígrafo negro o lápiz mina dura.<br />
                        2. Rellene COMPLETAMENTE el óvalo sin salirse de sus límites.<br />
                        3. No doble la hoja ni haga tachaduras para evitar lecturas erróneas.
                      </div>
                    </div>

                    {/* OMR BUBBLES GRID */}
                    <div className="border border-slate-200 bg-slate-50/40 rounded-2xl p-6.5 max-w-xl mx-auto space-y-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center border-b border-slate-150 pb-2">Matriz de Lectura de Respuestas</span>
                      
                      <div className="divide-y divide-slate-150">
                        {evaluation.questions.map((q, idx) => {
                          const isMC = q.type === 'seleccion_multiple' || q.type === 'matematica';
                          const isTF = q.type === 'verdadero_falso';

                          return (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-6 hover:bg-slate-100/30 px-3 rounded-lg transition-colors">
                              <span className="font-extrabold text-xs text-slate-800 min-w-8">
                                Q{idx + 1}.
                              </span>

                              {isMC ? (
                                <div className="flex gap-4 sm:gap-8 font-black text-xs text-slate-700">
                                  {['A', 'B', 'C', 'D'].map((letter) => (
                                    <div key={letter} className="flex items-center gap-1">
                                      <div className="w-6 h-6 rounded-full border-[1.5px] border-slate-400 hover:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 bg-white cursor-pointer select-none">
                                        {letter}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : isTF ? (
                                <div className="flex gap-6 sm:gap-12 font-black text-xs text-slate-700">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full border-[1.5px] border-slate-400 hover:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 bg-white cursor-pointer select-none">
                                      A
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">V</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full border-[1.5px] border-slate-400 hover:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 bg-white cursor-pointer select-none">
                                      B
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">F</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest italic select-none">
                                  Calificación Directa por Rúbrica
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer de la hoja OMR */}
                  <div className="border-t border-slate-300 pt-3.5 mt-8 flex justify-between items-center text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest">
                    <span>Soporte de lectura automática OMR calibrado</span>
                    <span>Hoja 2 de 2</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
      {/* PRINT-ONLY ROOT WRAPPER FOR NATIVE CLEAN PRINTING */}
      {mounted && createPortal(
        <div id="aulacore-print-area" className="hidden print:block text-black bg-white w-full">
        {/* PAGE 1: EXAM PORTRAIT (ALWAYS PRINTED) */}
        <div className="print-page-break p-[1.5cm] min-h-screen flex flex-col justify-between" style={{ minWidth: '100%' }}>
          <div>
            {/* Cambridge-style Header */}
            <div className="border-[2px] border-black p-4.5 flex items-stretch justify-between gap-4 font-sans" style={{ borderColor: '#000000' }}>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-[13px] font-black tracking-tight leading-none text-black">
                    {schoolSettings.name.toUpperCase()}
                  </h4>
                  <p className="text-[8.5px] font-extrabold tracking-widest text-slate-700 uppercase mt-0.5">
                    {schoolSettings.slogan}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-[9px] font-bold text-slate-800">
                  <div>NIT: {schoolSettings.nit}</div>
                  <div>AÑO LECTIVO: {new Date().getFullYear()}</div>
                  <div>SEDE: {evaluation.campus}</div>
                  <div>DANE: {schoolSettings.daneCode}</div>
                </div>
              </div>
              
              <div className="w-[1px] bg-black self-stretch my-1" />
              
              <div className="w-28 shrink-0 flex flex-col items-center justify-center text-center">
                <img 
                  src={schoolSettings.logoPrincipal} 
                  alt="Logo Colegio" 
                  className="h-14 w-auto object-contain max-h-14"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-aulacore.png';
                  }}
                />
                <span className="text-[7.5px] font-black text-slate-650 tracking-wider uppercase mt-1">Sello Oficial</span>
              </div>
            </div>

            {/* Exam Details */}
            <div className="mt-5 border-b-[1.5px] border-black pb-3.5 flex items-end justify-between gap-4">
              <div className="font-sans">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-700">Evaluación Escrita Oficial</span>
                <h2 className="text-xl font-black tracking-tight text-black mt-0.5">{evaluation.title}</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-bold text-slate-800 mt-1.5">
                  <div>Materia: <span className="font-extrabold">{evaluation.subject}</span></div>
                  <div>Curso: <span className="font-extrabold">{evaluation.course}</span></div>
                  <div>Docente: <span className="font-extrabold">{schoolSettings.rectorName}</span></div>
                  <div>Límite: <span className="font-extrabold">{evaluation.timeLimit} Minutos</span></div>
                </div>
              </div>

              <div className="font-mono text-right shrink-0 flex flex-col items-end">
                <div className="w-12 h-12 border border-black p-0.5 bg-white flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 29 29" shapeRendering="crispEdges" className="text-black fill-current">
                    <path d="M0 0h7v7H0zM22 0h7v7h-7zM0 22h7v7H0zM2 2h3v3H2zM24 2h3v3h-3zM2 24h3v3H2zM9 0h1v1H9zM12 0h2v1h-2zM15 0h2v1h-2z" />
                  </svg>
                </div>
                <span className="text-[7.5px] font-bold text-slate-700 mt-0.5 uppercase tracking-wider">{examCode}</span>
              </div>
            </div>

            {/* Student ID fields */}
            <div className="mt-4 bg-slate-50 border border-black p-3.5 grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-5 text-[10px] font-sans font-bold text-black" style={{ border: '1px solid #000000' }}>
              <div className="md:col-span-2 flex items-center gap-1.5">
                <span className="shrink-0">Estudiante:</span>
                <div className="flex-1 border-b border-dashed border-black h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0">Documento:</span>
                <div className="flex-1 border-b border-dashed border-black h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0">Curso / Grupo:</span>
                <div className="flex-1 border-b border-dashed border-black h-4" />
              </div>
              <div className="md:col-span-2 flex items-center gap-1.5">
                <span className="shrink-0">Fecha:</span>
                <div className="flex-1 border-b border-dashed border-black h-4" />
              </div>
            </div>

            {/* EXAM QUESTIONS LIST */}
            <div className="mt-6 space-y-5 text-[11.5px] leading-relaxed">
              {evaluation.questions.map((q, idx) => {
                const isMC = q.type === 'seleccion_multiple';
                const isTF = q.type === 'verdadero_falso';
                const isMath = q.type === 'matematica';
                const isOpen = q.type === 'abierta';

                return (
                  <div key={q.id || idx} className="print-no-break space-y-1.5">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-extrabold text-black flex-1">
                        <span className="font-sans font-black mr-1 text-black">{idx + 1}.</span> {q.text}
                      </h4>
                      <span className="font-sans font-black text-[9px] text-slate-800 shrink-0 border border-black px-1.5 py-0.2 rounded font-mono">
                        {q.points} PTS
                      </span>
                    </div>

                    {(isMC || isMath) && q.options && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-sans font-semibold text-slate-800 pl-4 mt-2">
                        {q.options.map((opt, oIdx) => {
                          const letter = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
                          return (
                            <div key={oIdx} className="flex items-center gap-2">
                              <div className="w-4.5 h-4.5 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-black shrink-0 bg-white">
                                {letter}
                              </div>
                              <span className="text-[12px] leading-tight truncate">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {isTF && (
                      <div className="flex gap-8 font-sans font-bold text-slate-800 pl-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4.5 h-4.5 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-black shrink-0">V</div>
                          <span className="text-[12px]">Verdadero</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4.5 h-4.5 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-black shrink-0">F</div>
                          <span className="text-[12px]">Falso</span>
                        </div>
                      </div>
                    )}

                    {isOpen && (
                      <div className="pl-4 pt-2 space-y-2.5">
                        <div className="border-b border-dashed border-black h-5 w-full" />
                        <div className="border-b border-dashed border-black h-5 w-full" />
                        <div className="border-b border-dashed border-black h-5 w-full" />
                        <div className="border-b border-dashed border-black h-5 w-full" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Page 1 */}
          <div className="border-t border-black pt-2.5 mt-6 flex justify-between items-center text-[8.5px] font-sans font-bold text-slate-650 uppercase tracking-widest">
            <span>Generado digitalmente por AulaCore AI</span>
            <span>Hoja 1 de {includeOMR ? '2' : '1'}</span>
          </div>
        </div>

        {/* PAGE 2: OMR ANSWER SHEET (PRINT ONLY IF SELECTED) */}
        {includeOMR && (
          <div className="print-page-break p-[1.5cm] min-h-screen flex flex-col justify-between relative" style={{ minWidth: '100%' }}>
            
            {/* Optical Alignment corner markers ■ */}
            <div className="absolute top-[0.6cm] left-[0.6cm] w-2.5 h-2.5 bg-black" />
            <div className="absolute top-[0.6cm] right-[0.6cm] w-2.5 h-2.5 bg-black" />
            <div className="absolute bottom-[0.6cm] left-[0.6cm] w-2.5 h-2.5 bg-black" />
            <div className="absolute bottom-[0.6cm] right-[0.6cm] w-2.5 h-2.5 bg-black" />

            <div className="space-y-5">
              {/* OMR Header banner block */}
              <div className="border-b-2 border-black pb-3.5 flex items-stretch justify-between gap-4">
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-black">
                    {schoolSettings.name.toUpperCase()}
                  </span>
                  <h2 className="text-lg font-black text-black tracking-tight mt-0.5">HOJA DE RESPUESTAS OFICIAL OMR</h2>
                  <p className="text-[9px] text-slate-700 font-bold mt-0.5 max-w-md leading-relaxed uppercase tracking-wider">
                    Rellene completamente los óvalos con bolígrafo negro para habilitar la calificación óptica biométrica.
                  </p>
                </div>

                <div className="text-right flex flex-col items-end shrink-0 justify-center">
                  <div className="w-12 h-12 border border-black p-0.5 bg-white rounded-lg flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 29 29" shapeRendering="crispEdges" className="text-black fill-current">
                      <path d="M0 0h7v7H0zM22 0h7v7h-7zM0 22h7v7H0zM2 2h3v3H2zM24 2h3v3h-3z" />
                    </svg>
                  </div>
                  <span className="text-[7px] font-bold text-slate-700 mt-0.5 tracking-widest">{examCode}</span>
                </div>
              </div>

              {/* Student Info Box */}
              <div className="border border-black p-3 grid grid-cols-2 gap-y-3 gap-x-5 text-[9.5px] font-bold text-black" style={{ border: '1px solid #000000' }}>
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">Estudiante:</span>
                  <div className="flex-1 border-b border-dashed border-black h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">Documento:</span>
                  <div className="flex-1 border-b border-dashed border-black h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">Evaluación:</span>
                  <span className="font-extrabold truncate">{evaluation.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">Código ID:</span>
                  <span className="font-mono font-extrabold tracking-wider">{evaluation.id || 'EVAL-TEMP'}</span>
                </div>
              </div>

              {/* Optical bubble instructions card */}
              <div className="border border-black bg-white p-3 flex gap-3 text-[9.5px] leading-snug text-slate-700 font-bold" style={{ border: '1px solid #000000' }}>
                <div className="shrink-0 space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-black" />
                    <span className="text-[9px]">Correcto</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-black flex items-center justify-center font-bold text-[7px] bg-slate-100">✖</div>
                    <span className="text-[9px]">Incorrecto</span>
                  </div>
                </div>
                <div className="border-l border-black pl-3" style={{ borderLeftColor: '#000000' }}>
                  1. Utilice únicamente bolígrafo negro o lápiz mina dura.<br />
                  2. Rellene COMPLETAMENTE el óvalo sin salirse de sus límites.<br />
                  3. No doble la hoja ni haga tachaduras para evitar lecturas erróneas.
                </div>
              </div>

              {/* OMR BUBBLES GRID */}
              <div className="border border-black bg-white p-5 max-w-xl mx-auto space-y-4" style={{ border: '1px solid #000000' }}>
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest block text-center border-b border-slate-300 pb-1.5">Matriz de Lectura de Respuestas</span>
                
                <div className="divide-y divide-slate-200">
                  {evaluation.questions.map((q, idx) => {
                    const isMC = q.type === 'seleccion_multiple' || q.type === 'matematica';
                    const isTF = q.type === 'verdadero_falso';

                    return (
                      <div key={idx} className="py-2 flex items-center justify-between gap-4">
                        <span className="font-extrabold text-xs text-black min-w-8">
                          Q{idx + 1}.
                        </span>

                        {isMC ? (
                          <div className="flex gap-6 font-black text-xs text-black">
                            {['A', 'B', 'C', 'D'].map((letter) => (
                              <div key={letter} className="flex items-center gap-1">
                                <div className="w-5.5 h-5.5 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-black bg-white">
                                  {letter}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : isTF ? (
                          <div className="flex gap-8 font-black text-xs text-black">
                            <div className="flex items-center gap-1">
                              <div className="w-5.5 h-5.5 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-black bg-white">
                                A
                              </div>
                              <span className="text-[9px] font-bold text-slate-700">V</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-5.5 h-5.5 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-black bg-white">
                                B
                              </div>
                              <span className="text-[9px] font-bold text-slate-700">F</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-widest italic">
                            Calificación Directa por Rúbrica
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Page 2 */}
            <div className="border-t border-black pt-2.5 mt-6 flex justify-between items-center text-[8.5px] font-sans font-bold text-slate-600 uppercase tracking-widest">
              <span>Soporte de lectura automática OMR calibrado</span>
              <span>Hoja 2 de 2</span>
            </div>
          </div>
        )}
        </div>,
        document.body
      )}

    </div>
  );
}
