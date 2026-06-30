'use client';

import React, { useState } from 'react';
import { HelpCircle, BookOpen, GraduationCap, Gavel, Award } from 'lucide-react';
import { HELP_GLOSSARY, logHelpQuery } from '@/services/help-glossary';
import { Modal } from './Modal';

interface AulaHelpProps {
  helpId: string;
  className?: string;
}

export function AulaHelp({ helpId, className = 'inline-block ml-1 align-middle' }: AulaHelpProps) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const item = HELP_GLOSSARY[helpId];

  if (!item) {
    // Si no está registrado en el glosario, no renderizar nada o mostrar ID de depuración
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logHelpQuery(helpId);
    setModalOpen(true);
  };

  return (
    <>
      <div 
        className={`relative ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          onClick={handleClick}
          className="text-slate-400 hover:text-indigo-600 transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center justify-center focus:outline-none"
          title="Ver Guía Metodológica"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Hover Tooltip Flotante Premium */}
        {hovered && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-lg leading-normal animate-fade-in pointer-events-none border border-slate-800 font-sans">
            <span className="font-extrabold text-indigo-400 block mb-0.5">{item.title}</span>
            <p className="font-medium text-slate-300">{item.tooltip}</p>
            <span className="block text-[8px] text-slate-500 font-extrabold mt-1 text-right">Click para ver más ➔</span>
            
            {/* Pequeña flecha del Tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </div>
        )}
      </div>

      {/* 🧭 MODAL DE INFORMACIÓN ESTRUCTURADA DE AYUDA CONTEXTUAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={item.title}
        subtitle="Guía de Asistencia Contextual AulaHelp"
        sizeClassName="max-w-xl"
        footer={
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
          >
            Entendido
          </button>
        }
      >
        <div className="space-y-4 text-xs leading-relaxed text-slate-655 font-semibold">
          {/* ¿Qué es? */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              ¿Qué es?
            </span>
            <p className="text-slate-700">{item.whatIs}</p>
          </div>

          {/* ¿Por qué es importante? */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              ¿Por qué es importante?
            </span>
            <p className="text-slate-700">{item.whyImportant}</p>
          </div>

          {/* ¿Cómo se calcula? */}
          {item.howCalculated && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">
                ¿Cómo se calcula?
              </span>
              <p className="text-slate-700 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                {item.howCalculated}
              </p>
            </div>
          )}

          {/* ¿Qué decisiones permite tomar? */}
          <div className="space-y-1 pt-2 border-t border-slate-100 bg-indigo-50/10 p-3 rounded-xl border border-indigo-100">
            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block">
              ¿Qué decisiones permite tomar?
            </span>
            <p className="text-indigo-950 font-bold">{item.decisions}</p>
          </div>

          {/* Buenas prácticas */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">
              Buenas Prácticas recomendadas
            </span>
            <p className="text-slate-700">{item.bestPractices}</p>
          </div>

          {/* Caso práctico */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Caso Práctico Territorial
            </span>
            <p className="text-slate-500 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-150">
              "{item.caseStudy}"
            </p>
          </div>

          {/* Normatividad */}
          {item.regulation && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                <Gavel className="w-3.5 h-3.5" />
                Normatividad y Marco Legal
              </span>
              <p className="text-slate-500 font-medium text-[11px]">{item.regulation}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
