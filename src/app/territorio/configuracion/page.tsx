'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings, Save, CheckCircle2, ShieldAlert, Sliders } from 'lucide-react';

export default function TerritoryConfiguracionPage() {
  const [name, setName] = useState('Secretaría de Educación de Antioquia');
  const [secretary, setSecretary] = useState('Dr. Alejandro Gómez');
  const [email, setEmail] = useState('secretaria.antioquia@sed.gov.co');
  
  // Umbrales de Alertas
  const [desercionThreshold, setDesercionThreshold] = useState(15); // % de ausentismo para deserción
  const [healthThreshold, setHealthThreshold] = useState(75); // % de madurez tecnológica mínima
  
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Configuración del Portal Territorial
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Gestione los metadatos de la entidad territorial, asigne umbrales de alertas predictivas y configure el acceso de funcionarios.
        </p>
      </div>

      {/* Alerta de Éxito */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          Configuración territorial actualizada con éxito.
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario 1: Datos de Entidad */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white lg:col-span-2">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-650" />
              Datos de la Entidad Gubernamental
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
              Personalice la firma oficial y los datos de contacto de la organización.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Entidad */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Nombre de la Organización
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Secretario */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Firma / Secretario Titular
                </label>
                <input
                  type="text"
                  required
                  value={secretary}
                  onChange={(e) => setSecretary(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Correo */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Correo Electrónico Oficial de Notificaciones
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer border-none"
              >
                <Save className="w-4 h-4" />
                Guardar Configuración
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Umbrales de IA */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white h-fit">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-650" />
              Umbrales de Alerta (IA)
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
              Configure las alarmas automatizadas del territorio.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Alerta Deserción */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-655">
                <span>Ausentismo disparador de Deserción:</span>
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
                Si un alumno acumula más de este porcentaje de inasistencias en el periodo, el motor IA enviará una alerta de deserción al portal.
              </span>
            </div>

            {/* Alerta Madurez */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-655">
                <span>Health Score Mínimo Crítico:</span>
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
                Las instituciones por debajo de este porcentaje se marcarán en color rojo en la consola de transformación digital para requerimiento técnico.
              </span>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
