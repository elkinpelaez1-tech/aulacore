'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { 
  Search, Bell, User, MapPin, Sparkles, ChevronDown, 
  Settings, Key, LogOut, Info, ShieldCheck, Calendar, Users2, Landmark,
  ShieldAlert, Mail, Phone, Lock
} from 'lucide-react';

export function TerritoryHeader() {
  const router = useRouter();
  const { allInstitutions, overrideInstitutionId } = useAuth();
  
  // States for dropdowns and modals
  const [profileOpen, setProfileOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Secretario de Educación');
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Leer cargo inicial de sessionStorage (simulación local interactiva) o de user_roles
  useEffect(() => {
    const saved = sessionStorage.getItem('simulated_role');
    if (saved) {
      setSelectedRole(saved);
    } else {
      async function fetchUserRole() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .limit(1)
              .single();
            
            if (data?.role) {
              const roleLabels: Record<string, string> = {
                rector: 'Rector Principal',
                docente: 'Docente Territorial',
                secretario_educacion: 'Secretario de Educación',
                director_calidad: 'Director de Calidad',
                director_tic: 'Director TIC',
                director_cobertura: 'Director de Cobertura',
              };
              const label = roleLabels[data.role] || data.role;
              setSelectedRole(label);
              sessionStorage.setItem('simulated_role', label);
            }
          }
        } catch (e) {
          // Ignorar silenciosamente
        }
      }
      fetchUserRole();
    }
  }, []);

  // Manejar cambio de rol
  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    sessionStorage.setItem('simulated_role', newRole);
    // Lanzar evento personalizado para actualizar el resto de vistas de inmediato
    window.dispatchEvent(new Event('rbac-role-changed'));
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSimulatedInst = allInstitutions.find(i => i.id === overrideInstitutionId);
  const isSecretaria = activeSimulatedInst?.organization_type === 'secretaria';

  const orgName = isSecretaria 
    ? activeSimulatedInst.name 
    : 'Secretaría de Educación de Antioquia';
  
  const orgLocation = isSecretaria
    ? `${activeSimulatedInst.municipality || 'Medellín'}, ${activeSimulatedInst.department || 'Antioquia'}`
    : 'Medellín, Antioquia';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs relative z-30">
      {/* Left: Territory Title and Location (Click opens Organization modal) */}
      <button 
        onClick={() => setOrgOpen(true)}
        className="flex items-center gap-3 min-w-0 hover:bg-slate-50 p-1.5 rounded-xl transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        title="Ver Ficha de la Secretaría"
      >
        <MapPin className="w-4.5 h-4.5 text-indigo-650 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xs font-black text-slate-800 uppercase tracking-wider truncate flex items-center gap-1.5">
            {orgName}
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </h1>
          <span className="text-[9px] text-slate-455 font-bold uppercase tracking-wider block mt-0.5">
            Jurisdicción: {orgLocation}
          </span>
        </div>
      </button>

      {/* Middle: Search bar (Simulated) */}
      <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 max-w-xs transition-all duration-200 focus-within:border-indigo-500 focus-within:bg-white">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar instituciones, códigos DANE..."
          className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Right: Notifications, Active Role & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notifications (Simulated) */}
        <button className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 border-l border-slate-200 pl-4 py-1 hover:opacity-85 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <span className="text-xs font-black text-slate-850 block truncate">
                Dr. Alejandro Gómez
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                {selectedRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="font-extrabold text-slate-800 block truncate">Dr. Alejandro Gómez</span>
                <span className="text-[10px] text-slate-450 block truncate">a.gomez@sed.gov.co</span>
              </div>

              {/* Simulación del Cambiador de Rol Territorial */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-2 block mb-1">Simular Vista de Cargo:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full text-[10px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                >
                  <option value="Secretario de Educación">Secretario de Educación</option>
                  <option value="Director de Calidad">Director de Calidad</option>
                  <option value="Director TIC">Director TIC</option>
                  <option value="Director de Cobertura">Director de Cobertura</option>
                  <option value="Inspección y Vigilancia">Inspección y Vigilancia</option>
                </select>
              </div>

               <button onClick={() => { setProfileModalOpen(true); setProfileOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-2 border-none bg-transparent cursor-pointer">
                <User className="w-4 h-4 text-slate-455" />
                Mi perfil
              </button>
              <button onClick={() => { router.push('/territorio/configuracion'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-2 border-none bg-transparent cursor-pointer">
                <Settings className="w-4 h-4 text-slate-455" />
                Configuración
              </button>
              <button onClick={() => { setPasswordModalOpen(true); setProfileOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-2 border-none bg-transparent cursor-pointer">
                <Key className="w-4 h-4 text-slate-455" />
                Cambiar contraseña
              </button>
              <button onClick={() => { router.push('/login'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 font-black text-rose-650 flex items-center gap-2 border-t border-slate-100 pt-2 mt-1 border-none bg-transparent cursor-pointer">
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🏛️ MODAL DE PERFIL CORPORATIVO DE LA ORGANIZACIÓN */}
      <Modal
        isOpen={orgOpen}
        onClose={() => setOrgOpen(false)}
        title={orgName}
        subtitle="Perfil Corporativo de la Organización"
        sizeClassName="max-w-3xl"
        footer={
          <button
            onClick={() => setOrgOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer border-none text-xs"
          >
            Entendido
          </button>
        }
      >
        <div className="space-y-6">
          {/* Bloque 1: Información Corporativa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Municipio Base</span>
              <span className="text-sm font-extrabold text-slate-800 block">{orgLocation}</span>
            </div>
            <div className="p-4 bg-indigo-50/20 border border-indigo-150 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black text-indigo-550 uppercase tracking-wider">Licencia AulaCore</span>
              <span className="text-sm font-extrabold text-indigo-900 block flex items-center justify-center gap-1">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                Corporativa Activa
              </span>
            </div>
            <div className="p-4 bg-purple-50/20 border border-purple-150 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black text-purple-550 uppercase tracking-wider">Health Score Territorial</span>
              <span className="text-sm font-extrabold text-purple-900 block">85.4% Promedio</span>
            </div>
          </div>

          {/* Estructura Operativa (Placeholders Preparados) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Organigrama y Funcionarios */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-indigo-650" />
                Funcionarios y Estructura
              </h4>
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/30 space-y-2 text-slate-550 font-semibold">
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-slate-100">
                  <span className="font-extrabold text-slate-700">Dr. Alejandro Gómez</span>
                  <span>Secretario de Educación</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-slate-100">
                  <span className="font-extrabold text-slate-700">Dra. Claudia Restrepo</span>
                  <span>Directora de Calidad</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-slate-700">Ing. Ricardo Vélez</span>
                  <span>Director TIC</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold pt-2 italic text-center">
                  [Estructura completa de organigrama y jerarquías configurable en fase posterior]
                </div>
              </div>
            </div>

            {/* Historial de Auditoría de Acceso */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-650" />
                Licencia y Auditoría General
              </h4>
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/30 space-y-2 text-slate-550 font-semibold">
                <div className="flex justify-between text-[11px]">
                  <span>Vencimiento Licencia:</span>
                  <span className="font-extrabold text-slate-700">Diciembre 31, 2028</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Último acceso auditoría:</span>
                  <span className="font-extrabold text-slate-700">Hoy 10:24 AM</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Colegios Adscritos:</span>
                  <span className="font-extrabold text-slate-700">48 Colegios Oficiales</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold pt-2 italic text-center">
                  [Registro de auditoría inmutable e inyectable de Supabase]
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 👤 MODAL DE MI PERFIL */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Mi Perfil de Usuario"
        subtitle="AulaCore Gestión de Identidad"
        footer={
          <button
            onClick={() => setProfileModalOpen(false)}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer text-xs border-none"
          >
            Cerrar
          </button>
        }
      >
        <div className="space-y-4 text-xs font-semibold text-slate-750">
          <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner shrink-0">
              AG
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Dr. Alejandro Gómez</h4>
              <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider block mt-1 w-fit">
                {selectedRole}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Correo Institucional</span>
                <span className="text-slate-800">a.gomez@sed.gov.co</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Teléfono de Contacto</span>
                <span className="text-slate-800">+57 (300) 456-7890</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Landmark className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Entidad Territorial</span>
                <span className="text-slate-800">Gobernación de Antioquia - Secretaría de Educación</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Firma Digital Autorizada</span>
                <span className="text-emerald-700 font-bold">Certificado Homologado Vigente (SHA-256)</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 🔑 MODAL DE CAMBIAR CONTRASEÑA */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Cambiar Contraseña"
        subtitle="AulaCore Seguridad"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-xs cursor-pointer text-slate-700 bg-white"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                alert('Contraseña modificada con éxito.');
                setPasswordModalOpen(false);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer border-none"
            >
              Guardar Contraseña
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Contraseña Actual</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Min. 8 caracteres"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Verifique su contraseña"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
