'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, Globe, Shield, Sparkles, Plus, AlertCircle, 
  CheckCircle2, ArrowLeft, Paintbrush, Layers, Check 
} from 'lucide-react';

export default function NuevoColegioPage() {
  const { roles } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slogan, setSlogan] = useState('Educación de Excelencia para el Futuro');
  const [nit, setNit] = useState('');
  const [daneCode, setDaneCode] = useState('');
  const [resolution, setResolution] = useState('');
  const [legalNature, setLegalNature] = useState('Privada');
  const [rectorName, setRectorName] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [sidebarColor, setSidebarColor] = useState('slate-900');
  const [planType, setPlanType] = useState('free_trial');
  const [activeModules, setActiveModules] = useState<string[]>(['onboarding']);
  const [logoUrl, setLogoUrl] = useState('');

  // Access Control check
  const isSuperAdmin = (roles as string[])?.includes('super_admin') || false;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto generate slug
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  const handleModuleToggle = (mod: string) => {
    if (activeModules.includes(mod)) {
      setActiveModules(activeModules.filter(m => m !== mod));
    } else {
      setActiveModules([...activeModules, mod]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('El nombre y el slug de la institución son obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Insert new institution
      const newInst = {
        name,
        slug,
        slogan,
        nit: nit || null,
        dane_code: daneCode || null,
        resolution: resolution || null,
        legal_nature: legalNature,
        rector_name: rectorName || null,
        secretary_name: secretaryName || null,
        primary_color: primaryColor,
        sidebar_color: sidebarColor,
        plan_type: planType,
        subscription_status: 'active',
        active_modules: activeModules,
        logo_url: logoUrl || null
      };

      const { data: instData, error: instError } = await supabase
        .from('institutions')
        .insert([newInst])
        .select()
        .single();

      if (instError || !instData) {
        throw new Error(instError?.message || 'Error al guardar la institución.');
      }

      const newInstId = instData.id;

      // 2. Insert Default Academic Settings
      const { error: settingsError } = await supabase
        .from('institution_academic_settings')
        .insert([{
          institution_id: newInstId,
          grading_scale_type: 'numeric_1_5',
          min_passing_grade: 3.00,
          min_attendance_percentage: 80.00,
          decimal_places: 2,
          average_calculation_type: 'weighted_periods',
          allow_recovery: true,
          recovery_max_grade: 3.00,
          country: 'Colombia',
          calendar_type: 'calendar_a'
        }]);

      if (settingsError) {
        console.error('Error insertando configuraciones académicas:', settingsError);
      }

      // 3. Insert Active Academic Year
      const { data: yearData, error: yearError } = await supabase
        .from('academic_years')
        .insert([{
          institution_id: newInstId,
          year: new Date().getFullYear(),
          is_active: true
        }])
        .select()
        .single();

      if (yearError) {
        console.error('Error insertando año lectivo:', yearError);
      }

      // 4. Insert Default Periods
      if (yearData) {
        const defaultPeriods = [
          { academic_year_id: yearData.id, name: 'Primer Periodo', code: 'P1', start_date: '2026-01-15', end_date: '2026-04-15', weight: 30.00, status: 'closed' },
          { academic_year_id: yearData.id, name: 'Segundo Periodo', code: 'P2', start_date: '2026-04-16', end_date: '2026-08-15', weight: 30.00, status: 'active' },
          { academic_year_id: yearData.id, name: 'Tercer Periodo', code: 'P3', start_date: '2026-08-16', end_date: '2026-11-25', weight: 40.00, status: 'inactive' }
        ];
        const { error: periodsError } = await supabase
          .from('academic_periods')
          .insert(defaultPeriods);
        
        if (periodsError) {
          console.error('Error insertando periodos:', periodsError);
        }
      }

      setSuccess(true);
      // Clean form
      setName('');
      setSlug('');
      setRectorName('');
      setNit('');
      setDaneCode('');
      setResolution('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al aprovisionar el colegio.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto mt-12 border-red-200 bg-white p-6 text-center shadow-lg rounded-2xl">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Acceso Restringido</h3>
          <p className="text-sm text-slate-500 mt-2">
            Solo los administradores globales (Super Admins) de AulaCore pueden dar de alta nuevas instituciones piloto.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-4 rounded-xl">
            Volver al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => router.push('/configuracion/saas')} 
          className="rounded-xl px-3 py-1.5 text-xs text-slate-600 border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Volver a SaaS
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dar de Alta Colegio Piloto</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Asistente de aprovisionamiento de Tenant en caliente</p>
        </div>
      </div>

      {success && (
        <Card className="border-emerald-200 bg-emerald-50/50 p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-sm">Colegio aprovisionado con éxito</h3>
              <p className="text-xs text-emerald-700 mt-1 max-w-xl">
                Se ha creado el inquilino en la base de datos de AulaCore. Hemos configurado automáticamente sus reglas de negocio iniciales, escala de calificación, año escolar vigente 2026 y tres periodos académicos predeterminados.
              </p>
              <div className="mt-4 flex gap-3">
                <Button 
                  onClick={() => setSuccess(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl border-none cursor-pointer"
                >
                  Registrar Otro Colegio
                </Button>
                <Button 
                  onClick={() => router.push('/configuracion/saas')}
                  variant="outline"
                  className="text-emerald-800 border-emerald-300 hover:bg-emerald-100 text-xs font-bold px-4 py-1.5 rounded-xl"
                >
                  Ir a Consola SaaS
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50/50 p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 text-sm">Error al aprovisionar</h3>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Datos de Registro y Firma */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 py-4.5 bg-slate-50/30">
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              1. Identidad Legal y Registros Oficiales
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500">
              Complete los nombres legales e identificadores gubernamentales del plantel.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nombre de la Institución *</label>
              <input 
                type="text" 
                value={name} 
                onChange={handleNameChange} 
                required 
                placeholder="Ej. Gimnasio Campestre AulaCore"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Slug (Autogenerado) *</label>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                required 
                placeholder="ej-colegio-campestre-aulacore"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Eslogan Institucional</label>
              <input 
                type="text" 
                value={slogan} 
                onChange={(e) => setSlogan(e.target.value)} 
                placeholder="Ej. Liderazgo y Ciencia para el Futuro"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Naturaleza Jurídica</label>
              <select 
                value={legalNature} 
                onChange={(e) => setLegalNature(e.target.value)} 
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="Privada">Privada (Colegio Privado)</option>
                <option value="Pública">Pública (I.E. Oficial)</option>
                <option value="Cooperativa">Cooperativa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">NIT de la Institución</label>
              <input 
                type="text" 
                value={nit} 
                onChange={(e) => setNit(e.target.value)} 
                placeholder="Ej. 900.123.456-7"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Código DANE Oficial</label>
              <input 
                type="text" 
                value={daneCode} 
                onChange={(e) => setDaneCode(e.target.value)} 
                placeholder="Ej. 111001012345"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Resolución de Funcionamiento</label>
              <input 
                type="text" 
                value={resolution} 
                onChange={(e) => setResolution(e.target.value)} 
                placeholder="Ej. Resolución 1234 del 12 de Octubre de 2022 - MinEducación"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nombre del Rector(a)</label>
              <input 
                type="text" 
                value={rectorName} 
                onChange={(e) => setRectorName(e.target.value)} 
                placeholder="Ej. Dra. Mariana Restrepo"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nombre del Secretario(a) Académico</label>
              <input 
                type="text" 
                value={secretaryName} 
                onChange={(e) => setSecretaryName(e.target.value)} 
                placeholder="Ej. Dr. Carlos Mario Hoyos"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Branding Visual */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 py-4.5 bg-slate-50/30">
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-indigo-600" />
              2. Branding e Identidad Visual
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500">
              Configure la paleta de colores y el logotipo para el branding independiente.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Color Primario (Tema de Interfaz) *</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="w-10 h-10 p-0 border border-slate-200 rounded-lg cursor-pointer bg-transparent"
                />
                <input 
                  type="text" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="flex-1 text-xs font-mono font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Color Barra Lateral (Sidebar)</label>
              <select 
                value={sidebarColor} 
                onChange={(e) => setSidebarColor(e.target.value)} 
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="slate-900">Slate Dark (Original)</option>
                <option value="indigo-950">Indigo Dark</option>
                <option value="emerald-950">Emerald Dark</option>
                <option value="zinc-950">Zinc Black</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">URL del Logotipo Principal (.png / .jpg)</label>
              <input 
                type="text" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)} 
                placeholder="Ej. https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format"
                className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Deje en blanco para usar el logotipo oficial de AulaCore por defecto.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Licencia y Módulos Activos */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 py-4.5 bg-slate-50/30">
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              3. Esquema de Licencia y Control de Módulos (SaaS)
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500">
              Asigne el nivel de plan y active los módulos autorizados bajo contrato.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Plan de Licencia Contratado *</label>
                <select 
                  value={planType} 
                  onChange={(e) => setPlanType(e.target.value)} 
                  className="w-full text-xs font-semibold text-slate-850 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="free_trial">Prueba Gratuita (Free Trial)</option>
                  <option value="basic">Plan Básico (Basic)</option>
                  <option value="premium">Plan Premium</option>
                  <option value="enterprise">Plan Corporativo (Enterprise)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Módulos Habilitados en Licencia
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: 'onboarding', label: 'Centro de Migración & Onboardings', desc: 'Permite carga masiva e invitaciones a docentes y alumnos' },
                  { id: 'pei', label: 'Gestión Institucional (PEI)', desc: 'Asistente IA para formulación de Proyecto Educativo' },
                  { id: 'pae', label: 'Módulo de Alimentación (PAE)', desc: 'Seguimiento financiero, minutas y entregas del PAE' },
                  { id: 'rfid', label: 'Control RFID / Asistencia QR', desc: 'Registro de ingresos inteligentes mediante hardware/QR' },
                ].map((mod) => {
                  const isChecked = activeModules.includes(mod.id);
                  return (
                    <div 
                      key={mod.id} 
                      onClick={() => handleModuleToggle(mod.id)}
                      className={`p-3.5 border rounded-2xl cursor-pointer select-none transition-all duration-200 flex gap-3 items-start ${
                        isChecked 
                          ? 'border-indigo-650 bg-indigo-50/40 shadow-sm' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800">{mod.label}</span>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 py-4.5 px-6 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.push('/configuracion/saas')} 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Aprovisionando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear Institución
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
