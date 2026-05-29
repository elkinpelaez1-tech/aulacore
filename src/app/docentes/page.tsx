import { AppLayout } from '@/components/layout';
import { TeacherIntelligenceGrid } from '@/components/directory/TeacherIntelligenceGrid';

export default function DocentesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Gestión Docente</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Directorio interactivo, cargas académicas y análisis de horarios institucionales.</p>
        </div>
        
        <TeacherIntelligenceGrid />
      </div>
    </AppLayout>
  );
}
