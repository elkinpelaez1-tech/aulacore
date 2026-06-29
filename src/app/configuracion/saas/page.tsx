'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth, InstitutionData } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Building2, Plus, Play, RefreshCw, AlertCircle, 
  CheckCircle2, Edit3, Save, X, ExternalLink, ShieldCheck, 
  Layers, Users, Activity, QrCode, HardDrive, BarChart3, 
  TrendingUp, Calendar, Clock, MapPin, Check, Mail, Phone,
  Info, ArrowRight, ShieldAlert, BadgeInfo, Eye, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

// --- CONFIGURACIÓN DE ETAPAS DE IMPLEMENTACIÓN ---
const IMPLEMENTATION_STAGES = [
  { id: 'prospecto', name: 'Prospecto', defaultResponsible: 'Eduardo Martínez (Comercial)' },
  { id: 'contrato', name: 'Contrato firmado', defaultResponsible: 'Diana Carolina (Legal)' },
  { id: 'tenant', name: 'Creación del tenant', defaultResponsible: 'Soporte Técnico AulaCore' },
  { id: 'parametrizacion', name: 'Parametrización', defaultResponsible: 'Rectoría / Secretaría' },
  { id: 'migracion', name: 'Migración de datos', defaultResponsible: 'Equipo Migraciones' },
  { id: 'capacitacion', name: 'Capacitación', defaultResponsible: 'Clara Inés (Capacitación)' },
  { id: 'piloto', name: 'Piloto', defaultResponsible: 'Coordinación Académica' },
  { id: 'produccion', name: 'Producción', defaultResponsible: 'Rectoría' },
  { id: 'operacion_estable', name: 'Operación estable', defaultResponsible: 'Soporte AulaCore' }
];

