'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Filter, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface TerritoryFiltersProps {
  comunas: FilterOption[];
  types: FilterOption[];
  jornadas: FilterOption[];
  selectedComuna: string;
  selectedType: string;
  selectedJornada: string;
  onComunaChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onJornadaChange: (value: string) => void;
  onResetFilters?: () => void;
}

export function TerritoryFilters({
  comunas,
  types,
  jornadas,
  selectedComuna,
  selectedType,
  selectedJornada,
  onComunaChange,
  onTypeChange,
  onJornadaChange,
  onResetFilters,
}: TerritoryFiltersProps) {
  return (
    <Card className="border-slate-200 shadow-xs rounded-2xl p-4 bg-slate-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 text-slate-700 shrink-0">
          <Filter className="w-4 h-4 text-indigo-650" />
          <span className="text-xs font-black uppercase tracking-wider">Filtros Territoriales</span>
        </div>

        {/* Dropdown Comuna / Jurisdicción */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px] max-w-[240px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jurisdicción / Zona</span>
          <select
            value={selectedComuna}
            onChange={(e) => onComunaChange(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
          >
            {comunas.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Tipo de Organización */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px] max-w-[240px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tipo de Organización</span>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
          >
            {types.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Jornada Académica */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px] max-w-[240px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jornada Escolar</span>
          <select
            value={selectedJornada}
            onChange={(e) => onJornadaChange(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
          >
            {jornadas.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Limpiar Filtros
        </button>
      )}
    </Card>
  );
}
