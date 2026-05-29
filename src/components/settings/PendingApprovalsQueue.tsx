'use client';

import React, { useState } from 'react';
import { PendingApproval } from '@/lib/data/mock-settings';
import { Check, X, Search, FileText, UserCircle2, ChevronRight } from 'lucide-react';
import { ApprovalReviewDrawer } from './ApprovalReviewDrawer';
import { cn } from '@/lib/utils';

interface PendingApprovalsQueueProps {
  pendingApprovals: PendingApproval[];
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onCorrectionNeeded: (id: string, notes?: string) => void;
  onUpdateDocumentStatus: (approvalId: string, docId: string, newStatus: 'Validado' | 'Pendiente' | 'Rechazado') => void;
  onSaveObservations: (id: string, observations: string) => void;
}

export function PendingApprovalsQueue({
  pendingApprovals,
  onApprove,
  onReject,
  onCorrectionNeeded,
  onUpdateDocumentStatus,
  onSaveObservations
}: PendingApprovalsQueueProps) {
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle case where selectedApproval is updated in the list or deleted
  const currentSelected = selectedApproval 
    ? pendingApprovals.find(p => p.id === selectedApproval.id) || null
    : null;

  const filteredApprovals = pendingApprovals.filter(approval => 
    approval.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    approval.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div> Cola de Aprobación
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {pendingApprovals.length} registros esperando validación
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o correo..." 
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredApprovals.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-semibold">
              No se encontraron registros
            </div>
          ) : (
            filteredApprovals.map(approval => (
              <div 
                key={approval.id} 
                onClick={() => setSelectedApproval(approval)}
                className="p-5 hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <UserCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{approval.name}</h4>
                      <p className="text-xs font-medium text-slate-500 mb-2">{approval.email}</p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                          {approval.type}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
                          approval.documentStatus === 'Validado' ? "bg-emerald-100 text-emerald-700" :
                          approval.documentStatus === 'Faltante' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                        )}>
                          <FileText className="w-3 h-3" /> docs: {approval.documentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{approval.submittedAt}</span>
                    <div className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-2">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ApprovalReviewDrawer 
        approval={currentSelected} 
        onClose={() => setSelectedApproval(null)} 
        onApprove={(id, notes) => {
          onApprove(id, notes);
          setSelectedApproval(null);
        }}
        onReject={(id, notes) => {
          onReject(id, notes);
          setSelectedApproval(null);
        }}
        onCorrectionNeeded={(id, notes) => {
          onCorrectionNeeded(id, notes);
        }}
        onUpdateDocumentStatus={onUpdateDocumentStatus}
        onSaveObservations={onSaveObservations}
      />
    </>
  );
}
