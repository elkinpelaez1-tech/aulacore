'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onActionClick?: () => void;
  statusLabel?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  onActionClick,
  statusLabel = 'Fase de Integración de Datos (Próxima Etapa)',
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-300 shadow-none rounded-2xl p-10 bg-slate-50/20 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center animate-pulse">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          {statusLabel}
        </span>

        {actionText && onActionClick && (
          <button
            onClick={onActionClick}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>
    </Card>
  );
}