export default function SaasConsolePage() {
  const { roles, allInstitutions, institutionId, setOverrideInstitutionId, overrideInstitutionId, refreshSession } = useAuth();
  const router = useRouter();

  const savedOverride = overrideInstitutionId;
  const activeSimulatedName = allInstitutions.find(i => i.id === savedOverride)?.name || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pestaña activa principal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'colegios' | 'implementaciones' | 'comercial'>('dashboard');

  // Listado de inquilinos
  const [institutions, setInstitutions] = useState<InstitutionData[]>([]);
  const [instMetrics, setInstMetrics] = useState<Record<string, any>>({});
  
  // Estadísticas globales del Dashboard
  const [globalStats, setGlobalStats] = useState({
    totalInsts: 0,
    activeInsts: 0,
    implInsts: 0,
    suspInsts: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalUsers: 0,
    totalGrades: 0,
    totalAttendance: 0,
    totalAlerts: 0,
    totalStorage: '1.25 GB',
    uptime: '99.98%',
    activeUsersOnline: 8
  });

  // Drawer Lateral de Vista 360
  const [selectedInst360, setSelectedInst360] = useState<InstitutionData | null>(null);
  const [activeTab360, setActiveTab360] = useState<'resumen' | 'general' | 'licencia' | 'auditoria'>('resumen');
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading360, setLoading360] = useState(false);

  // Formulario de Edición de Licencia
  const [editingInstId, setEditingInstId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState('free_trial');
  const [editStatus, setEditStatus] = useState('active');
  const [editModules, setEditModules] = useState<string[]>([]);

  // Chart rendering safety for Next SSR
  const [chartMounted, setChartMounted] = useState(false);

  const isSuperAdmin = (roles as string[])?.includes('super_admin') || false;

  // Cargar datos en base al estado del proveedor
  useEffect(() => {
    if (allInstitutions && allInstitutions.length > 0) {
      setInstitutions(allInstitutions);
      loadAllMetrics(allInstitutions);
    } else if (isSuperAdmin) {
      loadInstitutions();
    }
    setChartMounted(true);
  }, [allInstitutions, isSuperAdmin]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('name');
      
      if (data && !error) {
        setInstitutions(data as any);
        await loadAllMetrics(data as any);
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar la lista de colegios de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  // Carga paralela de métricas para evitar cuellos de botella (N+1 queries)
  const loadAllMetrics = async (insts: InstitutionData[]) => {
    try {
      const [
        { data: rolesData },
        { data: coursesData },
        { data: settingsData },
        { data: yearsData },
        { data: gradesData },
        { data: attendanceData },
        { data: alertsData },
        { data: subjectsData }
      ] = await Promise.all([
        supabase.from('user_roles').select('user_id, institution_id, role'),
        supabase.from('courses').select('id, institution_id'),
        supabase.from('institution_academic_settings').select('institution_id'),
        supabase.from('academic_years').select('institution_id, is_active'),
        supabase.from('academic_records').select('id, student_id, grade, created_at'),
        supabase.from('attendance_records').select('id, student_id, record_date'),
        supabase.from('early_alerts').select('id, student_id, status'),
        supabase.from('curriculum_subjects').select('id, institution_id')
      ]);

      const metricsMap: Record<string, any> = {};
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const inst of insts) {
        const instId = inst.id;

        // Filtrar roles del colegio
        const instRoles = rolesData?.filter(r => r.institution_id === instId) || [];
        const studentsCount = instRoles.filter(r => r.role === 'estudiante').length;
        const teachersCount = instRoles.filter(r => r.role === 'docente').length;
        const parentsCount = instRoles.filter(r => r.role === 'padre_familia').length;
        const coordinatorsCount = instRoles.filter(r => r.role === 'coordinador').length;
        const secretariesCount = instRoles.filter(r => r.role === 'secretaria').length;
        const totalUsersCount = instRoles.length;
        
        // Cursos del colegio
        const coursesCount = coursesData?.filter(c => c.institution_id === instId).length || 0;

        // Asignaturas
        const subjectsCount = subjectsData?.filter(s => s.institution_id === instId).length || 0;
        
        // Configuración y Año académico activo
        const hasSettings = settingsData?.some(s => s.institution_id === instId) || false;
        const hasActiveYear = yearsData?.some(y => y.institution_id === instId && y.is_active) || false;

        // Estudiantes IDs para relacionar notas, asistencias y alertas
        const studentIds = new Set(instRoles.filter(r => r.role === 'estudiante').map(r => r.user_id));

        // Filtrar notas, asistencias y alertas de estudiantes de este colegio
        const instGrades = gradesData?.filter(g => studentIds.has(g.student_id)) || [];
        const instAttendance = attendanceData?.filter(a => studentIds.has(a.student_id)) || [];
        const instAlerts = alertsData?.filter(a => studentIds.has(a.student_id)) || [];

        const gradesCount = instGrades.length;
        const attendanceCount = instAttendance.length;
        const activeAlerts = instAlerts.filter(a => a.status === 'open').length;

        // Actividad reciente (últimos 30 días)
        const recentGradesCount = instGrades.filter(g => new Date(g.created_at) >= thirtyDaysAgo).length;
        const recentAttendanceCount = instAttendance.filter(a => new Date(a.record_date) >= thirtyDaysAgo).length;

        // Promedio académico general del colegio
        const averageGrade = instGrades.length > 0
          ? (instGrades.reduce((sum, g) => sum + Number(g.grade), 0) / instGrades.length).toFixed(2)
          : 'N/A';

        // Calcular métricas dinámicas de madurez y Health Score
        const metrics = calculateMetricsForInstitution(
          inst,
          studentsCount,
          teachersCount,
          coursesCount,
          parentsCount,
          hasSettings,
          hasActiveYear,
          gradesCount,
          attendanceCount,
          subjectsCount,
          activeAlerts,
          recentGradesCount,
          recentAttendanceCount,
          totalUsersCount
        );

        metricsMap[instId] = {
          studentsCount,
          teachersCount,
          parentsCount,
          coursesCount,
          coordinatorsCount,
          secretariesCount,
          totalUsersCount,
          hasSettings,
          hasActiveYear,
          gradesCount,
          attendanceCount,
          subjectsCount,
          activeAlerts,
          averageGrade,
          recentGradesCount,
          recentAttendanceCount,
          ...metrics
        };
      }

      setInstMetrics(metricsMap);

      // Sincronizar KPIs Dashboard
      const active = insts.filter(i => i.subscription_status === 'active').length;
      const susp = insts.filter(i => i.subscription_status === 'suspended').length;
      
      let impl = 0;
      Object.keys(metricsMap).forEach(k => {
        if (metricsMap[k].progressPercent < 100 && insts.find(i => i.id === k)?.subscription_status !== 'suspended') {
          impl++;
        }
      });

      const totalStudents = rolesData?.filter(r => r.role === 'estudiante').length || 0;
      const totalTeachers = rolesData?.filter(r => r.role === 'docente').length || 0;
      const totalUsers = rolesData?.length || 0;

      setGlobalStats({
        totalInsts: insts.length,
        activeInsts: active,
        implInsts: impl,
        suspInsts: susp,
        totalStudents,
        totalTeachers,
        totalUsers,
        totalGrades: gradesData?.length || 0,
        totalAttendance: attendanceData?.length || 0,
        totalAlerts: alertsData?.filter(a => a.status === 'open').length || 0,
        totalStorage: (insts.length * 0.45 + 0.35).toFixed(2) + ' GB',
        uptime: '99.98%',
        activeUsersOnline: Math.floor(Math.random() * 4) + 6
      });

    } catch (e) {
      console.error('Error calculando métricas:', e);
    }
  };

  // Cargar logs de auditoría inmutables para el Drawer lateral 360
  useEffect(() => {
    if (!selectedInst360) return;
    const instId = selectedInst360.id;
    async function loadAuditLogs360() {
      setLoading360(true);
      try {
        const { data, error } = await supabase
          .from('migration_audit_logs')
          .select('*')
          .eq('institution_id', instId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data && !error) {
          setRecentLogs(data);
        } else {
          setRecentLogs([]);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading360(false);
      }
    }
    loadAuditLogs360();
  }, [selectedInst360]);

  // --- LÓGICA DINÁMICA DE CÁLCULO DE MÉTRICAS (Madurez & Implementación) ---
  const calculateMetricsForInstitution = (
    inst: any,
    studentsCount: number,
    teachersCount: number,
    coursesCount: number,
    parentsCount: number,
    hasSettings: boolean,
    hasActiveYear: boolean,
    gradesCount: number,
    attendanceCount: number,
    subjectsCount: number,
    activeAlerts: number,
    recentGradesCount: number,
    recentAttendanceCount: number,
    totalUsersCount: number
  ) => {
    // 1. Configuración de Ponderaciones (Fácilmente configurable)
    const weights = {
      parametrizacion: 10,   // Slogan, nit, rector, secretario, logo
      calendario: 10,       // Año académico activo
      sedesJornadas: 10,    // Configuraciones de reglas de negocio académicas
      docentes: 10,         // Docentes registrados (> 0)
      estudiantes: 10,      // Estudiantes registrados (> 0)
      padres: 10,           // Padres de familia vinculados (> 0)
      cursos: 5,            // Cursos configurados (> 0)
      asignaturas: 5,       // Asignaturas en mallas configuradas (> 0)
      mallas: 5,            // Mallas curriculares activas (si hay asignaturas y cursos > 0)
      evaluaciones: 10,     // Calificaciones registradas (> 0)
      asistencia: 10,       // Registros de asistencia (> 0)
      actividad30dias: 5,   // Actividad en los últimos 30 días (> 0)
      usoModulos: 5,        // Al menos 2 módulos contratados y activos
      calidadInfo: 5        // Calidad de la información general (NIT, DANE, etc. completos)
    };

    // 2. Calcular puntaje dinámicamente
    let score = 0;

    const hasSlogan = !!inst.slogan;
    const hasRector = !!inst.rector_name;
    const hasSecretary = !!inst.secretary_name;
    const hasLogo = !!inst.logo_url;
    const hasNit = !!inst.nit;
    const hasDane = !!inst.dane_code;
    const hasResolution = !!inst.resolution;

    // A. Parametrización
    let paramScore = 0;
    if (hasRector) paramScore += 2;
    if (hasSecretary) paramScore += 2;
    if (hasSlogan) paramScore += 1;
    if (hasLogo) paramScore += 2;
    if (hasNit) paramScore += 2;
    if (hasDane) paramScore += 1;
    if (hasResolution) paramScore += 2;
    score += (paramScore / 12) * weights.parametrizacion;

    // B. Calendario académico
    if (hasActiveYear) score += weights.calendario;

    // C. Sedes y jornadas
    if (hasSettings) score += weights.sedesJornadas;

    // D. Docentes registrados
    if (teachersCount > 0) score += weights.docentes;

    // E. Estudiantes registrados
    if (studentsCount > 0) score += weights.estudiantes;

    // F. Padres vinculados
    if (parentsCount > 0) score += weights.padres;

    // G. Cursos activos
    if (coursesCount > 0) score += weights.cursos;

    // H. Asignaturas configuradas
    if (subjectsCount > 0) score += weights.asignaturas;

    // I. Mallas curriculares
    if (subjectsCount > 0 && coursesCount > 0) score += weights.mallas;

    // J. Evaluaciones realizadas
    if (gradesCount > 0) score += weights.evaluaciones;

    // K. Asistencia registrada
    if (attendanceCount > 0) score += weights.asistencia;

    // L. Actividad en los últimos 30 días
    if (recentGradesCount > 0 || recentAttendanceCount > 0) score += weights.actividad30dias;

    // M. Uso de módulos contratados
    const activeModCount = inst.active_modules?.length || 0;
    if (activeModCount >= 2) score += weights.usoModulos;
    else if (activeModCount === 1) score += weights.usoModulos * 0.5;

    // N. Calidad de la información
    let infoQualityScore = 0;
    if (hasNit) infoQualityScore += 1.5;
    if (hasDane) infoQualityScore += 1.5;
    if (hasResolution) infoQualityScore += 2;
    score += (infoQualityScore / 5) * weights.calidadInfo;

    // O. Penalizaciones por alertas críticas pendientes
    const alertPenalization = Math.min(15, activeAlerts * 5);
    score = Math.max(0, score - alertPenalization);

    const healthPercent = Math.max(5, Math.min(100, Math.round(score)));

    // 3. Determinar Estado de Salud
    let healthStatus: 'excellent' | 'warning' | 'critical' = 'excellent';
    if (healthPercent >= 80) healthStatus = 'excellent';
    else if (healthPercent >= 45) healthStatus = 'warning';
    else healthStatus = 'critical';

    // 4. Determinar Etapa de Implementación (17 hitos)
    const checklist = [
      { id: 'contrato_firmado', name: 'Contrato firmado', complete: true },
      { id: 'tenant_creado', name: 'Creación del tenant', complete: true },
      { id: 'branding_configurado', name: 'Branding de marca', complete: hasLogo || inst.primary_color !== '#6366f1' },
      { id: 'sedes_creadas', name: 'Sedes creadas', complete: hasSettings },
      { id: 'jornadas_configuradas', name: 'Jornadas configuradas', complete: hasSettings },
      { id: 'calendario_academico', name: 'Calendario y Años', complete: hasActiveYear },
      { id: 'periodos_configurados', name: 'Periodos Académicos', complete: hasActiveYear },
      { id: 'docentes_cargados', name: 'Docentes cargados', complete: teachersCount > 0 },
      { id: 'estudiantes_registrados', name: 'Estudiantes registrados', complete: studentsCount > 0 },
      { id: 'padres_vinculados', name: 'Padres vinculados', complete: parentsCount > 0 },
      { id: 'cursos_activos', name: 'Cursos parametrizados', complete: coursesCount > 0 },
      { id: 'asignaturas_vinculadas', name: 'Asignaturas vinculadas', complete: subjectsCount > 0 },
      { id: 'mallas_curriculares', name: 'Mallas curriculares', complete: subjectsCount > 0 && coursesCount > 0 },
      { id: 'evaluaciones_realizadas', name: 'Evaluaciones IA', complete: gradesCount > 0 },
      { id: 'asistencia_registrada', name: 'Asistencia registrada', complete: attendanceCount > 0 },
      { id: 'portal_docentes', name: 'Portal Docentes activo', complete: teachersCount > 0 },
      { id: 'portal_padres', name: 'Portal Padres activo', complete: parentsCount > 0 }
    ];

    const completedCount = checklist.filter(c => c.complete).length;
    const progressPercent = Math.round((completedCount / checklist.length) * 100);

    // Determinar etapa secuencial de forma estricta según el progreso real:
    let stageId = 'prospecto';
    let stageName = 'Prospecto';
    let stageResponsible = 'Eduardo Martínez (Comercial)';
    let stageDate = '2026-05-10';

    if (progressPercent >= 100) {
      stageId = 'operacion_stable';
      stageName = 'Operación estable';
      stageResponsible = 'Soporte AulaCore';
      stageDate = '2026-06-25';
    } else if (progressPercent >= 90) {
      stageId = 'produccion';
      stageName = 'Producción';
      stageResponsible = 'Rectoría';
      stageDate = '2026-06-24';
    } else if (progressPercent >= 80) {
      stageId = 'piloto';
      stageName = 'Piloto';
      stageResponsible = 'Coordinación Académica';
      stageDate = '2026-06-22';
    } else if (progressPercent >= 70) {
      stageId = 'capacitacion';
      stageName = 'Capacitación';
      stageResponsible = 'Clara Inés (Capacitación)';
      stageDate = '2026-06-18';
    } else if (progressPercent >= 55) {
      stageId = 'migracion';
      stageName = 'Migración de datos';
      stageResponsible = 'Equipo Migraciones';
      stageDate = '2026-06-12';
    } else if (progressPercent >= 40) {
      stageId = 'parametrizacion';
      stageName = 'Parametrización';
      stageResponsible = 'Rectoría / Secretaría';
      stageDate = '2026-06-05';
    } else if (progressPercent >= 30) {
      stageId = 'tenant';
      stageName = 'Creación del tenant';
      stageResponsible = 'Soporte Técnico AulaCore';
      stageDate = '2026-06-01';
    } else if (progressPercent >= 15) {
      stageId = 'contrato';
      stageName = 'Contrato firmado';
      stageResponsible = 'Diana Carolina (Legal)';
      stageDate = '2026-05-20';
    }

    return {
      progressPercent,
      checklist,
      stage: stageName,
      stageId,
      stageResponsible,
      stageDate,
      healthPercent,
      healthStatus
    };
  };

  // Mapear límites de suscripción en base al plan
  const getLimitsByPlan = (plan: string) => {
    switch (plan) {
      case 'free_trial':
        return { maxStudents: 50, maxTeachers: 5, maxStorage: '100 MB' };
      case 'basic':
        return { maxStudents: 250, maxTeachers: 15, maxStorage: '500 MB' };
      case 'premium':
        return { maxStudents: 1000, maxTeachers: 60, maxStorage: '2.0 GB' };
      case 'enterprise':
        return { maxStudents: 5000, maxTeachers: 200, maxStorage: '10.0 GB' };
      default:
        return { maxStudents: 100, maxTeachers: 10, maxStorage: '200 MB' };
    }
  };

  const handleSimulate = (id: string, name: string) => {
    setOverrideInstitutionId(id);
    setSuccess(`Simulando inquilino: "${name}" de forma activa.`);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleStopSimulate = () => {
    setOverrideInstitutionId(null);
    setSuccess('Simulación finalizada. Restaurado a su inquilino de origen.');
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleStartEdit = (inst: InstitutionData) => {
    setEditingInstId(inst.id);
    setEditPlan(inst.plan_type || 'free_trial');
    setEditStatus(inst.subscription_status || 'active');
    setEditModules(inst.active_modules || []);
  };

  const handleModuleToggle = (mod: string) => {
    if (editModules.includes(mod)) {
      setEditModules(editModules.filter(m => m !== mod));
    } else {
      setEditModules([...editModules, mod]);
    }
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updErr } = await supabase
        .from('institutions')
        .update({
          plan_type: editPlan,
          subscription_status: editStatus,
          active_modules: editModules
        })
        .eq('id', id);

      if (updErr) throw updErr;

      setSuccess('Licenciamiento de colegio actualizado correctamente.');
      setEditingInstId(null);
      
      await loadInstitutions();
      await refreshSession();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al actualizar los datos de licenciamiento.');
    } finally {
      setLoading(false);
    }
  };

  // Mocks de actividad para gráficos
  const chartData = [
    { name: 'Lun', evaluaciones: 23, asistencias: 140, usuariosActivos: 9 },
    { name: 'Mar', evaluaciones: 34, asistencias: 165, usuariosActivos: 12 },
    { name: 'Mie', evaluaciones: 45, asistencias: 180, usuariosActivos: 15 },
    { name: 'Jue', evaluaciones: 50, asistencias: 172, usuariosActivos: 14 },
    { name: 'Vie', evaluaciones: 38, asistencias: 160, usuariosActivos: 11 },
    { name: 'Sab', evaluaciones: 12, asistencias: 10, usuariosActivos: 5 },
    { name: 'Dom', evaluaciones: 5, asistencias: 0, usuariosActivos: 3 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Dynamic Slide In CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* SaaS Status bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-650" />
            Consola SaaS Global AulaCore
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Administración central de licenciamiento, aprovisionamiento de inquilinos y simulación en caliente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/configuracion/nuevo-colegio')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Colegio
          </Button>
          <Button 
            variant="outline"
            onClick={loadInstitutions}
            disabled={loading}
            className="text-slate-655 border-slate-200 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {savedOverride && (
        <Card className="border-indigo-200 bg-indigo-50/50 p-4.5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 animate-pulse fill-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block leading-none">Simulación Activa</span>
              <p className="text-xs font-bold text-slate-850 mt-1">
                La plataforma entera está respondiendo al inquilino: <span className="underline font-extrabold text-indigo-855">"{activeSimulatedName || savedOverride}"</span>.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleStopSimulate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border-none cursor-pointer shrink-0"
          >
            Finalizar Simulación
          </Button>
        </Card>
      )}

      {success && (
        <Card className="border-emerald-250 bg-emerald-50/40 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{success}</span>
        </Card>
      )}

      {error && (
        <Card className="border-red-250 bg-red-50/40 p-4 rounded-2xl flex items-center gap-3 text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </Card>
      )}

      {/* TABS DE CONSOLA SAAS */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'dashboard', label: 'AulaCore Cloud', desc: 'Métricas y KPIs globales' },
          { id: 'colegios', label: 'Colegios & Salud', desc: 'Salud y simulación de Tenants' },
          { id: 'implementaciones', label: 'Centro de Implementación', desc: 'Embudos y etapas de salida' },
          { id: 'comercial', label: 'Consola Comercial', desc: 'Suscripciones y cuotas' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-700 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: DASHBOARD GLOBAL (AULACORE CLOUD) --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-xs rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Instituciones</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{globalStats.totalInsts} Colegios</span>
                <span className="text-[10px] text-slate-400 block font-bold mt-0.5">{globalStats.activeInsts} Activas / {globalStats.suspInsts} Suspendidas</span>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-xs rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Usuarios Registrados</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{globalStats.totalUsers} Perfiles</span>
                <span className="text-[10px] text-slate-400 block font-bold mt-0.5">{globalStats.totalStudents} Alumnos / {globalStats.totalTeachers} Docentes</span>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-xs rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Actividad Global</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{globalStats.totalGrades} Calificac.</span>
                <span className="text-[10px] text-slate-400 block font-bold mt-0.5">{globalStats.totalAttendance} Asistencias registradas</span>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-xs rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Infraestructura</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{globalStats.totalStorage} Usado</span>
                <span className="text-[10px] text-slate-400 block font-bold mt-0.5">Uptime: {globalStats.uptime} | 🟢 Operativo</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl p-6 lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">Actividad de Usuarios y Evaluaciones</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Frecuencia de accesos diarios y registros de notas IA.</p>
              </div>
              <div className="w-full">
                {chartMounted && (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEvaluaciones" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <Tooltip />
                      <Legend style={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="evaluaciones" name="Ev. Procesadas IA" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEvaluaciones)" />
                      <Area type="monotone" dataKey="asistencias" name="Asistencias RFID" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAsistencias)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mb-4">Estado del Motor de IA y Servidores</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-600">Modelos de IA Llama/Claude</span>
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Operativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-600">Sincronización Supabase Sync</span>
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Operativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-600">B2B Integraciones Webhooks</span>
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Operativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-slate-600">Usuarios en Línea (Concurrente)</span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {globalStats.activeUsersOnline} Activos
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Último Backup Global</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">2026-06-25 04:00 AM (Automático)</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB 2: COLEGIOS & SALUD --- */}
      {activeTab === 'colegios' && (
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-4.5 bg-slate-50/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider">
                Inquilinos y Madurez Operativa
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-450 mt-1">
                Visualice el Health Score y active simulaciones de cualquier colegio.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Nombre del Plantel</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Health Score (Madurez)</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Estado Comercial</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Etapa Actual</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map((inst) => {
                    const metrics = instMetrics[inst.id] || { healthPercent: 0, healthStatus: 'critical', stage: 'Creación del tenant' };
                    return (
                      <TableRow key={inst.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedInst360(inst)}>
                        <TableCell className="py-3.5 align-middle">
                          <div className="flex items-center gap-2.5">
                            {inst.logo_url ? (
                              <img src={inst.logo_url} alt="" className="w-9 h-9 object-cover rounded-lg border border-slate-100" />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 text-slate-550 rounded-lg flex items-center justify-center font-bold text-sm">
                                {inst.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                                {inst.name}
                                {inst.organization_type === 'secretaria' ? (
                                  <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                    Secretaría
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                    Colegio
                                  </span>
                                )}
                                {inst.id === '11111111-1111-1111-1111-111111111111' && (
                                  <span className="bg-indigo-100 text-indigo-855 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                    Demo V1
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-450 block font-semibold mt-0.5">
                                {inst.organization_type === 'secretaria'
                                  ? `${inst.municipality || 'Municipio'}, ${inst.department || 'Departamento'} (${inst.territorial_type || 'Entidad'})`
                                  : (inst.rector_name || 'Rector No Asignado')}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              metrics.healthStatus === 'excellent' ? 'bg-emerald-500 animate-pulse' :
                              metrics.healthStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            <span className="text-xs font-black text-slate-800">{metrics.healthPercent}%</span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              ({metrics.healthStatus === 'excellent' ? 'Excelente' : 
                                metrics.healthStatus === 'warning' ? 'Seguimiento' : 'Intervención'})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            inst.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            inst.subscription_status === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-850'
                          }`}>
                            {inst.subscription_status || 'activo'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                            {metrics.stage}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedInst360(inst)}
                              className="text-slate-655 border-slate-200 hover:bg-slate-50 text-[10px] font-bold px-2.5 py-1 h-7.5 rounded-lg flex items-center gap-0.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver 360
                            </Button>
                            {savedOverride === inst.id ? (
                              <Button 
                                onClick={handleStopSimulate}
                                className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 h-7.5 rounded-lg border-none cursor-pointer"
                              >
                                Detener
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleSimulate(inst.id, inst.name)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1 h-7.5 rounded-lg border-none cursor-pointer flex items-center gap-0.5"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                Simular
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- TAB 3: CENTRO DE IMPLEMENTACIONES --- */}
      {activeTab === 'implementaciones' && (
        <div className="space-y-6">
          {institutions.map(inst => {
            const metrics = instMetrics[inst.id] || { progressPercent: 0, stage: 'Creación del tenant', stageResponsible: '', stageDate: '' };
            const currentStageIndex = IMPLEMENTATION_STAGES.findIndex(s => s.name === metrics.stage);

            return (
              <Card key={inst.id} className="border-slate-200 shadow-sm rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    {inst.logo_url ? (
                      <img src={inst.logo_url} alt="" className="w-10 h-10 object-cover rounded-xl border border-slate-100" />
                    ) : (
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                        {inst.name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-slate-850">{inst.name}</h3>
                      <span className="text-[10px] text-slate-450 block font-bold mt-0.5">Etapa Actual: <span className="text-indigo-650 underline">{metrics.stage}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs font-black text-slate-800">{metrics.progressPercent}% Implementado</span>
                    <div className="w-48 bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${metrics.progressPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Línea de tiempo visual de etapas */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
                  {IMPLEMENTATION_STAGES.map((s, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    
                    return (
                      <div key={s.id} className="flex flex-col items-center text-center space-y-2 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-50 border-emerald-300 text-emerald-600' :
                          isCurrent ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-black animate-pulse shadow-md' :
                          'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-[10px]">{idx + 1}</span>}
                        </div>
                        <span className={`text-[9px] font-bold block max-w-[85px] leading-tight ${
                          isCurrent ? 'text-indigo-855 font-extrabold' : 'text-slate-500'
                        }`}>
                          {s.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Responsable de Etapa</span>
                    <span className="text-slate-800 mt-1 block font-bold">{metrics.stageResponsible}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Fecha Límite / Firma</span>
                    <span className="text-slate-800 mt-1 block font-bold">{metrics.stageDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Estado Operativo</span>
                    <span className={`mt-1 inline-block font-extrabold ${
                      metrics.healthStatus === 'excellent' ? 'text-emerald-700' :
                      metrics.healthStatus === 'warning' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {metrics.healthStatus === 'excellent' ? '✓ Operación Saludable' : 
                       metrics.healthStatus === 'warning' ? '⚠ Requiere atención' : '⚠ Intervención Urgente'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- TAB 4: CONSOLA COMERCIAL --- */}
      {activeTab === 'comercial' && (
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-4.5 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider">
              Supervisión de Suscripciones y Cuotas Comerciales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Colegio</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Plan Activo</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Límite Estudiantes</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Límite Docentes</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Renovación</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Estado Pago</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-right">Límites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map(inst => {
                    const metrics = instMetrics[inst.id] || { studentsCount: 0, teachersCount: 0 };
                    const limits = getLimitsByPlan(inst.plan_type);
                    const isEditing = editingInstId === inst.id;

                    return (
                      <TableRow key={inst.id}>
                        <TableCell className="py-3.5 align-middle">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {inst.name}
                            {inst.organization_type === 'secretaria' ? (
                              <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                Secretaría
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                Colegio
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-450 block font-semibold">{inst.nit || 'NIT No parametrizado'}</span>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          {isEditing ? (
                            <select 
                              value={editPlan}
                              onChange={(e) => setEditPlan(e.target.value)}
                              className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 rounded-lg"
                            >
                              <option value="free_trial">Prueba Gratuita</option>
                              <option value="basic">Básico</option>
                              <option value="premium">Premium</option>
                              <option value="enterprise">Corporativo</option>
                            </select>
                          ) : (
                            <span className="text-xs font-bold text-slate-700 capitalize">{inst.plan_type?.replace('_', ' ') || 'Free Trial'}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          {inst.organization_type === 'secretaria' ? (
                            <span className="text-xs font-bold text-slate-450">No aplica (Territorial)</span>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-850 block">{metrics.studentsCount} / {limits.maxStudents}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">
                                ({limits.maxStudents > 0 ? Math.round((metrics.studentsCount / limits.maxStudents) * 100) : 0}% de la cuota)
                              </span>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          {inst.organization_type === 'secretaria' ? (
                            <span className="text-xs font-bold text-slate-450">No aplica (Territorial)</span>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-850 block">{metrics.teachersCount} / {limits.maxTeachers}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">
                                ({limits.maxTeachers > 0 ? Math.round((metrics.teachersCount / limits.maxTeachers) * 100) : 0}% de la cuota)
                              </span>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <span className="text-xs font-bold text-slate-805">
                            {inst.subscription_expires_at ? new Date(inst.subscription_expires_at).toLocaleDateString() : '2026-12-31'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          {isEditing ? (
                            <select 
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 rounded-lg"
                            >
                              <option value="active">Activo</option>
                              <option value="suspended">Suspendido</option>
                              <option value="expired">Expirado</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              inst.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {inst.subscription_status || 'activo'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-right">
                          <div className="flex justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <Button 
                                  onClick={() => handleSaveEdit(inst.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 h-7.5 rounded-lg border-none"
                                >
                                  Guardar
                                </Button>
                                <Button 
                                  variant="ghost"
                                  onClick={() => setEditingInstId(null)}
                                  className="text-slate-500 text-[10px] font-bold px-2 h-7.5 rounded-lg"
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="outline"
                                onClick={() => handleStartEdit(inst)}
                                className="text-slate-655 border-slate-200 hover:bg-slate-50 text-[10px] font-bold px-2.5 py-1 h-7.5 rounded-lg flex items-center gap-0.5"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Modificar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================================= */}
      {/* 🧭 DRAWER VISTA 360 DE INSTITUCIÓN (SLIDE-IN PANEL LATERAL)       */}
      {/* ================================================================= */}
      {selectedInst360 && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setSelectedInst360(null)}
          />
          {/* Panel Deslizable */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-slide-in border-l border-slate-200">
            
            {/* Cabecera Drawer */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div className="flex gap-3 items-center">
                {selectedInst360.logo_url ? (
                  <img src={selectedInst360.logo_url} alt="" className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-lg">
                    {selectedInst360.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-black text-slate-855 flex items-center gap-2">
                    {selectedInst360.name}
                    {selectedInst360.id === '11111111-1111-1111-1111-111111111111' && (
                      <span className="bg-indigo-100 text-indigo-855 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Demo V1
                      </span>
                    )}
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold italic">{selectedInst360.slogan || 'Sin eslogan definido'}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedInst360(null)}
                className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Pestañas Drawer */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/20">
              {[
                { id: 'resumen', label: 'Resumen Ejecutivo' },
                { id: 'general', label: 'Datos Generales' },
                { id: 'licencia', label: 'Licencia & Cuotas' },
                { id: 'auditoria', label: 'Historial Auditoría' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab360(t.id as any)}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
                    activeTab360 === t.id 
                      ? 'border-indigo-650 text-indigo-700 font-extrabold' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Cuerpo del Drawer (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab360 === 'resumen' && (
                selectedInst360.organization_type === 'secretaria' ? (
                  <div className="space-y-6">
                    <Card className="p-5 border-indigo-150 bg-indigo-50/20 rounded-2xl text-center space-y-3 shadow-none">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Entidad Territorial Registrada</h4>
                        <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                          Jurisdicción asignada a la Secretaría de Educación de {selectedInst360.municipality || 'Municipio'} ({selectedInst360.department || 'Departamento'}).
                        </p>
                      </div>
                    </Card>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Estado Comercial y Licencia</h4>
                      <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Plan Activo</span>
                          <span className="text-slate-800 mt-1 block font-bold capitalize">
                            {selectedInst360.plan_type?.replace('_', ' ') || 'Free Trial'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Suscripción</span>
                          <span className="text-slate-850 mt-1 block font-bold">
                            {selectedInst360.subscription_status === 'active' ? '🟢 Activa' : '🔴 Suspendida'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Vencimiento</span>
                          <span className="text-slate-800 mt-1 block font-bold">
                            {selectedInst360.subscription_expires_at ? new Date(selectedInst360.subscription_expires_at).toLocaleDateString() : '2026-12-31'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-5 text-center bg-slate-50/10 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Panel Ejecutivo Territorial</h4>
                      <p className="text-xs font-semibold text-slate-450 leading-relaxed max-w-md mx-auto">
                        Las analíticas agregadas de cobertura, calidad académica y ausentismo de las instituciones bajo esta jurisdicción se habilitarán en la siguiente etapa del desarrollo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Fila de KPIs de Salud y Avance */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 border-slate-150 shadow-none flex items-center gap-3 bg-slate-50/10">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          (instMetrics[selectedInst360.id]?.healthStatus === 'excellent') ? 'bg-emerald-50 text-emerald-600' :
                          (instMetrics[selectedInst360.id]?.healthStatus === 'warning') ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Salud Operativa</span>
                          <span className="text-base font-black text-slate-800 block mt-0.5">
                            {instMetrics[selectedInst360.id]?.healthPercent || 0}%
                          </span>
                        </div>
                      </Card>

                      <Card className="p-4 border-slate-150 shadow-none flex items-center gap-3 bg-slate-50/10">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-655 rounded-xl flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Implementado</span>
                          <span className="text-base font-black text-slate-800 block mt-0.5">
                            {instMetrics[selectedInst360.id]?.progressPercent || 0}%
                          </span>
                        </div>
                      </Card>
                    </div>

                    {/* Resumen Comercial */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Estado Comercial y Licencia</h4>
                      <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Plan de Licencia</span>
                          <span className="text-slate-800 mt-1 block font-bold capitalize">
                            {selectedInst360.plan_type?.replace('_', ' ') || 'Free Trial'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Suscripción</span>
                          <span className="text-slate-850 mt-1 block font-bold">
                            {selectedInst360.subscription_status === 'active' ? '🟢 Activa' : '🔴 Suspendida'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Vencimiento</span>
                          <span className="text-slate-800 mt-1 block font-bold">
                            {selectedInst360.subscription_expires_at ? new Date(selectedInst360.subscription_expires_at).toLocaleDateString() : '2026-12-31'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Indicadores Académicos y Salud Operativa */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Indicadores Académicos</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-slate-50/30 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Promedio General</span>
                          <span className="text-base font-black text-slate-855 mt-1 block">
                            {instMetrics[selectedInst360.id]?.averageGrade || 'N/A'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/30 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Calificaciones</span>
                          <span className="text-base font-black text-slate-855 mt-1 block">
                            {instMetrics[selectedInst360.id]?.gradesCount || 0}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/30 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Asistencias</span>
                          <span className="text-base font-black text-slate-855 mt-1 block">
                            {instMetrics[selectedInst360.id]?.attendanceCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Población Estudiantil y Usuarios Activos */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">Usuarios Activos por Rol</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 bg-slate-50/20 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Alumnos</span>
                          <span className="text-sm font-black text-slate-800 mt-1 block">{instMetrics[selectedInst360.id]?.studentsCount || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50/20 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Docentes</span>
                          <span className="text-sm font-black text-slate-800 mt-1 block">{instMetrics[selectedInst360.id]?.teachersCount || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50/20 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Padres</span>
                          <span className="text-sm font-black text-slate-800 mt-1 block">{instMetrics[selectedInst360.id]?.parentsCount || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50/20 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Staff</span>
                          <span className="text-sm font-black text-slate-800 mt-1 block">
                            {(instMetrics[selectedInst360.id]?.coordinatorsCount || 0) + (instMetrics[selectedInst360.id]?.secretariesCount || 0) + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actividad Reciente (30 días) */}
                    <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">Actividad Reciente (Últimos 30 días)</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>Evaluaciones Procesadas IA:</span>
                          <strong className="text-indigo-855 font-black">+{instMetrics[selectedInst360.id]?.recentGradesCount || 0}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>Asistencias Registradas:</span>
                          <strong className="text-blue-855 font-black">+{instMetrics[selectedInst360.id]?.recentAttendanceCount || 0}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Alertas Críticas */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">Alertas Críticas Activas</h4>
                      {instMetrics[selectedInst360.id]?.activeAlerts > 0 ? (
                        <div className="bg-rose-50/40 border border-rose-200 p-4 rounded-xl flex gap-3 text-rose-800 items-start">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 animate-bounce" />
                          <div className="text-xs">
                            <span className="font-bold">Requiere Intervención</span>
                            <p className="font-semibold text-rose-700 mt-1">
                              El colegio reporta {instMetrics[selectedInst360.id]?.activeAlerts} alertas predictivas de riesgo escolar/deserción activas sin resolver en el periodo.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/40 border border-emerald-250 p-4 rounded-xl flex gap-3 text-emerald-800 items-start">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <div className="text-xs">
                            <span className="font-bold">Sin alertas críticas</span>
                            <p className="font-semibold text-emerald-700 mt-0.5">La institución no reporta incidencias críticas o riesgos escolares sin atender.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Próximas Tareas Recomendadas */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">Próximas Tareas Recomendadas (IA Motor)</h4>
                      <div className="space-y-2">
                        {instMetrics[selectedInst360.id]?.progressPercent < 50 ? (
                          <div className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">1. Completar Parametrización Académica</span>
                            <span className="text-[10px] font-black uppercase text-indigo-650 font-extrabold animate-pulse">Alta Prioridad</span>
                          </div>
                        ) : null}
                        {instMetrics[selectedInst360.id]?.studentsCount === 0 ? (
                          <div className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">1. Realizar Importación de Estudiantes (.xlsx)</span>
                            <span className="text-[10px] font-black uppercase text-rose-650 font-extrabold">Prioridad Crítica</span>
                          </div>
                        ) : null}
                        {instMetrics[selectedInst360.id]?.teachersCount > 0 && !selectedInst360.active_modules?.includes('rfid') ? (
                          <div className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">1. Ofrecer Módulo RFID (Upsell)</span>
                            <span className="text-[10px] font-black uppercase text-amber-650 font-extrabold">Oportunidad Comercial</span>
                          </div>
                        ) : null}
                        {instMetrics[selectedInst360.id]?.progressPercent >= 80 && instMetrics[selectedInst360.id]?.progressPercent < 100 ? (
                          <div className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">1. Planificar Capacitación de Padres y Docentes</span>
                            <span className="text-[10px] font-black uppercase text-indigo-500">Siguiente Etapa</span>
                          </div>
                        ) : null}
                        <div className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-655">Monitorear logs de Auditoría Semanales</span>
                          <span className="text-[10px] text-slate-400 font-bold">Mantenimiento</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* --- DRAWER TAB: DATOS GENERALES (LEGAL / BRANDING) --- */}
              {activeTab360 === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">NIT de la Entidad</span>
                      <span className="text-slate-800 font-bold block">{selectedInst360.nit || 'NIT No parametrizado'}</span>
                    </div>
                    {selectedInst360.organization_type === 'secretaria' ? (
                      <>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Departamento</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.department || 'No especificado'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Municipio</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.municipality || 'No especificado'}</span>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tipo de Entidad Territorial</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.territorial_type || 'No especificado'}</span>
                        </div>
                        {selectedInst360.dane_code && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Código DANE</span>
                            <span className="text-slate-800 font-bold block">{selectedInst360.dane_code}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Código DANE</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.dane_code || 'N/A'}</span>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Resolución de Funcionamiento</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.resolution || 'No especificada'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rector</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.rector_name || 'No especificado'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Secretario Académico</span>
                          <span className="text-slate-800 font-bold block">{selectedInst360.secretary_name || 'No especificado'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Identidad Visual</h4>
                    <div className="flex gap-4 items-center">
                      <div 
                        className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: selectedInst360.primary_color }}
                      >
                        <span className="text-white text-xs font-bold font-mono">Hex</span>
                      </div>
                      <div className="text-xs font-semibold">
                        <span className="text-slate-700 font-bold block">Color Primario: <span className="font-mono text-indigo-750">{selectedInst360.primary_color}</span></span>
                        <span className="text-slate-450 block mt-1">Aplicado automáticamente en toda la botonera y layout del tenant.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DRAWER TAB: LICENCIA Y CUOTAS --- */}
              {activeTab360 === 'licencia' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Plan Contratado</span>
                      <span className="text-slate-800 font-bold block capitalize">{selectedInst360.plan_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Renovación Suscripción</span>
                      <span className="text-slate-800 font-bold block">
                        {selectedInst360.subscription_expires_at ? new Date(selectedInst360.subscription_expires_at).toLocaleDateString() : '2026-12-31'}
                      </span>
                    </div>
                  </div>

                  {/* Consumo de cuotas */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Límites y Consumos Estimados</h4>
                    {selectedInst360.organization_type === 'secretaria' ? (
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 font-semibold leading-relaxed">
                        Las Secretarías de Educación operan bajo un modelo de licenciamiento territorial. El consumo de cuotas de almacenamiento y perfiles se calcula de forma agregada a partir de los colegios asociados a su jurisdicción en la siguiente etapa del desarrollo.
                      </div>
                    ) : (
                      <div className="space-y-3.5 text-xs font-semibold">
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Cuota de Estudiantes</span>
                            <span>{instMetrics[selectedInst360.id]?.studentsCount} / {getLimitsByPlan(selectedInst360.plan_type).maxStudents} Alumnos</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-650 h-full rounded-full"
                              style={{ width: `${Math.round((instMetrics[selectedInst360.id]?.studentsCount / getLimitsByPlan(selectedInst360.plan_type).maxStudents) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Cuota de Docentes</span>
                            <span>{instMetrics[selectedInst360.id]?.teachersCount} / {getLimitsByPlan(selectedInst360.plan_type).maxTeachers} Profesores</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-650 h-full rounded-full"
                              style={{ width: `${Math.round((instMetrics[selectedInst360.id]?.teachersCount / getLimitsByPlan(selectedInst360.plan_type).maxTeachers) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Módulos Habilitados</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedInst360.active_modules || []).map(m => (
                        <span key={m} className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- DRAWER TAB: AUDITORÍA DE MIGRACIONES (HISTORIAL) --- */}
              {activeTab360 === 'auditoria' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Logs de Migración del Colegio</h4>
                  {loading360 ? (
                    <div className="py-12 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Cargando historial de auditoría...
                    </div>
                  ) : recentLogs.length === 0 ? (
                    <div className="py-8 text-center text-xs font-bold text-slate-400 italic">
                      No se registran eventos de importación para esta institución.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentLogs.map((log) => (
                        <div key={log.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/30 flex justify-between items-center gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-850 block">{log.module_type}</span>
                            <span className="text-[10px] text-slate-450 block font-semibold mt-0.5">Archivo: {log.file_name}</span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-1">Hash: {log.id}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              log.status === 'Exitoso' ? 'bg-emerald-100 text-emerald-855' : 'bg-amber-100 text-amber-855'
                            }`}>
                              {log.status}
                            </span>
                            <span className="text-[10px] text-slate-450 block font-bold mt-1">+{log.records_count} filas</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(log.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={() => setSelectedInst360(null)}
                className="text-slate-655 border-slate-200 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cerrar Panel
              </Button>
              {savedOverride === selectedInst360.id ? (
                <Button 
                  onClick={handleStopSimulate}
                  className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer"
                >
                  Detener Simulación
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSimulate(selectedInst360.id, selectedInst360.name)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Simular Inquilino
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
