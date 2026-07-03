'use client';

import React, { useState } from 'react';
import { InstitutionData } from '@/providers/auth-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Search, Plus, Eye, ShieldCheck, Play, Edit3, 
  Trash2, RefreshCw, CheckCircle2, AlertCircle, Filter, Users, MapPin
} from 'lucide-react';

interface SaasClientsTableProps {
  institutions: any[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpen360: (inst: any) => void;
  onOpenSupportMode: (inst: any) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export function SaasClientsTable({
  institutions,
  loading,
  onRefresh,
  onOpenCreate,
  onOpen360,
  onOpenSupportMode,
  onToggleStatus
}: SaasClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'colegios' | 'seds'>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filtered = institutions.filter(inst => {
    if (filterType === 'colegios' && inst.is_sed) return false;
    if (filterType === 'seds' && !inst.is_sed) return false;
    if (filterStatus !== 'todos' && (inst.subscription_status || 'active') !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = inst.name?.toLowerCase().includes(q);
      const matchNit = inst.nit?.toLowerCase().includes(q);
      const matchCity = inst.city?.toLowerCase().includes(q);
      if (!matchName && !matchNit && !matchCity) return false;
    }
    return true;
  });

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'active':
        return <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase">Activo</Badge>;
      case 'free_trial':
        return <Badge className="bg-blue-500 text-white font-black text-[10px] uppercase">En Prueba</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 text-white font-black text-[10px] uppercase">Suspendido</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white font-black text-[10px] uppercase">{st || 'Activo'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera & Botones de Acción */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300 block">Administración de Tenants</span>
            <h2 className="text-xl font-black text-white">Directorio de Clientes (Colegios & Secretarías)</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Control de ciclo de vida SaaS, licencias, suspensión y acceso técnico auditable en Modo Soporte.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="text-slate-200 border-slate-700 hover:bg-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button
            onClick={onOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Cliente
          </Button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, NIT, municipio o ciudad..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'colegios', label: 'Colegios' },
              { id: 'seds', label: 'Secretarías (SED)' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  filterType === btn.id 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Estado: Todos</option>
            <option value="active">Activos</option>
            <option value="free_trial">En Prueba (Trial)</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Institución / NIT</th>
                <th className="py-3.5 px-4">Tipo Cliente</th>
                <th className="py-3.5 px-4">Ubicación</th>
                <th className="py-3.5 px-4">Plan & Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones de Cuenta</th>
                <th className="py-3.5 px-4 text-right">Modo Soporte (RBAC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                    No se encontraron clientes que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map(inst => {
                  const status = inst.subscription_status || 'active';
                  const isSuspended = status === 'suspended';
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img src={inst.logo_url || '/logo-aulacore.png'} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="block truncate max-w-xs">{inst.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">NIT: {inst.nit || 'S/N'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {inst.is_sed ? (
                          <span className="bg-blue-100 text-blue-800 font-black text-[10px] px-2 py-0.5 rounded-md border border-blue-200">
                            Secretaría (SED)
                          </span>
                        ) : (
                          <span className="bg-purple-100 text-purple-800 font-black text-[10px] px-2 py-0.5 rounded-md border border-purple-200">
                            Colegio K-12
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{inst.city || 'Bogotá'} ({inst.department || 'Cund.'})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(status)}
                        </div>
                        <span className="text-[10px] font-extrabold text-indigo-700 block uppercase">
                          Plan: {inst.subscription_plan || 'profesional'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpen360(inst)}
                            className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer"
                            title="Ficha 360°"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ficha 360°
                          </Button>
                          
                          <button
                            onClick={() => onToggleStatus(inst.id, status)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                              isSuspended 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                            title={isSuspended ? 'Reactivar acceso' : 'Suspender servicio'}
                          >
                            {isSuspended ? 'Reactivar' : 'Suspender'}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => onOpenSupportMode(inst)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Modo Soporte
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
