'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/territorio/KpiCard';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { TerritoryFilters, FilterOption } from '@/components/territorio/TerritoryFilters';
import { getTerritorialKpis, TerritorialKpis } from '@/services/territory-service';
import { 
  Building, Users, Award, ShieldAlert, 
  CheckCircle2, Laptop, Calendar, AlertTriangle,
  ArrowRight, Megaphone, PlusCircle, FileText, Sparkles, UserCheck, Settings, Users2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';

// --- MOCK DATA PARA FILTROS ---
const MOCK_COMUNAS: FilterOption[] = [
  { value: 'all', label: 'Todas las Jurisdicciones' },
  { value: 'c1', label: 'Zona Norte - Comunas 1 a 4' },
  { value: 'c2', label: 'Zona Centro - Comunas 5 a 10' },
  { value: 'c3', label: 'Zona Sur - Comunas 11 a 16' },
  { value: 'rural', label: 'Zona Rural - Corregimientos' },
];

const MOCK_TYPES: FilterOption[] = [
  { value: 'all', label: 'Todos los tipos de inquilino' },
  { value: 'school_public', label: 'I.E. Oficiales (Públicas)' },
  { value: 'school_private', label: 'Colegios Privados' },
  { value: 'secretaria', label: 'Secretarías & Entidades' },
];

const MOCK_JORNADAS: FilterOption[] = [
  { value: 'all', label: 'Todas las jornadas' },
  { value: 'unica', label: 'Jornada Única' },
  { value: 'regular', label: 'Jornadas Mañana / Tarde' },
];

// --- MOCK DATA DE GRÁFICOS ---
const COBERTURA_HISTORICA = [
  { name: '2022', matricula: 29800, cupos: 32000 },
  { name: '2023', matricula: 31200, cupos: 33500 },
  { name: '2024', matricula: 32900, cupos: 35000 },
  { name: '2025', matricula: 33800, cupos: 35500 },
  { name: '2026', matricula: 34250, cupos: 36000 },
];

export default function TerritoryDashboardPage() {
  // Filtros
  const [comuna, setComuna] = useState('all');
  const [type, setType] = useState('all');
  const [jornada, setJornada] = useState('all');

  // Supabase KPIs State
  const [kpis, setKpis] = useState<TerritorialKpis | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado Novedades local
  const [novedades, setNovedades] = useState([
    { id: 1, text: 'I.E. Marco Fidel Suárez completó el 100% de la matrícula del periodo.', type: 'success', date: 'Hace 10 min' },
    { id: 2, text: 'Nueva circular oficial emitida sobre auditorías técnicas del PAE.', type: 'info', date: 'Hace 1 hora' },
    { id: 3, text: 'Se reporta caída de conectividad en el aula informática de I.E. Hatillo.', type: 'warning', date: 'Hace 3 horas' },
  ]);

  // Carga de datos reales de Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getTerritorialKpis();
      setKpis(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleResetFilters = () => {
    setComuna('all');
    setType('all');
    setJornada('all');
  };

  const handleDismissNovedad = (id: number) => {
    setNovedades(prev => prev.filter(n => n.id !== id));
  };

  // Mapear distribución del gráfico de torta en base al total real
  const totalSchools = kpis?.totalSchools || 0;
  const DISTRIBUCION_SECTOR = [
    { name: 'Oficial Urbano', value: Math.round(totalSchools * 0.5), color: '#6366f1' },
    { name: 'Oficial Rural', value: Math.round(totalSchools * 0.25), color: '#3b82f6' },
    { name: 'Privado Urbano', value: Math.round(totalSchools * 0.20), color: '#10b981' },
    { name: 'Privado Cobertura', value: totalSchools - Math.round(totalSchools * 0.95), color: '#f59e0b' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
            Resumen Ejecutivo Territorial
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Analítica unificada de cobertura, calidad y madurez operativa escolar.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-1.5 shrink-0">
          <Calendar className="w-4 h-4 text-indigo-650" />
          <span className="text-[10px] font-black uppercase text-indigo-700">
            Periodo Escolar: 2026 Activo
          </span>
        </div>
      </div>

      {/* Barra de Filtros Territoriales */}
      <TerritoryFilters
        comunas={MOCK_COMUNAS}
        types={MOCK_TYPES}
        jornadas={MOCK_JORNADAS}
        selectedComuna={comuna}
        selectedType={type}
        selectedJornada={jornada}
        onComunaChange={setComuna}
        onTypeChange={setType}
        onJornadaChange={setJornada}
        onResetFilters={handleResetFilters}
      />

      {/* Fila 1 de KPIs de Primer Nivel - Estructura y Cobertura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total de Instituciones"
          value={loading ? '...' : String(kpis?.totalSchools || 0)}
          description="Colegios registrados"
          trend={{ value: 0, isPositive: true, label: 'real' }}
          icon={Building}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Sedes Educativas"
          value={kpis?.totalCampuses || 'Pendiente'}
          description="Sedes físicas del territorio"
          icon={Settings}
          iconColorClass="text-slate-550"
          iconBgClass="bg-slate-50"
        />
        <KpiCard
          title="Estudiantes Activos"
          value={loading ? '...' : (kpis?.totalStudents || 0).toLocaleString()}
          description="Fichas de alumnos activas"
          trend={{ value: 0, isPositive: true, label: 'real' }}
          icon={Users}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Matrícula Consolidada"
          value={loading ? '...' : (kpis?.consolidatedEnrollment || 0).toLocaleString()}
          description="Alumnos en cursos vigentes"
          trend={{ value: 0, isPositive: true, label: 'real' }}
          icon={UserCheck}
          iconColorClass="text-emerald-650"
          iconBgClass="bg-emerald-50"
        />
      </div>

      {/* Fila 2 de KPIs de Primer Nivel - Personal y Transformación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Docentes Registrados"
          value={loading ? '...' : String(kpis?.totalTeachers || 0)}
          description="Cuentas docentes activas"
          icon={Users2}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Directivos Docentes"
          value={loading ? '...' : String(kpis?.totalDirectives || 0)}
          description="Rectores y coordinadores"
          icon={Award}
          iconColorClass="text-emerald-650"
          iconBgClass="bg-emerald-50"
        />
        <KpiCard
          title="Personal Administrativo"
          value={loading ? '...' : String(kpis?.totalAdministratives || 0)}
          description="Secretarias vinculadas"
          icon={FileText}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Madurez Digital General"
          value={loading ? '...' : `${kpis?.healthScore}%`}
          description="Health Score (Provisional)"
          trend={{ value: 0, isPositive: true, label: 'módulos' }}
          icon={Laptop}
          iconColorClass="text-purple-650"
          iconBgClass="bg-purple-50"
        />
      </div>

      {/* ACCESOS RÁPIDOS GUBERNAMENTALES */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">
          Accesos Rápidos Administrativos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/territorio/comunicaciones" className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Emitir Circular Oficial</span>
                <span className="text-[10px] font-semibold text-slate-455 block">Decretos y circulares en lote</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-650 group-hover:translate-x-1 transition-all duration-200" />
          </Link>

          <Link href="/territorio/agenda" className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center">
                <PlusCircle className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Programar Visita Técnica</span>
                <span className="text-[10px] font-semibold text-slate-455 block">Inspección de sedes y PAE</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-650 group-hover:translate-x-1 transition-all duration-200" />
          </Link>

          <Link href="/territorio/reportes" className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Descargar Reporte Mensual</span>
                <span className="text-[10px] font-semibold text-slate-455 block">Estadísticas Consolidadas PDF</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-650 group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        </div>
      </div>

      {/* Fila de Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Cobertura Histórica */}
        <ChartCard
          title="Evolución de Matrícula y Capacidad"
          description="Comparativo de cupos ofertados vs. estudiantes matriculados."
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COBERTURA_HISTORICA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMatricula" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCupos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Legend style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="matricula" name="Matriculados" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMatricula)" />
                <Area type="monotone" dataKey="cupos" name="Cupos Ofertados" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorCupos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Gráfico 2: Distribución por Naturaleza y Sector */}
        <ChartCard
          title="Tipología de Colegios"
          description="Distribución de instituciones por zona y sector."
        >
          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DISTRIBUCION_SECTOR}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DISTRIBUCION_SECTOR.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{loading ? '...' : totalSchools}</span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Planteles</span>
              </div>
            </div>
            
            {/* Leyenda Personalizada */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
              {DISTRIBUCION_SECTOR.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* PANALES DE RECOMENDACIÓN IA Y NOVEDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IA Predictiva e Insights */}
        <SummaryCard 
          title="Insights Predictivos (Motor IA de Alertas Tempranas)"
          className="lg:col-span-2"
          headerActions={
            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              IA Activa
            </span>
          }
        >
          <div className="space-y-4">
            <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-xl flex gap-3 text-indigo-850 items-start">
              <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block">Recomendación IA: Refuerzo Académico</span>
                <p className="font-semibold text-slate-650 mt-1">
                  Se detecta un desfase promedio de 12% en el área de matemáticas en la Zona Norte. El motor IA recomienda asignar un plan de acompañamiento curricular en mallas antes de finalizar el trimestre académico.
                </p>
              </div>
            </div>

            <div className="bg-rose-50/40 border border-rose-200 p-4 rounded-xl flex gap-3 text-rose-800 items-start">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block">Riesgo de Deserción por Desplazamiento</span>
                <p className="font-semibold text-rose-700 mt-1">
                  Alertas predictivas detectan riesgo medio en 3 comunas por ausentismo recurrente superior al 15% acumulado. Sugerencia: Programar visitas de auditoría en la agenda territorial.
                </p>
              </div>
            </div>
          </div>
        </SummaryCard>

        {/* Novedades y logs */}
        <SummaryCard title="Novedades y Monitoreo del Día">
          <div className="space-y-3">
            {/* Widget de Usuarios Activos consolidado */}
            <div className="p-3 border border-indigo-100 bg-indigo-50/10 rounded-xl flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-650 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Usuarios Registrados en Plataforma:</span>
              </div>
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                {loading ? '...' : kpis?.activeUsers}
              </span>
            </div>

            {novedades.map(nov => (
              <div key={nov.id} className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between items-start gap-2 shadow-xs group">
                <div className="text-left min-w-0">
                  <span className="text-[10px] text-slate-450 font-bold block">{nov.date}</span>
                  <p className="text-xs font-semibold text-slate-700 mt-1 leading-normal">
                    {nov.text}
                  </p>
                </div>
                <button 
                  onClick={() => handleDismissNovedad(nov.id)}
                  className="text-slate-400 hover:text-slate-700 text-[10px] font-black cursor-pointer px-1.5"
                  title="Descartar novedad"
                >
                  ×
                </button>
              </div>
            ))}
            {novedades.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-450 italic font-semibold">
                No hay novedades pendientes.
              </div>
            )}
          </div>
        </SummaryCard>
      </div>
    </div>
  );
}
