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
import { SaasDashboard } from '@/components/saas/SaasDashboard';
import { SaasAlertsCenter } from '@/components/saas/SaasAlertsCenter';
import { SaasClientsTable } from '@/components/saas/SaasClientsTable';
import { SaasCustomerSuccess } from '@/components/saas/SaasCustomerSuccess';
import { 
  SaasLicenses, SaasCrm, SaasImplementations, SaasBilling, 
  SaasSupport, SaasIntegrations, SaasMonitoring, SaasAuditLogs, SaasGlobalConfig 
} from '@/components/saas/SaasOtherModules';
import { Client360Drawer } from '@/components/saas/Client360Drawer';
import { SupportModeModal } from '@/components/saas/SupportModeModal';

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
  { id: 'operacion_stable', name: 'Operación estable', defaultResponsible: 'Soporte AulaCore' }
];

export default function SaasConsolePage() {
  const router = useRouter();
  const { allInstitutions, roles, overrideInstitutionId: savedOverride, setOverrideInstitutionId, refreshSession } = useAuth();
  const activeSimulatedName = allInstitutions?.find(i => i.id === savedOverride)?.name || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pestaña activa principal (13 módulos corporativos)
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [supportModalTenant, setSupportModalTenant] = useState<any | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Listado de inquilinos
  const [institutions, setInstitutions] = useState<any[]>([]);
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
  const [selectedInst360, setSelectedInst360] = useState<any | null>(null);
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

        const instRoles = rolesData?.filter(r => r.institution_id === instId) || [];
        const studentsCount = instRoles.filter(r => r.role === 'estudiante').length;
        const teachersCount = instRoles.filter(r => r.role === 'docente').length;
        const parentsCount = instRoles.filter(r => r.role === 'padre_familia').length;
        const coordinatorsCount = instRoles.filter(r => r.role === 'coordinador').length;
        const secretariesCount = instRoles.filter(r => r.role === 'secretaria').length;
        const totalUsersCount = instRoles.length;
        
        const coursesCount = coursesData?.filter(c => c.institution_id === instId).length || 0;
        const subjectsCount = subjectsData?.filter(s => s.institution_id === instId).length || 0;
        const hasSettings = settingsData?.some(s => s.institution_id === instId) || false;
        const hasActiveYear = yearsData?.some(y => y.institution_id === instId && y.is_active) || false;

        const studentIds = new Set(instRoles.filter(r => r.role === 'estudiante').map(r => r.user_id));

        const instGrades = gradesData?.filter(g => studentIds.has(g.student_id)) || [];
        const instAttendance = attendanceData?.filter(a => studentIds.has(a.student_id)) || [];
        const instAlerts = alertsData?.filter(a => studentIds.has(a.student_id)) || [];

        const gradesCount = instGrades.length;
        const attendanceCount = instAttendance.length;
        const activeAlerts = instAlerts.filter(a => a.status === 'open').length;

        const recentGradesCount = instGrades.filter(g => new Date(g.created_at) >= thirtyDaysAgo).length;
        const recentAttendanceCount = instAttendance.filter(a => new Date(a.record_date) >= thirtyDaysAgo).length;

        const averageGrade = instGrades.length > 0
          ? (instGrades.reduce((sum, g) => sum + Number(g.grade), 0) / instGrades.length).toFixed(2)
          : 'N/A';

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
    const weights = {
      parametrizacion: 10,
      calendario: 10,
      sedesJornadas: 10,
      docentes: 10,
      estudiantes: 10,
      padres: 10,
      cursos: 5,
      asignaturas: 5,
      mallas: 5,
      evaluaciones: 10,
      asistencia: 10,
      actividad30dias: 5,
      usoModulos: 5,
      calidadInfo: 5
    };

    let score = 0;

    const hasSlogan = !!inst.slogan;
    const hasRector = !!inst.rector_name;
    const hasSecretary = !!inst.secretary_name;
    const hasLogo = !!inst.logo_url;
    const hasNit = !!inst.nit;
    const hasDane = !!inst.dane_code;
    const hasResolution = !!inst.resolution;

    let paramScore = 0;
    if (hasRector) paramScore += 2;
    if (hasSecretary) paramScore += 2;
    if (hasSlogan) paramScore += 1;
    if (hasLogo) paramScore += 2;
    if (hasNit) paramScore += 2;
    if (hasDane) paramScore += 1;
    if (hasResolution) paramScore += 2;
    score += (paramScore / 12) * weights.parametrizacion;

    if (hasActiveYear) score += weights.calendario;
    if (hasSettings) score += weights.sedesJornadas;
    if (teachersCount > 0) score += weights.docentes;
    if (studentsCount > 0) score += weights.estudiantes;
    if (parentsCount > 0) score += weights.padres;
    if (coursesCount > 0) score += weights.cursos;
    if (subjectsCount > 0) score += weights.asignaturas;
    if (subjectsCount > 0 && coursesCount > 0) score += weights.mallas;
    if (gradesCount > 0) score += weights.evaluaciones;
    if (attendanceCount > 0) score += weights.asistencia;
    if (recentGradesCount > 0 || recentAttendanceCount > 0) score += weights.actividad30dias;

    const activeModCount = inst.active_modules?.length || 0;
    if (activeModCount >= 2) score += weights.usoModulos;
    else if (activeModCount === 1) score += weights.usoModulos * 0.5;

    let infoQualityScore = 0;
    if (hasNit) infoQualityScore += 1.5;
    if (hasDane) infoQualityScore += 1.5;
    if (hasResolution) infoQualityScore += 2;
    score += (infoQualityScore / 5) * weights.calidadInfo;

    const alertPenalization = Math.min(15, activeAlerts * 5);
    score = Math.max(0, score - alertPenalization);

    const healthPercent = Math.max(5, Math.min(100, Math.round(score)));

    let healthStatus: 'excellent' | 'warning' | 'critical' = 'excellent';
    if (healthPercent >= 80) healthStatus = 'excellent';
    else if (healthPercent >= 45) healthStatus = 'warning';
    else healthStatus = 'critical';

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

  const getLimitsByPlan = (plan?: string) => {
    switch (plan) {
      case 'free_trial':
        return { maxStudents: 50, maxTeachers: 5, maxStorage: '500 MB' };
      case 'basic':
        return { maxStudents: 300, maxTeachers: 20, maxStorage: '1.0 GB' };
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
    setSelectedInst360(inst);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setLoading(true);
    try {
      const { error } = await supabase
        .from('institutions')
        .update({ subscription_status: nextStatus })
        .eq('id', id);
      if (error) throw error;
      setSuccess(`Estado actualizado a: ${nextStatus === 'active' ? 'Activo' : 'Suspendido'}`);
      await loadInstitutions();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSupportMode = async (tenantId: string, tenantName: string, reason: string) => {
    try {
      await supabase.from('migration_audit_logs').insert({
        institution_id: tenantId,
        user_id: (await supabase.auth.getUser()).data.user?.id || 'super-admin',
        module_type: 'MODO_SOPORTE_RBAC',
        file_name: `Motivo: ${reason}`,
        records_count: 1,
        status: 'Exitoso'
      });
    } catch (e) {
      console.warn('Error audit log:', e);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('aulacore-support-mode', JSON.stringify({
        tenantId,
        tenantName,
        reason,
        timestamp: new Date().toISOString()
      }));
    }
    await setOverrideInstitutionId(tenantId);
    router.push('/dashboard');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* SaaS Status bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-650" />
            Consola SaaS Enterprise & Centro de Control
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Administración central del negocio SaaS, telemetría de inquilinos, licencias, facturación y soporte corporativo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/configuracion/nuevo-colegio')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Cliente
          </Button>
          <Button 
            variant="outline"
            onClick={loadInstitutions}
            disabled={loading}
            className="text-slate-655 border-slate-200 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
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

      {/* 🌟 NAVEGACIÓN CORPORATIVA DE 13 MÓDULOS (ENTERPRISE SAAS CONTROL ROOM) */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max text-xs font-black">
          {/* Pilar 1 */}
          <span className="px-2 py-1 text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest bg-indigo-50 rounded-lg border border-indigo-100">
            1. Estratégico & Financiero:
          </span>
          {[
            { id: 'dashboard', label: 'Dashboard Ejecutivo' },
            { id: 'alertas_saas', label: 'Alertas (CAT SaaS)' },
            { id: 'facturacion', label: 'Facturación & Recaudo' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="h-5 w-px bg-slate-200 mx-1.5" />

          {/* Pilar 2 */}
          <span className="px-2 py-1 text-[10px] font-extrabold text-purple-700 uppercase tracking-widest bg-purple-50 rounded-lg border border-purple-100">
            2. Clientes & Adopción:
          </span>
          {[
            { id: 'colegios', label: 'Clientes (360°)' },
            { id: 'customer_success', label: 'Customer Success' },
            { id: 'licencias', label: 'Licencias & Contratos' },
            { id: 'comercial', label: 'CRM Comercial' },
            { id: 'implementaciones', label: 'Implementaciones' },
            { id: 'soporte', label: 'Soporte Técnico' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="h-5 w-px bg-slate-200 mx-1.5" />

          {/* Pilar 3 */}
          <span className="px-2 py-1 text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 rounded-lg border border-emerald-100">
            3. Tecnología & Seguridad:
          </span>
          {[
            { id: 'integraciones', label: 'Integraciones Globales' },
            { id: 'monitoreo', label: 'Monitoreo de Plataforma' },
            { id: 'auditoria', label: 'Auditoría & Modo Soporte' },
            { id: 'configuracion_global', label: 'Configuración Global' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDERIZADO DEL MÓDULO SELECCIONADO */}
      <div className="transition-all duration-300">
        {activeTab === 'dashboard' && <SaasDashboard stats={globalStats} />}
        {activeTab === 'alertas_saas' && <SaasAlertsCenter institutions={institutions} />}
        {activeTab === 'facturacion' && <SaasBilling />}
        {activeTab === 'colegios' && (
          <SaasClientsTable 
            institutions={institutions}
            loading={loading}
            onRefresh={loadInstitutions}
            onOpenCreate={() => router.push('/configuracion/nuevo-colegio')}
            onOpen360={(inst) => setSelectedInst360(inst)}
            onOpenSupportMode={(inst) => { setSupportModalTenant(inst); setSupportModalOpen(true); }}
            onToggleStatus={handleToggleStatus}
          />
        )}
        {activeTab === 'customer_success' && <SaasCustomerSuccess institutions={institutions} />}
        {activeTab === 'licencias' && <SaasLicenses institutions={institutions} onEditLicense={(inst) => setSelectedInst360(inst)} />}
        {activeTab === 'comercial' && <SaasCrm />}
        {activeTab === 'implementaciones' && <SaasImplementations institutions={institutions} />}
        {activeTab === 'soporte' && <SaasSupport />}
        {activeTab === 'integraciones' && <SaasIntegrations />}
        {activeTab === 'monitoreo' && <SaasMonitoring />}
        {activeTab === 'auditoria' && <SaasAuditLogs />}
        {activeTab === 'configuracion_global' && <SaasGlobalConfig />}
      </div>

      {/* DRAWER 360° DE CLIENTE */}
      <Client360Drawer
        tenant={selectedInst360}
        metrics={selectedInst360 ? instMetrics[selectedInst360.id] : {}}
        isOpen={!!selectedInst360}
        onClose={() => setSelectedInst360(null)}
        onOpenSupportMode={(inst) => { setSelectedInst360(null); setSupportModalTenant(inst); setSupportModalOpen(true); }}
      />

      {/* MODAL DE MODO SOPORTE AUDITABLE */}
      <SupportModeModal
        tenant={supportModalTenant}
        isOpen={supportModalOpen}
        onClose={() => { setSupportModalOpen(false); setSupportModalTenant(null); }}
        onConfirmSupportMode={handleConfirmSupportMode}
      />
    </div>
  );
}
