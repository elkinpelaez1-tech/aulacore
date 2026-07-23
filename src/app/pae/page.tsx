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

// SEED DATA fallback definition
const SEED_RESOURCES = [
  { id: 'res-1', source_name: 'SGP - Sistema General de Participación', allocated_value: 125000000.00, allocation_date: '2026-01-15', support_document: 'Resolución MEN 0451 de 2026', pdf_url: '/documentos/res_sgp_0451.pdf' },
  { id: 'res-2', source_name: 'Cofinanciación Municipal', allocated_value: 45000000.00, allocation_date: '2026-02-01', support_document: 'Acuerdo Municipal 012 de 2026', pdf_url: '/documentos/acuerdo_mun_012.pdf' }
];

const SEED_PRIORITIZATIONS = [
  { id: 'pri-1', school_sede: 'Sede Principal Campestre', school_shift: 'Única', projected_beneficiaries: 320, assigned_slots: 320 },
  { id: 'pri-2', school_sede: 'Sede Anexa Primaria', school_shift: 'Mañana', projected_beneficiaries: 180, assigned_slots: 180 }
];

const SEED_DIAGNOSTICS = [
  { id: 'diag-1', school_sede: 'Sede Principal Campestre', dining_room_status: 'Bueno', kitchen_status: 'Bueno', pantry_status: 'Bueno', utensils_status: 'Bueno', equipment_status: 'Bueno', observaciones: 'El comedor cuenta con capacidad para 120 estudiantes por turno. Equipos de refrigeración en óptimo estado.', photos: ['/evidencias/comedor_principal_1.jpg'] },
  { id: 'diag-2', school_sede: 'Sede Anexa Primaria', dining_room_status: 'Regular', kitchen_status: 'Regular', pantry_status: 'Regular', utensils_status: 'Bueno', equipment_status: 'Malo', observaciones: 'Se requiere reposición urgente de la licuadora industrial y mantenimiento de las hornillas de gas.', photos: ['/evidencias/cocina_primaria_1.jpg'] }
];

const SEED_OPERATORS = [
  { id: 'op-1', operator_name: 'Consorcio Alimentando Futuro 2026', nit: '901.458.123-5', representative: 'Dra. Patricia Gómez Ruiz', contract_number: 'Licitación Pública No. LP-PAE-001-2026', start_date: '2026-01-20', end_date: '2026-11-30', policies: ['Póliza de Calidad de Alimentos - Suramericana No. 45102', 'Póliza de Cumplimiento - Seguros del Estado No. 90291'], pdf_url: '/documentos/contrato_pae_2026.pdf', is_active: true }
];

const SEED_TEAM = [
  { id: 'team-1', member_name: 'Dra. Claudia Marcela Pérez', role_title: 'Nutricionista - Supervisor de Contrato', document_number: '52.321.456', email: 'claudia.perez@consorcio.com', phone: '+573124567891' },
  { id: 'team-2', member_name: 'María del Carmen Suárez', role_title: 'Manipuladora de Alimentos Líder', document_number: '20.123.456', email: 'maria.carmen@gmail.com', phone: '+573219876543' }
];

const SEED_MENUS = [
  { id: 'menu-1', week_number: 1, menu_details: 'Lunes: Arroz con pollo, ensalada verde, banano y jugo de guayaba. Martes: Carne de res sudada, arroz, lentejas, papaya y jugo de mango. Miércoles: Pollo al horno, puré de papa, zanahoria, manzana y leche. Jueves: Cerdo asado, arroz, fríjoles, melón y limonada. Viernes: Pescado frito, arroz con coco, patacón, ensalada de repollo y jugo de piña.', minuta_pdf_url: '/minutas/minuta_semana_1.pdf', nutrition_analysis_url: '/minutas/analisis_nutri_s1.pdf', preparation_guides_url: '/minutas/guia_prep_s1.pdf' }
];

