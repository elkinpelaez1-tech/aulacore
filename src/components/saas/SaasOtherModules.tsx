'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
              {institutions.map(inst => (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">{inst.name}</td>
                  <td className="py-3.5 px-4">
                    <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase">
                      {inst.subscription_plan || 'profesional'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {inst.subscription_start || '01/01/2026'} <span className="text-slate-400">➔</span> {inst.subscription_end || '31/12/2026'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-800">450 Alumnos</span> <span className="text-slate-400">/ 1 Sede</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200">MIO</span>
                      <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200">CIE</span>
                      <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">IA</span>
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
              ))}
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
  const columns = [
    { title: '1. Prospectos (4)', color: 'border-slate-300 bg-slate-50', items: ['Colegio Bilingüe San Agustín', 'Liceo de la Salle', 'Gimnasio Los Caobos', 'SED Vichada'] },
    { title: '2. Demos Activas (3)', color: 'border-blue-300 bg-blue-50/40', items: ['Instituto Técnico Central', 'Colegio Santa María', 'Liceo Taller San Miguel'] },
    { title: '3. Seguimiento KAM (5)', color: 'border-amber-300 bg-amber-50/40', items: ['Gimnasio Campestre', 'SED Santander', 'Colegio San José', 'Liceo Francés', 'Colegio Berchmans'] },
    { title: '4. Cierre de Contrato (2)', color: 'border-emerald-300 bg-emerald-50/40', items: ['Secretaría Educación Boyacá', 'Colegio Anglo Colombiano'] },
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
              {col.items.map((item, i) => (
                <Card key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer space-y-1.5">
                  <span className="font-extrabold text-xs text-slate-900 block">{item}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>KAM: Eduardo M.</span>
                    <span className="font-bold text-indigo-600">$18.5M COP</span>
                  </div>
                </Card>
              ))}
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
        {institutions.slice(0, 5).map((inst, index) => {
          const currentStep = (index % 5) + 4; // Etapas variadas
          return (
            <Card key={inst.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{inst.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">Responsable AulaCore: <strong className="text-slate-800">Soporte Técnico Nivel 2</strong> • Go-Live proyectado: <strong className="text-emerald-700 font-mono">15/08/2026</strong></span>
                </div>
                <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs px-3 py-1">
                  Etapa {currentStep} de 9: {STAGES[currentStep - 1]}
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
        })}
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 8: FACTURACIÓN SAAS
// ==========================================
export function SaasBilling() {
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
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">$253,500,000 COP</span>
          <span className="text-[10px] text-emerald-600 font-bold">100% facturas electrónicas DIAN</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Recaudo Efectivo</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">$241,000,000 COP</span>
          <span className="text-[10px] text-slate-500 font-bold">95.1% tasa de recaudo oportuno</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Cartera en Mora (&gt; 30d)</span>
          <span className="text-2xl font-black text-amber-900 font-mono mt-0.5 block">$12,500,000 COP</span>
          <span className="text-[10px] text-red-600 font-bold">2 Colegios con acuerdo de pago</span>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Últimas Facturas Emitidas</h4>
        <div className="space-y-2 text-xs">
          {[
            { id: 'FAC-2026-089', client: 'Colegio San José de Flores', amount: '$18,500,000 COP', date: '01/06/2026', status: 'Pagado' },
            { id: 'FAC-2026-090', client: 'Gimnasio del Norte K-12', amount: '$24,000,000 COP', date: '02/06/2026', status: 'Pagado' },
            { id: 'FAC-2026-091', client: 'Secretaría Educación Boyacá', amount: '$85,000,000 COP', date: '05/06/2026', status: 'Pagado' },
            { id: 'FAC-2026-092', client: 'Liceo Moderno Campestre', amount: '$12,500,000 COP', date: '15/06/2026', status: 'Pendiente' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-150">
              <div className="space-y-0.5">
                <span className="font-black text-slate-900 block">{inv.id} • {inv.client}</span>
                <span className="text-[10px] text-slate-500">Emisión: {inv.date}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-800 font-mono block">{inv.amount}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inv.status === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
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
          <span className="text-3xl font-black text-emerald-600 font-mono mt-1 block">99.4%</span>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">Tiempos bajo 20 minutos por ticket</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Tickets Activos Hoy</span>
          <span className="text-3xl font-black text-slate-800 font-mono mt-1 block">3 Tickets</span>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">2 en atención, 1 en espera de cliente</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Canal Preferido</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">WhatsApp API</span>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">78% resoluciones en primer contacto</span>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 10: CENTRO GLOBAL DE INTEGRACIONES
// ==========================================
export function SaasIntegrations() {
  const CONNECTORS = [
    { name: 'SIMAT - Ministerio de Educación', version: 'v2.4 (OFICIAL)', status: 'Online', desc: 'Sincronización bidireccional de matrícula escolar oficial.', ping: '42ms' },
    { name: 'DANE - Estadística Educativa', version: 'v1.8 (OFICIAL)', status: 'Online', desc: 'Reportes automatizados de sedes y estadísticas C600.', ping: '68ms' },
    { name: 'SISBEN IV - DNP Colombia', version: 'v3.1 (OFICIAL)', status: 'Online', desc: 'Validación en línea de puntajes para subsidios y PAE.', ping: '35ms' },
    { name: 'WhatsApp Business API (Meta)', version: 'v4.0 (OFICIAL)', status: 'Online', desc: 'Canal oficial de notificaciones y alertas tempranas CAT/MIO.', ping: '18ms' },
    { name: 'OpenAI GPT-4o / Google Gemini', version: 'v2.0 (OFICIAL)', status: 'Online', desc: 'Motores de inteligencia artificial para AulaHelp y recetas MIO.', ping: '110ms' },
    { name: 'Stripe & PSE (Recaudo)', version: 'v3.5 (OFICIAL)', status: 'Online', desc: 'Pasarelas de recaudo para pensiones escolares y facturación SaaS.', ping: '25ms' },
  ];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONNECTORS.map((c, i) => (
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
          <span className="text-2xl font-black text-emerald-600 font-mono block">Latencia: 14 ms</span>
          <span className="text-slate-500 font-semibold block">Conexiones activas: 48 / 500 max</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">Vercel Edge Network (Global CDN)</span>
          <span className="text-2xl font-black text-blue-600 font-mono block">Uptime: 100%</span>
          <span className="text-slate-500 font-semibold block">0 errores 5xx en las últimas 24 horas</span>
        </Card>
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">Almacenamiento S3 Nube</span>
          <span className="text-2xl font-black text-purple-600 font-mono block">18.4 GB de 1 TB</span>
          <span className="text-slate-500 font-semibold block">Respaldos diarios verificados</span>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO 12: AUDITORÍA GLOBAL
// ==========================================
export function SaasAuditLogs() {
  const [logs, setLogs] = useState([
    { id: 'aud-01', time: 'Hoy, 08:45 AM', user: 'superadmin@aulacore.com', action: 'INGRESAR_MODO_SOPORTE', tenant: 'Colegio San José de Flores', details: 'Soporte técnico solicitado por rectoría para verificación de reportes del SIMAT en el periodo 2.' },
    { id: 'aud-02', time: 'Ayer, 04:12 PM', user: 'superadmin@aulacore.com', action: 'CREACION_TENANT', tenant: 'Liceo Moderno Campestre', details: 'Creación exitosa de nuevo inquilino con plan Profesional y 450 cupos habilitados.' },
    { id: 'aud-03', time: '01/07/2026 11:30 AM', user: 'superadmin@aulacore.com', action: 'MODIFICACION_LICENCIA', tenant: 'Gimnasio del Norte K-12', details: 'Ampliación de cupo de estudiantes de 500 a 600 por solicitud de secretaría académica.' },
    { id: 'aud-04', time: '28/06/2026 09:15 AM', user: 'superadmin@aulacore.com', action: 'INGRESAR_MODO_SOPORTE', tenant: 'Secretaría de Educación de Boyacá', details: 'Acompañamiento en la parametrización de reportes territoriales SISBEN IV.' },
  ]);

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
              {logs.map((row) => (
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
              ))}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <h4 className="font-black text-sm text-slate-900 uppercase">1. Tablas de Precios SaaS & Cuotas</h4>
          <p className="text-slate-600 leading-relaxed font-medium">Configuración de montos base por estudiante para planes Free Trial, Básico ($35,000 COP/alumno), Profesional ($48,000 COP/alumno) y Enterprise.</p>
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2 cursor-pointer">
            Gestionar Tarifas
          </Button>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <h4 className="font-black text-sm text-slate-900 uppercase">2. Prompts Maestros & Motores de IA</h4>
          <p className="text-slate-600 leading-relaxed font-medium">Ajuste de variables de system prompt para AulaHelp IA, umbrales predictivos en el CIE y límites de tokens por ejecución.</p>
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2 cursor-pointer">
            Ajustar Prompts IA
          </Button>
        </Card>
      </div>
    </div>
  );
}
