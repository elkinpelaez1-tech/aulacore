'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  sizeClassName?: string; // por defecto 'max-w-lg'
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  sizeClassName = 'max-w-lg',
  footer,
  children
}: ModalProps) {
  
  // Cierre automático al presionar Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 cursor-pointer" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className={`relative w-full ${sizeClassName} bg-white shadow-2xl rounded-3xl flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden z-10 animate-scale-in`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/40 flex justify-between items-start shrink-0">
          <div>
            {subtitle && (
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                {subtitle}
              </span>
            )}
            {title && (
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider mt-0.5">
                {title}
              </h3>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-all duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs leading-normal">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