const SEED_BENEFICIARIES = [
  { student_id: '77777777-7777-7777-7777-777777777777', is_beneficiary: true, entry_date: '2026-01-20', modality: 'Almuerzo Caliente Preparado en Sitio', prioritization_reason: 'Jornada Única', classifications: ['Jornada única'] },
  { student_id: '88888888-8888-8888-8888-888888888888', is_beneficiary: true, entry_date: '2026-01-20', modality: 'Almuerzo Caliente Preparado en Sitio', prioritization_reason: 'Ruralidad', classifications: ['Rural', 'Jornada única'] },
  { student_id: '99999999-9999-9999-9999-999999999999', is_beneficiary: true, entry_date: '2026-01-20', modality: 'Ración Industrializada', prioritization_reason: 'Extrema Pobreza', classifications: ['Vulnerabilidad'] }
];

const SEED_PURCHASES = [
  { id: 'pur-1', supplier_name: 'Cooperativa Agropecuaria de San Antonio', municipality: 'San Antonio de Tequendama', product_name: 'Frutas y Verduras (Banano, Guayaba, Tomate)', purchase_value: 8500000.00, purchase_date: '2026-05-10', invoice_pdf: '/facturas/factura_agro_012.pdf' },
  { id: 'pur-2', supplier_name: 'Asociación de Lecheros de la Vereda El Hato', municipality: 'San Antonio de Tequendama', product_name: 'Leche entera pasteurizada y Queso campesino', purchase_value: 7500000.00, purchase_date: '2026-05-18', invoice_pdf: '/facturas/factura_lecheros_450.pdf' }
];

const SEED_INCIDENTS = [
  { id: 'inc-1', incident_type: 'Retraso', title: 'Retraso de entrega de ración industrializada', description: 'El camión transportador del operador llegó a las 11:30 AM en lugar de las 9:30 AM programadas.', incident_date: '2026-05-25', status: 'Cerrado' },
  { id: 'inc-2', incident_type: 'Mala Calidad', title: 'Banano en estado de sobremaduración', description: 'Se recibió una caja de banano con golpes y cáscara negra no aptos para el consumo de los estudiantes.', incident_date: '2026-06-02', status: 'Abierto' }
];

const SEED_SPQRS = [
  { id: 'spqr-1', spqr_type: 'Queja', requester_name: 'Marcos Elías Gómez (Padre de Familia)', description: 'Presento queja formal debido a que el menú del día jueves no coincidió con la minuta publicada en el portal.', spqr_date: '2026-05-18', status: 'Respondido', response_text: 'Apreciado acudiente, se verificó con el operador y hubo un cambio autorizado por secretaría de educación debido a problemas logísticos con el proveedor de carne de cerdo.', response_date: '2026-05-20' }
];

const SEED_COMMITTEES = [
  { id: 'meet-1', committee_type: 'CAE', meeting_date: '2026-03-12', meeting_time: '10:00', location: 'Biblioteca Principal', description: 'Primera sesión del Comité de Alimentación Escolar (CAE) de la vigencia 2026.', members: [{ name: 'Dr. Ramón Ramírez', role: 'Rector / Presidente' }, { name: 'Lic. Diana Carolina Reyes', role: 'Docente Responsable' }, { name: 'Carlos Ortiz', role: 'Representante de Padres' }, { name: 'Alejandro Ortiz', role: 'Representante de Estudiantes' }], decisions: 'Se conforma formalmente el comité CAE. Se acuerda realizar veeduría semanal de la calidad de la leche recibida y programar la primera Mesa Pública en Abril.', acta_pdf_url: '/actas/acta_cae_001_2026.pdf', status: 'Realizado' }
];

const SEED_MESAS = [
  { id: 'mesa-1', vigencia_year: '2026', mesa_number: 1, meeting_date: '2026-04-20', attendees_count: 85, compromisos: '1. El operador se compromete a ajustar los tiempos de entrega. 2. La secretaría de educación municipal supervisará la cadena de frío semanalmente. 3. Mayor inclusión de frutas de productores locales.', acta_pdf_url: '/actas/acta_mesa_publica_1.pdf' }
];

const SEED_PLANS = [
  { id: 'plan-1', finding: 'La licuadora industrial de la Sede Anexa Primaria está en mal estado.', corrective_action: 'Adquirir y reponer licuadora industrial nueva de 5 litros.', responsible_name: 'Ingeniero de Operaciones PAE', due_date: '2026-06-20', status: 'Abierto', completion_percentage: 40 }
];

