'use client';

import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  UserMinus,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Bell,
  Info,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  BookOpen,
  UserPlus,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CircularGaugeProps {
  valueText: string;
  subValueText?: string;
  label: string;
  progressPercent: number;
  color: 'emerald' | 'rose' | 'blue';
}

function CircularGauge({
  valueText,
  subValueText,
  label,
  progressPercent,
  color
}: CircularGaugeProps) {
  const radius = 54;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const colorConfig = {
    emerald: {
      stroke: '#10b981',
      bgStroke: '#d1fae5',
      text: 'text-emerald-900',
    },
    rose: {
      stroke: '#f43f5e',
      bgStroke: '#ffe4e6',
      text: 'text-rose-900',
    },
    blue: {
      stroke: '#3b82f6',
      bgStroke: '#dbeafe',
      text: 'text-blue-900',
    }
  }[color];

  return (
    <div className="relative flex items-center justify-center w-36 h-36 shrink-0">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 136 136">
        <circle
          cx="68"
          cy="68"
          r={radius}
          stroke={colorConfig.bgStroke}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="68"
          cy="68"
          r={radius}
          stroke={colorConfig.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
          {valueText}
        </span>
        {subValueText && (
          <span className="text-[11px] font-bold text-slate-500 mt-0.5">
            {subValueText}
          </span>
        )}
        <span className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-tight">
          {label}
        </span>
      </div>
    </div>
  );
}

function MiniSparkline({ color }: { color: 'emerald' | 'rose' | 'blue' }) {
  const pathConfig = {
    emerald: {
      stroke: '#10b981',
      path: 'M2 24 C10 22, 18 20, 26 23 C34 26, 42 16, 50 18 C58 20, 66 10, 74 12 C82 14, 90 6, 98 4',
    },
    rose: {
      stroke: '#f43f5e',
      path: 'M2 8 C14 12, 26 24, 38 18 C50 12, 62 26, 74 22 C86 18, 92 24, 98 26',
    },
    blue: {
      stroke: '#3b82f6',
      path: 'M2 24 C12 22, 24 25, 36 18 C48 11, 60 19, 72 13 C84 7, 92 12, 98 6',
    }
  }[color];

  return (
    <svg viewBox="0 0 100 30" className="w-24 h-8 overflow-visible">
      <path
        d={pathConfig.path}
        fill="none"
        stroke={pathConfig.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface RectorExecutiveSummaryProps {
  roleTitle?: string;
  institutionId?: string | null;
}

export function RectorExecutiveSummary({ roleTitle = 'Rector', institutionId }: RectorExecutiveSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmin: 1,
    academicAvg: 0,
    dropoutRate: 0,
    convivenciaAvg: 0,
    activeInstitutionName: ''
  });

  useEffect(() => {
    async function loadRealStats() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let targetInstId = institutionId || user?.user_metadata?.institution_id;

        if (!targetInstId && user?.id) {
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('institution_id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (userRole?.institution_id) {
            targetInstId = userRole.institution_id;
          }
        }

        if (!targetInstId) {
          setStats({
            totalStudents: 0,
            totalTeachers: 0,
            totalAdmin: 1,
            academicAvg: 0,
            dropoutRate: 0,
            convivenciaAvg: 0,
            activeInstitutionName: ''
          });
          setLoading(false);
          return;
        }

        // Obtener nombre de la institución
        const { data: instData } = await supabase
          .from('institutions')
          .select('name')
          .eq('id', targetInstId)
          .maybeSingle();

        // 1. Contar estudiantes
        const { count: countEst } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('institution_id', targetInstId);

        // 2. Contar docentes
        const { count: countDoc } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('institution_id', targetInstId)
          .eq('role', 'docente');

        // 3. Contar personal administrativo
        const { count: countAdm } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('institution_id', targetInstId)
          .in('role', ['rector', 'secretaria', 'coordinador']);

        setStats({
          totalStudents: countEst || 0,
          totalTeachers: countDoc || 0,
          totalAdmin: countAdm || 1,
          academicAvg: 0,
          dropoutRate: 0,
          convivenciaAvg: 0,
          activeInstitutionName: instData?.name || ''
        });
      } catch (err) {
        console.error('Error cargando estadísticas reales de rectoría:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRealStats();
  }, [institutionId]);

  const isEmptyState = stats.totalStudents === 0 && stats.totalTeachers === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Cabecera Ejecutiva */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¡Buenos días, {roleTitle}! 👋
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-500 mt-1">
            Panel Ejecutivo - {stats.activeInstitutionName || 'Resumen Institucional'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* BANNER DE ASISTENTE DE CONFIGURACIÓN INICIAL SI ES COLEGIO NUEVO */}
      {isEmptyState && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-indigo-700/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Asistente de Parametrización Inicial
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ¡Bienvenido a la Configuración de tu Institución! 🚀
            </h2>
            
            <p className="text-sm text-indigo-200/90 leading-relaxed font-medium">
              Bienvenido a AulaCore. Tu institución ya fue creada. Completa la configuración inicial para comenzar a registrar docentes, estudiantes, cursos y periodos académicos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Link href="/configuracion/sedes" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-black mb-2 group-hover:scale-110 transition-transform">1</div>
                <h4 className="font-extrabold text-sm text-white">Registrar Sedes y Cursos</h4>
                <p className="text-xs text-indigo-200 mt-1">Define grados, grupos y aulas del colegio.</p>
              </Link>

              <Link href="/docentes" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 font-black mb-2 group-hover:scale-110 transition-transform">2</div>
                <h4 className="font-extrabold text-sm text-white">Vincular Docentes</h4>
                <p className="text-xs text-indigo-200 mt-1">Asigna profesores a sus materias de enseñanza.</p>
              </Link>

              <Link href="/migracion" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-300 font-black mb-2 group-hover:scale-110 transition-transform">3</div>
                <h4 className="font-extrabold text-sm text-white">Matricular Estudiantes</h4>
                <p className="text-xs text-indigo-200 mt-1">Importa el archivo SIMAT o registra manualmente.</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tarjetas Principales de Métricas (Circular Gauges) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TARJETA 1: Resultados Académicos */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Resultados Académicos
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Promedios académicos de la institución
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <CircularGauge
                valueText={stats.academicAvg > 0 ? stats.academicAvg.toFixed(2) : "0.00"}
                subValueText="de 5.00"
                label="Promedio institucional"
                progressPercent={stats.academicAvg > 0 ? (stats.academicAvg / 5) * 100 : 0}
                color="emerald"
              />

              <div className="flex flex-col items-end justify-center space-y-2 text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Estado actual
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold">
                  {stats.academicAvg > 0 ? 'Activo' : 'Sin datos calificados'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{stats.academicAvg > 0 ? 'Promedio calculado con calificaciones del periodo' : 'Requiere registro de notas por docentes'}</span>
          </div>
        </div>

        {/* TARJETA 2: Resultados de Deserción Escolar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <UserMinus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Resultados de Deserción Escolar
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Tasa de deserción calculada
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <CircularGauge
                valueText={`${stats.dropoutRate.toFixed(1)}%`}
                label="Tasa institucional"
                progressPercent={stats.dropoutRate}
                color="rose"
              />

              <div className="flex flex-col items-end justify-center space-y-2 text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Monitoreo de Riesgo
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  {stats.totalStudents === 0 ? 'Sin matrículas' : '0% Deserción'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Meta institucional: Mantener por debajo del 3%</span>
          </div>
        </div>

        {/* TARJETA 3: Resultados de Convivencia */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Resultados de Convivencia
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Índice de convivencia escolar
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <CircularGauge
                valueText={stats.convivenciaAvg > 0 ? stats.convivenciaAvg.toFixed(2) : "0.00"}
                subValueText="de 5.00"
                label="Promedio de convivencia"
                progressPercent={stats.convivenciaAvg > 0 ? (stats.convivenciaAvg / 5) * 100 : 0}
                color="blue"
              />

              <div className="flex flex-col items-end justify-center space-y-2 text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Clima escolar
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold">
                  {stats.convivenciaAvg > 0 ? 'Normal' : 'Sin anotaciones'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Basado en bitácora de convivencia de directores de grupo</span>
          </div>
        </div>

      </div>

      {/* 3. Barra Resumen Institucional */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          {/* Columna 1: Total estudiantes */}
          <div className="flex items-center gap-4 py-4 sm:py-2 px-4 first:pl-0 last:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalStudents}
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Total estudiantes
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mt-1">
                <span>Matriculados oficialmente</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Total docentes */}
          <div className="flex items-center gap-4 py-4 sm:py-2 px-4 first:pl-0 last:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalTeachers}
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Total docentes
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mt-1">
                <span>Planta docente vinculada</span>
              </div>
            </div>
          </div>

          {/* Columna 3: Total personal adm. */}
          <div className="flex items-center gap-4 py-4 sm:py-2 px-4 first:pl-0 last:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalAdmin}
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Total personal adm.
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mt-1">
                <span>Rectoría y Secretaría</span>
              </div>
            </div>
          </div>

          {/* Columna 4: Promedio académico del colegio */}
          <div className="flex items-center gap-4 py-4 sm:py-2 px-4 first:pl-0 last:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.academicAvg > 0 ? stats.academicAvg.toFixed(2) : "0.00"}
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Promedio académico del colegio
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mt-1">
                <span>Escala 1.0 a 5.0</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Datos en tiempo real consultados directamente desde la base de datos de la institución.</span>
        </div>
      </div>
    </div>
  );
}
