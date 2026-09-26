'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout';
import { useRole } from '@/providers/role-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Utensils, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import modular components
import { PaeDashboard } from '@/components/pae/PaeDashboard';
import { PaePlanning } from '@/components/pae/PaePlanning';
import { PaeBeneficiaries } from '@/components/pae/PaeBeneficiaries';
import { PaeExecution } from '@/components/pae/PaeExecution';
import { PaeTracking } from '@/components/pae/PaeTracking';
import { PaeIncidents } from '@/components/pae/PaeIncidents';
import { PaeCommittees } from '@/components/pae/PaeCommittees';
import { PaeReports } from '@/components/pae/PaeReports';

export default function PaePage() {
  const { userRole, userName, mounted, institutionId, activeInstitution } = useRole();
  const router = useRouter();

  const safeRole = userRole || 'coordinador';
  const effectiveInstitutionId = activeInstitution?.id || institutionId || (typeof window !== 'undefined' ? localStorage.getItem('aulacore-institution-id') : null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'planeacion' | 'beneficiarios' | 'ejecucion' | 'seguimiento' | 'incidencias' | 'comites' | 'informes'>('dashboard');

  // Modular state variables initialized empty
  const [resources, setResources] = useState<any[]>([]);
  const [prioritizations, setPrioritizations] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [localPurchases, setLocalPurchases] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [spqrs, setSpqrs] = useState<any[]>([]);
  const [committeeMeetings, setCommitteeMeetings] = useState<any[]>([]);
  const [mesas, setMesas] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [dailyDeliveries, setDailyDeliveries] = useState<any[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableSedes, setAvailableSedes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    if (userRole === 'estudiante' || userRole === 'padre_familia') {
      return; // Permisos denegados
    }

    // Clean legacy unscoped demo LocalStorage keys
    if (typeof window !== 'undefined') {
      const legacyPaeKeys = [
        'aulacore-pae-resources',
        'aulacore-pae-prioritizations',
        'aulacore-pae-diagnostics',
        'aulacore-pae-operators',
        'aulacore-pae-team',
        'aulacore-pae-menus',
        'aulacore-pae-beneficiaries',
        'aulacore-pae-purchases',
        'aulacore-pae-incidents',
        'aulacore-pae-spqrs',
        'aulacore-pae-committees',
        'aulacore-pae-mesas',
        'aulacore-pae-plans',
        'aulacore-pae-deliveries',
        'aulacore-pae-attendance',
        'aulacore-pae-controls'
      ];
      legacyPaeKeys.forEach(k => localStorage.removeItem(k));
    }

    if (!effectiveInstitutionId) {
      setLoading(false);
      return;
    }

    // Read real sedes from institutional settings
    if (typeof window !== 'undefined') {
      const rawSettings = localStorage.getItem(`aulacore-institucion-settings-${effectiveInstitutionId}`);
      if (rawSettings) {
        try {
          const parsed = JSON.parse(rawSettings);
          if (parsed.sedes && Array.isArray(parsed.sedes) && parsed.sedes.length > 0) {
            setAvailableSedes(parsed.sedes.map((s: any) => s.name || s).filter(Boolean));
          }
        } catch (e) {
          console.error('Error parsing institutional settings on PAE page', e);
        }
      }
    }

    async function loadPaeData() {
      try {
        setLoading(true);

        const withTimeout = <T,>(promise: PromiseLike<T>, ms = 3000): Promise<T> => {
          return Promise.race([
            Promise.resolve(promise),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Supabase query timed out')), ms)
            )
          ]);
        };

        // 1. Cargar estudiantes reales de la institución activa a través de user_roles
        const { data: userRolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('institution_id', effectiveInstitutionId)
          .eq('role', 'estudiante');

        const studentIds = userRolesData?.map(r => r.user_id) || [];

        if (studentIds.length > 0 && !rolesError) {
          const { data: studentsData } = await withTimeout(
            supabase.from('students').select(`
              id,
              enrollment_number,
              profiles (
                first_name,
                last_name
              )
            `).in('id', studentIds)
          ) as any;

          if (studentsData) {
            const formattedStudents = studentsData.map((s: any) => ({
              id: s.id,
              enrollment_number: s.enrollment_number,
              first_name: s.profiles?.first_name || '',
              last_name: s.profiles?.last_name || ''
            }));
            setStudents(formattedStudents);
          }
        } else {
          setStudents([]);
        }

        // 2. Consultas PAE aisladas estrictamente por la institución activa
        const [
          resDb, priDb, diagDb, opDb, teamDb, menuDb, benDb, purDb, incDb, spqrDb, commDb, mesasDb, plansDb, delDb, attDb, ctrlDb
        ] = await Promise.all([
          withTimeout(supabase.from('pae_financial_resources').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_prioritization').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_infrastructure_diagnostic').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_operators').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_team').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_menu_cycles').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_beneficiaries').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_local_purchases').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_incidents').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_spqr').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_committees').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_mesas_publicas').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_improvement_plans').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_daily_deliveries').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_daily_attendance').select('*').eq('institution_id', effectiveInstitutionId)),
          withTimeout(supabase.from('pae_controls').select('*').eq('institution_id', effectiveInstitutionId))
        ]) as any[];

        setResources(resDb?.data || []);
        setPrioritizations(priDb?.data || []);
        setDiagnostics(diagDb?.data || []);
        setOperators(opDb?.data || []);
        setTeam(teamDb?.data || []);
        setMenus(menuDb?.data || []);
        setBeneficiaries(benDb?.data || []);
        setLocalPurchases(purDb?.data || []);
        setIncidents(incDb?.data || []);
        setSpqrs(spqrDb?.data || []);
        setCommitteeMeetings(commDb?.data || []);
        setMesas(mesasDb?.data || []);
        setPlans(plansDb?.data || []);
        setDailyDeliveries(delDb?.data || []);
        setDailyAttendance(attDb?.data || []);
        setControls(ctrlDb?.data || []);

      } catch (err) {
        console.warn('Supabase PAE fetch encountered an issue.', err);
      } finally {
        setLoading(false);
      }
    }

    loadPaeData();
  }, [mounted, userRole, effectiveInstitutionId]);

  // --- SAVE HANDLERS (SUPABASE WRITES USING REAL INSTITUTION ID) ---
  const handleSaveResources = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setResources(updatedData);
    try {
      await supabase.from('pae_financial_resources').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(r => ({
        institution_id: effectiveInstitutionId,
        source_name: r.source_name,
        allocated_value: r.allocated_value,
        allocation_date: r.allocation_date,
        support_document: r.support_document,
        pdf_url: r.pdf_url
      }));
      if (payload.length > 0) {
        await supabase.from('pae_financial_resources').insert(payload);
      }
    } catch (e) {
      console.error('Error saving financial resources', e);
    }
  };

  const handleSavePrioritizations = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setPrioritizations(updatedData);
    try {
      await supabase.from('pae_prioritization').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(p => ({
        institution_id: effectiveInstitutionId,
        school_sede: p.school_sede,
        school_shift: p.school_shift,
        projected_beneficiaries: p.projected_beneficiaries,
        assigned_slots: p.assigned_slots
      }));
      if (payload.length > 0) {
        await supabase.from('pae_prioritization').insert(payload);
      }
    } catch (e) {
      console.error('Error saving prioritizations', e);
    }
  };

  const handleSaveDiagnostics = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setDiagnostics(updatedData);
    try {
      await supabase.from('pae_infrastructure_diagnostic').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(d => ({
        institution_id: effectiveInstitutionId,
        school_sede: d.school_sede,
        dining_room_status: d.dining_room_status,
        kitchen_status: d.kitchen_status,
        pantry_status: d.pantry_status,
        utensils_status: d.utensils_status,
        equipment_status: d.equipment_status,
        observaciones: d.observaciones,
        photos: d.photos
      }));
      if (payload.length > 0) {
        await supabase.from('pae_infrastructure_diagnostic').insert(payload);
      }
    } catch (e) {
      console.error('Error saving diagnostics', e);
    }
  };

  const handleSaveOperators = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setOperators(updatedData);
    try {
      await supabase.from('pae_operators').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(o => ({
        institution_id: effectiveInstitutionId,
        operator_name: o.operator_name,
        nit: o.nit,
        representative: o.representative,
        contract_number: o.contract_number,
        start_date: o.start_date,
        end_date: o.end_date,
        policies: o.policies,
        pdf_url: o.pdf_url,
        is_active: o.is_active
      }));
      if (payload.length > 0) {
        await supabase.from('pae_operators').insert(payload);
      }
    } catch (e) {
      console.error('Error saving operators', e);
    }
  };

  const handleSaveTeam = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setTeam(updatedData);
    try {
      await supabase.from('pae_team').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(t => ({
        institution_id: effectiveInstitutionId,
        member_name: t.member_name,
        role_title: t.role_title,
        document_number: t.document_number,
        email: t.email,
        phone: t.phone
      }));
      if (payload.length > 0) {
        await supabase.from('pae_team').insert(payload);
      }
    } catch (e) {
      console.error('Error saving team', e);
    }
  };

  const handleSaveMenus = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setMenus(updatedData);
    try {
      await supabase.from('pae_menu_cycles').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(m => ({
        institution_id: effectiveInstitutionId,
        week_number: m.week_number,
        menu_details: m.menu_details,
        minuta_pdf_url: m.minuta_pdf_url,
        nutrition_analysis_url: m.nutrition_analysis_url,
        preparation_guides_url: m.preparation_guides_url
      }));
      if (payload.length > 0) {
        await supabase.from('pae_menu_cycles').insert(payload);
      }
    } catch (e) {
      console.error('Error saving menus', e);
    }
  };

  const handleSaveBeneficiaries = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setBeneficiaries(updatedData);
    try {
      await supabase.from('pae_beneficiaries').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(b => ({
        student_id: b.student_id,
        institution_id: effectiveInstitutionId,
        is_beneficiary: b.is_beneficiary,
        entry_date: b.entry_date,
        exit_date: b.exit_date,
        modality: b.modality,
        prioritization_reason: b.prioritization_reason,
        classifications: b.classifications
      }));
      if (payload.length > 0) {
        await supabase.from('pae_beneficiaries').insert(payload);
      }
    } catch (e) {
      console.error('Error saving beneficiaries', e);
    }
  };

  const handleSaveLocalPurchases = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setLocalPurchases(updatedData);
    try {
      await supabase.from('pae_local_purchases').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(p => ({
        institution_id: effectiveInstitutionId,
        supplier_name: p.supplier_name,
        municipality: p.municipality,
        product_name: p.product_name,
        purchase_value: p.purchase_value,
        purchase_date: p.purchase_date,
        invoice_pdf: p.invoice_pdf
      }));
      if (payload.length > 0) {
        await supabase.from('pae_local_purchases').insert(payload);
      }
    } catch (e) {
      console.error('Error saving local purchases', e);
    }
  };

  const handleSaveIncidents = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setIncidents(updatedData);
    try {
      await supabase.from('pae_incidents').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(i => ({
        institution_id: effectiveInstitutionId,
        incident_type: i.incident_type,
        title: i.title,
        description: i.description,
        incident_date: i.incident_date,
        affected_count: i.affected_count || 0,
        symptoms: i.symptoms || null,
        medical_attention: i.medical_attention || false,
        status: i.status
      }));
      if (payload.length > 0) {
        await supabase.from('pae_incidents').insert(payload);
      }
    } catch (e) {
      console.error('Error saving incidents', e);
    }
  };

  const handleSaveSpqrs = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setSpqrs(updatedData);
    try {
      await supabase.from('pae_spqr').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(s => ({
        institution_id: effectiveInstitutionId,
        spqr_type: s.spqr_type,
        requester_name: s.requester_name,
        description: s.description,
        spqr_date: s.spqr_date,
        status: s.status,
        response_text: s.response_text,
        response_date: s.response_date
      }));
      if (payload.length > 0) {
        await supabase.from('pae_spqr').insert(payload);
      }
    } catch (e) {
      console.error('Error saving spqrs', e);
    }
  };

  const handleSaveCommitteeMeetings = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setCommitteeMeetings(updatedData);
    try {
      await supabase.from('pae_committees').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(c => ({
        institution_id: effectiveInstitutionId,
        committee_type: c.committee_type,
        meeting_date: c.meeting_date,
        meeting_time: c.meeting_time,
        location: c.location,
        description: c.description,
        members: c.members,
        decisions: c.decisions,
        acta_pdf_url: c.acta_pdf_url,
        status: c.status
      }));
      if (payload.length > 0) {
        await supabase.from('pae_committees').insert(payload);
      }
    } catch (e) {
      console.error('Error saving committees', e);
    }
  };

  const handleSaveMesas = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setMesas(updatedData);
    try {
      await supabase.from('pae_mesas_publicas').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(m => ({
        institution_id: effectiveInstitutionId,
        vigencia_year: m.vigencia_year,
        mesa_number: m.mesa_number,
        meeting_date: m.meeting_date,
        attendees_count: m.attendees_count,
        compromisos: m.compromisos,
        acta_pdf_url: m.acta_pdf_url
      }));
      if (payload.length > 0) {
        await supabase.from('pae_mesas_publicas').insert(payload);
      }
    } catch (e) {
      console.error('Error saving mesas', e);
    }
  };

  const handleSaveDeliveries = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setDailyDeliveries(updatedData);
    try {
      await supabase.from('pae_daily_deliveries').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(d => ({
        institution_id: effectiveInstitutionId,
        delivery_date: d.delivery_date,
        school_sede: d.school_sede,
        school_shift: d.school_shift,
        ration_type: d.ration_type,
        scheduled_rations: d.scheduled_rations,
        delivered_rations: d.delivered_rations,
        missing_rations: d.missing_rations,
        observaciones: d.observaciones,
        photos: d.photos
      }));
      if (payload.length > 0) {
        await supabase.from('pae_daily_deliveries').insert(payload);
      }
    } catch (e) {
      console.error('Error saving deliveries', e);
    }
  };

  const handleSaveAttendance = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setDailyAttendance(updatedData);
    try {
      await supabase.from('pae_daily_attendance').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(a => ({
        institution_id: effectiveInstitutionId,
        student_id: a.student_id,
        attendance_date: a.attendance_date,
        consumed: a.consumed
      }));
      if (payload.length > 0) {
        await supabase.from('pae_daily_attendance').insert(payload);
      }
    } catch (e) {
      console.error('Error saving attendance', e);
    }
  };

  const handleSaveControls = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setControls(updatedData);
    try {
      await supabase.from('pae_controls').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(c => ({
        institution_id: effectiveInstitutionId,
        control_type: c.control_type,
        control_date: c.control_date,
        inspector_name: c.inspector_name,
        score_percentage: c.score_percentage,
        findings: c.findings,
        action_plan: c.action_plan
      }));
      if (payload.length > 0) {
        await supabase.from('pae_controls').insert(payload);
      }
    } catch (e) {
      console.error('Error saving controls', e);
    }
  };

  const handleSavePlans = async (updatedData: any[]) => {
    if (!effectiveInstitutionId) return;
    setPlans(updatedData);
    try {
      await supabase.from('pae_improvement_plans').delete().eq('institution_id', effectiveInstitutionId);
      const payload = updatedData.map(p => ({
        institution_id: effectiveInstitutionId,
        finding: p.finding,
        corrective_action: p.corrective_action,
        responsible_name: p.responsible_name,
        due_date: p.due_date,
        status: p.status,
        completion_percentage: p.completion_percentage
      }));
      if (payload.length > 0) {
        await supabase.from('pae_improvement_plans').insert(payload);
      }
    } catch (e) {
      console.error('Error saving improvement plans', e);
    }
  };

  if (!mounted) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500 font-semibold">Cargando módulo PAE...</div>
      </AppLayout>
    );
  }

  if (userRole === 'estudiante' || userRole === 'padre_familia') {
    return (
      <AppLayout>
        <Card className="border-red-200 bg-red-50/50 p-8 rounded-3xl max-w-xl mx-auto my-12 text-center shadow-lg">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-red-950">Acceso Restringido al Módulo Privado PAE</h2>
            <p className="text-xs text-red-700 leading-relaxed font-semibold">
              Esta sección administrativa y de auditoría del Programa de Alimentación Escolar está reservada para el equipo directivo, coordinación y docentes de la institución.
            </p>
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
    { id: 'dashboard', label: 'Dashboard PAE' },
    { id: 'planeacion', label: 'Planeación' },
    { id: 'beneficiarios', label: 'Beneficiarios' },
    { id: 'ejecucion', label: 'Ejecución' },
    { id: 'seguimiento', label: 'Seguimiento' },
    { id: 'incidencias', label: 'Incidencias e SPQR' },
    { id: 'comites', label: 'Comités y CAE' },
    { id: 'informes', label: 'Informes' }
  ] as const;

  // Real reactive calculations for Dashboard
  const activeOperatorName = operators.find(o => o.is_active)?.operator_name || 'Sin operador asignado';
  const openIncidents = incidents.filter(i => i.status !== 'Cerrado' && i.incident_type !== 'ETA');
  const activeEta = incidents.filter(i => i.incident_type === 'ETA' && i.status !== 'Cerrado');
  const scheduledRations = dailyDeliveries.reduce((acc, curr) => acc + (curr.scheduled_rations || 0), 0);
  const deliveredRations = dailyDeliveries.reduce((acc, curr) => acc + (curr.delivered_rations || 0), 0);
  const coveragePercentage = scheduledRations > 0 ? parseFloat(((deliveredRations / scheduledRations) * 100).toFixed(1)) : 0;
  const beneficiariesCount = beneficiaries.filter(b => b.is_beneficiary).length;

  const dashboardSedes = availableSedes.map(s => {
    const dels = dailyDeliveries.filter(d => d.school_sede === s);
    const sch = dels.reduce((acc, c) => acc + (c.scheduled_rations || 0), 0);
    const del = dels.reduce((acc, c) => acc + (c.delivered_rations || 0), 0);
    return { name: s, scheduled: sch, delivered: del };
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-indigo-400 animate-bounce" />
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-255">Gestión Institucional</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-1.5">Programa de Alimentación Escolar (PAE)</h1>
            <p className="text-base text-slate-200 mt-1.5 leading-relaxed">
              Consola unificada de planeación, cobertura, auditorías y transparencia alimentaria del plantel.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 text-xs bg-slate-950/40 px-3 py-1.5 border border-slate-800 rounded-xl font-mono text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Rol: {safeRole.toUpperCase()}</span>
          </div>
        </div>

        {/* Tab Switcher Selector */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm select-none shrink-0 overflow-x-auto w-full max-w-5xl scrollbar-hide">
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
            <p className="text-xs text-slate-500 font-bold">Cargando base de datos y auditorías del PAE...</p>
          </Card>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && (
              <PaeDashboard 
                userRole={safeRole}
                beneficiariesCount={beneficiariesCount}
                coveragePercentage={coveragePercentage}
                scheduledRations={scheduledRations}
                deliveredRations={deliveredRations}
                incidentsCount={openIncidents.length}
                activeOperator={activeOperatorName}
                localPurchasesPercentage={0}
                etaCount={activeEta.length}
                nextCaeDate={committeeMeetings[0]?.meeting_date || ''}
                sedes={dashboardSedes}
              />
            )}

            {activeTab === 'planeacion' && (
              <PaePlanning 
                userRole={safeRole}
                resources={resources}
                onSaveResources={handleSaveResources}
                prioritizations={prioritizations}
                onSavePrioritizations={handleSavePrioritizations}
                diagnostics={diagnostics}
                onSaveDiagnostics={handleSaveDiagnostics}
                operators={operators}
                onSaveOperators={handleSaveOperators}
                team={team}
                onSaveTeam={handleSaveTeam}
                menus={menus}
                onSaveMenus={handleSaveMenus}
              />
            )}

            {activeTab === 'beneficiarios' && (
              <PaeBeneficiaries 
                userRole={safeRole}
                students={students}
                beneficiaries={beneficiaries}
                onSaveBeneficiaries={handleSaveBeneficiaries}
              />
            )}

            {activeTab === 'ejecucion' && (
              <PaeExecution 
                userRole={safeRole}
                students={students}
                beneficiaries={beneficiaries}
                deliveries={dailyDeliveries}
                onSaveDeliveries={handleSaveDeliveries}
                attendance={dailyAttendance}
                onSaveAttendance={handleSaveAttendance}
                controls={controls}
                onSaveControls={handleSaveControls}
                availableSedes={availableSedes}
              />
            )}

            {activeTab === 'seguimiento' && (
              <PaeTracking 
                userRole={safeRole}
                localPurchases={localPurchases}
                onSavePurchases={handleSaveLocalPurchases}
                visits={controls}
                onSaveVisits={handleSaveControls}
                totalContractValue={0}
              />
            )}

            {activeTab === 'incidencias' && (
              <PaeIncidents 
                userRole={safeRole}
                incidents={incidents}
                onSaveIncidents={handleSaveIncidents}
                spqrs={spqrs}
                onSaveSpqrs={handleSaveSpqrs}
                plans={plans}
                onSavePlans={handleSavePlans}
                availableSedes={availableSedes}
              />
            )}

            {activeTab === 'comites' && (
              <PaeCommittees 
                userRole={safeRole}
                meetings={committeeMeetings}
                onSaveMeetings={handleSaveCommitteeMeetings}
                mesas={mesas}
                onSaveMesas={handleSaveMesas}
              />
            )}

            {activeTab === 'informes' && (
              <PaeReports 
                userRole={safeRole}
              />
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
