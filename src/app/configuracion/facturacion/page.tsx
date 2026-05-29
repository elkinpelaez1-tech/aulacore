'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Activity, Percent, Users, Search, Plus, X, 
  ChevronRight, RefreshCw, AlertTriangle, CheckCircle, 
  MapPin, Clock, Calendar, Check, Info, ShieldAlert,
  Smartphone, Eye, Power, FileText, Landmark, MessageSquare, Sparkles, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

// TYPES & INTERFACES
interface PaymentLedger {
  studentName: string;
  course: string;
  amount: number;
  date: string;
  method: 'PSE' | 'Stripe' | 'Tarjeta de Crédito' | 'Convenio Bancario';
  status: 'Aprobado' | 'Pendiente';
}

interface BillingConcept {
  id: string;
  name: string;
  category: 'Pensión' | 'Servicios' | 'Trámites' | 'Otros';
  value: number;
  periodicity: 'Mensual' | 'Anual' | 'Único' | 'Por Trámite';
  status: 'Activo' | 'Pausado' | 'Vencido';
  linkedStudentsCount: number;
  collectedAmount: number;
  goalAmount: number;
  icon: string;
  description: string;
  moraAmount: number;
  scholarshipAmount: number;
  paymentMethods: string[];
  recentPayments: PaymentLedger[];
}

