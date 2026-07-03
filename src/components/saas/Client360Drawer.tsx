'use client';

import React, { useState } from 'react';
import { InstitutionData } from '@/providers/auth-provider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Building2, ShieldCheck, Mail, Phone, MapPin, Calendar, Users, 
  Activity, CheckCircle2, AlertCircle, Clock, Award, Briefcase, 
  Cpu, HeartPulse, HelpCircle, ExternalLink, QrCode, HardDrive, 
  Sparkles, FileText, Lock, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Client360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any | null;
  metrics: any;
  onOpenSupportMode: (tenant: any) => void;
  onEditLicense?: (tenant: any) => void;
}

export function Client360Drawer({
  isOpen,
  onClose,
  tenant,
  metrics,
  onOpenSupportMode,
  onEditLicense
}: Client360DrawerProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'comercial' | 'licencia' | 'actividad' | 'soporte'>('general');

  if (!tenant) return null;

  const schoolName = tenant.name || 'Institución sin nombre';
  const logoUrl = tenant.logo_url || '/logo-aulacore.png';
  const status = tenant.subscription_status || 'active';
  const plan = tenant.plan_type || 'profesional';
  const activeModules = tenant.active_modules || [];

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'active':
        return <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase">Cliente Activo</Badge>;
      case 'free_trial':
        return <Badge className="bg-blue-500 text-white font-black text-[10px] uppercase">En Prueba (Demo/Piloto)</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 text-white font-black text-[10px] uppercase">Cuenta Suspendida</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white font-black text-[10px] uppercase">{st}</Badge>;
    }
  };

  const getPlanBadge = (pl: string) => {
    switch (pl) {
      case 'enterprise':
        return <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase border border-purple-400">Enterprise SaaS</Badge>;
      case 'profesional':
        return <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase">Profesional</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white font-black text-[10px] uppercase">Básico / Trial</Badge>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col bg-slate-50 border-l border-slate-200 shadow-2xl overflow-hidden z-[100]">
        
        {/* Cabecera Premium 360 */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-slate-800 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-md shrink-0 overflow-hidden flex items-center justify-center">
                <img src={logoUrl} alt={schoolName} className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(status)}
                  {getPlanBadge(plan)}
                </div>
                <SheetTitle className="text-xl font-black text-white truncate leading-snug" title={schoolName}>
                  {schoolName}
                </SheetTitle>
                <p className="text-xs text-indigo-200 font-mono font-semibold flex items-center gap-2">
                  <span>NIT: {tenant.nit || 'Sin NIT'}</span>
                  <span>•</span>
                  <span>DANE: {tenant.dane_code || 'Sin DANE'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Botón Auditable Modo Soporte en la Cabecera */}
          <div className="mt-5 pt-4 border-t border-indigo-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-900/40 p-3 rounded-2xl border border-indigo-700/50">
            <div className="flex items-center gap-2 text-indigo-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acceso directo con privilegios de fabricante (RBAC y auditoría).</span>
            </div>
            <Button
              onClick={() => onOpenSupportMode(tenant)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Ingresar como cliente (Modo Soporte)
            </Button>
          </div>
        </div>

        {/* Barra de Pestañas 360 */}
        <div className="flex bg-white border-b border-slate-200 overflow-x-auto shrink-0 px-4">
          {[
            { id: 'general', label: '1. Información General', icon: Building2 },
            { id: 'comercial', label: '2. Estado Comercial', icon: Briefcase },
            { id: 'licencia', label: '3. Licencia & Módulos', icon: Award },
            { id: 'actividad', label: '4. Actividad & IA', icon: Cpu },
            { id: 'soporte', label: '5. Soporte & SLA', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 font-extrabold text-[11px] uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSel
                    ? 'border-indigo-600 text-indigo-700 font-black bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenido de las Pestañas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* --- PESTAÑA 1: INFORMACIÓN GENERAL --- */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Datos Físicos y Ubicación
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Dirección Institucional</span>
                    <span className="font-extrabold text-slate-800 mt-0.5 block">{tenant.address || 'Calle 45 # 22-10, Sede Principal'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Ciudad / Municipio</span>
                    <span className="font-extrabold text-slate-800 mt-0.5 block">{tenant.city || 'Bogotá D.C.'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Departamento / Región</span>
                    <span className="font-extrabold text-slate-800 mt-0.5 block">{tenant.department || 'Cundinamarca'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Resolución Oficial</span>
                    <span className="font-extrabold text-slate-800 mt-0.5 block">{tenant.resolution || 'Res. 4829 del 12/04/2018'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Directivas y Contacto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Rector(a)</span>
                    <span className="font-black text-slate-800 mt-0.5 block">{tenant.rector_name || 'Dr. Carlos Eduardo Mendoza'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Secretario(a) Académico(a)</span>
                    <span className="font-black text-slate-800 mt-0.5 block">{tenant.secretary_name || 'Lic. Martha Lucía Gómez'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Teléfono / WhatsApp Directo</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-extrabold text-slate-800">{tenant.phone || '+57 310 458 9021'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Correo Electrónico Oficial</span>
                    <div className="flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-extrabold text-slate-800 truncate">{tenant.email || 'rectoria@colegioaulacore.edu.co'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PESTAÑA 2: ESTADO COMERCIAL --- */}
          {activeTab === 'comercial' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Ciclo de Vida y Pipeline SaaS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className={`p-3 rounded-xl border ${status === 'free_trial' ? 'bg-blue-50 border-blue-300 font-black text-blue-800' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                    <span className="text-[10px] uppercase block font-bold">Fase 1</span>
                    <span className="text-xs block mt-0.5">Demo / Piloto</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${status === 'active' ? 'bg-emerald-50 border-emerald-300 font-black text-emerald-800' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                    <span className="text-[10px] uppercase block font-bold">Fase 2</span>
                    <span className="text-xs block mt-0.5">Cliente Activo</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${status === 'suspended' ? 'bg-red-50 border-red-300 font-black text-red-800' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                    <span className="text-[10px] uppercase block font-bold">Fase 3</span>
                    <span className="text-xs block mt-0.5">Suspendido</span>
                  </div>
                  <div className="p-3 rounded-xl border bg-slate-50 border-slate-150 text-slate-500 font-bold">
                    <span className="text-[10px] uppercase block font-bold">Renovación</span>
                    <span className="text-xs block mt-0.5">Anual Automática</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Ejecutivo Comercial Asignado:</span>
                    <span className="font-extrabold text-slate-800">Eduardo Martínez (KAM Colombia)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Tipo de Cliente:</span>
                    <span className="font-extrabold text-slate-800">{tenant.is_sed ? 'Secretaría de Educación (SED)' : 'Colegio K-12 / Privado o Oficial'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Valor Contrato Estimado:</span>
                    <span className="font-black text-emerald-600 font-mono">$18,500,000 COP / año</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PESTAÑA 3: LICENCIA & MÓDULOS --- */}
          {activeTab === 'licencia' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Parámetros del Contrato SaaS
                  </h4>
                  {onEditLicense && (
                    <Button
                      size="sm"
                      onClick={() => onEditLicense(tenant)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl px-3 py-1 cursor-pointer"
                    >
                      Ajustar Licencia
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Plan Actual</span>
                    <span className="font-black text-indigo-700 text-sm mt-0.5 block capitalize">{plan}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Fecha Inicio</span>
                    <span className="font-black text-slate-800 text-sm mt-0.5 block">{tenant.subscription_start || '01/01/2026'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Fecha Vencimiento</span>
                    <span className="font-black text-emerald-700 text-sm mt-0.5 block">{tenant.subscription_end || '31/12/2026'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Cupo Alumnos</span>
                    <span className="font-black text-slate-800 text-sm mt-0.5 block">{metrics?.students || 450} / 600</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Cupo Docentes</span>
                    <span className="font-black text-slate-800 text-sm mt-0.5 block">{metrics?.teachers || 32} / 50</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Sedes Habilitadas</span>
                    <span className="font-black text-slate-800 text-sm mt-0.5 block">1 Sede Principal</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Módulos Contratados</span>
                  <div className="flex flex-wrap gap-2">
                    {activeModules && activeModules.length > 0 ? (
                      activeModules.map((mod: string) => (
                        <Badge key={mod} className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs py-1 px-3">
                          ✓ {mod.toUpperCase()}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic font-semibold">Todos los módulos estándar activos por defecto</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PESTAÑA 4: ACTIVIDAD & IA --- */}
          {activeTab === 'actividad' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  Telemetría del Inquilino y Uso de IA
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Último Acceso al Sistema</span>
                      <span className="text-sm font-black text-emerald-900 mt-0.5 block">Hoy, hace 14 minutos</span>
                    </div>
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">Sincronización Base Datos</span>
                      <span className="text-sm font-black text-blue-900 mt-0.5 block">Inmediata (Supabase RLS)</span>
                    </div>
                    <HardDrive className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Consumo de Motores Inteligentes</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-bold block">Motor MIO (Recetas)</span>
                      <span className="text-base font-black text-slate-800 mt-1 block">148 Ejecuciones</span>
                      <span className="text-[10px] text-emerald-600 font-bold">100% Exitosas</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-bold block">Motor CIE (Alerta Temprana)</span>
                      <span className="text-base font-black text-slate-800 mt-1 block">24 Alertas Procesadas</span>
                      <span className="text-[10px] text-blue-600 font-bold">4 Casos Prioritarios</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-bold block">AulaHelp IA (Asistente)</span>
                      <span className="text-base font-black text-slate-800 mt-1 block">4,280 Tokens</span>
                      <span className="text-[10px] text-purple-600 font-bold">$0.18 USD Consumidos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PESTAÑA 5: SOPORTE & SLA --- */}
          {activeTab === 'soporte' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Mesa de Ayuda y Cumplimiento SLA
                </h4>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Tickets Abiertos</span>
                    <span className="text-lg font-black text-slate-800 mt-0.5 block">0</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-700 font-bold text-[10px] uppercase block">Tickets Resueltos</span>
                    <span className="text-lg font-black text-emerald-800 mt-0.5 block">12</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-indigo-700 font-bold text-[10px] uppercase block">Cumplimiento SLA</span>
                    <span className="text-lg font-black text-indigo-800 mt-0.5 block font-mono">99.4%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Responsable Técnico AulaCore:</span>
                    <span className="font-extrabold text-slate-800">Ing. Julián Gómez (Soporte Nivel 2)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Tiempo Promedio Respuesta:</span>
                    <span className="font-extrabold text-slate-800">18 minutos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Canal Prioritario:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">WhatsApp Directo + Tickets</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie de página del Drawer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <Button onClick={onClose} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-6 py-2 cursor-pointer">
            Cerrar Ficha 360°
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