export default function PaePage() {
  const { userRole, userName, mounted } = useRole();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'planeacion' | 'beneficiarios' | 'ejecucion' | 'seguimiento' | 'incidencias' | 'comites' | 'informes'>('dashboard');

  // Modular state variables
  const [resources, setResources] = useState<any[]>(SEED_RESOURCES);
  const [prioritizations, setPrioritizations] = useState<any[]>(SEED_PRIORITIZATIONS);
  const [diagnostics, setDiagnostics] = useState<any[]>(SEED_DIAGNOSTICS);
  const [operators, setOperators] = useState<any[]>(SEED_OPERATORS);
  const [team, setTeam] = useState<any[]>(SEED_TEAM);
  const [menus, setMenus] = useState<any[]>(SEED_MENUS);
  const [beneficiaries, setBeneficiaries] = useState<any[]>(SEED_BENEFICIARIES);
  const [localPurchases, setLocalPurchases] = useState<any[]>(SEED_PURCHASES);
  const [incidents, setIncidents] = useState<any[]>(SEED_INCIDENTS);
  const [spqrs, setSpqrs] = useState<any[]>(SEED_SPQRS);
  const [committeeMeetings, setCommitteeMeetings] = useState<any[]>(SEED_COMMITTEES);
  const [mesas, setMesas] = useState<any[]>(SEED_MESAS);
  const [plans, setPlans] = useState<any[]>(SEED_PLANS);
  const [dailyDeliveries, setDailyDeliveries] = useState<any[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    if (userRole === 'estudiante' || userRole === 'padre_familia') {
      return; // Permisos denegados
    }

    async function loadPaeData() {
      // 1. Cargar desde LocalStorage fallback inmediato
      const savedRes = localStorage.getItem('aulacore-pae-resources');
      const savedPri = localStorage.getItem('aulacore-pae-prioritizations');
      const savedDiag = localStorage.getItem('aulacore-pae-diagnostics');
      const savedOp = localStorage.getItem('aulacore-pae-operators');
      const savedTeam = localStorage.getItem('aulacore-pae-team');
      const savedMenus = localStorage.getItem('aulacore-pae-menus');
      const savedBen = localStorage.getItem('aulacore-pae-beneficiaries');
      const savedPur = localStorage.getItem('aulacore-pae-purchases');
      const savedInc = localStorage.getItem('aulacore-pae-incidents');
      const savedSpqrs = localStorage.getItem('aulacore-pae-spqrs');
      const savedComm = localStorage.getItem('aulacore-pae-committees');
      const savedMesas = localStorage.getItem('aulacore-pae-mesas');
      const savedPlans = localStorage.getItem('aulacore-pae-plans');
      const savedDel = localStorage.getItem('aulacore-pae-deliveries');
      const savedAtt = localStorage.getItem('aulacore-pae-attendance');
      const savedCtrl = localStorage.getItem('aulacore-pae-controls');

      if (savedRes) setResources(JSON.parse(savedRes));
      if (savedPri) setPrioritizations(JSON.parse(savedPri));
      if (savedDiag) setDiagnostics(JSON.parse(savedDiag));
      if (savedOp) setOperators(JSON.parse(savedOp));
      if (savedTeam) setTeam(JSON.parse(savedTeam));
      if (savedMenus) setMenus(JSON.parse(savedMenus));
      if (savedBen) setBeneficiaries(JSON.parse(savedBen));
      if (savedPur) setLocalPurchases(JSON.parse(savedPur));
      if (savedInc) setIncidents(JSON.parse(savedInc));
      if (savedSpqrs) setSpqrs(JSON.parse(savedSpqrs));
      if (savedComm) setCommitteeMeetings(JSON.parse(savedComm));
      if (savedMesas) setMesas(JSON.parse(savedMesas));
      if (savedPlans) setPlans(JSON.parse(savedPlans));
      if (savedDel) setDailyDeliveries(JSON.parse(savedDel));
      if (savedAtt) setDailyAttendance(JSON.parse(savedAtt));
      if (savedCtrl) setControls(JSON.parse(savedCtrl));

      try {
        setLoading(true);

        const withTimeout = <T,>(promise: PromiseLike<T>, ms = 2000): Promise<T> => {
          return Promise.race([
            Promise.resolve(promise),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Supabase query timed out')), ms)
            )
          ]);
        };

        // Cargar estudiantes del sistema educativo de forma real
        const studentsQuery = withTimeout(
          supabase.from('students').select(`
            id,
            enrollment_number,
            profiles (
              first_name,
              last_name
            )
          `)
        );

        const [studentsRes] = await Promise.all([studentsQuery]) as [any];

        if (studentsRes.data) {
          const formattedStudents = studentsRes.data.map((s: any) => ({
            id: s.id,
            enrollment_number: s.enrollment_number,
            first_name: s.profiles?.first_name || '',
            last_name: s.profiles?.last_name || ''
          }));
          setStudents(formattedStudents);
        }

        // Consultas PAE de la base de datos remota
        const [
          resDb, priDb, diagDb, opDb, teamDb, menuDb, benDb, purDb, incDb, spqrDb, commDb, mesasDb, plansDb, delDb, attDb, ctrlDb
        ] = await Promise.all([
          withTimeout(supabase.from('pae_financial_resources').select('*')),
          withTimeout(supabase.from('pae_prioritization').select('*')),
          withTimeout(supabase.from('pae_infrastructure_diagnostic').select('*')),
          withTimeout(supabase.from('pae_operators').select('*')),
          withTimeout(supabase.from('pae_team').select('*')),
          withTimeout(supabase.from('pae_menu_cycles').select('*')),
          withTimeout(supabase.from('pae_beneficiaries').select('*')),
          withTimeout(supabase.from('pae_local_purchases').select('*')),
          withTimeout(supabase.from('pae_incidents').select('*')),
          withTimeout(supabase.from('pae_spqr').select('*')),
          withTimeout(supabase.from('pae_committees').select('*')),
          withTimeout(supabase.from('pae_mesas_publicas').select('*')),
          withTimeout(supabase.from('pae_improvement_plans').select('*')),
          withTimeout(supabase.from('pae_daily_deliveries').select('*')),
          withTimeout(supabase.from('pae_daily_attendance').select('*')),
          withTimeout(supabase.from('pae_controls').select('*'))
        ]) as any[];

        if (resDb.data && resDb.data.length > 0) {
          setResources(resDb.data);
          localStorage.setItem('aulacore-pae-resources', JSON.stringify(resDb.data));
        }
        if (priDb.data && priDb.data.length > 0) {
          setPrioritizations(priDb.data);
          localStorage.setItem('aulacore-pae-prioritizations', JSON.stringify(priDb.data));
        }
        if (diagDb.data && diagDb.data.length > 0) {
          setDiagnostics(diagDb.data);
          localStorage.setItem('aulacore-pae-diagnostics', JSON.stringify(diagDb.data));
        }
        if (opDb.data && opDb.data.length > 0) {
          setOperators(opDb.data);
          localStorage.setItem('aulacore-pae-operators', JSON.stringify(opDb.data));
        }
        if (teamDb.data && teamDb.data.length > 0) {
          setTeam(teamDb.data);
          localStorage.setItem('aulacore-pae-team', JSON.stringify(teamDb.data));
        }
        if (menuDb.data && menuDb.data.length > 0) {
          setMenus(menuDb.data);
          localStorage.setItem('aulacore-pae-menus', JSON.stringify(menuDb.data));
        }
        if (benDb.data && benDb.data.length > 0) {
          setBeneficiaries(benDb.data);
          localStorage.setItem('aulacore-pae-beneficiaries', JSON.stringify(benDb.data));
        }
        if (purDb.data && purDb.data.length > 0) {
          setLocalPurchases(purDb.data);
          localStorage.setItem('aulacore-pae-purchases', JSON.stringify(purDb.data));
        }
        if (incDb.data && incDb.data.length > 0) {
          setIncidents(incDb.data);
          localStorage.setItem('aulacore-pae-incidents', JSON.stringify(incDb.data));
        }
        if (spqrDb.data && spqrDb.data.length > 0) {
          setSpqrs(spqrDb.data);
          localStorage.setItem('aulacore-pae-spqrs', JSON.stringify(spqrDb.data));
        }
        if (commDb.data && commDb.data.length > 0) {
          setCommitteeMeetings(commDb.data);
          localStorage.setItem('aulacore-pae-committees', JSON.stringify(commDb.data));
        }
        if (mesasDb.data && mesasDb.data.length > 0) {
          setMesas(mesasDb.data);
          localStorage.setItem('aulacore-pae-mesas', JSON.stringify(mesasDb.data));
        }
        if (plansDb.data && plansDb.data.length > 0) {
          setPlans(plansDb.data);
          localStorage.setItem('aulacore-pae-plans', JSON.stringify(plansDb.data));
        }
        if (delDb.data && delDb.data.length > 0) {
          setDailyDeliveries(delDb.data);
          localStorage.setItem('aulacore-pae-deliveries', JSON.stringify(delDb.data));
        }
        if (attDb.data && attDb.data.length > 0) {
          setDailyAttendance(attDb.data);
          localStorage.setItem('aulacore-pae-attendance', JSON.stringify(attDb.data));
        }
        if (ctrlDb.data && ctrlDb.data.length > 0) {
          setControls(ctrlDb.data);
          localStorage.setItem('aulacore-pae-controls', JSON.stringify(ctrlDb.data));
        }

      } catch (err) {
        console.warn('Supabase PAE fetch failed or timed out. Serving local cache.', err);
      } finally {
        setLoading(false);
      }
    }

    loadPaeData();
  }, [mounted, userRole]);

  // --- SAVE HANDLERS (SUPABASE WRITES WITH LOCALSTORAGE MIRROR) ---
  const handleSaveResources = async (updatedData: any[]) => {
    setResources(updatedData);
    localStorage.setItem('aulacore-pae-resources', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_financial_resources').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(r => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        source_name: r.source_name,
        allocated_value: r.allocated_value,
        allocation_date: r.allocation_date,
        support_document: r.support_document,
        pdf_url: r.pdf_url
      }));
      await supabase.from('pae_financial_resources').insert(payload);
    } catch (e) {}
  };

  const handleSavePrioritizations = async (updatedData: any[]) => {
    setPrioritizations(updatedData);
    localStorage.setItem('aulacore-pae-prioritizations', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_prioritization').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(p => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        school_sede: p.school_sede,
        school_shift: p.school_shift,
        projected_beneficiaries: p.projected_beneficiaries,
        assigned_slots: p.assigned_slots
      }));
      await supabase.from('pae_prioritization').insert(payload);
    } catch (e) {}
  };

  const handleSaveDiagnostics = async (updatedData: any[]) => {
    setDiagnostics(updatedData);
    localStorage.setItem('aulacore-pae-diagnostics', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_infrastructure_diagnostic').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(d => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        school_sede: d.school_sede,
        dining_room_status: d.dining_room_status,
        kitchen_status: d.kitchen_status,
        pantry_status: d.pantry_status,
        utensils_status: d.utensils_status,
        equipment_status: d.equipment_status,
        observaciones: d.observaciones,
        photos: d.photos
      }));
      await supabase.from('pae_infrastructure_diagnostic').insert(payload);
    } catch (e) {}
  };

  const handleSaveOperators = async (updatedData: any[]) => {
    setOperators(updatedData);
    localStorage.setItem('aulacore-pae-operators', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_operators').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(o => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
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
      await supabase.from('pae_operators').insert(payload);
    } catch (e) {}
  };

  const handleSaveTeam = async (updatedData: any[]) => {
    setTeam(updatedData);
    localStorage.setItem('aulacore-pae-team', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_team').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(t => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        member_name: t.member_name,
        role_title: t.role_title,
        document_number: t.document_number,
        email: t.email,
        phone: t.phone
      }));
      await supabase.from('pae_team').insert(payload);
    } catch (e) {}
  };

  const handleSaveMenus = async (updatedData: any[]) => {
    setMenus(updatedData);
    localStorage.setItem('aulacore-pae-menus', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_menu_cycles').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(m => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        week_number: m.week_number,
        menu_details: m.menu_details,
        minuta_pdf_url: m.minuta_pdf_url,
        nutrition_analysis_url: m.nutrition_analysis_url,
        preparation_guides_url: m.preparation_guides_url
      }));
      await supabase.from('pae_menu_cycles').insert(payload);
    } catch (e) {}
  };

  const handleSaveBeneficiaries = async (updatedData: any[]) => {
    setBeneficiaries(updatedData);
    localStorage.setItem('aulacore-pae-beneficiaries', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_beneficiaries').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(b => ({
        student_id: b.student_id,
        institution_id: '11111111-1111-1111-1111-111111111111',
        is_beneficiary: b.is_beneficiary,
        entry_date: b.entry_date,
        exit_date: b.exit_date,
        modality: b.modality,
        prioritization_reason: b.prioritization_reason,
        classifications: b.classifications
      }));
      await supabase.from('pae_beneficiaries').insert(payload);
    } catch (e) {}
  };

  const handleSaveLocalPurchases = async (updatedData: any[]) => {
    setLocalPurchases(updatedData);
    localStorage.setItem('aulacore-pae-purchases', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_local_purchases').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(p => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        supplier_name: p.supplier_name,
        municipality: p.municipality,
        product_name: p.product_name,
        purchase_value: p.purchase_value,
        purchase_date: p.purchase_date,
        invoice_pdf: p.invoice_pdf
      }));
      await supabase.from('pae_local_purchases').insert(payload);
    } catch (e) {}
  };

  const handleSaveIncidents = async (updatedData: any[]) => {
    setIncidents(updatedData);
    localStorage.setItem('aulacore-pae-incidents', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_incidents').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(i => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        incident_type: i.incident_type,
        title: i.title,
        description: i.description,
        incident_date: i.incident_date,
        affected_count: i.affected_count || 0,
        symptoms: i.symptoms || null,
        medical_attention: i.medical_attention || false,
        status: i.status
      }));
      await supabase.from('pae_incidents').insert(payload);
    } catch (e) {}
  };

  const handleSaveSpqrs = async (updatedData: any[]) => {
    setSpqrs(updatedData);
    localStorage.setItem('aulacore-pae-spqrs', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_spqr').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(s => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        spqr_type: s.spqr_type,
        requester_name: s.requester_name,
        description: s.description,
        spqr_date: s.spqr_date,
        status: s.status,
        response_text: s.response_text,
        response_date: s.response_date
      }));
      await supabase.from('pae_spqr').insert(payload);
    } catch (e) {}
  };

  const handleSaveCommitteeMeetings = async (updatedData: any[]) => {
    setCommitteeMeetings(updatedData);
    localStorage.setItem('aulacore-pae-committees', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_committees').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(c => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
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
      await supabase.from('pae_committees').insert(payload);
    } catch (e) {}
  };

  const handleSaveMesas = async (updatedData: any[]) => {
    setMesas(updatedData);
    localStorage.setItem('aulacore-pae-mesas', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_mesas_publicas').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(m => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        vigencia_year: m.vigencia_year,
        mesa_number: m.mesa_number,
        meeting_date: m.meeting_date,
        attendees_count: m.attendees_count,
        compromisos: m.compromisos,
        acta_pdf_url: m.acta_pdf_url
      }));
      await supabase.from('pae_mesas_publicas').insert(payload);
    } catch (e) {}
  };

  const handleSaveDeliveries = async (updatedData: any[]) => {
    setDailyDeliveries(updatedData);
    localStorage.setItem('aulacore-pae-deliveries', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_daily_deliveries').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(d => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
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
      await supabase.from('pae_daily_deliveries').insert(payload);
    } catch (e) {}
  };

  const handleSaveAttendance = async (updatedData: any[]) => {
    setDailyAttendance(updatedData);
    localStorage.setItem('aulacore-pae-attendance', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_daily_attendance').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(a => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        student_id: a.student_id,
        attendance_date: a.attendance_date,
        consumed: a.consumed
      }));
      await supabase.from('pae_daily_attendance').insert(payload);
    } catch (e) {}
  };

  const handleSaveControls = async (updatedData: any[]) => {
    setControls(updatedData);
    localStorage.setItem('aulacore-pae-controls', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_controls').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(c => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        control_type: c.control_type,
        control_date: c.control_date,
        inspector_name: c.inspector_name,
        score_percentage: c.score_percentage,
        findings: c.findings,
        action_plan: c.action_plan
      }));
      await supabase.from('pae_controls').insert(payload);
    } catch (e) {}
  };

  const handleSavePlans = async (updatedData: any[]) => {
    setPlans(updatedData);
    localStorage.setItem('aulacore-pae-plans', JSON.stringify(updatedData));
    try {
      await supabase.from('pae_improvement_plans').delete().eq('institution_id', '11111111-1111-1111-1111-111111111111');
      const payload = updatedData.map(p => ({
        institution_id: '11111111-1111-1111-1111-111111111111',
        finding: p.finding,
        corrective_action: p.corrective_action,
        responsible_name: p.responsible_name,
        due_date: p.due_date,
        status: p.status,
        completion_percentage: p.completion_percentage
      }));
      await supabase.from('pae_improvement_plans').insert(payload);
    } catch (e) {}
  };

  if (!mounted || !userRole) return null;

  // Acceso denegado a estudiantes y padres
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
              No tienes permisos administrativos para consultar el panel del Programa de Alimentación Escolar (PAE).
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
    { id: 'dashboard', label: 'Dashboard PAE' },
    { id: 'planeacion', label: 'Planeación' },
    { id: 'beneficiarios', label: 'Beneficiarios' },
    { id: 'ejecucion', label: 'Ejecución' },
    { id: 'seguimiento', label: 'Seguimiento' },
    { id: 'incidencias', label: 'Incidencias e SPQR' },
    { id: 'comites', label: 'Comités y CAE' },
    { id: 'informes', label: 'Informes' }
  ] as const;

  const totalLocalPurchasesVal = localPurchases.reduce((acc, curr) => acc + curr.purchase_value, 0);
  const calculatedLocalPurchasePct = parseFloat(((totalLocalPurchasesVal / 80000000) * 100).toFixed(2));
  const activeOperatorName = operators[0]?.operator_name || 'Consorcio Alimentando Futuro 2026';
  const openIncidents = incidents.filter(i => i.status !== 'Cerrado' && i.incident_type !== 'ETA');
  const activeEta = incidents.filter(i => i.incident_type === 'ETA' && i.status !== 'Cerrado');

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
            <span>Rol: {userRole.toUpperCase()}</span>
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
                userRole={userRole}
                beneficiariesCount={beneficiaries.filter(b => b.is_beneficiary).length}
                coveragePercentage={87.5}
                scheduledRations={500}
                deliveredRations={492}
                incidentsCount={openIncidents.length}
                activeOperator={activeOperatorName}
                localPurchasesPercentage={calculatedLocalPurchasePct}
                etaCount={activeEta.length}
                nextCaeDate="2026-07-15"
              />
            )}

            {activeTab === 'planeacion' && (
              <PaePlanning 
                userRole={userRole}
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
                userRole={userRole}
                students={students}
                beneficiaries={beneficiaries}
                onSaveBeneficiaries={handleSaveBeneficiaries}
              />
            )}

            {activeTab === 'ejecucion' && (
              <PaeExecution 
                userRole={userRole}
                students={students}
                beneficiaries={beneficiaries}
                deliveries={dailyDeliveries}
                onSaveDeliveries={handleSaveDeliveries}
                attendance={dailyAttendance}
                onSaveAttendance={handleSaveAttendance}
                controls={controls}
                onSaveControls={handleSaveControls}
              />
            )}

            {activeTab === 'seguimiento' && (
              <PaeTracking 
                userRole={userRole}
                localPurchases={localPurchases}
                onSavePurchases={handleSaveLocalPurchases}
                visits={controls}
                onSaveVisits={handleSaveControls}
                totalContractValue={80000000}
              />
            )}

            {activeTab === 'incidencias' && (
              <PaeIncidents 
                userRole={userRole}
                incidents={incidents}
                onSaveIncidents={handleSaveIncidents}
                spqrs={spqrs}
                onSaveSpqrs={handleSaveSpqrs}
                plans={plans}
                onSavePlans={handleSavePlans}
              />
            )}

            {activeTab === 'comites' && (
              <PaeCommittees 
                userRole={userRole}
                meetings={committeeMeetings}
                onSaveMeetings={handleSaveCommitteeMeetings}
                mesas={mesas}
                onSaveMesas={handleSaveMesas}
              />
            )}

            {activeTab === 'informes' && (
              <PaeReports 
                userRole={userRole}
              />
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
