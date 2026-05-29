'use client';

import React, { useState } from 'react';
import { X, Link2, Settings2, ShieldCheck, QrCode, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagicLink } from '@/lib/data/mock-settings';

interface MagicLinkGeneratorModalProps {
  onClose: () => void;
  onGenerate: (link: MagicLink) => void;
}

export function MagicLinkGeneratorModal({ onClose, onGenerate }: MagicLinkGeneratorModalProps) {
  const [step, setStep] = useState<'config' | 'success'>('config');
  const [linkType, setLinkType] = useState('Matrícula');
  const [autoRole, setAutoRole] = useState('Estudiante');
  const [requireApproval, setRequireApproval] = useState(true);
  const [generatedLinkUrl, setGeneratedLinkUrl] = useState('');
  const [generatedLinkName, setGeneratedLinkName] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const url = `aulacore.com/join/${linkType.toLowerCase().substring(0, 3)}-${randomSuffix}`;
    const name = `${linkType} ${autoRole === 'Estudiante' ? 'Secundaria' : autoRole} 2026`;
    
    const newLink: MagicLink = {
      id: 'ml-' + Date.now(),
      name,
      type: linkType === 'Matrícula' ? 'Matrícula Abierta' : linkType === 'Docentes' ? 'Invitación Docente' : 'Actualización Datos',
      uses: 0,
      maxUses: 'Ilimitado',
      completed: 0,
      abandoned: 0,
      status: 'Activo',
      createdAt: 'Hace un momento',
      lastActive: 'Nunca',
      url,
      autoRole
    };

    setGeneratedLinkUrl(url);
    setGeneratedLinkName(name);
    onGenerate(newLink);
    
    // Auto-copy generated URL to clipboard as a premium SaaS convenience!
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    setStep('success');
  };

  const handleManualCopy = () => {
    navigator.clipboard.writeText(generatedLinkUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Generador de Enlace Mágico</h2>
              <p className="text-[10px] font-medium text-slate-500">Auto-onboarding inteligente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'config' ? (
            <div className="space-y-6">
              
              {/* Tipo de Enlace */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tipo de Flujo</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Matrícula', 'Docentes', 'Actualización'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setLinkType(type);
                        if (type === 'Docentes') setAutoRole('Docente');
                        else if (type === 'Actualización') setAutoRole('Acudiente');
                        else setAutoRole('Estudiante');
                      }}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                        linkType === type 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Asignación de Rol
                  </label>
                  <select 
                    value={autoRole} onChange={(e) => setAutoRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option>Estudiante</option>
                    <option>Docente</option>
                    <option>Acudiente</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
                    <Settings2 className="w-3 h-3" /> Límite de Usos
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500">
                    <option>Ilimitado</option>
                    <option>1 uso único</option>
                    <option>10 usos</option>
                  </select>
                </div>
              </div>

              {/* Toggles Premium */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Aprobación Obligatoria</h4>
                    <p className="text-[10px] text-slate-500">Requerir validación manual en la cola antes de crear el perfil.</p>
                  </div>
                  <button 
                    onClick={() => setRequireApproval(!requireApproval)}
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                      requireApproval ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                      requireApproval ? "left-5" : "left-1"
                    )}></div>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">¡Enlace Generado!</h3>
              <p className="text-sm text-slate-500 mb-6">El flujo de {linkType} está listo y ha sido copiado al portapapeles.</p>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl mb-6">
                <div className="flex-1 text-xs font-mono text-slate-600 truncate select-all text-left">
                  {generatedLinkUrl}
                </div>
                <button 
                  onClick={handleManualCopy}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer",
                    isCopied ? "bg-emerald-100 text-emerald-800" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  )}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center gap-3">
                <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer">
                  <QrCode className="w-4 h-4" /> Descargar QR
                </button>
                <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  Cerrar panel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'config' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button onClick={handleGenerate} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">
              Generar Enlace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
