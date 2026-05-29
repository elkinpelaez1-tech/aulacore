import { AppLayout } from '@/components/layout';
import { CourseIntelligenceGrid } from '@/components/courses/CourseIntelligenceGrid';

export default function CursosPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Intelligence Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Centro operacional y analítico de unidades académicas, horarios y directores.</p>
        </div>
        
        <CourseIntelligenceGrid />
      </div>
    </AppLayout>
  );
}
