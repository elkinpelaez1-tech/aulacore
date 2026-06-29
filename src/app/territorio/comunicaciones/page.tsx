'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Megaphone, Send, CheckCircle2, FileText, Globe, Users, 
  Upload, Trash2, ShieldAlert, Sparkles, Mail, MessageSquare, 
  Clock, CheckCheck, Landmark, CheckCircle
} from 'lucide-react';

interface Circular {
  id: string;
  title: string;
  body: string;
  scope: string;
  targetDetails?: string;
  date: string;
  status: 'Pendiente' | 'Enviado' | 'Entregado' | 'Leído';
  readRatio: string; // ej: "18/24"
  attachments: string[];
  digitallySigned: boolean;
  scheduledFor?: string;
}

const INITIAL_CIRCULARES: Circular[] = [
  { 
    id: '1', 
    title: 'Circular 024: Auditorías del Programa de Alimentación Escolar (PAE)', 
    body: 'Se convoca a todos los rectores oficiales a revisar el cronograma de visitas de auditoría del segundo trimestre para garantizar la sanidad alimentaria.', 
    scope: 'Instituciones Oficiales', 
    date: 'Hoy 10:24 AM', 
    status: 'Leído', 
    readRatio: '20/24 (83%)', 
    attachments: ['Cronograma_Auditorias_PAE.pdf'], 
    digitallySigned: true 
  },
  { 
    id: '2', 
    title: 'Circular 023: Actualización Obligatoria de Matrículas en Lote', 
    body: 'Plazo extendido hasta el 15 de julio para registrar las novedades académicas en la plataforma AulaCore.', 
    scope: 'Todas las Instituciones', 
    date: 'Hace 3 días', 
    status: 'Entregado', 
    readRatio: '32/48 (66%)', 
    attachments: ['Manual_Matricula_AulaCore_2026.docx', 'Plantilla_Carga.xlsx'], 
    digitallySigned: true 
  },
];

const INITIAL_BORRADORES = [
  { id: 'b1', title: 'Borrador: Conectividad Rural Banda Ancha', body: 'Solicitud de informe de factibilidad de tendido de fibra en veredas...', scope: 'Por Municipio (Barbosa)', date: 'Modificado ayer' }
];

const INITIAL_PROGRAMADOS = [
  { id: 'p1', title: 'Circular 025: Capacitación Docente Plan PEI 2027', body: 'Taller virtual de alineamiento pedagógico del Proyecto Educativo Institucional...', scope: 'Todas las Instituciones', scheduledFor: '2026-07-01 a las 08:00 AM' }
];

