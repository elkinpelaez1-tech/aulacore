'use client';

import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ObservacionesPage() {
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Observador del Estudiante</h1>
            <p className="text-sm text-slate-500">Módulo de Seguimiento de Convivencia y Conducta Oficial</p>
          </div>
        </div>

        <Card className="p-8 border-slate-200 border-2 border-dashed bg-white">
          <div className="flex items-center gap-4 text-center w-full justify-center flex-col py-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h2 className="text-xl font-bold text-slate-900">Seguimiento de Convivencia Escolar</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Este módulo está totalmente integrado en la base de datos de AulaCore. Para experimentar las operaciones interactivas de anotaciones de convivencia en caliente por cada rol directivo, por favor dirígete al <span className="font-semibold text-indigo-600">Dashboard Principal</span> en el menú lateral.
              </p>
              <Link href="/dashboard">
                <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2 cursor-pointer font-semibold shadow-sm transition">
                  Ir al Dashboard Principal
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
