import { AppLayout } from '@/components/layout';
import { StudentIntelligenceGrid } from '@/components/students/StudentIntelligenceGrid';

export default function EstudiantesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Intelligence Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Directorio interactivo, analítica institucional y gestión 360° de estudiantes.</p>
        </div>
        
        <StudentIntelligenceGrid />
      </div>
    </AppLayout>
  );
}
