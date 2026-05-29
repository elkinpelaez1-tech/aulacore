'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/providers/role-provider';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnotacionesPage() {
  const { userRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (userRole === 'padre_familia') {
      router.replace('/dashboard?tab=observador');
    }
  }, [userRole, router]);

  if (userRole === 'padre_familia') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold animate-pulse">Redirigiendo al Student Success Center...</p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Anotaciones</h1>
            <p className="text-sm text-slate-500">Diario de campo y seguimiento comportamental</p>
          </div>
        </div>

        <Card className="p-8 border-slate-200 border-2 border-dashed bg-white">
          <div className="flex items-center gap-4 text-center w-full justify-center flex-col py-8">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h2 className="text-xl font-bold text-slate-900">Diario de Campo</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Las anotaciones de los docentes sobre el comportamiento del estudiante se integran de forma nativa en el <span className="font-semibold text-rose-600">Dashboard Principal</span> en la sección de Alertas y Semáforo.
              </p>
              <Link href="/dashboard">
                <Button className="mt-6 bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-5 py-2 cursor-pointer font-semibold shadow-sm transition">
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
