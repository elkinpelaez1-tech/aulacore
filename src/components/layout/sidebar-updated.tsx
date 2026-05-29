'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NAVIGATION_MENUS, UserRole } from '@/lib/navigation';

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuItems = NAVIGATION_MENUS[userRole];

  // Dynamic branding states
  const [logoUrl, setLogoUrl] = useState('/logo-aulacore.png');
  const [schoolName, setSchoolName] = useState('AulaCore');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aulacore-institucion-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.logoPrincipal && parsed.logoPrincipal !== 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120') {
          setLogoUrl(parsed.logoPrincipal);
          setIsCustom(true);
        }
        if (parsed.name && parsed.name !== 'Gimnasio Campestre AulaCore') {
          setSchoolName(parsed.name);
          setIsCustom(true);
        }
      } catch (e) {
        console.error('Error loading institutional settings in sidebar', e);
      }
    }
  }, []);

  return (
    <aside className="w-60 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-50 flex flex-col h-screen border-r border-slate-800 shadow-xl select-none">
      {/* Logo Section */}
      <div className="px-4.5 py-5 border-b border-slate-250 bg-white flex items-center justify-start shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[88px]">
        <Link href="/dashboard" className="flex items-center hover:opacity-95 transition-opacity w-full">
          {isCustom ? (
            <div className="flex items-center gap-3 w-full overflow-hidden">
              <img 
                src={logoUrl} 
                alt={schoolName} 
                className="h-12 w-12 rounded-xl object-cover bg-white border border-slate-100 shadow-sm select-none shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-aulacore.png';
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-black text-slate-900 tracking-tight leading-snug truncate" title={schoolName}>
                  {schoolName}
                </span>
                <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-widest leading-none mt-1">
                  AulaCore
                </span>
              </div>
            </div>
          ) : (
            <img 
              src="/logo-aulacore.png" 
              alt="AulaCore Logo" 
              className="h-9 w-auto object-contain max-w-full select-none"
            />
          )}
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // Check query parameters to highlight correct tab for padre_familia
          const itemPathname = item.href.split('?')[0];
          const itemTab = item.href.includes('?tab=') ? item.href.split('?tab=')[1] : null;
          const currentTab = searchParams.get('tab') || 'actividad';
          
          const isActive = userRole === 'padre_familia'
            ? (pathname === itemPathname && (!itemTab || itemTab === currentTab))
            : (pathname === item.href || pathname.startsWith(item.href + '/'));

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 px-4 py-2.5 h-10 transition-all duration-200 rounded-lg font-semibold text-slate-300',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/10 transform-gpu scale-100'
                    : 'hover:bg-slate-800/40 hover:text-slate-100'
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors duration-200", isActive ? "text-white" : "text-slate-400")} />
                <span className="flex-1 text-left text-sm font-semibold truncate">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold shadow-sm">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-80" />}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800 bg-slate-950/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-2.5 h-10 text-slate-350 hover:bg-slate-800/40 hover:text-slate-100 rounded-lg font-semibold transition"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-semibold">Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
}
