'use client';

import React, { useState } from 'react';
import { Filter, Calendar, MapPin, GraduationCap, X } from 'lucide-react';

export function ReportsFilterBar() {
  const [year, setYear] = useState('2026');
  const [period, setPeriod] = useState('P4');
  const [campus, setCampus] = useState('Todas');
  const [level, setLevel] = useState('Todos');

  const hasActiveFilters = campus !== 'Todas' || level !== 'Todos' || period !== 'P4' || year !== '2026';

  const clearAllFilters = () => {
    setYear('2026');
    setPeriod('P4');
    setCampus('Todas');
    setLevel('Todos');
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-3">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Filtros Globales Institucionales
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select 
              value={year} onChange={e => setYear(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <select 
            value={period} onChange={e => setPeriod(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <option value="P1">Periodo 1</option>
            <option value="P2">Periodo 2</option>
            <option value="P3">Periodo 3</option>
            <option value="P4">Periodo 4 (Actual)</option>
            <option value="Anual">Consolidado Anual</option>
          </select>

          <select 
            value={campus} onChange={e => setCampus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <option value="Todas">Sede: Todas</option>
            <option value="Sede Principal">Sede Principal</option>
            <option value="Sede Norte">Sede Norte</option>
          </select>

          <select 
            value={level} onChange={e => setLevel(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <option value="Todos">Nivel: Todos</option>
            <option value="Preescolar">Preescolar</option>
            <option value="Primaria">Primaria</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Media Técnica">Media Técnica</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 mt-1 border-t border-slate-50 animate-in fade-in">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Activos:</span>
          
          {year !== '2026' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
              Año: {year}
            </span>
          )}
          {period !== 'P4' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
              Periodo: {period}
            </span>
          )}
          {campus !== 'Todas' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
              Sede: {campus}
            </span>
          )}
          {level !== 'Todos' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
              Nivel: {level}
            </span>
          )}
          
          <button 
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline ml-1 transition-colors flex items-center"
          >
            <X className="w-3 h-3 mr-0.5" /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
