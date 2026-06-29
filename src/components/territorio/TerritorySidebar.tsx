'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, Building2, Users, Award, Briefcase, 
  TrendingUp, Laptop, HardDrive, Megaphone, 
  Calendar, FileText, Settings, Sparkles
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roleRestricted?: string[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Inicio (Resumen)', href: '/territorio', icon: Globe },
  { name: 'Instituciones Educativas', href: '/territorio/instituciones', icon: Building2 },
  { name: 'Cobertura Educativa', href: '/territorio/cobertura', icon: Users },
  { name: 'Calidad Educativa', href: '/territorio/calidad', icon: Award },
  { name: 'Talento Humano', href: '/territorio/talento-humano', icon: Briefcase },
  { name: 'Analítica Territorial', href: '/territorio/analitica', icon: TrendingUp },
  { name: 'Transformación Digital', href: '/territorio/transformacion-digital', icon: Laptop },
  { name: 'Infraestructura & PAE', href: '/territorio/infraestructura', icon: HardDrive },
  { name: 'Comunicaciones', href: '/territorio/comunicaciones', icon: Megaphone },
  { name: 'Agenda Territorial', href: '/territorio/agenda', icon: Calendar },
  { name: 'Reportes Consolidados', href: '/territorio/reportes', icon: FileText },
  { name: 'Configuración', href: '/territorio/configuracion', icon: Settings },
];

export function TerritorySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-650 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-900/40">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-black text-white tracking-wider uppercase block">
            AulaCore
          </span>
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mt-0.5">
            Portal Territorial
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-center">
        <span className="text-[10px] text-slate-500 font-bold block">
          AulaCore Territorial v1.3
        </span>
      </div>
    </aside>
  );
}