// INITIAL HIGH FIDELITY SEED DATA
const SEED_BILLING_CONCEPTS: BillingConcept[] = [
  {
    id: 'bill-1',
    name: 'Pensión Mensual Estándar',
    category: 'Pensión',
    value: 450000,
    periodicity: 'Mensual',
    status: 'Activo',
    linkedStudentsCount: 110,
    collectedAmount: 42500000,
    goalAmount: 50000000,
    icon: '🎒',
    description: 'Cobro mensual estándar por concepto de matrícula escolar y enseñanza académica reglamentaria.',
    moraAmount: 5000000,
    scholarshipAmount: 2500000,
    paymentMethods: ['PSE', 'Stripe', 'Tarjeta de Crédito'],
    recentPayments: [
      { studentName: 'Juan Pablo Montoya', course: '11-B', amount: 450000, date: 'Hoy, 09:15 AM', method: 'PSE', status: 'Aprobado' },
      { studentName: 'Valentina Restrepo', course: '10-A', amount: 450000, date: 'Ayer, 03:40 PM', method: 'Stripe', status: 'Aprobado' },
      { studentName: 'Juan Diego Castro', course: '11-A', amount: 450000, date: 'Hace 2 días', method: 'Convenio Bancario', status: 'Aprobado' }
    ]
  },
  {
    id: 'bill-2',
    name: 'Ruta & Transporte Escolar',
    category: 'Servicios',
    value: 180000,
    periodicity: 'Mensual',
    status: 'Activo',
    linkedStudentsCount: 80,
    collectedAmount: 12240000,
    goalAmount: 14400000,
    icon: '🚌',
    description: 'Servicio de rutas y transporte escolar institucional puerta a puerta administrado por AulaCore.',
    moraAmount: 1800000,
    scholarshipAmount: 360000,
    paymentMethods: ['PSE', 'Convenio Bancario'],
    recentPayments: [
      { studentName: 'Andrés Felipe Arias', course: '8-A', amount: 180000, date: 'Ayer, 10:15 AM', method: 'PSE', status: 'Aprobado' },
      { studentName: 'Camila Tobón', course: '9-B', amount: 180000, date: 'Hace 3 días', method: 'Convenio Bancario', status: 'Aprobado' }
    ]
  },
  {
    id: 'bill-3',
    name: 'Restaurante & Comedor Diario',
    category: 'Servicios',
    value: 250000,
    periodicity: 'Mensual',
    status: 'Activo',
    linkedStudentsCount: 75,
    collectedAmount: 15000000,
    goalAmount: 18750000,
    icon: '🍽️',
    description: 'Servicio nutricional escolar de almuerzo y refrigerio diario balanceado, auditado en portería.',
    moraAmount: 2500000,
    scholarshipAmount: 1250000,
    paymentMethods: ['PSE', 'Tarjeta de Crédito'],
    recentPayments: [
      { studentName: 'Salomé Rodríguez', course: '7-B', amount: 250000, date: 'Hoy, 11:30 AM', method: 'Tarjeta de Crédito', status: 'Aprobado' },
      { studentName: 'Samuel Beltrán', course: '6-A', amount: 250000, date: 'Ayer, 08:20 AM', method: 'PSE', status: 'Aprobado' }
    ]
  },
  {
    id: 'bill-4',
    name: 'Derechos de Grado Once',
    category: 'Otros',
    value: 220000,
    periodicity: 'Anual',
    status: 'Vencido',
    linkedStudentsCount: 60,
    collectedAmount: 13200000,
    goalAmount: 13200000,
    icon: '🎓',
    description: 'Derechos de grado oficiales, papelería diplomática, ceremonias e investiduras académicas.',
    moraAmount: 0,
    scholarshipAmount: 0,
    paymentMethods: ['PSE', 'Convenio Bancario'],
    recentPayments: [
      { studentName: 'Mateo Hoyos', course: '11-B', amount: 220000, date: 'Hace 1 semana', method: 'Convenio Bancario', status: 'Aprobado' },
      { studentName: 'Manuela Alzate', course: '11-A', amount: 220000, date: 'Hace 1 semana', method: 'PSE', status: 'Aprobado' }
    ]
  },
  {
    id: 'bill-5',
    name: 'Certificados & Constancias',
    category: 'Trámites',
    value: 15000,
    periodicity: 'Por Trámite',
    status: 'Activo',
    linkedStudentsCount: 30,
    collectedAmount: 360000,
    goalAmount: 450000,
    icon: '📄',
    description: 'Expedición digital y física de boletines, notas históricas, actas parciales y constancias de estudio.',
    moraAmount: 30000,
    scholarshipAmount: 60000,
    paymentMethods: ['PSE', 'Stripe'],
    recentPayments: [
      { studentName: 'David Ospina', course: '10-B', amount: 15000, date: 'Ayer, 04:10 PM', method: 'PSE', status: 'Aprobado' }
    ]
  },
  {
    id: 'bill-6',
    name: 'Reposición Manilla/Tag RFID',
    category: 'Trámites',
    value: 25000,
    periodicity: 'Por Trámite',
    status: 'Activo',
    linkedStudentsCount: 12,
    collectedAmount: 225000,
    goalAmount: 300000,
    icon: '🔑',
    description: 'Reposición física de chip RFID de seguridad en portería escolar debido a pérdida, hurto o daño provocado.',
    moraAmount: 50000,
    scholarshipAmount: 25000,
    paymentMethods: ['PSE', 'Stripe'],
    recentPayments: [
      { studentName: 'Juan Pablo Montoya', course: '11-B', amount: 25000, date: 'Hoy, 08:30 AM', method: 'Stripe', status: 'Aprobado' }
    ]
  },
  {
    id: 'bill-7',
    name: 'Salida de Campo: Planetario',
    category: 'Otros',
    value: 65000,
    periodicity: 'Único',
    status: 'Pausado',
    linkedStudentsCount: 90,
    collectedAmount: 4550000,
    goalAmount: 5850000,
    icon: '🔭',
    description: 'Salida pedagógica guiada al Planetario Distrital y Jardín Botánico, transporte y refrigerio incluidos.',
    moraAmount: 975000,
    scholarshipAmount: 325000,
    paymentMethods: ['PSE', 'Convenio Bancario'],
    recentPayments: [
      { studentName: 'Sofía Valderrama', course: '8-B', amount: 65000, date: 'Hace 3 días', method: 'PSE', status: 'Aprobado' }
    ]
  }
];

