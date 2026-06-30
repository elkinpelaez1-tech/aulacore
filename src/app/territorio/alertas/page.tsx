'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TerritorialAlert } from '@/services/territory-mock';
import { getAlertsByQueue } from '@/services/territory-alerts';
import { 
  ShieldAlert, Clock, CheckCircle2, TrendingUp, AlertTriangle, 
  Building, UserCheck, HelpCircle, Activity, Landmark, ArrowRight 
} from 'lucide-react';

type QueueType = 'inmediata' | 'seguimiento' | 'tendencias' | 'resueltas';

export default function TerritoryAlertsPage() {
  const [activeQueue, setActiveQueue] = useState<QueueType>('inmediata');
  const [alerts, setAlerts] = useState<TerritorialAlert[]>([]);
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');

  // Cargar rol y alertas del servicio
  const loadAlerts = () => {
    const data = getAlertsByQueue(activeQueue);
    setAlerts(data);
  };

  useEffect(() => {
    loadAlerts();

    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();

    window.addEventListener('rbac-role-changed', updateRole);
    window.addEventListener('territory-alerts-updated', loadAlerts);
    return () => {
      window.removeEventListener('rbac-role-changed', updateRole);
      window.removeEventListener('territory-alerts-updated', loadAlerts);
    };
  }, [activeQueue]);

  // Cuentas del Dashboard Ejecutivo Reorientado a Decisiones
  const [kpis, setKpis] = useState({
    decisionesUrgentes: 1, // Alertas Críticas sin responsable asignado
    ieCriticasCount: 3,    // Colegios con semáforo Rojo o Naranja activo
    accionesPendientes: 2,  // Alertas asignadas en intervención/seguimiento
    vulnerabilidadIndex: '28%' // Índice global del territorio
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critico': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'alto': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bajo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-705 border-slate-200';
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'urgente': return 'bg-rose-50 border-rose-150 text-rose-700';
      case 'alta': return 'bg-amber-50 border-amber-150 text-amber-700';
      case 'media': return 'bg-indigo-50 border-indigo-150 text-indigo-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-550';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'detectada': return 'bg-slate-100 text-slate-700';
      case 'validada': return 'bg-blue-100 text-blue-800';
      case 'asignada': return 'bg-indigo-100 text-indigo-800';
      case 'intervencion': return 'bg-purple-100 text-purple-800';
      case 'seguimiento': return 'bg-amber-100 text-amber-800';
      case 'resuelta': return 'bg-emerald-100 text-emerald-800';
      case 'cerrada': return 'bg-slate-200 text-slate-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Centro de Alertas Tempranas (CAT)
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Consola del Motor de Inteligencia Educativa. Priorice incidencias y gestione bitácoras de aprendizaje del territorio.
        </p>
      </div>

      {/* 📊 DASHBOARD EJECUTIVO REORIENTADO A TOMA DE DECISIONES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Decisiones Urgentes */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Decisiones Urgentes</span>
              <h3 className="text-2xl font-black text-rose-700">{kpis.decisionesUrgentes} Triage</h3>
              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                Alertas críticas sin reasignar
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </Card>

        {/* KPI 2: Instituciones que requieren intervención */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">I.E. con Semáforo Activo</span>
              <h3 className="text-2xl font-black text-amber-700">{kpis.ieCriticasCount} Colegios</h3>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Semáforo rojo/naranja activo
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <Building className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        {/* KPI 3: Acciones Pendientes */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Acciones Asignadas</span>
              <h3 className="text-2xl font-black text-slate-805">{kpis.accionesPendientes} Casos</h3>
              <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">
                En intervención o seguimiento
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* KPI 4: Nivel de Vulnerabilidad */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vulnerabilidad Territorial</span>
              <h3 className="text-2xl font-black text-slate-700">{kpis.vulnerabilidadIndex}</h3>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                Índice predictivo del municipio
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <Activity className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* 🧭 NAVEGACIÓN POR BANDEJAS OPERATIVAS */}
      <div className="flex border-b border-slate-200 p-1 bg-slate-50/30 rounded-2xl gap-2 w-full overflow-x-auto">
        <button
          onClick={() => setActiveQueue('inmediata')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'inmediata' 
              ? 'bg-rose-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Atención Inmediata
        </button>
        <button
          onClick={() => setActiveQueue('seguimiento')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'seguimiento' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Seguimiento y Control
        </button>
        <button
          onClick={() => setActiveQueue('tendencias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'tendencias' 
              ? 'bg-amber-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Tendencias y Comportamiento
        </button>
        <button
          onClick={() => setActiveQueue('resueltas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'resueltas' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Histórico de Resueltas
        </button>
      </div>

      {/* 📋 LISTADO DE ALERTAS CON SEMÁFOROS CROMÁTICOS */}
      <Card className="border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/40">
                <TableRow>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 w-12 text-center">Semáforo</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Expediente</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Institución Educativa</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Descripción / Incidente</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 text-center">Impacto</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Prioridad Inteligente</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Responsable</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 text-center">Estado</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-xs text-slate-450 font-bold italic">
                      No hay incidencias en esta bandeja de control. Todo fluye de acuerdo a los límites establecidos.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Semáforo visual */}
                      <TableCell className="align-middle text-center py-4">
                        <div className={`w-3.5 h-3.5 rounded-full mx-auto shadow-xs border ${
                          alert.severity === 'critico' ? 'bg-rose-500 border-rose-600 animate-pulse' :
                          alert.severity === 'alto' ? 'bg-amber-500 border-amber-600' :
                          alert.severity === 'medio' ? 'bg-yellow-405 border-yellow-500' :
                          alert.severity === 'bajo' ? 'bg-indigo-500 border-indigo-600' :
                          'bg-slate-400 border-slate-500'
                        }`} />
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs font-mono font-black text-slate-800">
                        {alert.id}
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs font-bold text-slate-800">
                        <div>
                          <span>{alert.institution_name}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{alert.municipality}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs font-semibold text-slate-655 max-w-[280px] truncate" title={alert.description}>
                        {alert.description}
                      </TableCell>
                      <TableCell className="py-4 align-middle text-center text-xs font-bold text-indigo-700">
                        {alert.impact_estimate}
                      </TableCell>
                      <TableCell className="py-4 align-middle">
                        <span className={`text-[9px] font-black uppercase border px-2.5 py-0.5 rounded-md ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs text-slate-600 font-semibold">
                        {alert.assigned_to || <span className="text-slate-400 italic">Sin asignar</span>}
                      </TableCell>
                      <TableCell className="py-4 align-middle text-center">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 align-middle text-right pr-6">
                        <Link
                          href={`/territorio/alertas/${alert.id}`}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl cursor-pointer transition-all inline-block text-center"
                        >
                          Gestionar expediente
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