export default function TerritoryComunicacionesPage() {
  const [circulares, setCirculares] = useState<Circular[]>(INITIAL_CIRCULARES);
  const [historyTab, setHistoryTab] = useState<'enviados' | 'borradores' | 'programados'>('enviados');
  
  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState('Todas las Instituciones');
  
  // Destinatarios avanzados
  const [selectedMunicipio, setSelectedMunicipio] = useState('Barbosa');
  const [selectedComuna, setSelectedComuna] = useState('Comuna 1');
  const [selectedManualIds, setSelectedManualIds] = useState<string[]>([]);

  // Adjuntos States
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Opciones avanzadas
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [digitallySigned, setDigitallySigned] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');

  const [success, setSuccess] = useState(false);

  // Simulación de carga de archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const newFile = { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, progress: 10 };
    setAttachedFiles(prev => [...prev, newFile]);

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 30;
      setAttachedFiles(prev => 
        prev.map(f => f.name === file.name ? { ...f, progress: Math.min(currentProgress, 100) } : f)
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 150);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    let finalScope = scope;
    if (scope === 'Por Municipio') finalScope = `Municipio: ${selectedMunicipio}`;
    if (scope === 'Por Comuna') finalScope = `Comuna: ${selectedComuna}`;
    if (scope === 'Manual') finalScope = `Selección Manual (${selectedManualIds.length} Colegios)`;

    const newCircular: Circular = {
      id: Date.now().toString(),
      title,
      body,
      scope: finalScope,
      date: isScheduled ? 'Programada' : 'Hoy 11:30 AM',
      status: isScheduled ? 'Pendiente' : 'Enviado',
      readRatio: isScheduled ? '0/0' : '0/48 (0%)',
      attachments: attachedFiles.map(f => f.name),
      digitallySigned,
      scheduledFor: isScheduled ? `${scheduledDate} ${scheduledTime}` : undefined
    };

    if (isScheduled) {
      alert(`Circular programada con éxito para el ${scheduledDate} a las ${scheduledTime}`);
    } else {
      setCirculares(prev => [newCircular, ...prev]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }

    // Reset Form
    setTitle('');
    setBody('');
    setAttachedFiles([]);
    setIsScheduled(false);
  };

  const toggleManualId = (id: string) => {
    setSelectedManualIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const mockSchools = [
    { id: 'c1', name: 'Gimnasio Campestre AulaCore' },
    { id: 'c2', name: 'I.E. Marco Fidel Suárez' },
    { id: 'c3', name: 'I.E. Presbítero Antonio Bernal' },
    { id: 'c4', name: 'I.E. Rural El Hatillo' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Centro de Comunicaciones Territoriales
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Emisión de circulares de obligatorio cumplimiento, resoluciones y envíos unificados a directivos vía Email y WhatsApp.
        </p>
      </div>

      {/* Alerta de éxito */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          Circular emitida e inyectada en los paneles escolares con éxito.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Circular */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white lg:col-span-2">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-655" />
              Redactar Nueva Circular Oficial
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
              Las circulares emitidas se publicarán en el Portal de cada Rector y se archivarán en el registro histórico territorial.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Título de la Circular</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Circular 025: Talleres de Capacitación Pedagógica 2026"
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400 focus:border-indigo-500"
                />
              </div>

              {/* Destinatarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Destinatarios (Alcance)</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Todas las Instituciones">Todas las Instituciones</option>
                    <option value="Instituciones Oficiales">Instituciones Oficiales</option>
                    <option value="Instituciones Privadas">Instituciones Privadas</option>
                    <option value="Por Municipio">Por Municipio</option>
                    <option value="Por Comuna">Por Comuna / Corregimiento</option>
                    <option value="Manual">Selección Manual</option>
                  </select>
                </div>

                {/* Sub-selectores según el tipo de alcance */}
                {scope === 'Por Municipio' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Seleccionar Municipio</label>
                    <select
                      value={selectedMunicipio}
                      onChange={(e) => setSelectedMunicipio(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Barbosa">Barbosa</option>
                      <option value="Bello">Bello</option>
                      <option value="Medellín">Medellín</option>
                      <option value="Sabaneta">Sabaneta</option>
                    </select>
                  </div>
                )}

                {scope === 'Por Comuna' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Seleccionar Comuna / Corregimiento</label>
                    <select
                      value={selectedComuna}
                      onChange={(e) => setSelectedComuna(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Comuna 1">Comuna 1 (Popular)</option>
                      <option value="Comuna 2">Comuna 2 (Santa Cruz)</option>
                      <option value="Corregimiento San Cristóbal">Corregimiento San Cristóbal</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Selección Manual Multiselect */}
              {scope === 'Manual' && (
                <div className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Marcar Colegios Destinatarios:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                    {mockSchools.map(sch => (
                      <label key={sch.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedManualIds.includes(sch.id)}
                          onChange={() => toggleManualId(sch.id)}
                          className="rounded text-indigo-650"
                        />
                        <span>{sch.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuerpo */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mensaje / Comunicado</label>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Redacte el cuerpo de la circular de obligatorio cumplimiento..."
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400 focus:border-indigo-500"
                />
              </div>

              {/* Carga de Adjuntos Drag & Drop */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Anexar Documentos Oficiales</label>
                
                <div className="border border-dashed border-slate-250 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/20 hover:bg-slate-50/50 transition-all duration-200 relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                  />
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-slate-700 block">Haga clic o arrastre archivos aquí</span>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Admite PDF, Word, Excel, PPT, Imágenes o ZIP (Max 10MB)</span>
                </div>

                {/* Listado de archivos cargados */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-slate-800 block truncate font-mono text-[10px]">{file.name}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{file.size}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {file.progress < 100 ? (
                            <span className="text-[9px] text-indigo-650 font-black">{file.progress}%</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="text-rose-650 hover:bg-rose-50 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Programación de Envío */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="rounded text-indigo-650"
                    />
                    <span>Programar envío para fecha futura</span>
                  </label>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Fecha de Envío</span>
                      <input
                        type="date"
                        required
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Hora de Envío</span>
                      <input
                        type="time"
                        required
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Firma y Canal Integración */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-655">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="rounded text-indigo-650"
                  />
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded text-indigo-650"
                  />
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Correo SED</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digitallySigned}
                    onChange={(e) => setDigitallySigned(e.target.checked)}
                    className="rounded text-indigo-650"
                  />
                  <div className="flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-purple-650" />
                    <span>Firma Digital</span>
                  </div>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isScheduled ? 'Programar Circular' : 'Emitir Circular'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Historial y Centro de Seguimiento */}
        <div className="space-y-4">
          <div className="flex border border-slate-200 bg-white rounded-xl p-1 gap-1">
            <button 
              onClick={() => setHistoryTab('enviados')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                historyTab === 'enviados' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Enviados
            </button>
            <button 
              onClick={() => setHistoryTab('borradores')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                historyTab === 'borradores' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Borradores
            </button>
            <button 
              onClick={() => setHistoryTab('programados')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                historyTab === 'programados' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Programados
            </button>
          </div>

          {/* Listado Enviados */}
          {historyTab === 'enviados' && (
            <div className="space-y-4">
              {circulares.map((c) => (
                <Card key={c.id} className="border-slate-200 shadow-sm rounded-2xl bg-white p-4.5 space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-black text-slate-800 leading-snug">{c.title}</h4>
                      <span className="text-[9px] text-slate-400 font-extrabold whitespace-nowrap">{c.date}</span>
                    </div>
                    <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md w-fit block uppercase tracking-wider">
                      {c.scope}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {c.body}
                  </p>

                  {/* Adjuntos del historial */}
                  {c.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                      {c.attachments.map((file, fIdx) => (
                        <span key={fIdx} className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {file}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Estado del Envío y confirmación de lectura */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px] font-bold text-slate-455">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Lecturas:</span>
                      <span className="text-slate-800 font-extrabold">{c.readRatio}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-650">
                      <CheckCheck className="w-4 h-4" />
                      <span className="uppercase text-[9px] font-black">{c.status}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Listado Borradores */}
          {historyTab === 'borradores' && (
            <div className="space-y-4">
              {INITIAL_BORRADORES.map((b) => (
                <Card key={b.id} className="border-slate-200 shadow-sm rounded-2xl bg-white p-4.5 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-xs font-black text-slate-800 leading-snug">{b.title}</h4>
                    <span className="text-[9px] text-slate-400 font-extrabold whitespace-nowrap">{b.date}</span>
                  </div>
                  <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md w-fit block uppercase tracking-wider">
                    {b.scope}
                  </span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed pt-1.5">
                    {b.body}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Listado Programados */}
          {historyTab === 'programados' && (
            <div className="space-y-4">
              {INITIAL_PROGRAMADOS.map((p) => (
                <Card key={p.id} className="border-slate-200 shadow-sm rounded-2xl bg-white p-4.5 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-xs font-black text-slate-800 leading-snug">{p.title}</h4>
                    <div className="flex items-center gap-1 text-indigo-650 shrink-0">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[9px] font-black uppercase">Prog</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md w-fit block uppercase tracking-wider">
                    {p.scope}
                  </span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed pt-1.5">
                    {p.body}
                  </p>
                  <div className="text-[9px] font-bold text-slate-455 pt-2 border-t border-slate-100">
                    Programado para: <span className="text-slate-800 font-extrabold">{p.scheduledFor}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
