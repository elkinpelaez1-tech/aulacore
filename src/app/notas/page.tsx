'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/providers/role-provider';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GradesOverview } from '@/components/grades/GradesOverview';
import { SubjectCardsGrid } from '@/components/grades/SubjectCardsGrid';

export default function NotasPage() {
  const { userRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (userRole === 'padre_familia') {
      router.replace('/dashboard?tab=notas');
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Notas</h1>
            <p className="text-sm text-slate-500">Rendimiento Académico y Progreso por Materias</p>
          </div>
        </div>

        <div className="mt-8">
          <GradesOverview />
          <SubjectCardsGrid />
        </div>
      </div>
    </AppLayout>
  );
}

