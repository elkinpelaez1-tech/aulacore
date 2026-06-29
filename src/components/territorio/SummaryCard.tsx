'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  children,
  headerActions,
  className,
}: SummaryCardProps) {
  return (
    <Card className={`border-slate-200 shadow-sm rounded-2xl bg-white ${className}`}>
      <CardHeader className="border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between gap-4 bg-slate-50/20">
        <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider block truncate">
          {title}
        </CardTitle>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
