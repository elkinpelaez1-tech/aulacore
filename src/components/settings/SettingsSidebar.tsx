'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Wand2, 
  Building2, 
  Users, 
  Settings2, 
  GraduationCap, 
  CreditCard, 
  Activity,
  Blocks,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

const BASE_MENU_GROUPS = [
  {
    label: 'Auto-Onboarding',
    items: [
      { name: 'Automatización & Links', href: '/configuracion/automatizacion', icon: Wand2 },
      { name: 'Matrícula & Acudientes', href: '/configuracion/matricula', icon: UserPlus },
      { name: 'Onboarding Docentes', href: '/configuracion/docentes', icon: GraduationCap },
    ]
  },
  {
    label: 'Estructura Institucional',
    items: [
      { name: 'Datos de Institución', href: '/configuracion/institucion', icon: Building2 },
      { name: 'Sedes & Jornadas', href: '/configuracion/sedes', icon: Blocks },
      { name: 'Roles & Permisos', href: '/configuracion/roles', icon: ShieldCheck },
    ]
  },
  {
    label: 'Operaciones Inteligentes',
    items: [
      { name: 'Configuración Académica', href: '/configuracion/mallas', icon: Settings2 },
      { name: 'Dispositivos RFID', href: '/configuracion/rfid', icon: Activity },
      { name: 'Integraciones B2B', href: '/configuracion/integraciones', icon: Users },
      { name: 'Facturación y Pagos', href: '/configuracion/facturacion', icon: CreditCard },
    ]
  }
];

export function SettingsSidebar() {
  const pathname = usePathname();

  const menuGroups = [...BASE_MENU_GROUPS];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-theme(spacing.16))] flex flex-col py-6 px-4">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Configuración</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Centro de Automatización</p>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto max-h-[calc(100vh-280px)]">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              {group.label}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                       href={item.href}
                       className={cn(
                         "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 group",
                         isActive 
                           ? "bg-indigo-50 text-indigo-700" 
                           : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                       )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                      )} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Mini status indicator */}
      <div className="mt-8 pt-6 border-t border-slate-100 px-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Motor IA Activo</span>
        </div>
      </div>
    </aside>
  );
}
