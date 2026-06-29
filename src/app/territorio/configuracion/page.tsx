'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { hasTerritoryPermission, getRbacControlAttrs } from '@/services/territory-rbac';
import { 
  Settings, Save, CheckCircle2, Sliders, Landmark, 
  Image as ImageIcon, Sparkles, Mail, Users2, ShieldCheck, 
  MapPin, ShieldAlert, FileText, ToggleLeft 
} from 'lucide-react';

type TabType = 
  | 'ficha' 
  | 'identidad' 
  | 'umbrales' 
  | 'ia' 
  | 'comunicaciones' 
  | 'funcionarios' 
  | 'territorial' 
  | 'auditoria' 
  | 'licencia';

export default function TerritoryConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ficha');
  const [success, setSuccess] = useState(false);
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');

  // Ficha General States
  const [name, setName] = useState('Secretaría de Educación de Antioquia');
  const [secretary, setSecretary] = useState('Dr. Alejandro Gómez');
  const [email, setEmail] = useState('secretaria.antioquia@sed.gov.co');
  const [phone, setPhone] = useState('+57 4 300-0000');
  const [address, setAddress] = useState('Calle 42B #52-106, Medellín');
  const [municipality, setMunicipality] = useState('Medellín');
  const [department, setDepartment] = useState('Antioquia');
  const [website, setWebsite] = useState('www.sedantioquia.gov.co');
  const [hours, setHours] = useState('Lunes a Viernes: 8:00 AM - 5:00 PM');
  const [nit, setNit] = useState('890.900.286-0');

  // Contactos Directores States
  const [dirCalidad, setDirCalidad] = useState('Dra. Claudia Restrepo');
  const [dirTic, setDirTic] = useState('Ing. Ricardo Vélez');

  // Umbrales States
  const [desercionThreshold, setDesercionThreshold] = useState(15);
  const [healthThreshold, setHealthThreshold] = useState(75);

  // Cargar rol y escuchar simulación
  useEffect(() => {
    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();
    window.addEventListener('rbac-role-changed', updateRole);
    return () => window.removeEventListener('rbac-role-changed', updateRole);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const tabs: { id: TabType; label: string; icon: any; isPlaceholder?: boolean }[] = [
    { id: 'ficha', label: 'Ficha de la Secretaría', icon: Landmark },
    { id: 'identidad', label: 'Identidad e Imagen', icon: ImageIcon },
    { id: 'umbrales', label: 'Umbrales de Alertas', icon: Sliders },
    { id: 'ia', label: 'Motor IA Territorial', icon: Sparkles, isPlaceholder: true },
    { id: 'comunicaciones', label: 'Config. Comunicaciones', icon: Mail, isPlaceholder: true },
    { id: 'funcionarios', label: 'Gestión de Funcionarios', icon: Users2, isPlaceholder: true },
    { id: 'territorial', label: 'Config. Territorial', icon: MapPin, isPlaceholder: true },
    { id: 'auditoria', label: 'Bitácora de Auditoría', icon: FileText, isPlaceholder: true },
    { id: 'licencia', label: 'Licenciamiento AulaCore', icon: ShieldCheck, isPlaceholder: true },
  ];

  // RBAC checks
  const canEditFicha = hasTerritoryPermission(currentRole, 'ajustar_configuracion_secretaria');
  const canEditUmbrales = hasTerritoryPermission(currentRole, 'ajustar_umbrales_alertas');

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Centro de Administración del Portal Territorial
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Parametrización de la entidad gubernamental, gestión de variables del Motor IA y administración de accesos del territorio.
        </p>
      </div>

      {/* Alerta de Éxito */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          Cambios en la configuración del Centro de Administración guardados con éxito.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navegación Lateral Interna */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between font-bold text-xs cursor-pointer border transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </div>
                {tab.isPlaceholder && (
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-105 text-slate-400'
                  }`}>
                    Próx
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel de Contenido */}
        <div className="lg:col-span-3">
          {activeTab === 'ficha' && (
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
              <form onSubmit={handleSave}>
                <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
                  <CardTitle className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-indigo-655" />
                    Ficha Técnica de la Secretaría de Educación
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
                    Gestione la información general y los directores administrativos de la entidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {!canEditFicha && (
                    <div className="bg-amber-50 border border-amber-205 p-3 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                      Visualización de solo lectura. Su rol ({currentRole}) no permite modificar esta ficha.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nombre Oficial</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 disabled:bg-slate-55"
                      />
                    </div>
                    {/* NIT */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">NIT</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={nit}
                        onChange={(e) => setNit(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-805 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 disabled:bg-slate-55"
                      />
                    </div>
                    {/* Dirección */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Dirección Sede Principal</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 disabled:bg-slate-55"
                      />
                    </div>
                    {/* Teléfono */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>
                    {/* Municipio */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Municipio</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>
                    {/* Departamento */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Departamento</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>
                    {/* Correo */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Correo Electrónico Institucional</label>
                      <input
                        type="email"
                        required
                        disabled={!canEditFicha}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono disabled:bg-slate-55"
                      />
                    </div>
                    {/* Web */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Sitio Web Oficial</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>

                    {/* SECCIÓN ADMINISTRATIVA */}
                    <div className="md:col-span-2 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black uppercase text-indigo-755 tracking-wider mb-3">Información de Liderazgo y Contacto Directo</h4>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Secretario de Educación</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={secretary}
                        onChange={(e) => setSecretary(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Director de Calidad</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={dirCalidad}
                        onChange={(e) => setDirCalidad(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Director de Tecnología / TIC</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditFicha}
                        value={dirTic}
                        onChange={(e) => setDirTic(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-55"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      {...getRbacControlAttrs(currentRole, 'ajustar_configuracion_secretaria')}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      Guardar Ficha
                    </button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

          {activeTab === 'identidad' && (
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-6 space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Identidad e Imagen Institucional</h3>
                <p className="text-xs text-slate-450 mt-1 font-semibold">Cargue los símbolos oficiales de la entidad para membretes y reportes.</p>
              </div>

              {!canEditFicha && (
                <div className="bg-amber-50 border border-amber-205 p-3 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  Operación no autorizada. Su rol ({currentRole}) no permite modificar la identidad de marca de la Secretaría.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div className="p-6 border border-dashed border-slate-250 rounded-2xl text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Logo de la Secretaría</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Formatos recomendados: PNG transparent (Max 2MB)</span>
                  </div>
                  <button 
                    disabled={!canEditFicha}
                    onClick={() => alert('Carga simulada de Logo...')} 
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Seleccionar Archivo
                  </button>
                </div>

                {/* Escudo */}
                <div className="p-6 border border-dashed border-slate-250 rounded-2xl text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-405 mx-auto">
                    <Landmark className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Escudo Institucional (Gobernación/Alcaldía)</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Formatos recomendados: SVG o PNG (Max 2MB)</span>
                  </div>
                  <button 
                    disabled={!canEditFicha}
                    onClick={() => alert('Carga simulada de Escudo...')} 
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'umbrales' && (
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-6 space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Umbrales de Alertas Predictivas (IA)</h3>
                <p className="text-xs text-slate-455 mt-1 font-semibold">Regule la sensibilidad de las alarmas automatizadas de deserción y madurez digital del territorio.</p>
              </div>

              {!canEditUmbrales && (
                <div className="bg-amber-50 border border-amber-205 p-3 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  Acceso Restringido. Su rol ({currentRole}) no permite modificar los umbrales de alerta del Motor IA.
                </div>
              )}

              <div className="space-y-6">
                {/* Deserción */}
                <div className={`space-y-2 ${!canEditUmbrales ? 'opacity-60 pointer-events-none' : ''}`}>
                  <div className="flex justify-between text-xs font-bold text-slate-705">
                    <span>Ausentismo disparador de Deserción Escolar:</span>
                    <span className="text-indigo-650 font-black">{desercionThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    disabled={!canEditUmbrales}
                    value={desercionThreshold}
                    onChange={(e) => setDesercionThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-655"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold block leading-relaxed">
                    Si un estudiante sobrepasa este porcentaje de inasistencias en el periodo lectivo, se emitirá una alerta de deserción al portal.
                  </span>
                </div>

                {/* Health Score */}
                <div className={`space-y-2 pt-4 border-t border-slate-100 ${!canEditUmbrales ? 'opacity-60 pointer-events-none' : ''}`}>
                  <div className="flex justify-between text-xs font-bold text-slate-705">
                    <span>Límite Crítico del Health Score (Madurez Digital):</span>
                    <span className="text-indigo-650 font-black">{healthThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="1"
                    disabled={!canEditUmbrales}
                    value={healthThreshold}
                    onChange={(e) => setHealthThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-655"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold block leading-relaxed">
                    Los colegios con puntajes de adopción de herramientas digitales inferiores a este límite se marcarán en color rojo en la consola.
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Placeholder Tabs de Opciones de Navegación Futura */}
          {['ia', 'comunicaciones', 'funcionarios', 'territorial', 'auditoria', 'licencia'].includes(activeTab) && (
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-655 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
                <Sparkles className="w-6 h-6 animate-pulse text-indigo-600" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {activeTab === 'ia' ? 'Configuración del Motor de Inteligencia (IA)' :
                   activeTab === 'comunicaciones' ? 'Configuración de Canales de Comunicación' :
                   activeTab === 'funcionarios' ? 'Consola de Gestión de Funcionarios' :
                   activeTab === 'territorial' ? 'Configuración Geográfica y Territorial' :
                   activeTab === 'auditoria' ? 'Registro de Auditoría e Inmutabilidad' :
                   'Gestión de Licenciamiento y Facturación'}
                </h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  Esta consola de administración avanzada está en planificación de arquitectura. La navegación ha sido preparada y se conectará en el desarrollo de la siguiente fase del Ecosistema Territorial.
                </p>
                <div className="pt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    Módulo de Expansión Próximamente
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
