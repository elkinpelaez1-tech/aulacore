'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout';
import { useRole } from '@/providers/role-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Target, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import modular components
import { PeiDashboard } from '@/components/pei/PeiDashboard';
import { PeiIdentity } from '@/components/pei/PeiIdentity';
import { PeiPedagogicalModel } from '@/components/pei/PeiPedagogicalModel';
import { PeiSchoolGovernment } from '@/components/pei/PeiSchoolGovernment';
import { PeiManualConvivencia } from '@/components/pei/PeiManualConvivencia';
import { PeiProjects } from '@/components/pei/PeiProjects';

// Define DEFAULT SEED DATA for offline presentation
const SEED_IDENTITY = {
  mission: 'Formar líderes éticos, creativos y competentes mediante una educación de excelencia e integral que promueva el desarrollo sostenible y la paz social.',
  vision: 'Ser en el 2030 una institución educativa referente a nivel nacional por su innovación pedagógica, el liderazgo digital y el compromiso social de sus egresados.',
  principles: 'La centralidad del estudiante en el aprendizaje, la justicia social, el respeto a la diversidad y la investigación científica.',
  values: 'Respeto, Honestidad, Responsabilidad, Empatía, Solidaridad, Tolerancia.',
  studentProfile: 'Estudiante crítico, indagador, ético, autónomo en su aprendizaje y comprometido con su comunidad.',
  teacherProfile: 'Docente facilitador, actualizado, investigador, que promueve la creatividad y la inclusión pedagógica.',
  graduateProfile: 'Ciudadano integral, emprendedor, con altas competencias académicas, comunicativas y habilidades digitales.'
};

const SEED_MODEL = {
  modelType: 'Constructivista',
  description: 'El modelo pedagógico de AulaCore se fundamenta en el constructivismo social, donde el aprendizaje es un proceso activo de construcción de significado. El estudiante conecta nuevos saberes con sus experiencias previas mediante el trabajo colaborativo, la investigación guiada y la resolución de problemas reales (ABP), acompañado por el docente como facilitador.'
};

const SEED_GOVERNMENT = [
  { id: 'gov-1', body_type: 'Rector', member_name: 'Dr. Ramón Ramírez', role_title: 'Rector de la Institución', period: '2026' },
  { id: 'gov-2', body_type: 'Consejo Directivo', member_name: 'Dr. Ramón Ramírez', role_title: 'Presidente', period: '2026' },
  { id: 'gov-3', body_type: 'Consejo Directivo', member_name: 'Dra. Diana Carolina Reyes', role_title: 'Representante de Docentes', period: '2026' },
  { id: 'gov-4', body_type: 'Consejo Académico', member_name: 'Lic. Carlos Martínez', role_title: 'Representante de Humanidades', period: '2026' },
  { id: 'gov-5', body_type: 'Consejo Estudiantil', member_name: 'Mateo Gómez', role_title: 'Representante Grado Décimo', period: '2026' },
  { id: 'gov-6', body_type: 'Personero', member_name: 'Alejandro Ortiz', role_title: 'Personero de Estudiantes', period: '2026' },
  { id: 'gov-7', body_type: 'Contralor Escolar', member_name: 'Sofía Ramírez', role_title: 'Contralora Escolar', period: '2026' },
  { id: 'gov-8', body_type: 'Consejo de Padres', member_name: 'Carlos Ortiz', role_title: 'Representante Grado Décimo A', period: '2026' }
];

const SEED_MANUAL_VERSIONS = [
  { id: 'man-1', version: '1.0.0', pdf_url: '/manual-convivencia-v1.0.pdf', update_notes: 'Versión inicial aprobada por el Consejo Directivo en 2024.', is_active: false, created_at: '2024-02-15' },
  { id: 'man-2', version: '2.0.0', pdf_url: '/manual-convivencia-v2.0.pdf', update_notes: 'Ajuste de normativas de uso de celulares en el aula y actualización de rutas de atención de la Ley 1620.', is_active: true, created_at: '2026-01-20' }
];

