'use client';

import React from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        {/* Background track */}
        <circle
          cx="68"
          cy="68"
          r={radius}
          stroke={colorConfig.bgStroke}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress arc */}
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
      fill: '#10b98120'
    },
    rose: {
      stroke: '#f43f5e',
      path: 'M2 8 C14 12, 26 24, 38 18 C50 12, 62 26, 74 22 C86 18, 92 24, 98 26',
      fill: '#f43f5e20'
    },
    blue: {
      stroke: '#3b82f6',
      path: 'M2 24 C12 22, 24 25, 36 18 C48 11, 60 19, 72 13 C84 7, 92 12, 98 6',
      fill: '#3b82f620'
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

export function RectorExecutiveSummary() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Cabecera Ejecutiva (Saludo y Fecha institucional) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¡Buenos días, Rector! 👋
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-500 mt-1">
            Panel Ejecutivo - Resumen Institucional
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Hoy, 10 de julio de 2026</span>
          </div>
          <div className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              3
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas Principales de Métricas (3 Columnas con Gauges Circulares) */}
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
                  Promedios académicos de toda la institución
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <CircularGauge
                valueText="4.25"
                subValueText="de 5.00"
                label="Promedio institucional"
                progressPercent={85}
                color="emerald"
              />

              <div className="flex flex-col items-end justify-center space-y-2 text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Comparado con el periodo anterior
                </span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-base">
                  <TrendingUp className="w-4 h-4" />
                  <span>↑ 0.18</span>
                </div>
                <MiniSparkline color="emerald" />
                <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold shadow-2xs">
                  Excelente
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>+0.18 puntos vs. periodo anterior</span>
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
                  Promedio de deserción escolar en la institución
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <CircularGauge
                valueText="2.6%"
                label="Promedio institucional"
                progressPercent={26}
                color="rose"
              />

              <div className="flex flex-col items-end justify-center space-y-2 text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Comparado con el periodo anterior
                </span>
                <div className="flex items-center gap-1.5 text-rose-600 font-black text-base">
                  <TrendingDown className="w-4 h-4" />
                  <span>↓ -0.7%</span>
                </div>
                <MiniSparkline color="rose" />
                <span className="px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-xs font-extrabold shadow-2xs">
                  En atención
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-rose-700">
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
                  Promedio de convivencia escolar en la institución
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <CircularGauge
                valueText="4.32"
                subValueText="de 5.00"
                label="Promedio institucional"
                progressPercent={86.4}
                color="blue"
              />

              <div className="flex flex-col items-end justify-center space-y-2 text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Comparado con el periodo anterior
                </span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-base">
                  <TrendingUp className="w-4 h-4" />
                  <span>↑ 0.21</span>
                </div>
                <MiniSparkline color="blue" />
                <span className="px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-extrabold shadow-2xs">
                  Muy bueno
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Ambiente escolar positivo y estable</span>
          </div>
        </div>

      </div>

      {/* 3. Barra Resumen Institucional (4 Tarjetas / Columnas en Contenedor Elegante) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          {/* Columna 1: Total estudiantes */}
          <div className="flex items-center gap-4 py-4 sm:py-2 px-4 first:pl-0 last:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                1.248
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Total estudiantes
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>2.4% vs. mes anterior</span>
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
                86
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Total docentes
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>1.2% vs. mes anterior</span>
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
                22
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Total personal adm.
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>0.5% vs. mes anterior</span>
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
                4.25
              </div>
              <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                Promedio académico del colegio
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>0.18 vs. periodo anterior</span>
              </div>
            </div>
          </div>

        </div>

        {/* Pie informativo de actualización en tiempo real */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Los datos se actualizan automáticamente en tiempo real. Última actualización: Hoy, 8:30 a. m.</span>
        </div>
      </div>
    </div>
  );
}
