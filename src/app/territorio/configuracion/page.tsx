'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Settings, Save, CheckCircle2, ShieldAlert, Sliders, 
  Landmark, Image as ImageIcon, ToggleLeft, Sparkles, 
  Mail, Users2, ShieldCheck, ClipboardList 
} from 'lucide-react';

type TabType = 'ficha' | 'identidad' | 'parametros' | 'umbrales' | 'ia' | 'comunicaciones' | 'funcionarios' | 'licencia';

export default function TerritoryConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ficha');
  const [success, setSuccess] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const tabs: { id: TabType; label: string; icon: any; isPlaceholder?: boolean }[] = [
    { id: 'ficha', label: 'Ficha de la Secretaría', icon: Landmark },
    { id: 'identidad', label: 'Identidad e Imagen', icon: ImageIcon },
    { id: 'umbrales', label: 'Umbrales de Alertas', icon: Sliders },
    { id: 'parametros', label: 'Parámetros Generales', icon: Settings, isPlaceholder: true },
    { id: 'ia', label: 'Motor de Inteligencia', icon: Sparkles, isPlaceholder: true },
    { id: 'comunicaciones', label: 'Comunicaciones', icon: Mail, isPlaceholder: true },
    { id: 'funcionarios', label: 'Gestión de Funcionarios', icon: Users2, isPlaceholder: true },
    { id: 'licencia', label: 'Auditoría y Licencia', icon: ShieldCheck, isPlaceholder: true },
  ];

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
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-400'
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
                  <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-indigo-650" />
                    Ficha Técnica de la Secretaría de Educación
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
                    Gestione la información general y los directores administrativos de la entidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nombre Oficial</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {/* NIT */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">NIT</label>
                      <input
                        type="text"
                        required
                        value={nit}
                        onChange={(e) => setNit(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-805 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {/* Dirección */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Dirección Sede Principal</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {/* Teléfono */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    {/* Municipio */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Municipio</label>
                      <input
                        type="text"
                        required
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    {/* Departamento */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Departamento</label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    {/* Correo */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Correo Electrónico Institucional</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                      />
                    </div>
                    {/* Web */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Sitio Web Oficial</label>
                      <input
                        type="text"
                        required
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    {/* Horario */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Horario de Atención al Público</label>
                      <input
                        type="text"
                        required
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* SECCIÓN ADMINISTRATIVA */}
                    <div className="md:col-span-2 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wider mb-3">Información de Liderazgo y Contacto Directo</h4>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Secretario de Educación</label>
                      <input
                        type="text"
                        required
                        value={secretary}
                        onChange={(e) => setSecretary(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Director de Calidad</label>
                      <input
                        type="text"
                        required
                        value={dirCalidad}
                        onChange={(e) => setDirCalidad(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Director de Tecnología / TIC</label>
                      <input
                        type="text"
                        required
                        value={dirTic}
                        onChange={(e) => setDirTic(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer border-none"
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
                  <button onClick={() => alert('Carga simulada de Logo...')} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
                    Seleccionar Archivo
                  </button>
                </div>

                {/* Escudo */}
                <div className="p-6 border border-dashed border-slate-250 rounded-2xl text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                    <Landmark className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Escudo Institucional (Gobernación/Alcaldía)</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Formatos recomendados: SVG o PNG (Max 2MB)</span>
                  </div>
                  <button onClick={() => alert('Carga simulada de Escudo...')} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
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
                <p className="text-xs text-slate-450 mt-1 font-semibold">Regule la sensibilidad de las alarmas automatizadas de deserción y madurez digital del territorio.</p>
              </div>

              <div className="space-y-6">
                {/* Deserción */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Ausentismo disparador de Deserción Escolar:</span>
                    <span className="text-indigo-650 font-black">{desercionThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={desercionThreshold}
                    onChange={(e) => setDesercionThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold block leading-relaxed">
                    Si un estudiante sobrepasa este porcentaje de inasistencias en el periodo lectivo, se emitirá una alerta de deserción al portal.
                  </span>
                </div>

                {/* Health Score */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Límite Crítico del Health Score (Madurez Digital):</span>
                    <span className="text-indigo-650 font-black">{healthThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="1"
                    value={healthThreshold}
                    onChange={(e) => setHealthThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold block leading-relaxed">
                    Los colegios con puntajes de adopción de herramientas digitales inferiores a este límite se marcarán en color rojo en la consola.
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Placeholder Tabs */}
          {['parametros', 'ia', 'comunicaciones', 'funcionarios', 'licencia'].includes(activeTab) && (
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Módulo en Planificación Estratégica</h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  Esta pestaña forma parte de la ampliación administrativa del Centro de Configuración y está preparada para integrarse en la siguiente fase de desarrollo.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