const SEED_PROJECTS = [
  {
    id: 'proj-1',
    project_type: 'PRAE',
    objective: 'Promover una cultura de reciclaje, conservación del agua y manejo adecuado de residuos sólidos dentro del colegio para mitigar el impacto ambiental.',
    responsible: 'Lic. Diana Carolina Reyes',
    schedule: 'Marzo a Noviembre - Actividades semanales de compostaje y jornadas mensuales ecológicas.',
    evidences: ['/evidencias/prae-jornada-siembra.jpg', '/evidencias/taller-reciclaje.pdf'],
    status: 'Activo',
    indicators: '92% de cobertura de participación estudiantil; 450 kg de material reciclable clasificado.'
  },
  {
    id: 'proj-2',
    project_type: 'Democracia',
    objective: 'Fomentar la cultura de la participación cívica y la toma de decisiones democráticas mediante el proceso de elección del Gobierno Escolar.',
    responsible: 'Lic. Carlos Martínez',
    schedule: 'Febrero a Marzo - Debates electorales, votación digital RFID y posesión oficial.',
    evidences: ['/evidencias/acta-posesion-personero.pdf', '/evidencias/graficas-escrutinio.png'],
    status: 'Completado',
    indicators: '100% de estudiantes habilitaron y votaron mediante las terminales IoT de AulaCore.'
  },
  {
    id: 'proj-3',
    project_type: 'Orientador Escolar',
    objective: 'Brindar acompañamiento psicosocial continuo y realizar talleres preventivos de salud mental, orientación vocacional y convivencia familiar.',
    responsible: 'Dra. Elena Toro',
    schedule: 'Permanente - Tutorías individuales los martes y jueves por la tarde, talleres grupales mensuales.',
    evidences: ['/evidencias/taller-prevencion-ansiedad.pdf'],
    status: 'Activo',
    indicators: '45 tutorías individuales realizadas; 10 talleres grupales ejecutados con éxito.'
  }
];

