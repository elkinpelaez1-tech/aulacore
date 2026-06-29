'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Megaphone, Send, CheckCircle2, FileText, Globe, Users } from 'lucide-react';

interface Circular {
  id: string;
  title: string;
  body: string;
  scope: string;
  date: string;
}

const INITIAL_CIRCULARES: Circular[] = [
  { id: '1', title: 'Circular 024: Auditorías del Programa de Alimentación Escolar (PAE)', body: 'Se convoca a todos los rectores oficiales a revisar el cronograma de visitas de auditoría del segundo trimestre para garantizar la sanidad alimentaria.', scope: 'Colegios Oficiales', date: 'Hace 2 días' },
  { id: '2', title: 'Circular 023: Actualización Obligatoria de Matrículas en Lote', body: 'Plazo extendido hasta el 15 de julio para registrar las novedades académicas en la plataforma AulaCore.', scope: 'Todos los Colegios', date: 'Hace 5 días' },
];

export default function TerritoryComunicacionesPage() {
  const [circulares, setCirculares] = useState<Circular[]>(INITIAL_CIRCULARES);
  
  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState('Todos los Colegios');
  
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    const newCircular: Circular = {
      id: Date.now().toString(),
      title,
      body,
      scope,
      date: 'Recién emitida',
    };

    setCirculares(prev => [newCircular, ...prev]);
    setTitle('');
    setBody('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Canal de Comunicaciones Territoriales
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Emisión de circulares de obligatorio cumplimiento, resoluciones en lote y avisos generales a directivos.
        </p>
      </div>

      {/* Alerta de Éxito */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          Circular emitida e inyectada en los paneles escolares con éxito.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Circular */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white lg:col-span-1 h-fit">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-650" />
              Redactar Circular
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
              Publique avisos o directrices en bloque.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Título de la Circular
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Circular 025: Capacitación Mallas"
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-400"
                />
              </div>

              {/* Alcance */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Alcance / Destinatarios
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="Todos los Colegios">Todos los Colegios</option>
                  <option value="Colegios Oficiales">Solo Oficiales (Públicos)</option>
                  <option value="Colegios Privados">Solo Privados</option>
                </select>
              </div>

              {/* Cuerpo */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Cuerpo del Comunicado
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Redacte las instrucciones o la resolución correspondiente aquí..."
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-400 resize-none"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none"
              >
                <Send className="w-3.5 h-3.5" />
                Emitir Circular Oficial
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Historial de Circulares */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">
            Historial de Circulares Emitidas
          </h4>

          <div className="space-y-4">
            {circulares.map((c) => (
              <Card key={c.id} className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-650 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      {c.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md shrink-0">
                    {c.scope}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed pl-6">
                  {c.body}
                </p>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold pl-6">
                  <span>Emitido por: Despacho del Secretario</span>
                  <span>{c.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
