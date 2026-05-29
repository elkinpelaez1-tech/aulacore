'use client';

import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DirectorsGrid } from '@/components/directory/DirectorsGrid';

export default function DirectoresPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Directores de Grupo</h1>
            <p className="text-sm text-slate-500">Módulo Administrativo de Coordinación Docente</p>
          </div>
        </div>

        <DirectorsGrid />
      </div>
    </AppLayout>
  );
}
