'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  Award, Briefcase, Layers, DollarSign, HelpCircle, Globe, 
  Activity, ShieldCheck, Sliders, CheckCircle2, Clock, Users, 
  ArrowRight, Search, Plus, Filter, Check, ExternalLink, Key, 
  Server, Cpu, HardDrive, AlertCircle, Phone, Mail, FileText,
  UserCheck, RefreshCw, Zap
} from 'lucide-react';

// ==========================================
// MÓDULO 5: LICENCIAS Y SUSCRIPCIONES
// ==========================================
export function SaasLicenses({ institutions, onEditLicense }: { institutions: any[], onEditLicense: (inst: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-purple-300 block">Administración de Contratos</span>
            <h2 className="text-xl font-black text-white">Licencias y Suscripciones SaaS</h2>
            <p className="text-xs text-purple-200 mt-0.5">Control granular de planes, cupos de estudiantes, vigencias y módulos habilitados por inquilino.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Institución / Tenant</th>
                <th className="py-3.5 px-4">Plan Contratado</th>
                <th className="py-3.5 px-4">Vigencia (Inicio - Fin)</th>
                <th className="py-3.5 px-4">Cupo Estudiantes / Sedes</th>
                <th className="py-3.5 px-4">Módulos Ecosistema</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {institutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold bg-slate-50 italic">
                    Sin registros
                  </td>
                </tr>
              ) : (
                institutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{inst.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase">
                        {inst.subscription_plan || 'N/D'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {inst.subscription_start || 'N/D'} <span className="text-slate-400">➔</span> {inst.subscription_end || 'N/D'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-800">{inst.active_users || 0} Alumnos</span> <span className="text-slate-400">/ {inst.sedes_count || 0} Sedes</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {inst.active_modules && inst.active_modules.length > 0 ? (
                          inst.active_modules.map((mod: string) => (
                            <span key={mod} className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded border border-indigo-200">{mod.toUpperCase()}</span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Ninguno</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => onEditLicense(inst)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl px-3 py-1 cursor-pointer"
                      >
                        Editar Licencia
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// MÓDULO 6: CRM COMERCIAL
// ==========================================
export function SaasCrm() {
  const [pipeline, setPipeline] = useState<any[]>([]);

  useEffect(() => {
    // In a real scenario, this fetches from a CRM table in Supabase
    // For now, it respects the empty state rule
  }, []);

  const columns = [
    { title: '1. Prospectos', color: 'border-slate-300 bg-slate-50', items: pipeline.filter(p => p.stage === 'prospect') },
    { title: '2. Demos Activas', color: 'border-blue-300 bg-blue-50/40', items: pipeline.filter(p => p.stage === 'demo') },
    { title: '3. Seguimiento KAM', color: 'border-amber-300 bg-amber-50/40', items: pipeline.filter(p => p.stage === 'followup') },
    { title: '4. Cierre de Contrato', color: 'border-emerald-300 bg-emerald-50/40', items: pipeline.filter(p => p.stage === 'closing') },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-blue-300 block">Embudo de Ventas & Oportunidades</span>
            <h2 className="text-xl font-black text-white">CRM Comercial AulaCore</h2>
            <p className="text-xs text-blue-200 mt-0.5">Pipeline visual de cuentas en prospección, demostraciones, negociaciones y cierre de contratos.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {columns.map((col, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${col.color} space-y-3`}>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{col.title}</h4>
            <div className="space-y-2.5">
              {col.items.length === 0 ? (
                <div className="p-3 text-center text-slate-400 font-bold text-[10px] italic border border-dashed border-slate-300 rounded-xl">
                  Sin registros
                </div>
              ) : (
                col.items.map((item, i) => (
                  <Card key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer space-y-1.5">
                    <span className="font-extrabold text-xs text-slate-900 block">{item.name}</span>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>KAM: {item.kam_name || 'Sin asignar'}</span>
                      <span className="font-bold text-indigo-600">${item.value || 0} COP</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 7: IMPLEMENTACIONES (ONBOARDING)
// ==========================================
export function SaasImplementations({ institutions }: { institutions: any[] }) {
  const STAGES = [
    'Prospecto', 'Contrato firmado', 'Creación del tenant', 'Parametrización', 
    'Migración de datos', 'Capacitación', 'Piloto', 'Producción', 'Operación estable'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 block">Customer Success & Onboarding</span>
            <h2 className="text-xl font-black text-white">Centro de Implementaciones (Go-Live)</h2>
            <p className="text-xs text-emerald-200 mt-0.5">Seguimiento de las 9 etapas críticas de adopción tecnológica en nuevos clientes institucionales.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {institutions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 border border-slate-200 rounded-2xl italic">
            Sin registros de implementaciones en curso.
          </div>
        ) : (
          institutions.map((inst) => {
            const currentStep = inst.implementation_step || 1; 
            return (
              <Card key={inst.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{inst.name}</h4>
                    <span className="text-xs text-slate-500 font-medium">Responsable: <strong className="text-slate-800">{inst.kam_name || 'Sin Asignar'}</strong> • Go-Live proyectado: <strong className="text-emerald-700 font-mono">N/D</strong></span>
                  </div>
                  <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs px-3 py-1">
                    Etapa {currentStep} de 9: {STAGES[currentStep - 1] || 'N/D'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center">
                  {STAGES.map((stg, i) => {
                    const isPast = i + 1 < currentStep;
                    const isCurr = i + 1 === currentStep;
                    return (
                      <div 
                        key={i} 
                        className={`p-2 rounded-xl border text-[10px] font-extrabold transition-all ${
                          isCurr 
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm animate-pulse' 
                            : isPast 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-50 text-slate-400 border-slate-150'
                        }`}
                      >
                        <span className="block">{i + 1}. {stg}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 8: FACTURACIÓN SAAS
// ==========================================
export function SaasBilling() {
  console.log("RENDER FACTURACION SAAS");
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 block">Administración Financiera SaaS</span>
            <h2 className="text-xl font-black text-white">Facturación, Recaudo y Cartera</h2>
            <p className="text-xs text-emerald-200 mt-0.5">Emisión de facturas de AulaCore hacia las instituciones, recaudo PSE/Stripe y calendario de cobro.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Facturado Q2</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">$0 COP</span>
          <span className="text-[10px] text-slate-400 font-bold">N/D</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Recaudo Efectivo</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">$0 COP</span>
          <span className="text-[10px] text-slate-400 font-bold">N/D</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Cartera en Mora (&gt; 30d)</span>
          <span className="text-2xl font-black text-amber-900 font-mono mt-0.5 block">$0 COP</span>
          <span className="text-[10px] text-slate-400 font-bold">N/D</span>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Últimas Facturas Emitidas</h4>
        <div className="space-y-2 text-xs">
          <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-xl border border-slate-100 italic">
            Sin registros de facturas
          </div>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// MÓDULO 9: SOPORTE TÉCNICO SAAS
// ==========================================
export function SaasSupport() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300 block">Mesa de Ayuda Corporativa</span>
            <h2 className="text-xl font-black text-white">Centro de Soporte Técnico y SLA</h2>
            <p className="text-xs text-indigo-200 mt-0.5">Atención de incidencias de segundo nivel, tiempos de respuesta y priorización de tickets para colegios y SEDs.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Cumplimiento SLA Global</span>
          <span className="text-3xl font-black text-slate-800 font-mono mt-1 block">0%</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1 block">Sin datos históricos</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Tickets Activos Hoy</span>
          <span className="text-3xl font-black text-slate-800 font-mono mt-1 block">0</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1 block">Sin datos históricos</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Canal Preferido</span>
          <span className="text-3xl font-black text-slate-800 mt-1 block">N/D</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1 block">Sin datos recientes</span>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 10: CENTRO GLOBAL DE INTEGRACIONES
// ==========================================
export function SaasIntegrations() {
  const [connectors, setConnectors] = useState<any[]>([]);

  useEffect(() => {
    // In a real scenario, this fetches from Supabase
    // We enforce the empty state rule for now
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-blue-300 block">Ecosistema & Marketplace de Fabricante</span>
            <h2 className="text-xl font-black text-white">Centro Global de Integraciones Oficiales</h2>
            <p className="text-xs text-blue-200 mt-0.5">Control de versiones, latencias e interfaces de conectores gubernamentales y corporativos. (Sin exponer llaves privadas de colegios).</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {connectors.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 border border-slate-200 rounded-2xl italic">
            Sin registros de integraciones
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connectors.map((c, i) => (
              <Card key={i} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.version}</span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">{c.name}</h4>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                    ● {c.status} ({c.ping})
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{c.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 11: MONITOREO DE PLATAFORMA
// ==========================================
export function SaasMonitoring() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-purple-300 block">Telemetría de Infraestructura en Vivo</span>
            <h2 className="text-xl font-black text-white">Monitoreo de Plataforma & Clúster</h2>
            <p className="text-xs text-purple-200 mt-0.5">Supervisión en tiempo real de base de datos Supabase, edge functions en Vercel, latencia de IA y disponibilidad.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">Base de Datos Supabase (Postgres)</span>
          <span className="text-2xl font-black text-slate-800 font-mono block">N/D</span>
          <span className="text-slate-400 font-semibold block">Sin conexión a telemetría</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">Vercel Edge Network (Global CDN)</span>
          <span className="text-2xl font-black text-slate-800 font-mono block">N/D</span>
          <span className="text-slate-400 font-semibold block">Sin conexión a telemetría</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">Almacenamiento S3 Nube</span>
          <span className="text-2xl font-black text-slate-800 font-mono block">N/D</span>
          <span className="text-slate-400 font-semibold block">Sin datos de cuota</span>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 12: AUDITORÍA GLOBAL
// ==========================================
export function SaasAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  console.log("RENDER AUDITORIA SAAS", { count: logs.length, logs });

  useEffect(() => {
    // Should fetch from 'migration_audit_logs' or 'saas_audit_logs' in Supabase
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 block">Bitácora Inmutable de Seguridad</span>
            <h2 className="text-xl font-black text-white">Auditoría Global del Fabricante & Modo Soporte</h2>
            <p className="text-xs text-indigo-200 mt-0.5">Historial auditable de creaciones de cuentas, cambios de licencia y registro con motivo de todos los accesos en Modo Soporte.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Usuario Super Admin</th>
                <th className="py-3.5 px-4">Acción / Tipo</th>
                <th className="py-3.5 px-4">Inquilino Destino</th>
                <th className="py-3.5 px-4">Detalle / Motivo de Soporte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold bg-slate-50 italic">
                    Sin registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{row.time}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{row.user}</td>
                    <td className="py-3.5 px-4">
                      {row.action === 'INGRESAR_MODO_SOPORTE' ? (
                        <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-1 rounded-lg border border-emerald-300">
                          🛡️ MODO SOPORTE
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200">
                          {row.action}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-indigo-700">{row.tenant}</td>
                    <td className="py-3.5 px-4 text-slate-600 italic font-medium max-w-md">{row.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// MÓDULO 13: CONFIGURACIÓN GLOBAL
// ==========================================
export function SaasGlobalConfig() {
  const [activePanel, setActivePanel] = useState<'none' | 'tarifas' | 'prompts'>('none');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados de Tarifas
  const [basicPrice, setBasicPrice] = useState('0');
  const [proPrice, setProPrice] = useState('0');
  const [enterprisePrice, setEnterprisePrice] = useState('0');
  const [trialDays, setTrialDays] = useState('0');

  // Estados de Prompts IA
  const [iaModel, setIaModel] = useState('');
  const [tokenLimit, setTokenLimit] = useState('0');
  const [catThreshold, setCatThreshold] = useState('0');
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleSaveTarifas = () => {
    // No more setTimeout fake logic.
    // Real implementation would save to Supabase here.
    setActivePanel('none');
  };

  const handleSavePrompts = () => {
    // No more setTimeout fake logic.
    // Real implementation would save to Supabase here.
    setActivePanel('none');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-500/20 border border-slate-400/30 flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 block">Parámetros Maestros SaaS</span>
            <h2 className="text-xl font-black text-white">Configuración Global de AulaCore</h2>
            <p className="text-xs text-slate-300 mt-0.5">Planes de precios, catálogos maestros gubernamentales, variables globales de IA y control de versiones del sistema.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Card className={`p-5 rounded-2xl border transition-all shadow-xs space-y-3 ${activePanel === 'tarifas' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-200 bg-white'}`}>
          <h4 className="font-black text-sm text-slate-900 uppercase">1. Tablas de Precios SaaS & Cuotas</h4>
          <p className="text-slate-600 leading-relaxed font-medium">Configuración de montos base por estudiante para planes Free Trial, Básico, Profesional y Enterprise.</p>
          <Button 
            size="sm" 
            onClick={() => setActivePanel(activePanel === 'tarifas' ? 'none' : 'tarifas')}
            className={`font-bold text-xs rounded-xl px-4 py-2 cursor-pointer transition-all ${activePanel === 'tarifas' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
          >
            {activePanel === 'tarifas' ? 'Cerrar Panel de Tarifas' : 'Gestionar Tarifas'}
          </Button>
        </Card>

        <Card className={`p-5 rounded-2xl border transition-all shadow-xs space-y-3 ${activePanel === 'prompts' ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10' : 'border-slate-200 bg-white'}`}>
          <h4 className="font-black text-sm text-slate-900 uppercase">2. Prompts Maestros & Motores de IA</h4>
          <p className="text-slate-600 leading-relaxed font-medium">Ajuste de variables de system prompt para AulaHelp IA, umbrales predictivos en el CIE y límites de tokens por ejecución.</p>
          <Button 
            size="sm" 
            onClick={() => setActivePanel(activePanel === 'prompts' ? 'none' : 'prompts')}
            className={`font-bold text-xs rounded-xl px-4 py-2 cursor-pointer transition-all ${activePanel === 'prompts' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
          >
            {activePanel === 'prompts' ? 'Cerrar Panel de IA' : 'Ajustar Prompts IA'}
          </Button>
        </Card>
      </div>

      {/* PANEL EXPANDIBLE: GESTIÓN DE TARIFAS */}
      {activePanel === 'tarifas' && (
        <Card className="p-6 rounded-3xl border border-indigo-200 bg-white shadow-lg space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900">Gestión Maestra de Tarifas & Cuotas por Estudiante</h3>
              <p className="text-xs text-slate-500">Defina los valores base de suscripción anual por alumno en pesos colombianos (COP).</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 text-xs">Moneda: COP ($)</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Días Free Trial</label>
              <input 
                type="number" 
                value={trialDays} 
                onChange={(e) => setTrialDays(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Plan Básico ($ / año)</label>
              <input 
                type="text" 
                value={basicPrice} 
                onChange={(e) => setBasicPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Plan Profesional ($ / año)</label>
              <input 
                type="text" 
                value={proPrice} 
                onChange={(e) => setProPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Plan Enterprise ($ / año)</label>
              <input 
                type="text" 
                value={enterprisePrice} 
                onChange={(e) => setEnterprisePrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setActivePanel('none')} className="rounded-xl font-bold text-xs">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveTarifas} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 cursor-pointer shadow-md">
              Guardar y Publicar Tarifas
            </Button>
          </div>
        </Card>
      )}

      {/* PANEL EXPANDIBLE: AJUSTE DE PROMPTS Y MOTORES IA */}
      {activePanel === 'prompts' && (
        <Card className="p-6 rounded-3xl border border-purple-200 bg-white shadow-lg space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900">Motores IA y System Prompt Gubernamental</h3>
              <p className="text-xs text-slate-500">Configuración global del motor predictivo AulaHelp para Secretarías y Colegios.</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 font-bold px-3 py-1 text-xs">LLM: DeepMind Gemini 2.5 Pro</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Modelo de Lenguaje IA Principal</label>
              <input 
                type="text" 
                value={iaModel} 
                onChange={(e) => setIaModel(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Max Tokens / Sesión</label>
                <input 
                  type="number" 
                  value={tokenLimit} 
                  onChange={(e) => setTokenLimit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Umbral Alertas CAT (%)</label>
                <input 
                  type="number" 
                  value={catThreshold} 
                  onChange={(e) => setCatThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">System Prompt Maestro (Secretarías de Educación y Rectores)</label>
            <textarea 
              rows={4}
              value={systemPrompt} 
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 leading-relaxed" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setActivePanel('none')} className="rounded-xl font-bold text-xs">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSavePrompts} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl px-5 cursor-pointer shadow-md">
              Guardar Configuración IA
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
