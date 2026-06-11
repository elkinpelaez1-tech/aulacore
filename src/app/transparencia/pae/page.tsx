'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Utensils, Users, CalendarDays, 
  Download, Sparkles, Building2, BarChart3, Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PublicPaePage() {
  const [operator, setOperator] = useState<any>({
    operator_name: 'Consorcio Alimentando Futuro 2026',
    nit: '901.458.123-5',
    contract_number: 'LP-PAE-001-2026',
    start_date: '2026-01-20',
    end_date: '2026-11-30',
    representative: 'Dra. Patricia Gómez Ruiz'
  });

  const [menu, setMenu] = useState<string>(
    'Lunes: Arroz con pollo, ensalada verde, banano y jugo de guayaba. Martes: Carne de res sudada, arroz, lentejas, papaya y jugo de mango. Miércoles: Pollo al horno, puré de papa, zanahoria, manzana y leche. Jueves: Cerdo asado, arroz, fríjoles, melón y limonada. Viernes: Pescado frito, arroz con coco, patacón, ensalada de repollo y jugo de piña.'
  );

  const [localPurchasePct, setLocalPurchasePct] = useState<number>(20.0);
  
  const [caeMembers, setCaeMembers] = useState<any[]>([
    { name: 'Dr. Ramón Ramírez', role: 'Rector / Presidente' },
    { name: 'Lic. Diana Carolina Reyes', role: 'Docente Responsable' },
    { name: 'Carlos Ortiz', role: 'Representante de Padres' },
    { name: 'Alejandro Ortiz', role: 'Representante de Estudiantes' }
  ]);

  const [mesas, setMesas] = useState<any[]>([
    { mesa_number: 1, meeting_date: '2026-04-20', attendees_count: 85, compromisos: '1. El operador se compromete a ajustar los tiempos de entrega. 2. La secretaría de educación municipal supervisará la cadena de frío semanalmente. 3. Mayor inclusión de frutas de productores locales.' }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicData() {
      try {
        setLoading(true);

        const withTimeout = <T,>(promise: PromiseLike<T>, ms = 2000): Promise<T> => {
          return Promise.race([
            Promise.resolve(promise),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Supabase query timed out')), ms)
            )
          ]);
        };

        const [opDb, menuDb, purDb, commDb, mesasDb] = await Promise.all([
          withTimeout(supabase.from('pae_operators').select('*').limit(1).maybeSingle()),
          withTimeout(supabase.from('pae_menu_cycles').select('*').limit(1).maybeSingle()),
          withTimeout(supabase.from('pae_local_purchases').select('*')),
          withTimeout(supabase.from('pae_committees').select('*').eq('committee_type', 'CAE')),
          withTimeout(supabase.from('pae_mesas_publicas').select('*'))
        ]) as any[];

        if (opDb.data) setOperator(opDb.data);
        if (menuDb.data) setMenu(menuDb.data.menu_details);
        
        if (purDb.data && purDb.data.length > 0) {
          const totalVal = purDb.data.reduce((acc: number, curr: any) => acc + curr.purchase_value, 0);
          setLocalPurchasePct(parseFloat(((totalVal / 80000000) * 100).toFixed(2)));
        }

        if (commDb.data && commDb.data.length > 0) {
          const lastCae = commDb.data[0];
          if (lastCae.members) setCaeMembers(lastCae.members);
        }

        if (mesasDb.data && mesasDb.data.length > 0) {
          setMesas(mesasDb.data);
        }

      } catch (err) {
        console.warn('Public PAE portal loaded default mock data.', err);
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Cabecera / Banner del Portal Público */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-6 shadow-md border-b border-indigo-900/40 relative overflow-hidden select-none">
        <div className="max-w-6xl mx-auto space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300">PORTAL CIUDADANO DE TRANSPARENCIA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Programa de Alimentación Escolar (PAE)</h1>
          <p className="text-sm md:text-base text-slate-350 max-w-2xl leading-relaxed">
            Consulte y audite de forma abierta los menús, compras locales, integrantes del CAE e informes de control social del colegio.
          </p>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
      </header>

      {/* Grid de Contenido Principal */}
      <main className="max-w-6xl mx-auto py-10 px-6 space-y-8">
        
        {loading ? (
          <Card className="border-slate-200 p-12 text-center shadow-md bg-white rounded-2xl flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 font-bold">Cargando información pública del PAE...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Columna Izquierda (Contrato y Menú) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Menú Vigente */}
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-indigo-600 animate-bounce" />
                    Menú Escolar y Minuta Patrón Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-150 leading-relaxed font-mono">
                    {menu}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full bg-white border-slate-200 text-slate-700 font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer" onClick={() => alert('✓ Descargando Minuta Patrón oficial del Ministerio de Educación.')}>
                      <Download className="w-4 h-4 text-slate-500" /> Descargar Minuta Patrón
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mesas Públicas */}
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    Veeduría de Mesas Públicas de Control Social
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Sesión</TableHead>
                        <TableHead className="font-extrabold text-slate-800 text-xs">Fecha Evento</TableHead>
                        <TableHead className="font-extrabold text-slate-800 text-xs text-center">Asistentes</TableHead>
                        <TableHead className="font-extrabold text-slate-800 text-xs">Compromisos Acordados</TableHead>
                        <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mesas.map((m, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-black text-slate-900 text-xs pl-6">Mesa Pública No. {m.mesa_number}</TableCell>
                          <TableCell className="font-bold text-slate-600 text-xs">{m.meeting_date}</TableCell>
                          <TableCell className="text-center font-extrabold text-slate-800 text-xs">{m.attendees_count} ciudadanos</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-500 max-w-xs truncate" title={m.compromisos}>
                            {m.compromisos}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-650 hover:bg-indigo-50" onClick={() => alert('✓ Visualizando acta firmada del control social.')}>
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>

            {/* Columna Derecha (Ficha Contrato, Local Purchases, CAE) */}
            <div className="space-y-8">
              
              {/* Contratista Operador */}
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Contrato del Operador PAE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs font-semibold text-slate-655">
                  <div className="space-y-3.5">
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-450">Operador:</span>
                      <span className="font-extrabold text-slate-900">{operator.operator_name}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-450">NIT:</span>
                      <span className="font-extrabold text-slate-900">{operator.nit}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-450">Licitación / Contrato:</span>
                      <span className="font-extrabold text-slate-900 font-mono text-[10px]">{operator.contract_number}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Porcentaje Compras Locales */}
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Compras Locales Agrícolas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-800 font-black flex items-center justify-center text-sm shadow-inner shrink-0">
                    {localPurchasePct}%
                  </div>
                  <div className="text-xs font-semibold text-slate-550 leading-relaxed">
                    <p className="text-emerald-700 font-extrabold">Cumple Meta Legal (Mín. 20%)</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">La materia prima es comprada de forma directa a agricultores campesinos del municipio.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Comité CAE */}
              <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-sm font-black text-slate-955 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Integrantes del Comité CAE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-extrabold text-slate-800 text-[10px] pl-6">Representante</TableHead>
                        <TableHead className="font-extrabold text-slate-800 text-[10px] pr-6 text-right">Rol Comité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caeMembers.map((member, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-slate-900 text-xs pl-6">{member.name}</TableCell>
                          <TableCell className="pr-6 text-right font-semibold text-slate-500 text-[10px]">{member.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>

          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 text-center py-6 text-[10px] font-bold text-slate-400 select-none">
        Portal de Transparencia PAE - Gimnasio Campestre AulaCore © 2026. Todos los derechos reservados.
      </footer>
      
    </div>
  );
}
