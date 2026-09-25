'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout';
import { useRole } from '@/providers/role-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  ArrowLeft,
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

const EMPTY_IDENTITY = {
  mission: '',
  vision: '',
  principles: '',
  values: '',
  studentProfile: '',
  teacherProfile: '',
  graduateProfile: ''
};

const EMPTY_MODEL = {
  modelType: '',
  description: ''
};

export default function PeiPage() {
  const { userRole, mounted, institutionId, activeInstitution } = useRole();
  const router = useRouter();

  const effectiveInstitutionId = activeInstitution?.id || institutionId || (typeof window !== 'undefined' ? localStorage.getItem('aulacore-institution-id') : null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'identidad' | 'modelo' | 'gobierno' | 'manual' | 'proyectos'>('dashboard');

  // Modular states loaded from DB
  const [identity, setIdentity] = useState<any>(EMPTY_IDENTITY);
  const [model, setModel] = useState<any>(EMPTY_MODEL);
  const [government, setGovernment] = useState<any[]>([]);
  const [manualVersions, setManualVersions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [actas, setActas] = useState<any[]>([]);
  const [rector, setRector] = useState<{ name: string; email?: string; phone?: string; role_title?: string; period?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    // Redirección o bloqueo de acceso para roles no permitidos (Estudiante o Padre de familia)
    if (userRole === 'estudiante' || userRole === 'padre_familia') {
      return;
    }

    // Limpieza preventiva de mocks anteriores en LocalStorage
    const peiStorageKeys = [
      'aulacore-pei-identity',
      'aulacore-pei-model',
      'aulacore-pei-government',
      'aulacore-pei-convocatorias',
      'aulacore-pei-meetings',
      'aulacore-pei-actas',
      'aulacore-pei-manual',
      'aulacore-pei-projects'
    ];

    peiStorageKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item && (
          item.includes('Ramón') ||
          item.includes('ramon.ramirez') ||
          item.includes('1010202030') ||
          item.includes('11111111') ||
          item.includes('Formar líderes éticos') ||
          item.includes('Diana Carolina Reyes')
        )) {
          localStorage.removeItem(key);
        }
      } catch (e) {}
    });

    async function loadPeiData() {
      if (!effectiveInstitutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const withTimeout = <T,>(promise: PromiseLike<T>, ms = 2500): Promise<T> => {
          return Promise.race([
            Promise.resolve(promise),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Supabase query timed out')), ms)
            )
          ]);
        };

        const [
          identityRes,
          modelRes,
          governmentRes,
          manualRes,
          projectsRes,
          convocatoriasRes,
          meetingsRes,
          actasRes,
          rectorRoleRes
        ] = await Promise.all([
          withTimeout(supabase.from('pei_identity').select('*').eq('institution_id', effectiveInstitutionId).limit(1).maybeSingle()),
          withTimeout(supabase.from('pei_pedagogical_model').select('*').eq('institution_id', effectiveInstitutionId).limit(1).maybeSingle()),
          withTimeout(supabase.from('pei_school_government').select('*').eq('institution_id', effectiveInstitutionId).order('created_at', { ascending: true })),
          withTimeout(supabase.from('pei_manual_versions').select('*').eq('institution_id', effectiveInstitutionId).order('created_at', { ascending: false })),
          withTimeout(supabase.from('pei_projects').select('*').eq('institution_id', effectiveInstitutionId).order('created_at', { ascending: true })),
          withTimeout(supabase.from('pei_gov_convocatorias').select('*').eq('institution_id', effectiveInstitutionId).order('created_at', { ascending: false })),
          withTimeout(supabase.from('pei_gov_meetings').select('*').eq('institution_id', effectiveInstitutionId).order('created_at', { ascending: false })),
          withTimeout(supabase.from('pei_gov_actas').select('*').eq('institution_id', effectiveInstitutionId).order('created_at', { ascending: false })),
          withTimeout(supabase.from('user_roles').select('user_id').eq('institution_id', effectiveInstitutionId).eq('role', 'rector').maybeSingle())
        ]) as any[];

        const identityDb = identityRes.data;
        const modelDb = modelRes.data;
        const governmentDb = governmentRes.data;
        const manualDb = manualRes.data;
        const projectsDb = projectsRes.data;
        const convocatoriasDb = convocatoriasRes.data;
        const meetingsDb = meetingsRes.data;
        const actasDb = actasRes.data;
        const rectorRoleDb = rectorRoleRes?.data;

        // Consultar perfil del rector institucional real si existe
        if (rectorRoleDb?.user_id) {
          try {
            const { data: rectorProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', rectorRoleDb.user_id)
              .maybeSingle();

            if (rectorProfile) {
              const fullName = `${rectorProfile.first_name || ''} ${rectorProfile.last_name || ''}`.trim();
              setRector({
                name: fullName || 'Rector Asignado',
                role_title: 'Rector de la Institución',
                period: '2026'
              });
            } else {
              setRector(null);
            }
          } catch (e) {
            setRector(null);
          }
        } else {
          setRector(null);
        }

        if (identityDb) {
          const formattedIdentity = {
            mission: identityDb.mission || '',
            vision: identityDb.vision || '',
            principles: identityDb.principles || '',
            values: identityDb.values || '',
            studentProfile: identityDb.student_profile || '',
            teacherProfile: identityDb.teacher_profile || '',
            graduateProfile: identityDb.graduate_profile || ''
          };
          setIdentity(formattedIdentity);
        } else {
          setIdentity(EMPTY_IDENTITY);
        }

        if (modelDb) {
          const formattedModel = {
            modelType: modelDb.model_type || '',
            description: modelDb.description || ''
          };
          setModel(formattedModel);
        } else {
          setModel(EMPTY_MODEL);
        }

        setGovernment(governmentDb || []);
        setManualVersions(manualDb || []);
        setProjects(projectsDb || []);
        setConvocatorias(convocatoriasDb || []);
        setMeetings(meetingsDb || []);
        setActas(actasDb || []);

      } catch (err) {
        console.warn('Supabase fetch failed or timed out in PEI page.', err);
      } finally {
        setLoading(false);
      }
    }

    loadPeiData();
  }, [mounted, userRole, effectiveInstitutionId]);

  // Handler para guardar Identidad
  const handleSaveIdentity = async (updatedData: any) => {
    if (!effectiveInstitutionId) {
      alert('No se ha detectado una institución activa para guardar.');
      return;
    }

    setIdentity(updatedData);

    try {
      const payload = {
        institution_id: effectiveInstitutionId,
        mission: updatedData.mission,
        vision: updatedData.vision,
        principles: updatedData.principles,
        values: updatedData.values,
        student_profile: updatedData.studentProfile,
        teacher_profile: updatedData.teacherProfile,
        graduate_profile: updatedData.graduateProfile,
        updated_at: new Date().toISOString()
      };
      
      const { data } = await supabase
        .from('pei_identity')
        .select('id')
        .eq('institution_id', effectiveInstitutionId)
        .limit(1)
        .maybeSingle();

      if (data) {
        await supabase.from('pei_identity').update(payload).eq('id', data.id);
      } else {
        await supabase.from('pei_identity').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando identidad:', e);
    }
  };

  // Handler para guardar Modelo
  const handleSaveModel = async (updatedData: any) => {
    if (!effectiveInstitutionId) {
      alert('No se ha detectado una institución activa para guardar.');
      return;
    }

    setModel(updatedData);

    try {
      const payload = {
        institution_id: effectiveInstitutionId,
        model_type: updatedData.modelType,
        description: updatedData.description,
        updated_at: new Date().toISOString()
      };

      const { data } = await supabase
        .from('pei_pedagogical_model')
        .select('id')
        .eq('institution_id', effectiveInstitutionId)
        .limit(1)
        .maybeSingle();

      if (data) {
        await supabase.from('pei_pedagogical_model').update(payload).eq('id', data.id);
      } else {
        await supabase.from('pei_pedagogical_model').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando modelo pedagógico:', e);
    }
  };

  // Handler para guardar Gobierno
  const handleSaveGovernment = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setGovernment(updatedData);
    
    try {
      await supabase.from('pei_school_government').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(m => ({
        institution_id: effectiveInstitutionId,
        body_type: m.body_type,
        member_name: m.member_name,
        role_title: m.role_title,
        period: m.period,
        document_number: m.document_number || '',
        email: m.email || '',
        phone: m.phone || ''
      }));
      if (payload.length > 0) {
        await supabase.from('pei_school_government').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando integrantes de gobierno escolar:', e);
    }
  };

  // Handler para guardar Convocatorias
  const handleSaveConvocatorias = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setConvocatorias(updatedData);
    try {
      await supabase.from('pei_gov_convocatorias').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(c => ({
        id: c.id.startsWith('conv-') ? undefined : c.id,
        institution_id: effectiveInstitutionId,
        title: c.title,
        body_type: c.body_type,
        meeting_date: c.meeting_date,
        meeting_time: c.meeting_time.includes(':') && c.meeting_time.split(':').length === 2 ? `${c.meeting_time}:00` : c.meeting_time,
        location: c.location,
        description: c.description,
        attachments: c.attachments,
        status: c.status,
        recipients: c.recipients,
        sent_at: c.sent_at,
        calendar_event_id: c.calendar_event_id || null
      }));
      if (payload.length > 0) {
        await supabase.from('pei_gov_convocatorias').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando convocatorias:', e);
    }
  };

  // Handler para guardar Reuniones
  const handleSaveMeetings = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setMeetings(updatedData);
    try {
      await supabase.from('pei_gov_meetings').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(m => ({
        id: m.id.startsWith('meet-') ? undefined : m.id,
        institution_id: effectiveInstitutionId,
        convocatoria_id: m.convocatoria_id && m.convocatoria_id.startsWith('conv-') ? null : m.convocatoria_id,
        title: m.title,
        body_type: m.body_type,
        meeting_date: m.meeting_date,
        meeting_time: m.meeting_time.includes(':') && m.meeting_time.split(':').length === 2 ? `${m.meeting_time}:00` : m.meeting_time,
        location: m.location,
        description: m.description,
        attendance: m.attendance,
        status: m.status,
        decisions: m.decisions,
        evidences: m.evidences,
        calendar_event_id: m.calendar_event_id || null
      }));
      if (payload.length > 0) {
        await supabase.from('pei_gov_meetings').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando reuniones:', e);
    }
  };

  // Handler para guardar Actas
  const handleSaveActas = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setActas(updatedData);
    try {
      await supabase.from('pei_gov_actas').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(a => ({
        id: a.id.startsWith('acta-') ? undefined : a.id,
        institution_id: effectiveInstitutionId,
        meeting_id: a.meeting_id && a.meeting_id.startsWith('meet-') ? null : a.meeting_id,
        acta_number: a.acta_number,
        content: a.content,
        pdf_url: a.pdf_url,
        evidences: a.evidences,
        signers: a.signers,
        status: a.status
      }));
      if (payload.length > 0) {
        await supabase.from('pei_gov_actas').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando actas:', e);
    }
  };

  // Handler para guardar versiones de Manual
  const handleSaveManual = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setManualVersions(updatedData);

    try {
      await supabase.from('pei_manual_versions').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(v => ({
        institution_id: effectiveInstitutionId,
        version: v.version,
        pdf_url: v.pdf_url,
        update_notes: v.update_notes,
        is_active: v.is_active,
        created_at: v.created_at
      }));
      if (payload.length > 0) {
        await supabase.from('pei_manual_versions').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando versiones del PEI:', e);
    }
  };

  // Handler para guardar Proyectos
  const handleSaveProjects = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setProjects(updatedData);

    try {
      await supabase.from('pei_projects').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(p => ({
        institution_id: effectiveInstitutionId,
        project_type: p.project_type,
        objective: p.objective,
        responsible: p.responsible,
        schedule: p.schedule,
        evidences: p.evidences,
        status: p.status,
        indicators: p.indicators
      }));
      if (payload.length > 0) {
        await supabase.from('pei_projects').insert(payload);
      }
    } catch (e) {
      console.error('Error guardando proyectos:', e);
    }
  };

  // Escudo contra problemas de hidratación
  if (!mounted || !userRole) return null;

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
                convocatorias={convocatorias}
                onSaveConvocatorias={handleSaveConvocatorias}
                meetings={meetings}
                onSaveMeetings={handleSaveMeetings}
                actas={actas}
                onSaveActas={handleSaveActas}
                rector={rector}
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
