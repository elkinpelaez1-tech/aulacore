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
  ArrowRight, Megaphone, PlusCircle, FileText, Sparkles, UserCheck, Settings, Users2, Cpu,
  Info, Utensils, UserMinus, GraduationCap, TrendingUp, BrainCircuit
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

// Helper: Gauge Circular Ejecutivo para Tarjetas de Dolor
function ExecutiveCircularGauge({
  value,
  progressPercent,
  label,
  sublabel,
  status,
  statusColor,
  color,
}: {
  value: number;
  progressPercent?: number;
  label: string;
  sublabel: string;
  status: string;
  statusColor: string;
  color: string;
}) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const arcCircumference = circumference * (240 / 360);
  const percentToDraw = progressPercent !== undefined ? progressPercent : value;
  const strokeDashoffset = arcCircumference - (arcCircumference * Math.min(percentToDraw, 100)) / 100;

  return (
    <div className="relative w-36 h-36 flex flex-col items-center justify-center shrink-0 mx-auto">
      <svg className="w-full h-full transform rotate-[150deg]" viewBox="0 0 120 120">
        {/* Fondo del arco */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#f1f5f9"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={`${arcCircumference} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progreso del arco */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={`${arcCircumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Texto en el centro */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 text-center pointer-events-none">
        <span className="text-2xl font-black tracking-tight leading-none" style={{ color }}>
          {label}
        </span>
        <span className="text-[10px] font-bold text-slate-500 leading-tight mt-1">
          {sublabel}
        </span>
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-white mt-1 shadow-2xs ${statusColor}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

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
      {/* --- DASHBOARD EJECUTIVO TERRITORIAL (1er Pantallazo) --- */}
      <div className="text-center space-y-1.5 pt-1 pb-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight">
          Los 3 dolores que más impactan la educación del territorio hoy
        </h1>
        <p className="text-xs font-bold text-slate-500">
          Información consolidada de {loading ? '...' : totalSchools} instituciones educativas y {loading ? '...' : (kpis?.totalStudents || 20000).toLocaleString()} estudiantes
        </p>
      </div>

      {/* LAS 3 TARJETAS DE DOLOR PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta 1: Nivel Académico */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              1
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider leading-tight">
                Nivel Académico del Municipio
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                ¿Cómo estamos forming a nuestros estudiantes?
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-2">
            <ExecutiveCircularGauge
              value={56}
              progressPercent={56}
              label="56%"
              sublabel="Nivel Académico"
              status="MEDIO"
              statusColor="text-blue-700 border-blue-200 bg-blue-50"
              color="#2563eb"
            />
            <div className="space-y-2 text-xs border-l sm:border-l sm:border-slate-100 sm:pl-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Avanzado</span>
                <span className="font-black text-emerald-600">22%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Satisfactorio</span>
                <span className="font-black text-blue-600">34%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Básico</span>
                <span className="font-black text-amber-600">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Insuficiente</span>
                <span className="font-black text-rose-600">16%</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3 flex items-start gap-2.5 text-blue-900 font-semibold text-xs leading-snug">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>Solo 56 de cada 100 estudiantes alcanzan el nivel académico esperado.</span>
          </div>
        </div>

        {/* Tarjeta 2: Deserción Escolar */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              2
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider leading-tight">
                Deserción Escolar en el Municipio
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                ¿Cuántos estudiantes están abandonando sus estudios?
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <UserMinus className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-2">
            <ExecutiveCircularGauge
              value={4.8}
              progressPercent={28}
              label="4,8%"
              sublabel="Tasa de Deserción"
              status="ALTA"
              statusColor="text-rose-700 border-rose-200 bg-rose-50"
              color="#dc2626"
            />
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-3.5 text-center flex flex-col justify-center items-center">
              <span className="text-[11px] font-bold text-slate-600 leading-tight">
                Estudiantes en riesgo de desertar
              </span>
              <span className="text-3xl font-black text-rose-600 my-1.5 tracking-tight">
                962
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                de 20.000 estudiantes
              </span>
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-3 flex items-start gap-2.5 text-rose-900 font-semibold text-xs leading-snug">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>Casi 5 de cada 100 estudiantes no continúan sus estudios. ¡Podemos actuar a tiempo!</span>
          </div>
        </div>

        {/* Tarjeta 3: Cumplimiento PAE */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              3
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider leading-tight">
                Cumplimiento Programa de Alimentación Escolar (PAE)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                ¿Estamos garantizando una alimentación oportuna y de calidad?
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-2">
            <ExecutiveCircularGauge
              value={72}
              progressPercent={72}
              label="72%"
              sublabel="Cumplimiento PAE"
              status="MEDIO"
              statusColor="text-emerald-700 border-emerald-200 bg-emerald-50"
              color="#10b981"
            />
            <div className="space-y-2.5 text-xs border-l sm:border-l sm:border-slate-100 sm:pl-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Cumple</span>
                <span className="font-black text-emerald-600">72%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">En Riesgo</span>
                <span className="font-black text-amber-500">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">No Cumple</span>
                <span className="font-black text-rose-600">10%</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3 flex items-start gap-2.5 text-emerald-900 font-semibold text-xs leading-snug">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>72 de cada 100 raciones programadas se están entregando correctamente.</span>
          </div>
        </div>
      </div>

      {/* BANDA HORIZONTAL TIPO INSIGHT IA */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-indigo-200 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-wide leading-snug">
            AulaCore convierte estos datos en decisiones oportunas para mejorar la educación del territorio.
          </span>
        </div>
        <Link 
          href="/territorio/alertas" 
          className="bg-white text-indigo-700 font-black text-xs px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 shrink-0 cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
          Ver Recomendaciones IA
          <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* LAS 5 TARJETAS RESUMEN REORGANIZADAS DEBAJO DEL DASHBOARD EJECUTIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Instituciones Educativas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Instituciones Educativas</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-850 block leading-tight">
              {loading ? '...' : String(kpis?.totalSchools || 34)}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
              8 Oficiales • 26 Privadas
            </span>
          </div>
          <Link href="/territorio/instituciones" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1 border-t border-slate-100 group">
            Ver detalle <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Estudiantes Matriculados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Estudiantes Matriculados</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-850 block leading-tight">
              {loading ? '...' : (kpis?.totalStudents || 20000).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
              9.638 Oficiales • 10.225 Privadas
            </span>
          </div>
          <Link href="/territorio/cobertura" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1 border-t border-slate-100 group">
            Ver detalle <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Docentes */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Docentes</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-850 block leading-tight">
              {loading ? '...' : (kpis?.totalTeachers || 1250).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
              Activos en plataforma
            </span>
          </div>
          <Link href="/territorio/talento-humano" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 pt-1 border-t border-slate-100 group">
            Ver detalle <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Alertas Activas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Alertas Activas</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-rose-600 block leading-tight">
              12
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
              Requieren atención
            </span>
          </div>
          <Link href="/territorio/alertas" className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 pt-1 border-t border-slate-100 group">
            Ver todas <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Indicadores Clave */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Indicadores Clave</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-850 block leading-tight">
              28
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
              En monitoreo
            </span>
          </div>
          <Link href="/territorio/analitica" className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 pt-1 border-t border-slate-100 group">
            Ver todos <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* --- CONSOLA EJECUTIVA Y SEGUIMIENTO OPERATIVO (Manteniendo contenido existente) --- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Consola Ejecutiva</span>
            <h2 className="text-base font-black uppercase tracking-wider mt-1">
              Buenos días, Dr. Alejandro Gómez
            </h2>
            <p className="text-xs text-slate-350 font-semibold mt-0.5">
              Bienvenido al ecosistema de inteligencia educativa territorial de AulaCore.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span className="text-[10px] font-black uppercase text-indigo-200">
              Periodo Escolar: 2026 Activo
            </span>
          </div>
        </div>

        {/* Resumen Operativo y Agenda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 text-xs">
          {/* Fichas de Control */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Monitoreo de Alertas del Territorio</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                <span className="text-lg font-black text-rose-450 block">2</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Alertas Críticas</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                <span className="text-lg font-black text-amber-450 block">4</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">En Seguimiento</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                <span className="text-lg font-black text-emerald-450 block">42</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Sin Novedad</span>
              </div>
            </div>
          </div>

          {/* Agenda de Actuación Diaria */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Agenda y Actuaciones Pendientes Hoy</h4>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-350">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span>1 Visita de PAE en ejecución</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>1 Circular programada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>1 Plan de Calidad abierto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span>Reunión de Rectores (2:00 PM)</span>
              </div>
            </div>
          </div>
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

      {/* Indicadores Operativos Complementarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Sedes Educativas"
          value={kpis?.totalCampuses || 'Pendiente'}
          description="Sedes físicas del territorio"
          icon={Settings}
          iconColorClass="text-slate-550"
          iconBgClass="bg-slate-50"
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
        <KpiCard
          title="Directivos y Administrativos"
          value={loading ? '...' : String((kpis?.totalDirectives || 0) + (kpis?.totalAdministratives || 0))}
          description="Rectores, coordinadores y admin"
          icon={Award}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/territorio/comunicaciones" className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-655 flex items-center justify-center">
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

          <Link href="/territorio/configuracion?tab=mio" className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-650 flex items-center justify-center">
                <Cpu className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Automatizaciones MIO</span>
                <span className="text-[10px] font-semibold text-slate-455 block">Consola y reglas del motor</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-650 group-hover:translate-x-1 transition-all duration-200" />
          </Link>

          <Link href="/territorio/reportes" className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-850 block">Descargar Reporte Mensual</span>
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
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCupos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Legend style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="matricula" name="Matriculados" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMatricula)" />
                <Area type="monotone" dataKey="cupos" name="Cupos Ofertados" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorCupos)" />
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
