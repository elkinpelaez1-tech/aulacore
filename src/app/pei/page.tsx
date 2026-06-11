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
  { id: 'gov-1', body_type: 'Rector', member_name: 'Dr. Ramón Ramírez', role_title: 'Rector de la Institución', period: '2026', document_number: '1010202030', email: 'ramon.ramirez@aulacore.edu.co', phone: '+573001234567' },
  { id: 'gov-2', body_type: 'Consejo Directivo', member_name: 'Dr. Ramón Ramírez', role_title: 'Presidente', period: '2026', document_number: '1010202030', email: 'ramon.ramirez@aulacore.edu.co', phone: '+573001234567' },
  { id: 'gov-3', body_type: 'Consejo Directivo', member_name: 'Dra. Diana Carolina Reyes', role_title: 'Representante de Docentes', period: '2026', document_number: '52190180', email: 'diana.reyes@aulacore.edu.co', phone: '+573123456789' },
  { id: 'gov-4', body_type: 'Consejo Académico', member_name: 'Lic. Carlos Martínez', role_title: 'Representante de Humanidades', period: '2026', document_number: '79820300', email: 'carlos.martinez@aulacore.edu.co', phone: '+573104567890' },
  { id: 'gov-5', body_type: 'Consejo Estudiantil', member_name: 'Mateo Gómez', role_title: 'Representante Grado Décimo', period: '2026', document_number: '1000123456', email: 'mateo.gomez@aulacore.edu.co', phone: '+573157890123' },
  { id: 'gov-6', body_type: 'Personero', member_name: 'Alejandro Ortiz', role_title: 'Personero de Estudiantes', period: '2026', document_number: '1000987654', email: 'alejandro.ortiz@aulacore.edu.co', phone: '+573204561234' },
  { id: 'gov-7', body_type: 'Contralor Escolar', member_name: 'Sofía Ramírez', role_title: 'Contralora Escolar', period: '2026', document_number: '1000543210', email: 'sofia.ramirez@aulacore.edu.co', phone: '+573183214321' },
  { id: 'gov-8', body_type: 'Consejo de Padres', member_name: 'Carlos Ortiz', role_title: 'Representante Grado Décimo A', period: '2026', document_number: '19820300', email: 'carlos.ortiz@parent.aulacore.com', phone: '+573111223344' }
];

const SEED_CONVOCATORIAS = [
  {
    id: 'conv-1',
    title: 'Primera Sesión Ordinaria de Consejo Directivo',
    body_type: 'Consejo Directivo',
    meeting_date: '2026-02-10',
    meeting_time: '08:00',
    location: 'Sala de Juntas Rectoría',
    description: 'Revisión y aprobación del presupuesto anual 2026 e informe de gestión del periodo anterior.',
    status: 'Realizada',
    recipients: [
      { name: 'Dr. Ramón Ramírez', email: 'ramon.ramirez@aulacore.edu.co', phone: '+573001234567', status: 'Enviado' },
      { name: 'Dra. Diana Carolina Reyes', email: 'diana.reyes@aulacore.edu.co', phone: '+573123456789', status: 'Enviado' }
    ],
    sent_at: '2026-02-09T08:00:00.000Z',
    attachments: ['/evidencias/orden_dia_cd_001.pdf']
  },
  {
    id: 'conv-2',
    title: 'Planeación Curricular Segundo Trimestre',
    body_type: 'Consejo Académico',
    meeting_date: '2026-06-15',
    meeting_time: '14:00',
    location: 'Biblioteca Principal',
    description: 'Ajustes de mallas curriculares según la Ley 115 e integración del modelo Constructivista.',
    status: 'Enviada',
    recipients: [
      { name: 'Lic. Carlos Martínez', email: 'carlos.martinez@aulacore.edu.co', phone: '+573104567890', status: 'Enviado' }
    ],
    sent_at: '2026-06-05T08:45:00.000Z',
    attachments: []
  }
];

const SEED_MEETINGS = [
  {
    id: 'meet-1',
    convocatoria_id: 'conv-1',
    title: 'Primera Sesión Ordinaria de Consejo Directivo',
    body_type: 'Consejo Directivo',
    meeting_date: '2026-02-10',
    meeting_time: '08:00',
    location: 'Sala de Juntas Rectoría',
    description: 'Revisión y aprobación del presupuesto anual 2026 e informe de gestión del periodo anterior.',
    status: 'Realizada',
    decisions: 'Se aprueba por unanimidad el presupuesto institucional de 2026. Se acuerda iniciar cotización para renovación del Aula de Tecnología en Marzo.',
    attendance: [
      { member_id: 'gov-1', name: 'Dr. Ramón Ramírez', role_title: 'Presidente', attended: true },
      { member_id: 'gov-3', name: 'Dra. Diana Carolina Reyes', role_title: 'Representante de Docentes', attended: true }
    ],
    evidences: ['/evidencias/presupuesto_aprobado_2026.xlsx', '/evidencias/cotizacion_aulas.pdf']
  }
];