export default function BillingPaymentsPage() {
  const [concepts, setConcepts] = useState<BillingConcept[]>(SEED_BILLING_CONCEPTS);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

  // New Concept modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<BillingConcept['category']>('Pensión');
  const [newValue, setNewValue] = useState(200000);
  const [newPeriod, setNewPeriod] = useState<BillingConcept['periodicity']>('Mensual');
  const [newDesc, setNewDesc] = useState('');
  const [newStudents, setNewStudents] = useState(50);
  const [newGoal, setNewGoal] = useState(10000000);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from local storage
  useEffect(() => {
    const raw = localStorage.getItem('aulacore-facturacion-settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length > 0) setConcepts(parsed);
      } catch (e) {
        console.error('Error loading billing settings', e);
      }
    }
  }, []);

  const saveConcepts = (updatedList: BillingConcept[]) => {
    setConcepts(updatedList);
    localStorage.setItem('aulacore-facturacion-settings', JSON.stringify(updatedList));
  };

  // Toggle status inside Drawer
  const handleChangeStatus = (id: string, nextStatus: BillingConcept['status']) => {
    const updated = concepts.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: nextStatus
        };
      }
      return c;
    });
    saveConcepts(updated);
    triggerToast(`✓ Concepto de cobro actualizado a estado: ${nextStatus}`);
  };

  // Simulation Alert late payments
  const handleSendReminders = (conceptName: string) => {
    setIsAlerting(true);
    setTimeout(() => {
      setIsAlerting(false);
      triggerToast(`✓ Alertas automáticas de mora enviadas por WhatsApp/SMS a acudientes deudores de: ${conceptName}`);
    }, 1500);
  };

  // Register new custom billing concept
  const handleCreateConcept = () => {
    if (!newName || !newValue) {
      triggerToast('⚠️ Por favor completa el nombre del concepto de cobro y el valor.');
      return;
    }

    const icons: Record<BillingConcept['category'], string> = {
      'Pensión': '🎒',
      'Servicios': '🚌',
      'Trámites': '📄',
      'Otros': '🏷️'
    };

    const newC: BillingConcept = {
      id: 'bill-' + Date.now(),
      name: newName,
      category: newCategory,
      value: newValue,
      periodicity: newPeriod,
      status: 'Activo',
      linkedStudentsCount: newStudents,
      collectedAmount: 0,
      goalAmount: newGoal || (newValue * newStudents),
      icon: icons[newCategory] || '🎒',
      description: newDesc || 'Rubro de cobro institucional personalizado.',
      moraAmount: 0,
      scholarshipAmount: 0,
      paymentMethods: ['PSE', 'Convenio Bancario'],
      recentPayments: []
    };

    const updated = [newC, ...concepts];
    saveConcepts(updated);

    // reset forms
    setNewName('');
    setNewDesc('');
    setNewValue(200000);
    setNewGoal(10000000);
    setNewStudents(50);
    setModalOpen(false);
    triggerToast(`✓ Rubro ${newC.name} provisionado correctamente.`);
  };

  // Format currency COP
  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
  };

  // Selected details
  const selectedConcept = concepts.find(c => c.id === selectedConceptId) || null;

  // Filter logic
  const filteredConcepts = concepts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'TODOS' || c.category.toUpperCase() === selectedCategory;
    
    const matchesStatus = selectedStatus === 'TODOS' || c.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <DollarSign className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Clean & No Heavy KPIs) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" /> Facturación & Recaudos
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Centro Financiero de Derechos Académicos, Trámites y Pensiones</p>
        </div>

        <div>
          <button 
            onClick={() => {
              console.log('Nuevo Concepto button clicked! State modalOpen set to true');
              setModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer relative z-30"
          >
            <Plus className="w-4 h-4" /> Nuevo Concepto
          </button>
        </div>
      </div>

      {/* Search & Filter Category Chips */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Buscar por concepto o servicio financiero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        {/* Filters chips group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Categories chips */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-150 rounded-xl p-1">
            {['TODOS', 'PENSIÓN', 'SERVICIOS', 'TRÁMITES', 'OTROS'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedCategory === cat 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {cat === 'TODOS' ? 'Rubros' : cat}
              </button>
            ))}
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-150 rounded-xl p-1">
            {['TODOS', 'ACTIVO', 'PAUSADO', 'VENCIDO'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedStatus === status 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {status === 'TODOS' ? 'Estados' : status}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* BILLING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConcepts.map(concept => {
          const isActive = concept.status === 'Activo';
          const isPaused = concept.status === 'Pausado';
          const isExpired = concept.status === 'Vencido';
          
          const collectedPercent = Math.min(100, Math.round((concept.collectedAmount / concept.goalAmount) * 100));

          return (
            <div 
              key={concept.id}
              onClick={() => {
                setSelectedConceptId(concept.id);
                setDrawerOpen(true);
              }}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
            >
              
              {/* Card Header: Icon, Category, Status badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {concept.icon}
                  </div>
                  <div>
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">{concept.category}</span>
                    <h3 className="text-xs font-semibold text-slate-800 tracking-tight leading-snug group-hover:text-indigo-700 transition-colors truncate max-w-[120px]">
                      {concept.name}
                    </h3>
                  </div>
                </div>

                <span className={cn(
                  "text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border flex items-center gap-1.5",
                  isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  isPaused ? 'bg-amber-50 border-amber-100 text-amber-700' :
                  'bg-rose-50 border-rose-100 text-rose-700'
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isActive ? 'bg-emerald-500 animate-pulse' :
                    isPaused ? 'bg-amber-500' :
                    'bg-rose-500'
                  )} />
                  {concept.status}
                </span>
              </div>

              {/* Card Body: Tarifa value */}
              <div className="space-y-1">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">TARIFA / VALOR</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold text-slate-800 tracking-tight font-mono">{formatCOP(concept.value)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">/ {concept.periodicity}</span>
                </div>
                
                <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-semibold pt-1">
                  <Users className="w-3 h-3 text-slate-350 shrink-0" />
                  <span>{concept.linkedStudentsCount} Estudiantes vinculados</span>
                </div>
              </div>

              {/* Subelement: Micro-progress bar for Collection */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-wide">
                  <span>Recaudado ({collectedPercent}%)</span>
                  <span className="text-slate-650 font-semibold">{formatCOP(concept.collectedAmount)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      collectedPercent >= 90 ? 'bg-emerald-500' :
                      collectedPercent >= 50 ? 'bg-indigo-500' :
                      'bg-amber-500'
                    )} 
                    style={{ width: `${collectedPercent}%` }}
                  />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-50 pt-2.5">
                <span className="truncate max-w-[170px] text-[9.5px] font-medium text-slate-450 italic leading-none">{concept.description}</span>
                <span className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all self-end shrink-0">
                  Ver 360 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          );
        })}

        {filteredConcepts.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-700">No se encontraron conceptos financieros</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto font-medium">Ajusta los filtros o realiza otra búsqueda para localizar el concepto.</p>
          </div>
        )}
      </div>

      {/* BILLING 360 DRAWER */}
      {drawerOpen && selectedConcept && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Backdrop overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Sliding Panel */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-slate-900 text-white border-l border-slate-800 shadow-2xl transition-all duration-300">
                
                <div className="flex h-full flex-col overflow-y-scroll py-6 px-6 space-y-6">
                  
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded font-mono">
                          FINANCIAL NODE
                        </span>
                        
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                          selectedConcept.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          selectedConcept.status === 'Pausado' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        )}>
                          {selectedConcept.status}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-slate-100 tracking-tight leading-tight pt-1">
                        Centro de Control de Cartera 360
                      </h2>
                      <p className="text-xs text-slate-350 font-medium">
                        Auditoría financiera de recaudos, cobros y cartera morosa.
                      </p>
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Concept Card inside Drawer */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shrink-0">
                      {selectedConcept.icon}
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-base font-semibold text-slate-100">{selectedConcept.name}</h3>
                        <span className="text-xs font-semibold text-indigo-400 font-mono">{formatCOP(selectedConcept.value)} / {selectedConcept.periodicity}</span>
                      </div>
                      <p className="text-xs text-slate-350 font-medium leading-normal">{selectedConcept.description}</p>
                    </div>
                  </div>

                  {/* Portfolio Health HSL Bar */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-4 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Estado de Cartera & Recaudación
                    </span>

                    {/* Progress representation */}
                    <div className="space-y-2">
                      <div className="flex h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        {/* Recaudado */}
                        <div 
                          className="h-full bg-emerald-500 hover:opacity-90 transition-all cursor-pointer" 
                          style={{ width: `${Math.round((selectedConcept.collectedAmount / selectedConcept.goalAmount) * 100)}%` }}
                        />
                        {/* Mora */}
                        <div 
                          className="h-full bg-rose-500 hover:opacity-90 transition-all cursor-pointer" 
                          style={{ width: `${Math.round((selectedConcept.moraAmount / selectedConcept.goalAmount) * 100)}%` }}
                        />
                        {/* Becas */}
                        <div 
                          className="h-full bg-slate-600 hover:opacity-90 transition-all cursor-pointer" 
                          style={{ width: `${Math.round((selectedConcept.scholarshipAmount / selectedConcept.goalAmount) * 100)}%` }}
                        />
                      </div>

                      {/* Legend details */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-bold pt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                          <div>
                            <p className="text-slate-450 leading-none">RECAUDADO</p>
                            <p className="text-slate-200 mt-0.5 font-mono">{formatCOP(selectedConcept.collectedAmount)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0" />
                          <div>
                            <p className="text-slate-450 leading-none">MORA / DEUDA</p>
                            <p className="text-slate-200 mt-0.5 font-mono">{formatCOP(selectedConcept.moraAmount)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-slate-600 shrink-0" />
                          <div>
                            <p className="text-slate-450 leading-none">BECAS / ALIVIOS</p>
                            <p className="text-slate-200 mt-0.5 font-mono">{formatCOP(selectedConcept.scholarshipAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment methods & Exonerations details */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 text-xs text-slate-300">
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-medium">
                      <div className="space-y-1.5">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Canales de Pago Activos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedConcept.paymentMethods.map(m => (
                            <span key={m} className="bg-slate-900 border border-slate-800 text-[8.5px] font-bold px-2 py-0.8 rounded text-indigo-400 font-mono uppercase">{m}</span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Alivios Académicos</p>
                        <p className="text-slate-200 flex items-center gap-1.5"><Percent className="w-3.5 h-3.5 text-slate-450 shrink-0" /> Beca Excelencia Activa (10% Desc)</p>
                      </div>
                    </div>
                  </div>

                  {/* Operations Buttons / Controls */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Controles de Facturación & Cobranza
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleChangeStatus(selectedConcept.id, 'Activo')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedConcept.status === 'Activo' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-450'
                        )}
                      >
                        Activar Cobro
                      </button>

                      <button
                        onClick={() => handleChangeStatus(selectedConcept.id, 'Pausado')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedConcept.status === 'Pausado' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-450'
                        )}
                      >
                        Pausar Ciclo
                      </button>

                      <button
                        onClick={() => handleSendReminders(selectedConcept.name)}
                        disabled={isAlerting || selectedConcept.moraAmount === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isAlerting ? 'Enviando...' : 'Enviar Alertas de Mora'}
                      </button>
                    </div>
                  </div>

                  {/* Transaction logs ledger */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Historial de Recaudos Recientes</span>
                    
                    <div className="relative border-l-2 border-slate-800 pl-4 ml-2.5 space-y-4">
                      {selectedConcept.recentPayments.map((log, index) => (
                        <div key={index} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute w-2.5 h-2.5 rounded-full -left-[21.5px] top-1 bg-indigo-500 border border-slate-900" />

                          <div className="flex justify-between items-start text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-200">{log.studentName} <span className="bg-slate-800 text-slate-350 text-[8px] font-bold px-1 py-0.2 rounded font-mono uppercase ml-1">{log.course}</span></p>
                              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3 h-3 text-slate-450" /> {log.date} via {log.method}</p>
                            </div>
                            
                            <div className="text-right flex items-center gap-2">
                              <span className="font-bold text-slate-200 font-mono text-[11px]">{formatCOP(log.amount)}</span>
                              <span className="bg-emerald-500/10 text-emerald-400 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {log.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedConcept.recentPayments.length === 0 && (
                        <p className="text-xs text-slate-500 italic pl-1">No se registran marcas de pago recientes para este concepto de cobro.</p>
                      )}
                    </div>
                  </div>

                  {/* Pre-architecture connectors placeholder */}
                  <div className="bg-slate-850 border border-slate-800/80 border-dashed rounded-2xl p-4.5 space-y-3 text-xs text-slate-400">
                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-indigo-400 block border-b border-slate-800 pb-1.5">
                      Canales de Recaudo Virtual Preparados (IA/Gateways)
                    </span>
                    <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-wider">
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">PSE Botón de Pago</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Stripe Invoice DIAN</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Wompi Bancolombia</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">QR Dinámico Recaudo</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Facturación Electrónica DIAN</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Alertas de Cobro IA</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Acuerdos Automáticos</span>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-semibold leading-none">
                      AulaCore Billing engine 2026
                    </span>
                    
                    <button
                      onClick={() => {
                        const updated = concepts.filter(c => c.id !== selectedConcept.id);
                        saveConcepts(updated);
                        setDrawerOpen(false);
                        triggerToast(`✓ Concepto de cobro ${selectedConcept.name} eliminado.`);
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Remover Concepto
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Notion-style new concept creation modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Backdrop shadow */}
            <div 
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 z-0"
            />

            {/* Trick center block */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <div className="relative z-10 inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
              
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" /> Aprovisionar Rubro Financiero
                  </h3>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="text-slate-450 hover:text-slate-655 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre del Concepto de Cobro</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Salida Pedagógica: Parque Explora"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-750"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Categoría Financiera</label>
                      <select 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Pensión">🎒 Pensión Recurrente</option>
                        <option value="Servicios">🚌 Servicios Modulares</option>
                        <option value="Trámites">📄 Trámites Especiales</option>
                        <option value="Otros">🏷️ Otros Conceptos</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Tarifa / Valor (COP)</label>
                      <input 
                        type="number" 
                        placeholder="Ej. 150000"
                        value={newValue}
                        onChange={(e) => setNewValue(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono text-slate-750"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Periodicidad</label>
                      <select 
                        value={newPeriod} 
                        onChange={(e) => setNewPeriod(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Mensual">Mensual</option>
                        <option value="Anual">Anual</option>
                        <option value="Único">Único (Evento)</option>
                        <option value="Por Trámite">Por Trámite</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Estudiantes Afectados</label>
                      <input 
                        type="number" 
                        value={newStudents}
                        onChange={(e) => setNewStudents(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-750"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Meta Total de Recaudo Estimado (COP)</label>
                      <input 
                        type="number" 
                        placeholder="Dejar vacío para auto-calcular"
                        value={newGoal}
                        onChange={(e) => setNewGoal(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono text-slate-755"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Descripción Detallada del Rubro</label>
                    <textarea 
                      placeholder="Ej. Cobro por carnetización física RFID y seguro estudiantil obligatorio anual."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 min-h-[50px]"
                    />
                  </div>

                </div>

              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateConcept}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Crear Rubro
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
