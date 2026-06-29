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
      {/* 🧭 DRAWER VISTA DETALLE DE COLEGIO (SLIDE-IN PANEL LATERAL)       */}
      {/* ================================================================= */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 cursor-pointer" 
            onClick={() => setSelectedInst(null)}
          />

          {/* Panel Deslizable */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-slide-in border-l border-slate-200 z-10">
            
            {/* Cabecera Drawer */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Ficha Técnica Institucional
                </span>
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mt-1 truncate max-w-[340px]">
                  {selectedInst.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedInst(null)}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-450 hover:text-slate-800 transition-all duration-200 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Cuerpo del Drawer (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Bloque 1: Información General */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-850 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-indigo-650" />
                  Datos de Contacto y Representación
                </h4>
                <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl space-y-3 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-450">Rector(a):</span>
                    <span className="text-slate-800 font-bold">{selectedInst.rector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Correo Oficial:</span>
                    <span className="text-indigo-650 font-bold font-mono">{selectedInst.contactEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Teléfono:</span>
                    <span className="text-slate-700 font-bold">{selectedInst.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Dirección Sede Principal:</span>
                    <span className="text-slate-700 font-bold truncate max-w-[200px]">{selectedInst.address}</span>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Madurez e Implementación AulaCore */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-850 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-purple-650" />
                  Adopción Tecnológica de AulaCore
                </h4>
                <div className="space-y-3 text-xs font-bold">
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
              </div>

              {/* Bloque 3: Insights IA Predictiva */}
              {selectedInst.iaInsight && (
                <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-xl flex gap-3 text-slate-800 items-start">
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

            {/* Footer Drawer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] text-slate-450 font-bold">Último backup: Hace 2 horas</span>
              <button
                onClick={() => {
                  alert(`Se iniciará el canal directo con la rectoría de: ${selectedInst.name}`);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-1"
              >
                Canal Directo Rectoría
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