const SEED_ACTAS = [
  {
    id: 'acta-1',
    meeting_id: 'meet-1',
    acta_number: 'Acta No. CD-001-2026',
    content: 'En la ciudad de Bogotá D.C., siendo las 08:00 AM del 10 de Febrero de 2026, se reunieron en la Sala de Juntas los integrantes del Consejo Directivo. El Rector Ramón Ramírez abrió la sesión explicando el orden del día. Se discutió el balance de gastos del año anterior y las metas financieras 2026. Tras someter a votación, se aprobó el rubro de infraestructura tecnológica.',
    pdf_url: '/actas/acta-cd-001-2026.pdf',
    evidences: ['/evidencias/anexo_firmas.jpg'],
    status: 'Firmada',
    signers: [
      { name: 'Dr. Ramón Ramírez', role_title: 'Presidente', signed: true, signed_at: '2026-02-10T11:00:00Z' },
      { name: 'Dra. Diana Carolina Reyes', role_title: 'Representante de Docentes', signed: true, signed_at: '2026-02-10T11:15:00Z' }
    ]
  }
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
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [actas, setActas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    // Redirección o bloqueo de acceso para roles no permitidos (Estudiante o Padre de familia)
    if (userRole === 'estudiante' || userRole === 'padre_familia') {
      return; // El componente renderizará la vista de error de permisos
    }

    async function loadPeiData() {
      // 1. Cargar datos locales de inmediato (evita pantallas de carga largas y da fallback instantáneo)
      const savedIdentity = localStorage.getItem('aulacore-pei-identity');
      const savedModel = localStorage.getItem('aulacore-pei-model');
      const savedGovernment = localStorage.getItem('aulacore-pei-government');
      const savedManual = localStorage.getItem('aulacore-pei-manual');
      const savedProjects = localStorage.getItem('aulacore-pei-projects');
      const savedConvocatorias = localStorage.getItem('aulacore-pei-convocatorias');
      const savedMeetings = localStorage.getItem('aulacore-pei-meetings');
      const savedActas = localStorage.getItem('aulacore-pei-actas');

      if (savedIdentity) setIdentity(JSON.parse(savedIdentity));
      else localStorage.setItem('aulacore-pei-identity', JSON.stringify(SEED_IDENTITY));

      if (savedModel) setModel(JSON.parse(savedModel));
      else localStorage.setItem('aulacore-pei-model', JSON.stringify(SEED_MODEL));

      if (savedGovernment) setGovernment(JSON.parse(savedGovernment));
      else localStorage.setItem('aulacore-pei-government', JSON.stringify(SEED_GOVERNMENT));

      if (savedManual) setManualVersions(JSON.parse(savedManual));
      else localStorage.setItem('aulacore-pei-manual', JSON.stringify(SEED_MANUAL_VERSIONS));

      if (savedProjects) setProjects(JSON.parse(savedProjects));
      else localStorage.setItem('aulacore-pei-projects', JSON.stringify(SEED_PROJECTS));

      if (savedConvocatorias) setConvocatorias(JSON.parse(savedConvocatorias));
      else {
        localStorage.setItem('aulacore-pei-convocatorias', JSON.stringify(SEED_CONVOCATORIAS));
        setConvocatorias(SEED_CONVOCATORIAS);
      }

      if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
      else {
        localStorage.setItem('aulacore-pei-meetings', JSON.stringify(SEED_MEETINGS));
        setMeetings(SEED_MEETINGS);
      }

      if (savedActas) setActas(JSON.parse(savedActas));
      else {
        localStorage.setItem('aulacore-pei-actas', JSON.stringify(SEED_ACTAS));
        setActas(SEED_ACTAS);
      }

      try {
        setLoading(true);

        // Definir helper de timeout para las peticiones a Supabase (2 segundos máx)
        const withTimeout = <T,>(promise: PromiseLike<T>, ms = 2000): Promise<T> => {
          return Promise.race([
            Promise.resolve(promise),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Supabase query timed out')), ms)
            )
          ]);
        };

        // Realizar las consultas de Supabase en paralelo y con timeout
        const [
          identityRes,
          modelRes,
          governmentRes,
          manualRes,
          projectsRes,
          convocatoriasRes,
          meetingsRes,
          actasRes
        ] = await Promise.all([
          withTimeout(supabase.from('pei_identity').select('*').limit(1).maybeSingle()),
          withTimeout(supabase.from('pei_pedagogical_model').select('*').limit(1).maybeSingle()),
          withTimeout(supabase.from('pei_school_government').select('*').order('created_at', { ascending: true })),
          withTimeout(supabase.from('pei_manual_versions').select('*').order('created_at', { ascending: false })),
          withTimeout(supabase.from('pei_projects').select('*').order('created_at', { ascending: true })),
          withTimeout(supabase.from('pei_gov_convocatorias').select('*').order('created_at', { ascending: false })),
          withTimeout(supabase.from('pei_gov_meetings').select('*').order('created_at', { ascending: false })),
          withTimeout(supabase.from('pei_gov_actas').select('*').order('created_at', { ascending: false }))
        ]) as any[];

        const identityDb = identityRes.data;
        const modelDb = modelRes.data;
        const governmentDb = governmentRes.data;
        const manualDb = manualRes.data;
        const projectsDb = projectsRes.data;
        const convocatoriasDb = convocatoriasRes.data;
        const meetingsDb = meetingsRes.data;
        const actasDb = actasRes.data;

        // Si la base de datos respondió correctamente, actualizar los estados y el LocalStorage
        if (identityDb) {
          const formattedIdentity = {
            mission: identityDb.mission,
            vision: identityDb.vision,
            principles: identityDb.principles,
            values: identityDb.values,
            studentProfile: identityDb.student_profile,
            teacherProfile: identityDb.teacher_profile,
            graduateProfile: identityDb.graduate_profile
          };
          setIdentity(formattedIdentity);
          localStorage.setItem('aulacore-pei-identity', JSON.stringify(formattedIdentity));
        }

        if (modelDb) {
          const formattedModel = {
            modelType: modelDb.model_type,
            description: modelDb.description
          };
          setModel(formattedModel);
          localStorage.setItem('aulacore-pei-model', JSON.stringify(formattedModel));
        }

        if (governmentDb && governmentDb.length > 0) {
          setGovernment(governmentDb);
          localStorage.setItem('aulacore-pei-government', JSON.stringify(governmentDb));
        }

        if (manualDb && manualDb.length > 0) {
          setManualVersions(manualDb);
          localStorage.setItem('aulacore-pei-manual', JSON.stringify(manualDb));
        }

        if (projectsDb && projectsDb.length > 0) {
          setProjects(projectsDb);
          localStorage.setItem('aulacore-pei-projects', JSON.stringify(projectsDb));
        }

        if (convocatoriasDb && convocatoriasDb.length > 0) {
          setConvocatorias(convocatoriasDb);
          localStorage.setItem('aulacore-pei-convocatorias', JSON.stringify(convocatoriasDb));
        }

        if (meetingsDb && meetingsDb.length > 0) {
          setMeetings(meetingsDb);
          localStorage.setItem('aulacore-pei-meetings', JSON.stringify(meetingsDb));
        }

        if (actasDb && actasDb.length > 0) {
          setActas(actasDb);
          localStorage.setItem('aulacore-pei-actas', JSON.stringify(actasDb));
        }

      } catch (err) {
        console.warn('Supabase fetch failed or timed out in PEI page. Utilizing LocalStorage cache.', err);
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
        period: m.period,
        document_number: m.document_number || '',
        email: m.email || '',
        phone: m.phone || ''
      }));
      await supabase.from('pei_school_government').insert(payload);
    } catch (e) {}
  };

  // Handler para guardar Convocatorias
  const handleSaveConvocatorias = async (updatedData: any[]) => {
    setConvocatorias(updatedData);
    localStorage.setItem('aulacore-pei-convocatorias', JSON.stringify(updatedData));
    try {
      await supabase.from('pei_gov_convocatorias').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(c => ({
        id: c.id.startsWith('conv-') ? undefined : c.id,
        institution_id: '11111111-1111-1111-1111-111111111111',
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
      await supabase.from('pei_gov_convocatorias').insert(payload);
    } catch (e) {}
  };

  // Handler para guardar Reuniones
  const handleSaveMeetings = async (updatedData: any[]) => {
    setMeetings(updatedData);
    localStorage.setItem('aulacore-pei-meetings', JSON.stringify(updatedData));
    try {
      await supabase.from('pei_gov_meetings').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(m => ({
        id: m.id.startsWith('meet-') ? undefined : m.id,
        institution_id: '11111111-1111-1111-1111-111111111111',
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
      await supabase.from('pei_gov_meetings').insert(payload);
    } catch (e) {}
  };

  // Handler para guardar Actas
  const handleSaveActas = async (updatedData: any[]) => {
    setActas(updatedData);
    localStorage.setItem('aulacore-pei-actas', JSON.stringify(updatedData));
    try {
      await supabase.from('pei_gov_actas').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(a => ({
        id: a.id.startsWith('acta-') ? undefined : a.id,
        institution_id: '11111111-1111-1111-1111-111111111111',
        meeting_id: a.meeting_id && a.meeting_id.startsWith('meet-') ? null : a.meeting_id,
        acta_number: a.acta_number,
        content: a.content,
        pdf_url: a.pdf_url,
        evidences: a.evidences,
        signers: a.signers,
        status: a.status
      }));
      await supabase.from('pei_gov_actas').insert(payload);
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
                convocatorias={convocatorias}
                onSaveConvocatorias={handleSaveConvocatorias}
                meetings={meetings}
                onSaveMeetings={handleSaveMeetings}
                actas={actas}
                onSaveActas={handleSaveActas}
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