export default function PeiPage() {
  const { userRole, userName, mounted } = useRole();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'identidad' | 'modelo' | 'gobierno' | 'manual' | 'proyectos'>('dashboard');

  // Modular states loaded from DB or LocalStorage fallback
  const [identity, setIdentity] = useState<any>(SEED_IDENTITY);
  const [model, setModel] = useState<any>(SEED_MODEL);
  const [government, setGovernment] = useState<any[]>(SEED_GOVERNMENT);
  const [manualVersions, setManualVersions] = useState<any[]>(SEED_MANUAL_VERSIONS);
  const [projects, setProjects] = useState<any[]>(SEED_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    // Redirección o bloqueo de acceso para roles no permitidos (Estudiante o Padre de familia)
    if (userRole === 'estudiante' || userRole === 'padre_familia') {
      return; // El componente renderizará la vista de error de permisos
    }

    async function loadPeiData() {
      try {
        setLoading(true);

        // Intentar consultar Supabase en caliente
        const { data: identityDb } = await supabase.from('pei_identity').select('*').limit(1).maybeSingle();
        const { data: modelDb } = await supabase.from('pei_pedagogical_model').select('*').limit(1).maybeSingle();
        const { data: governmentDb } = await supabase.from('pei_school_government').select('*').order('created_at', { ascending: true });
        const { data: manualDb } = await supabase.from('pei_manual_versions').select('*').order('created_at', { ascending: false });
        const { data: projectsDb } = await supabase.from('pei_projects').select('*').order('created_at', { ascending: true });

        // Sincronización con base de datos remota
        if (identityDb) setIdentity({
          mission: identityDb.mission,
          vision: identityDb.vision,
          principles: identityDb.principles,
          values: identityDb.values,
          studentProfile: identityDb.student_profile,
          teacherProfile: identityDb.teacher_profile,
          graduateProfile: identityDb.graduate_profile
        });
        if (modelDb) setModel({
          modelType: modelDb.model_type,
          description: modelDb.description
        });
        if (governmentDb && governmentDb.length > 0) setGovernment(governmentDb);
        if (manualDb && manualDb.length > 0) setManualVersions(manualDb);
        if (projectsDb && projectsDb.length > 0) setProjects(projectsDb);

        // Cargar desde LocalStorage para persistencia local de demostración
        const savedIdentity = localStorage.getItem('aulacore-pei-identity');
        const savedModel = localStorage.getItem('aulacore-pei-model');
        const savedGovernment = localStorage.getItem('aulacore-pei-government');
        const savedManual = localStorage.getItem('aulacore-pei-manual');
        const savedProjects = localStorage.getItem('aulacore-pei-projects');

        if (savedIdentity && !identityDb) setIdentity(JSON.parse(savedIdentity));
        if (savedModel && !modelDb) setModel(JSON.parse(savedModel));
        if (savedGovernment && (!governmentDb || governmentDb.length === 0)) setGovernment(JSON.parse(savedGovernment));
        if (savedManual && (!manualDb || manualDb.length === 0)) setManualVersions(JSON.parse(savedManual));
        if (savedProjects && (!projectsDb || projectsDb.length === 0)) setProjects(JSON.parse(savedProjects));

        // Inicializar LocalStorage si está vacío
        if (!savedIdentity) localStorage.setItem('aulacore-pei-identity', JSON.stringify(SEED_IDENTITY));
        if (!savedModel) localStorage.setItem('aulacore-pei-model', JSON.stringify(SEED_MODEL));
        if (!savedGovernment) localStorage.setItem('aulacore-pei-government', JSON.stringify(SEED_GOVERNMENT));
        if (!savedManual) localStorage.setItem('aulacore-pei-manual', JSON.stringify(SEED_MANUAL_VERSIONS));
        if (!savedProjects) localStorage.setItem('aulacore-pei-projects', JSON.stringify(SEED_PROJECTS));

      } catch (err) {
        console.warn('Supabase fetch failed in PEI page. Utilizing LocalStorage cache.');
      } finally {
        setLoading(false);
      }
    }

    loadPeiData();
  }, [mounted, userRole]);

  // Handler para guardar Identidad
  const handleSaveIdentity = async (updatedData: any) => {
    setIdentity(updatedData);
    localStorage.setItem('aulacore-pei-identity', JSON.stringify(updatedData));

    // Intentar escribir en Supabase
    try {
      const payload = {
        institution_id: '11111111-1111-1111-1111-111111111111',
        mission: updatedData.mission,
        vision: updatedData.vision,
        principles: updatedData.principles,
        values: updatedData.values,
        student_profile: updatedData.studentProfile,
        teacher_profile: updatedData.teacherProfile,
        graduate_profile: updatedData.graduateProfile,
        updated_at: new Date().toISOString()
      };
      
      const { data } = await supabase.from('pei_identity').select('id').limit(1).maybeSingle();
      if (data) {
        await supabase.from('pei_identity').update(payload).eq('id', data.id);
      } else {
        await supabase.from('pei_identity').insert(payload);
      }
    } catch (e) {}
  };

  // Handler para guardar Modelo
  const handleSaveModel = async (updatedData: any) => {
    setModel(updatedData);
    localStorage.setItem('aulacore-pei-model', JSON.stringify(updatedData));

    // Intentar escribir en Supabase
    try {
      const payload = {
        institution_id: '11111111-1111-1111-1111-111111111111',
        model_type: updatedData.modelType,
        description: updatedData.description,
        updated_at: new Date().toISOString()
      };

      const { data } = await supabase.from('pei_pedagogical_model').select('id').limit(1).maybeSingle();
      if (data) {
        await supabase.from('pei_pedagogical_model').update(payload).eq('id', data.id);
      } else {
        await supabase.from('pei_pedagogical_model').insert(payload);
      }
    } catch (e) {}
  };

  // Handler para guardar Gobierno
  const handleSaveGovernment = async (updatedData: any[]) => {
    setGovernment(updatedData);
    localStorage.setItem('aulacore-pei-government', JSON.stringify(updatedData));
    
    // En demo, el local storage actúa de forma asíncrona. Si hay supabase activo, se sincroniza mediante la API.
    try {
      // Para simplicidad en demo, sobrescribimos los integrantes vinculados al tenant
      // en Supabase mediante una transacción rápida.
      await supabase.from('pei_school_government').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(m => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        body_type: m.body_type,
        member_name: m.member_name,
        role_title: m.role_title,
        period: m.period
      }));
      await supabase.from('pei_school_government').insert(payload);
    } catch (e) {}
  };

  // Handler para guardar versiones de Manual
  const handleSaveManual = async (updatedData: any[]) => {
    setManualVersions(updatedData);
    localStorage.setItem('aulacore-pei-manual', JSON.stringify(updatedData));

    try {
      await supabase.from('pei_manual_versions').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(v => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        version: v.version,
        pdf_url: v.pdf_url,
        update_notes: v.update_notes,
        is_active: v.is_active,
        created_at: v.created_at
      }));
      await supabase.from('pei_manual_versions').insert(payload);
    } catch (e) {}
  };

  // Handler para guardar Proyectos
  const handleSaveProjects = async (updatedData: any[]) => {
    setProjects(updatedData);
    localStorage.setItem('aulacore-pei-projects', JSON.stringify(updatedData));

    try {
      await supabase.from('pei_projects').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(p => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        project_type: p.project_type,
        objective: p.objective,
        responsible: p.responsible,
        schedule: p.schedule,
        evidences: p.evidences,
        status: p.status,
        indicators: p.indicators
      }));
      await supabase.from('pei_projects').insert(payload);
    } catch (e) {}
  };

  // Escudo contra problemas de hidratación
  if (!mounted) return null;

  // ROL BLOCKING SCREEN (Para estudiantes y padres de familia)
  if (userRole === 'estudiante' || userRole === 'padre_familia') {
    return (
      <AppLayout>
        <Card className="max-w-md mx-auto mt-20 border-red-900/50 bg-slate-950 p-10 text-center shadow-2xl rounded-2xl border text-slate-100">
          <div className="w-16 h-16 bg-red-950/40 border border-red-500/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-4">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white">Acceso Denegado</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-sm mx-auto">
              No dispones de credenciales administrativas de Rectoría, Coordinación o Secretaría para acceder a la gestión interna del PEI.
            </p>
          </div>
          <div className="pt-6">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer border-none flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al Tablero
            </Button>
          </div>
        </Card>
      </AppLayout>
    );
  }

  const tabsConfig = [
    { id: 'dashboard', label: 'Dashboard PEI' },
    { id: 'identidad', label: 'Identidad' },
    { id: 'modelo', label: 'Modelo Pedagógico' },
    { id: 'gobierno', label: 'Gobierno Escolar' },
    { id: 'manual', label: 'PEI Oficial' },
    { id: 'proyectos', label: 'Proyectos Transversales' }
  ] as const;

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400 animate-bounce" />
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-255">Gestión Institucional</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-1.5">Proyecto Educativo Institucional (PEI)</h1>
            <p className="text-base text-slate-200 mt-1.5 leading-relaxed">
              Consola centralizada de administración, versionamiento y auditoría del marco normativo del colegio
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 text-xs bg-slate-950/40 px-3 py-1.5 border border-slate-800 rounded-xl font-mono text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Rol: {userRole.toUpperCase()}</span>
          </div>
        </div>

        {/* Tab Selector Switcher (Stripe Style) */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm select-none shrink-0 overflow-x-auto w-full max-w-4xl scrollbar-hide">
          {tabsConfig.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none whitespace-nowrap",
                activeTab === t.id 
                  ? "bg-slate-900 text-white shadow-sm font-black" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LOADING SHIMMER */}
        {loading ? (
          <Card className="border-slate-200 p-12 text-center shadow-md bg-white rounded-2xl flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 font-bold">Cargando base pedagógica y auditorías del PEI...</p>
          </Card>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && (
              <PeiDashboard 
                userRole={userRole} 
                peiData={model} 
                projects={projects} 
                manualVersions={manualVersions} 
              />
            )}
            
            {activeTab === 'identidad' && (
              <PeiIdentity 
                userRole={userRole} 
                identityData={identity} 
                onSave={handleSaveIdentity} 
              />
            )}

            {activeTab === 'modelo' && (
              <PeiPedagogicalModel 
                userRole={userRole} 
                modelData={model} 
                onSave={handleSaveModel} 
              />
            )}

            {activeTab === 'gobierno' && (
              <PeiSchoolGovernment 
                userRole={userRole} 
                members={government} 
                onSave={handleSaveGovernment} 
              />
            )}

            {activeTab === 'manual' && (
              <PeiManualConvivencia 
                userRole={userRole} 
                versions={manualVersions} 
                onSave={handleSaveManual} 
              />
            )}

            {activeTab === 'proyectos' && (
              <PeiProjects 
                userRole={userRole} 
                projects={projects} 
                onSave={handleSaveProjects} 
              />
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
