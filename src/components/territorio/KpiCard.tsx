'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function KpiCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColorClass = 'text-indigo-600',
  iconBgClass = 'bg-indigo-50',
}: KpiCardProps) {
  return (
    <Card className="border-slate-200 shadow-xs rounded-2xl p-5 flex items-start justify-between bg-white hover:border-slate-350 transition-all duration-200">
      <div className="space-y-2.5 min-w-0">
        <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block truncate">
          {title}
        </span>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-black text-slate-800 tracking-tight block">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              {trend.label && (
                <span className="text-slate-400 font-semibold ml-0.5">{trend.label}</span>
              )}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[10px] text-slate-400 font-semibold block truncate">
            {description}
          </p>
        )}
      </div>

      <div className={`w-10 h-10 ${iconBgClass} ${iconColorClass} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </Card>
  );
}
