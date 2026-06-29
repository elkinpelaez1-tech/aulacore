'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  headerActions,
  className,
}: ChartCardProps) {
  return (
    <Card className={`border-slate-200 shadow-sm rounded-2xl bg-white ${className}`}>
      <CardHeader className="border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider block truncate">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs font-semibold text-slate-450 mt-0.5 block truncate">
              {description}
            </CardDescription>
          )}
        </div>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
