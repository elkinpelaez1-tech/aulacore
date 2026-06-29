'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/territorio/KpiCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { HardDrive, ShieldAlert, Wifi, Wrench, CheckCircle2, AlertTriangle, Play, HelpCircle } from 'lucide-react';

interface MockIncident {
  id: string;
  school: string;
  type: 'Red de Datos' | 'Infraestructura Física' | 'Mobiliario' | 'PAE';
  description: string;
  severity: 'Crítica' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En Proceso' | 'Solucionado';
  date: string;
}

const INITIAL_INCIDENTS: MockIncident[] = [
  { id: '1', school: 'I.E. Rural El Hatillo', type: 'Red de Datos', description: 'Caída de fibra óptica aérea por tormenta eléctrica.', severity: 'Crítica', status: 'Pendiente', date: 'Ayer' },
  { id: '2', school: 'I.E. Técnico Industrial Pascual Bravo', type: 'Infraestructura Física', description: 'Fisura en muro de contención del bloque C.', severity: 'Crítica', status: 'En Proceso', date: 'Hace 2 días' },
  { id: '3', school: 'I.E. Marco Fidel Suárez', type: 'Mobiliario', description: 'Requerimiento de 40 pupitres adicionales para grado 10-A.', severity: 'Baja', status: 'Pendiente', date: 'Hace 4 días' },
  { id: '4', school: 'I.E. Presbítero Antonio Bernal', type: 'PAE', description: 'Retraso de 30 minutos en la entrega de la ración matinal.', severity: 'Media', status: 'Solucionado', date: 'Hace 5 días' },
];

export default function TerritoryInfraestructuraPage() {
  const [incidents, setIncidents] = useState<MockIncident[]>(INITIAL_INCIDENTS);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, newStatus: 'Pendiente' | 'En Proceso' | 'Solucionado') => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: newStatus };
      }
      return inc;
    }));
    
    const incName = incidents.find(i => i.id === id)?.school;
    setSuccessMsg(`Estado de incidencia en ${incName} actualizado a "${newStatus}" con éxito.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Infraestructura, Conectividad y PAE
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Auditoría de minutas del Programa de Alimentación Escolar (PAE), conectividad de sedes e incidencias físicas.
        </p>
      </div>

      {/* Mensaje de Éxito Interactivo */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Fila de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Raciones PAE Entregadas"
          value="24,850"
          description="94% de cobertura de hoy"
          icon={HardDrive}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Sedes Con Conectividad"
          value="42 / 48"
          description="Banda Ancha Fibra Óptica"
          icon={Wifi}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Incidencias Críticas"
          value={incidents.filter(i => i.severity === 'Crítica' && i.status !== 'Solucionado').length.toString()}
          icon={ShieldAlert}
          iconColorClass="text-rose-650"
          iconBgClass="bg-rose-50"
        />
        <KpiCard
          title="Mantenimientos Programados"
          value="5"
          description="Próxima semana"
          icon={Wrench}
          iconColorClass="text-purple-650"
          iconBgClass="bg-purple-50"
        />
      </div>

      {/* PAE & Conectividad Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCard title="Estado del Programa de Alimentación Escolar (PAE)">
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Minutas Escolares Revisadas:</span>
              <span className="text-slate-800 font-bold">100% de la semana</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Reporte de Desperdicios Promedio:</span>
              <span className="text-slate-800 font-bold">4.2% (bajo el umbral objetivo)</span>
            </div>
            <div className="bg-emerald-50/40 border border-emerald-250 p-4 rounded-xl flex gap-3 text-emerald-800 items-start">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-extrabold block">Cumplimiento PAE Destacado</span>
                <p className="font-semibold text-emerald-700 mt-0.5">El operador de la Zona Centro registra un 98.4% de entregas a tiempo y minutas balanceadas.</p>
              </div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Auditoría de Conectividad Satelital y Fibra">
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Velocidad Promedio de Descarga:</span>
              <span className="text-slate-800 font-bold">85 Mbps por Sede</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Sedes en Plan Rural Digital:</span>
              <span className="text-slate-800 font-bold">12 Sedes Activas</span>
            </div>
            <div className="bg-amber-50/40 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-850 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-655 mt-0.5 animate-pulse" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-extrabold block">Alerta de Red: Barbosa</span>
                <p className="font-semibold text-amber-800 mt-0.5">La I.E. Rural Hatillo reporta latencia alta por tormenta. Tráfico desviado a red de respaldo 4G.</p>
              </div>
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* Tabla de Incidencias */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">
          Reportes de Infraestructura y Mantenimiento
        </h4>
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Institución Educativa</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Área / Módulo</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Descripción del Incidente</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Severidad</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Estado</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Acciones Rápidas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc) => (
                    <TableRow key={inc.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-800">
                        {inc.school}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-semibold text-indigo-750">
                        {inc.type}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-semibold text-slate-600 truncate max-w-[240px]">
                        {inc.description}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          inc.severity === 'Crítica' ? 'bg-rose-100 text-rose-800' :
                          inc.severity === 'Media' ? 'bg-amber-100 text-amber-850' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inc.severity}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          inc.status === 'Solucionado' ? 'bg-emerald-100 text-emerald-800' :
                          inc.status === 'En Proceso' ? 'bg-amber-100 text-amber-850' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inc.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {inc.status === 'Pendiente' && (
                            <button
                              onClick={() => handleUpdateStatus(inc.id, 'En Proceso')}
                              className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200"
                            >
                              Atender
                            </button>
                          )}
                          {inc.status === 'En Proceso' && (
                            <button
                              onClick={() => handleUpdateStatus(inc.id, 'Solucionado')}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200"
                            >
                              Resolver
                            </button>
                          )}
                          {inc.status === 'Solucionado' && (
                            <span className="text-[10px] text-slate-400 font-bold">Sin acciones</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
