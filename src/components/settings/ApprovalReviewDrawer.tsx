'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, FileText, UserCircle2, ShieldAlert, FileWarning, Eye, AlertCircle } from 'lucide-react';
import { PendingApproval } from '@/lib/data/mock-settings';
import { cn } from '@/lib/utils';

interface ApprovalReviewDrawerProps {
  approval: PendingApproval | null;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onCorrectionNeeded: (id: string, notes?: string) => void;
  onUpdateDocumentStatus: (approvalId: string, docId: string, newStatus: 'Validado' | 'Pendiente' | 'Rechazado') => void;
  onSaveObservations: (id: string, observations: string) => void;
}

export function ApprovalReviewDrawer({ 
  approval, 
  onClose,
  onApprove,
  onReject,
  onCorrectionNeeded,
  onUpdateDocumentStatus,
  onSaveObservations
}: ApprovalReviewDrawerProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(approval?.observations || '');
  }, [approval?.id, approval?.observations]);

  if (!approval) return null;

  const toggleDocStatus = (docId: string, currentStatus: 'Validado' | 'Pendiente' | 'Rechazado') => {
    const order: ('Validado' | 'Pendiente' | 'Rechazado')[] = ['Validado', 'Pendiente', 'Rechazado'];
    const nextIdx = (order.indexOf(currentStatus) + 1) % order.length;
    onUpdateDocumentStatus(approval.id, docId, order[nextIdx]);
  };

  const handleBlurNotes = () => {
    onSaveObservations(approval.id, notes);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-in fade-in cursor-pointer"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">{approval.name}</h2>
              <p className="text-xs font-medium text-slate-500 mb-2">{approval.email}</p>
              <div className="flex gap-2">
                <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Rol: {approval.type}
                </span>
                {approval.riskScore !== undefined && (
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1",
                    approval.riskScore > 50 ? "bg-rose-50 border border-rose-200 text-rose-700" : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  )}>
                    <ShieldAlert className="w-3 h-3" /> IA Riesgo: {approval.riskScore}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Micro-interaction notice */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2 text-indigo-800 text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
            <p className="font-semibold">
              Tip: Haz clic en la etiqueta de validación de un documento para alternar rápidamente entre Validado, Pendiente y Rechazado.
            </p>
          </div>

          {/* Documents Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documentos Adjuntos
            </h3>
            
            <div className="space-y-3">
              {approval.documents?.map(doc => (
                <div key={doc.id} className="group border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      doc.type === 'PDF' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                    )}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{doc.size} &bull; {doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleDocStatus(doc.id, doc.status)}
                      title="Click para cambiar estado de validación"
                      className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95",
                        doc.status === 'Validado' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                        doc.status === 'Rechazado' ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      )}
                    >
                      {doc.status}
                    </button>
                    {doc.url ? (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center p-1 rounded hover:bg-slate-100" 
                        title="Ver documento"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    ) : (
                      <button className="text-slate-400 hover:text-indigo-650 transition-colors cursor-pointer" title="Previsualizar documento">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {approval.documentStatus === 'Faltante' && (
                <div className="bg-rose-50 border border-rose-200 border-dashed rounded-xl p-4 flex items-center gap-3 animate-in shake duration-300">
                  <FileWarning className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-xs font-semibold text-rose-700">Faltan documentos obligatorios para completar este perfil. Requiere intervención.</p>
                </div>
              )}
            </div>
          </div>

          {/* Observations Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Observaciones Administrativas</h3>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleBlurNotes}
              placeholder="Añadir nota interna (ej. Falta firmar página 2)..." 
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-indigo-500 resize-none transition-colors"
            ></textarea>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button 
            onClick={() => onCorrectionNeeded(approval.id, notes)}
            className="col-span-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Solicitar Corrección
          </button>
          <button 
            onClick={() => onApprove(approval.id, notes)}
            className="col-span-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Aprobar Perfil
          </button>
          <button 
            onClick={() => onReject(approval.id, notes)}
            className="col-span-2 px-4 py-2 mt-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Rechazar e invalidar
          </button>
        </div>

      </div>
    </>
  );
}
