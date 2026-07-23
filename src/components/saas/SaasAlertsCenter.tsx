'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, ShieldAlert, Cpu, Clock, RefreshCw, CheckCircle2, 
  HardDrive, Zap, Server, ExternalLink, ArrowRight, Check, Eye
} from 'lucide-react';

interface SaasAlert {
  id: string;
  category: 'inactividad' | 'licencia' | 'ia_quota' | 'simat_error' | 'backup_status';
  priority: 'critica' | 'alta' | 'media' | 'baja';
  tenantName: string;
  tenantId?: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'abierta' | 'en_proceso' | 'resuelta';
  suggestedAction: string;
}

const MOCK_SAAS_ALERTS: SaasAlert[] = [
  {
    id: 'alt-saas-101',
    category: 'inactividad',
    priority: 'alta',
    tenantName: 'Colegio San José de Flores',
    title: 'Inactividad Institucional Detectada (> 15 días)',
    description: 'Ningún docente ni administrativo del tenant ha iniciado sesión desde el 14 de junio de 2026. Riesgo moderado de abandono o falta de adopción.',
    timestamp: 'Hace 2 días',
    status: 'abierta',
    suggestedAction: 'Programar llamada de acompañamiento con Rectoría / Coordinación Académica.'
  },
  {
    id: 'alt-saas-102',
    category: 'licencia',
    priority: 'critica',
    tenantName: 'Liceo Moderno Campestre',
    title: 'Licencia SaaS por Vencer en 6 Días',
    description: 'El plan Profesional para 450 alumnos vence el 10 de julio de 2026. Aún no se ha registrado la orden de renovación anual en facturación.',
    timestamp: 'Hoy, 08:30 AM',
    status: 'abierta',
    suggestedAction: 'Enviar recordatorio de pago formal e iniciar gestión de renovación con KAM comercial.'
  },
  {
    id: 'alt-saas-103',
    category: 'ia_quota',
    priority: 'media',
    tenantName: 'Gimnasio del Norte K-12',
    title: 'Consumo Elevado de Tokens Inteligencia Artificial',
    description: 'El tenant ha consumido el 145% de su cuota mensual estimada en AulaHelp IA y recetas MIO durante las últimas 72 horas.',
    timestamp: 'Ayer, 04:15 PM',
    status: 'en_proceso',
    suggestedAction: 'Auditar consultas masivas en CIE/MIO o proponer upgrade de paquete de tokens IA.'
  },
  {
    id: 'alt-saas-104',
    category: 'simat_error',
    priority: 'alta',
    tenantName: 'Secretaría de Educación de Boyacá',
    title: 'Intermitencia en Conector Oficial SIMAT - DANE',
    description: 'El endpoint de sincronización gubernamental retornó timeout (HTTP 504) durante la actualización nocturna de matrícula SISBEN IV.',
    timestamp: 'Hace 4 horas',
    status: 'abierta',
    suggestedAction: 'Verificar estado del servidor SIMAT del Ministerio de Educación y reintentar cola de sincronización.'
  },
  {
    id: 'alt-saas-105',
    category: 'backup_status',
    priority: 'baja',
    tenantName: 'Ecosistema Global AulaCore (0 Tenants)',
    title: 'Respaldo Nocturno Inmutable Completado',
    description: 'El snapshot nocturno de Supabase Postgres y almacenamiento S3 se ejecutó con 100% de éxito en todas las instancias activas.',
    timestamp: 'Hoy, 03:00 AM',
    status: 'resuelta',
    suggestedAction: 'Ninguna acción requerida. Sistema operando bajo parámetros de alta disponibilidad.'
  }
];

export function SaasAlertsCenter({ institutions }: { institutions?: any[] } = {}) {
  const [alerts, setAlerts] = useState<SaasAlert[]>(MOCK_SAAS_ALERTS);
  const [filterCat, setFilterCat] = useState<string>('todas');
  const [filterPriority, setFilterPriority] = useState<string>('todas');

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resuelta' } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterCat !== 'todas' && a.category !== filterCat) return false;
    if (filterPriority !== 'todas' && a.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'critica':
        return <Badge className="bg-red-500 text-white font-black text-[10px] uppercase animate-pulse">Crítica</Badge>;
      case 'alta':
        return <Badge className="bg-amber-500 text-white font-black text-[10px] uppercase">Alta</Badge>;
      case 'media':
        return <Badge className="bg-blue-500 text-white font-black text-[10px] uppercase">Media</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white font-black text-[10px] uppercase">Baja / Informativa</Badge>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'inactividad':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'licencia':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'ia_quota':
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'simat_error':
        return <Server className="w-5 h-5 text-blue-600" />;
      default:
        return <HardDrive className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera CAT SaaS */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-red-400 block">Monitoreo Proactivo del Fabricante</span>
            <h2 className="text-xl font-black text-white">Centro de Alertas SaaS (CAT del Fabricante)</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Vigilancia automatizada de salud de cuentas, vencimientos, integraciones gubernamentales y telemetría IA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-200">Motor de Alertas Activo</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 mr-1">Categoría:</span>
          {[
            { id: 'todas', label: 'Todas las Alertas' },
            { id: 'inactividad', label: 'Inactividad > 15d' },
            { id: 'licencia', label: 'Vencimientos' },
            { id: 'ia_quota', label: 'Cuotas IA' },
            { id: 'simat_error', label: 'Conectores SIMAT' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterCat(btn.id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                filterCat === btn.id 
                  ? 'bg-slate-900 text-white shadow-sm font-black' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 mr-1">Prioridad:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todas">Todas las Prioridades</option>
            <option value="critica">Críticas</option>
            <option value="alta">Altas</option>
            <option value="media">Medias</option>
            <option value="baja">Bajas / Resueltas</option>
          </select>
        </div>
      </div>

      {/* Listado de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center bg-white border-slate-200 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <span className="text-sm font-black text-slate-800 block">No hay alertas activas con estos filtros</span>
            <p className="text-xs text-slate-500 mt-1">Todos los tenants se encuentran operando en condiciones normales.</p>
          </Card>
        ) : (
          filteredAlerts.map(alert => {
            const isResolved = alert.status === 'resuelta';
            return (
              <Card 
                key={alert.id} 
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  isResolved 
                    ? 'bg-slate-50/70 border-slate-200 opacity-60' 
                    : alert.priority === 'critica'
                    ? 'bg-red-50/30 border-red-200 shadow-sm'
                    : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(alert.priority)}
                        <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-150">
                          {alert.tenantName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold ml-auto sm:ml-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                      </div>
                      
                      <h4 className={`text-sm font-black ${isResolved ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {alert.description}
                      </p>

                      {!isResolved && (
                        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                          <span className="font-extrabold text-indigo-700 flex items-center gap-1">
                            <ArrowRight className="w-3.5 h-3.5" />
                            Acción Recomendada:
                          </span>
                          <span className="font-semibold italic">{alert.suggestedAction}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isResolved ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <Check className="w-4 h-4" />
                        <span>Resuelta</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Marcar Resuelta
                      </Button>
                    )}
                  </div>

                </div>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}
