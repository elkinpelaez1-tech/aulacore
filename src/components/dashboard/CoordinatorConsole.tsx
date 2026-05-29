'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Clock,
  Eye,
  ShieldAlert,
  Search,
  Filter,
  Users2,
  FileSignature,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DocumentEngine } from '@/components/document-engine/DocumentEngine';
import { SchedulePreviewWidget } from './shared/SchedulePreviewWidget';

export function CoordinatorConsole() {
  const [isDocEngineOpen, setIsDocEngineOpen] = useState(false);
  const [docEngineType, setDocEngineType] = useState<any>('rectoral_report');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ========================================================= */}
      {/* 🏛️ SECCIÓN 1: HEADER & KPI CARDS                          */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Supervisión Institucional
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Consola de Coordinación
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gestión académica, mallas curriculares y seguimiento convivencial.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDocEngineType('curriculum_grid');
              setIsDocEngineOpen(true);
            }}
            variant="outline"
            className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-100"
          >
            <BookOpen className="w-4 h-4" />
            Exportar Mallas (PDF)
          </Button>
          <Button
            onClick={() => {
              setDocEngineType('rectoral_report');
              setIsDocEngineOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            Consolidado Institucional
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mallas Curriculares</p>
              <h3 className="text-2xl font-black text-slate-900">42/45</h3>
              <p className="text-[10px] font-bold text-emerald-600">93% Aprobadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Planeaciones Semanales</p>
              <h3 className="text-2xl font-black text-slate-900">12</h3>
              <p className="text-[10px] font-bold text-amber-600">Pendientes de Revisión</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alertas Tempranas</p>
              <h3 className="text-2xl font-black text-slate-900">8</h3>
              <p className="text-[10px] font-bold text-red-600">Intervención Requerida</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Observadores Listos</p>
              <h3 className="text-2xl font-black text-slate-900">100%</h3>
              <p className="text-[10px] font-bold text-emerald-600">Actualización al día</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 📚 SECCIÓN 2: CONTROL DE PLANEACIONES DOCENTES            */}
      {/* ========================================================= */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-indigo-700" />
              Auditoría de Planeaciones Docentes
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">Validación semanal de contenido pedagógico por área.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar docente o área..."
                className="pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 w-48"
              />
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Docente / Área</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Semana Lectiva</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Unidad Temática</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { teacher: 'Prof. Gómez', area: 'Ciencias Naturales', week: 'Semana 12 (Mayo)', topic: 'Fotosíntesis y Celular', status: 'pending' },
                { teacher: 'Lic. Torres', area: 'Matemáticas (10-A)', week: 'Semana 12 (Mayo)', topic: 'Trigonometría Básica', status: 'approved' },
                { teacher: 'Esp. Ruiz', area: 'Sociales (8-B)', week: 'Semana 12 (Mayo)', topic: 'Revolución Industrial', status: 'returned' },
              ].map((p, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <span className="font-black text-slate-900 block text-xs">{p.teacher}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{p.area}</span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-600">{p.week}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-700">{p.topic}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider inline-block",
                      p.status === 'pending' && "bg-amber-100 text-amber-700 border border-amber-200",
                      p.status === 'approved' && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                      p.status === 'returned' && "bg-red-100 text-red-700 border border-red-200"
                    )}>
                      {p.status === 'pending' ? 'Por Revisar' : p.status === 'approved' ? 'Aprobada' : 'Devuelta'}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {p.status === 'pending' && (
                        <>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* ⚠️ SECCIÓN 3: RADAR DE ALERTAS Y NOVEDADES                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Radar de Alertas Institucionales
            </CardTitle>
            <span className="text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
              PRIORIDAD ALTA
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { date: 'Hoy, 08:30 AM', student: 'Mateo Gómez (10-A)', type: 'Inasistencia Reiterada', desc: 'Acumula 3 fallas sin justificación médica este periodo.', action: 'Llamado a Acudiente' },
                { date: 'Ayer, 14:15 PM', student: 'Sofía Ramírez (10-A)', type: 'Bajo Rendimiento', desc: 'Reporte preventivo en Matemáticas (Promedio: 3.20)', action: 'Citar Comité' }
              ].map((alert, i) => (
                <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{alert.student}</h4>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">{alert.type}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{alert.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-3">{alert.desc}</p>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] font-bold text-slate-700">
                    {alert.action} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 📋 SECCIÓN 4: REPORTE DE MALLAS CURRICULARES              */}
        {/* ========================================================= */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Validación de Mallas Curriculares
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              {[
                { area: 'Matemáticas Avanzadas (10°-11°)', progress: 100, status: 'Aprobada' },
                { area: 'Ciencias y Biología (6°-9°)', progress: 85, status: 'En Revisión' },
                { area: 'Humanidades y Lenguaje', progress: 40, status: 'Devuelta' },
              ].map((mesh, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{mesh.area}</span>
                    <span className={cn(
                      "text-[10px] uppercase",
                      mesh.status === 'Aprobada' ? "text-emerald-600" :
                      mesh.status === 'Devuelta' ? "text-red-600" : "text-amber-600"
                    )}>{mesh.status}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        mesh.status === 'Aprobada' ? "bg-emerald-500" :
                        mesh.status === 'Devuelta' ? "bg-red-500" : "bg-amber-500"
                      )} 
                      style={{ width: `${mesh.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs h-8">
                Ver Directorio Completo de Mallas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 🕒 SECCIÓN 5: PLANEACIÓN DE HORARIOS                      */}
        {/* ========================================================= */}
        <SchedulePreviewWidget role="coordinator" title="Horarios y Mallas Institucionales" />
      </div>

      <DocumentEngine
        isOpen={isDocEngineOpen}
        onClose={() => setIsDocEngineOpen(false)}
        documentType={docEngineType}
        studentName="N/A (Reporte Institucional)"
        courseName="Todos los Grados"
        metadataPayload={{ origin: 'coordinacion' }}
      />
    </div>
  );
}
