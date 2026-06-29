'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getTerritorialInstitutions, TerritorialInstitution } from '@/services/territory-service';
import { 
  Search, Building, Laptop, Eye, HelpCircle, X, 
  User, Mail, Phone, Calendar, Sparkles, ShieldAlert,
  ArrowRight, ShieldCheck, MapPin, Landmark
} from 'lucide-react';

export default function TerritoryInstitutionsPage() {
  const [search, setSearch] = useState('');
  const [natureFilter, setNatureFilter] = useState('all');
  const [munFilter, setMunFilter] = useState('all');
  
  // Supabase institutions data
  const [institutions, setInstitutions] = useState<TerritorialInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [selectedInst, setSelectedInst] = useState<TerritorialInstitution | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getTerritorialInstitutions();
      setInstitutions(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.daneCode.includes(search) ||
      inst.rector.toLowerCase().includes(search.toLowerCase());
    const matchesNature = natureFilter === 'all' || inst.nature === natureFilter;
    const matchesMun = munFilter === 'all' || inst.municipality === munFilter;
    return matchesSearch && matchesNature && matchesMun;
  });

  return (
    <div className="p-6 space-y-6 relative h-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
            Directorio de Instituciones Educativas
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Listado general de instituciones bajo jurisdicción del territorio y su nivel de madurez digital.
          </p>
        </div>
      </div>

      {/* Barra de Filtros unificada y consistente */}
      <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-[200px] flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, rector o DANE..."
            className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Filtro Naturaleza */}
        <div className="flex flex-col gap-1 w-full md:w-44">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sector</span>
          <select
            value={natureFilter}
            onChange={(e) => setNatureFilter(e.target.value)}
            className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
          >
            <option value="all">Todos los sectores</option>
            <option value="Oficial">Oficial (Público)</option>
            <option value="Privado">Privado</option>
          </select>
        </div>

        {/* Filtro Municipio */}
        <div className="flex flex-col gap-1 w-full md:w-44">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Municipio</span>
          <select
            value={munFilter}
            onChange={(e) => setMunFilter(e.target.value)}
            className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
          >
            <option value="all">Todos los municipios</option>
            <option value="Medellín">Medellín</option>
            <option value="Bello">Bello</option>
            <option value="Barbosa">Barbosa</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/40">
                <TableRow>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Nombre del Plantel</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Código DANE</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Municipio</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Naturaleza</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Rector</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Matrícula</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Madurez</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inst) => (
                  <TableRow key={inst.id} className="hover:bg-slate-50/50">
                    <TableCell className="py-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-650 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          {inst.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-850 truncate max-w-[200px]">
                          {inst.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 align-middle">
                      <span className="text-xs font-mono font-semibold text-slate-600">{inst.daneCode}</span>
                    </TableCell>
                    <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-700">
                      {inst.municipality}
                    </TableCell>
                    <TableCell className="py-3.5 align-middle">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        inst.nature === 'Oficial' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inst.nature}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 align-middle text-xs font-semibold text-slate-655 truncate max-w-[140px]">
                      {inst.rector}
                    </TableCell>
                    <TableCell className="py-3.5 align-middle text-center text-xs font-bold text-slate-800">
                      {inst.students.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3.5 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          inst.healthScore >= 90 ? 'bg-emerald-500' :
                          inst.healthScore >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span className="text-xs font-black text-slate-800">{inst.healthScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 align-middle text-center">
                      <button
                        onClick={() => setSelectedInst(inst)}
                        className="text-slate-500 hover:text-indigo-650 p-1 bg-slate-50 border border-slate-200 rounded-lg hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                        title="Ver Ficha Ejecutiva"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-xs text-indigo-650 font-bold animate-pulse">
                      Cargando información real de Supabase...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-xs text-slate-450 font-bold italic">
                      No se encontraron instituciones con el filtro aplicado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* 🏛️ MODAL FICHA EJECUTIVA DE COLEGIO (CENTERED POPUP DIALOG)      */}
      {/* ================================================================= */}
      {selectedInst && (
        <InstitutionDetailModal 
          selectedInst={selectedInst} 
          onClose={() => setSelectedInst(null)} 
        />
      )}
    </div>
  );
}

interface DetailModalProps {
  selectedInst: TerritorialInstitution;
  onClose: () => void;
}

type ModalTab = 'general' | 'adopcion' | 'infraestructura' | 'planes';

