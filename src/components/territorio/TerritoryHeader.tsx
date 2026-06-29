'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { 
  Search, Bell, User, MapPin, Sparkles, ChevronDown 
} from 'lucide-react';

export function TerritoryHeader() {
  const { allInstitutions, overrideInstitutionId } = useAuth();

  // Buscar si la institución activa simulada es una secretaría
  const activeSimulatedInst = allInstitutions.find(i => i.id === overrideInstitutionId);
  const isSecretaria = activeSimulatedInst?.organization_type === 'secretaria';

  const orgName = isSecretaria 
    ? activeSimulatedInst.name 
    : 'Secretaría de Educación de Antioquia'; // Default simulado para el Portal Territorial
  
  const orgLocation = isSecretaria
    ? `${activeSimulatedInst.municipality || 'Medellín'}, ${activeSimulatedInst.department || 'Antioquia'}`
    : 'Medellín, Antioquia';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
      {/* Left: Territory Title and Location */}
      <div className="flex items-center gap-3 min-w-0">
        <MapPin className="w-4.5 h-4.5 text-indigo-650 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xs font-black text-slate-800 uppercase tracking-wider truncate">
            {orgName}
          </h1>
          <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5">
            Jurisdicción Territorial: {orgLocation}
          </span>
        </div>
      </div>

      {/* Middle: Search bar (Simulated) */}
      <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 max-w-xs transition-all duration-200 focus-within:border-indigo-500 focus-within:bg-white">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar instituciones, códigos DANE..."
          className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Right: Notifications, Active Role & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notifications (Simulated) */}
        <button className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User profile dropdown (Simulated) */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <span className="text-xs font-black text-slate-850 block truncate">
              Dr. Alejandro Gómez
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
              Secretario de Educación
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