function InstitutionDetailModal({ selectedInst, onClose }: DetailModalProps) {
  const [tab, setTab] = useState<ModalTab>('general');

  const tabOptions: { id: ModalTab; label: string }[] = [
    { id: 'general', label: 'General & Contacto' },
    { id: 'adopcion', label: 'Adopción (Health Score)' },
    { id: 'infraestructura', label: 'Infraestructura & PAE' },
    { id: 'planes', label: 'Planes & IA' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
      {/* Backdrop clickable */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-3xl flex flex-col max-h-[85vh] animate-scale-in border border-slate-200 overflow-hidden z-10 m-4">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-650 font-bold shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Ficha Ejecutiva Escolar
              </span>
              <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mt-0.5 truncate max-w-[400px]">
                {selectedInst.name}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-450 hover:text-slate-800 transition-all duration-200 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pestañas de Navegación Interna */}
        <div className="flex border-b border-slate-100 bg-slate-50/20 px-6 py-2 gap-2 overflow-x-auto shrink-0">
          {tabOptions.map((opt) => {
            const isActive = tab === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTab(opt.id)}
                className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Contenido (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-normal flex-1">
          
          {tab === 'general' && (
            <div className="space-y-4 font-semibold text-slate-655">
              <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-450">Rector(a):</span>
                  <span className="text-slate-800 font-extrabold">{selectedInst.rector}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-455">Código DANE:</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedInst.daneCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-455">Naturaleza Jurídica:</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                    selectedInst.nature === 'Privado' ? 'bg-amber-50 border border-amber-100 text-amber-800' : 'bg-indigo-50 border border-indigo-100 text-indigo-850'
                  }`}>
                    {selectedInst.nature}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-455">Municipio / Comuna:</span>
                  <span className="text-slate-800 font-bold">{selectedInst.municipality}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-455">Correo de Contacto:</span>
                  <span className="text-indigo-650 font-bold font-mono">{selectedInst.contactEmail}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-455">Teléfono:</span>
                  <span className="text-slate-700 font-bold">{selectedInst.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Dirección Física:</span>
                  <span className="text-slate-700 font-bold truncate max-w-[240px]">{selectedInst.address}</span>
                </div>
              </div>

              {/* Botón Canal Directo */}
              <div className="pt-2 flex justify-between items-center bg-slate-50/20 p-4 border border-slate-150 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Canal Directo de Mensajería</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">Comunicación unificada con el Rector.</span>
                </div>
                <button
                  disabled
                  onClick={() => alert('Mensajería real inhabilitada en fase de onboarding.')}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-not-allowed"
                >
                  Rectoría (Inactivo)
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {tab === 'adopcion' && (
            <div className="space-y-6">
              {/* Ponderado General */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">Health Score Provisional</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Cálculo en base a módulos AulaCore activos.</span>
                </div>
                <span className="text-2xl font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                  {selectedInst.healthScore}%
                </span>
              </div>

              {/* Módulos Desglosados */}
              <div className="space-y-3.5 text-xs font-bold">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Detalle por Módulos</h4>
                
                {/* Matricula */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Matrícula en Lote</span>
                    <span>{selectedInst.adoption.matricula}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${selectedInst.adoption.matricula}%` }} />
                  </div>
                </div>

                {/* Mallas Curriculares */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Parametrización de Mallas</span>
                    <span>{selectedInst.adoption.mallas}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${selectedInst.adoption.mallas}%` }} />
                  </div>
                </div>

                {/* PEI */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Parametrización del PEI</span>
                    <span>{selectedInst.adoption.pei}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedInst.adoption.pei}%` }} />
                  </div>
                </div>

                {/* RFID */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Integración Asistencia RFID</span>
                    <span>{selectedInst.adoption.rfid}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${selectedInst.adoption.rfid}%` }} />
                  </div>
                </div>
              </div>

              {/* Análisis de IA */}
              {selectedInst.iaInsight && (
                <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-2xl flex gap-3 text-slate-800 items-start">
                  <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5 animate-pulse" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-black text-indigo-900 block flex items-center gap-1">
                      Análisis IA del Colegio
                    </span>
                    <p className="font-semibold text-slate-600 mt-1">
                      {selectedInst.iaInsight}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'infraestructura' && (
            <div className="space-y-4 font-semibold text-slate-655">
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/30 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estado de Red e Infraestructura</h4>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Conectividad de Banda Ancha:</span>
                  <span className="text-emerald-700 font-extrabold">Estable (85 Mbps)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Incidencias Críticas Reportadas:</span>
                  <span className="text-slate-800 font-bold">0 Activas</span>
                </div>
                <div className="flex justify-between">
                  <span>Último Reporte PAE:</span>
                  <span className="text-indigo-600 font-bold">Conforme (Hace 1 día)</span>
                </div>
              </div>
              <div className="p-4 border border-rose-150 bg-rose-50/10 rounded-2xl text-rose-800 text-[11px] leading-relaxed">
                <span className="font-black block text-rose-900 mb-0.5">Nota de Mantenimiento</span>
                Se pre-aprobó una visita técnica preventiva del área de redes para evaluar el switch principal del Bloque B de la sede.
              </div>
            </div>
          )}

          {tab === 'planes' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-2xl flex gap-3 text-slate-800 items-start">
                <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5 animate-pulse" />
                <div className="text-xs leading-relaxed">
                  <span className="font-black text-indigo-900 block flex items-center gap-1">
                    Sugerencias del Motor de Inteligencia Territorial
                  </span>
                  <p className="font-semibold text-slate-600 mt-1.5">
                    Este establecimiento destaca por su alta adopción del software. Se sugiere certificarlo como <strong>"Colegio Mentor Digital"</strong> para capacitar a otras I.E. rurales de Barbosa.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2 text-xs font-semibold text-slate-550">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-700">Plan de Refuerzo Curricular</span>
                  <span className="text-[9px] font-black uppercase text-indigo-750 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">Vigente</span>
                </div>
                <p className="text-[11px]">Meta: Nivelar el promedio de Matemáticas de grado 11 en el periodo escolar.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
