'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  DollarSign, MapPin, Building, ShieldCheck, 
  Users, Utensils, Plus, Eye, Download, 
  AlertCircle, Camera, Check, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadPaeResourcePDF, downloadPaeMenuPDF } from '@/lib/utils/PdfGenerator';

interface PaePlanningProps {
  userRole: string;
  resources: any[];
  onSaveResources: (data: any[]) => void;
  prioritizations: any[];
  onSavePrioritizations: (data: any[]) => void;
  diagnostics: any[];
  onSaveDiagnostics: (data: any[]) => void;
  operators: any[];
  onSaveOperators: (data: any[]) => void;
  team: any[];
  onSaveTeam: (data: any[]) => void;
  menus: any[];
  onSaveMenus: (data: any[]) => void;
}

export function PaePlanning({
  userRole,
  resources,
  onSaveResources,
  prioritizations,
  onSavePrioritizations,
  diagnostics,
  onSaveDiagnostics,
  operators,
  onSaveOperators,
  team,
  onSaveTeam,
  menus,
  onSaveMenus
}: PaePlanningProps) {
  const [activeSubTab, setActiveSubTab] = useState<'resources' | 'prioritisation' | 'diagnostics' | 'operators' | 'team' | 'menus'>('resources');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';

  // Operator Edit form state
  const [isEditOperatorModalOpen, setIsEditOperatorModalOpen] = useState(false);
  const [opId, setOpId] = useState('');
  const [opName, setOpName] = useState('');
  const [opNit, setOpNit] = useState('');
  const [opRep, setOpRep] = useState('');
  const [opContract, setOpContract] = useState('');
  const [opStart, setOpStart] = useState('');
  const [opEnd, setOpEnd] = useState('');
  const [opPoliciesText, setOpPoliciesText] = useState('');
  const [opActive, setOpActive] = useState(true);

  const handleOpenEditOperator = (op: any) => {
    setOpId(op.id);
    setOpName(op.operator_name);
    setOpNit(op.nit);
    setOpRep(op.representative);
    setOpContract(op.contract_number);
    setOpStart(op.start_date);
    setOpEnd(op.end_date);
    setOpPoliciesText(op.policies ? op.policies.join('\n') : '');
    setOpActive(op.is_active ?? true);
    setIsEditOperatorModalOpen(true);
  };

  const handleSaveEditedOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opName.trim() || !opNit.trim() || !opRep.trim() || !opContract.trim() || !opStart || !opEnd) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const updatedPolicies = opPoliciesText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const updated = operators.map(o => 
      o.id === opId
        ? {
            ...o,
            operator_name: opName,
            nit: opNit,
            representative: opRep,
            contract_number: opContract,
            start_date: opStart,
            end_date: opEnd,
            policies: updatedPolicies,
            is_active: opActive
          }
        : o
    );

    onSaveOperators(updated);
    setIsEditOperatorModalOpen(false);
    alert('✓ Información del contratista actualizada correctamente.');
  };

  // --- RESOURCES HANDLERS & MOCK NEW RESOURCE ---
  const handleAddResource = () => {
    if (!canEdit) return;
    const name = prompt('Ingrese la fuente de financiación (SGP, Regalías, etc.):');
    if (!name) return;
    const valStr = prompt('Ingrese el valor asignado:');
    const value = parseFloat(valStr || '0');
    if (isNaN(value) || value <= 0) return;
    const doc = prompt('Documento de soporte (Resolución, Decreto):');
    
    const newRes = {
      id: 'res-' + Date.now(),
      source_name: name,
      allocated_value: value,
      allocation_date: new Date().toISOString().split('T')[0],
      support_document: doc || 'Sin documento',
      pdf_url: '/documentos/res_sgp_nuevo.pdf'
    };
    const updated = [...resources, newRes];
    onSaveResources(updated);
  };

  // --- PRIORITIZATION HANDLERS & SLOT UPDATES ---
  const handleUpdateSlots = (id: string, newSlots: number) => {
    if (!canEdit || isNaN(newSlots) || newSlots < 0) return;
    const updated = prioritizations.map(p => 
      p.id === id ? { ...p, assigned_slots: newSlots } : p
    );
    onSavePrioritizations(updated);
  };

  // --- DIAGNOSTICS UPDATE ---
  const handleUpdateDiagnosticStatus = (id: string, field: string, value: string) => {
    if (!canEdit) return;
    const updated = diagnostics.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    );
    onSaveDiagnostics(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation Menu for Planning */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('resources')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'resources' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Recursos PAE
        </button>
        <button
          onClick={() => setActiveSubTab('prioritisation')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'prioritisation' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Priorización y Cupos
        </button>
        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'diagnostics' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Diagnóstico de Infraestructura
        </button>
        <button
          onClick={() => setActiveSubTab('operators')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'operators' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Operador PAE
        </button>
        <button
          onClick={() => setActiveSubTab('team')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'team' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Equipo PAE
        </button>
        <button
          onClick={() => setActiveSubTab('menus')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'menus' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Ciclo de Menús
        </button>
      </div>

      {/* --- SUBTAB: RESOURCES --- */}
      {activeSubTab === 'resources' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Recursos PAE y Cofinanciación
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de presupuestos y resoluciones soporte asignados a la vigencia actual.</p>
            </div>
            {canEdit && (
              <Button onClick={handleAddResource} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" />
                Registrar Recursos
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fuente de Financiación</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-right">Valor Asignado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Fecha Asignación</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Documento Soporte</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Adjunto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{res.source_name}</TableCell>
                    <TableCell className="font-mono font-black text-slate-700 text-xs text-right">
                      ${res.allocated_value.toLocaleString('co-CO', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-500 text-xs">{res.allocation_date}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-semibold">{res.support_document}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" className="h-8 text-indigo-600 font-bold text-xs px-3 hover:bg-indigo-50" onClick={() => downloadPaeResourcePDF(res)}>
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: PRIORITIZATION --- */}
      {activeSubTab === 'prioritisation' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Priorización de Cupos por Sede y Jornada
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de cobertura proyectada contra cupos realmente asignados en el plantel.</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Sede Educativa</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Jornada</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Beneficiarios Proyectados</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Cupos Asignados</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prioritizations.map((pri) => (
                  <TableRow key={pri.id}>
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{pri.school_sede}</TableCell>
                    <TableCell className="font-semibold text-slate-700 text-xs">{pri.school_shift}</TableCell>
                    <TableCell className="text-center font-bold text-slate-600 text-xs">{pri.projected_beneficiaries} estudiantes</TableCell>
                    <TableCell className="text-center font-black text-indigo-700 text-xs">
                      {pri.assigned_slots} cupos
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {canEdit ? (
                        <button
                          onClick={() => {
                            const input = prompt('Ingrese el nuevo número de cupos asignados:', pri.assigned_slots);
                            if (input !== null) handleUpdateSlots(pri.id, parseInt(input));
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl border-none cursor-pointer"
                        >
                          Actualizar Cupos
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Solo Lectura</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: DIAGNOSTICS --- */}
      {activeSubTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diagnostics.map((diag) => (
            <Card key={diag.id} className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-600" />
                    {diag.school_sede}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Grilla de Estados */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-655">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado Comedor</span>
                      <select 
                        value={diag.dining_room_status} 
                        onChange={(e) => handleUpdateDiagnosticStatus(diag.id, 'dining_room_status', e.target.value)}
                        disabled={!canEdit}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 mt-1 font-bold outline-none cursor-pointer focus:bg-white"
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                        <option value="No cuenta">No cuenta</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado Cocina</span>
                      <select 
                        value={diag.kitchen_status} 
                        onChange={(e) => handleUpdateDiagnosticStatus(diag.id, 'kitchen_status', e.target.value)}
                        disabled={!canEdit}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 mt-1 font-bold outline-none cursor-pointer focus:bg-white"
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado Bodega</span>
                      <select 
                        value={diag.pantry_status} 
                        onChange={(e) => handleUpdateDiagnosticStatus(diag.id, 'pantry_status', e.target.value)}
                        disabled={!canEdit}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 mt-1 font-bold outline-none cursor-pointer focus:bg-white"
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado Menaje / Utensilios</span>
                      <select 
                        value={diag.utensils_status} 
                        onChange={(e) => handleUpdateDiagnosticStatus(diag.id, 'utensils_status', e.target.value)}
                        disabled={!canEdit}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 mt-1 font-bold outline-none cursor-pointer focus:bg-white"
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                      </select>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Observaciones de Infraestructura</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-150">
                      {diag.observaciones || 'Sin observaciones registradas.'}
                    </p>
                  </div>

                  {/* Fotos */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Galería de Evidencias</span>
                    <div className="flex gap-2">
                      {diag.photos?.map((ph: string, idx: number) => (
                        <div key={idx} className="w-14 h-14 rounded-xl border border-slate-300 bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200" title={ph} onClick={() => alert(`✓ Simulación: Mostrando imagen ampliada: ${ph}`)}>
                          <Camera className="w-5 h-5 text-slate-450" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
              {canEdit && (
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
                  <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-600 hover:bg-indigo-50" onClick={() => alert('✓ Ajuste de diagnóstico guardado localmente.')}>
                    Guardar Diagnóstico
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* --- SUBTAB: OPERATORS --- */}
      {activeSubTab === 'operators' && (
        <div className="space-y-6">
          {operators.map((op) => (
            <Card key={op.id} className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Ficha del Contratista Operador
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleOpenEditOperator(op)}
                      className="h-8 text-xs font-bold border-slate-250 hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      Editar Contratista
                    </Button>
                  )}
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border",
                    op.is_active ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {op.is_active ? 'Contrato Activo' : 'Vencido'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-655">
                <div className="space-y-3.5">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-450">Operador:</span>
                    <span className="font-extrabold text-slate-900">{op.operator_name}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-450">NIT:</span>
                    <span className="font-extrabold text-slate-900">{op.nit}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-450">Representante Legal:</span>
                    <span className="font-extrabold text-slate-900">{op.representative}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-450">Número de Contrato:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{op.contract_number}</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-450">Vigencia desde:</span>
                    <span className="font-extrabold text-slate-900">{op.start_date}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-450">Vigencia hasta:</span>
                    <span className="font-extrabold text-slate-900">{op.end_date}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-450">Pólizas Constituidas:</span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1">
                      {op.policies?.map((pol: string, idx: number) => (
                        <li key={idx} className="font-bold">{pol}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- SUBTAB: TEAM --- */}
      {activeSubTab === 'team' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Equipo de Supervisión y Operación PAE
              </CardTitle>
            </div>
            {canEdit && (
              <Button onClick={() => {
                const name = prompt('Nombre del integrante:');
                if (!name) return;
                const role = prompt('Cargo o Perfil (Nutricionista, Manipuladora, etc.):');
                if (!role) return;
                const doc = prompt('Documento:');
                const mail = prompt('Correo:');
                const tel = prompt('Teléfono:');
                const newT = {
                  id: 'team-' + Date.now(),
                  member_name: name,
                  role_title: role,
                  document_number: doc || '',
                  email: mail || '',
                  phone: tel || ''
                };
                onSaveTeam([...team, newT]);
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" /> Registrar Integrante
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Nombre del Personal</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Rol / Cargo</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Documento</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Correo Electrónico</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6">Teléfono / WhatsApp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{t.member_name}</TableCell>
                    <TableCell className="font-bold text-slate-700 text-xs">{t.role_title}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500 font-mono">{t.document_number || 'N/A'}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">{t.email || 'No registrado'}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-750 pr-6">{t.phone || 'No registrado'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: MENUS --- */}
      {activeSubTab === 'menus' && (
        <div className="space-y-6">
          {menus.map((m) => (
            <Card key={m.id} className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-indigo-600" />
                  Ciclo de Minutas: Semana {m.week_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Detalles de Alimentos */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Menú Vigente</span>
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    {m.menu_details}
                  </p>
                </div>

                {/* Adjuntos Descargables */}
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Descargas Soporte Técnicos (MEN)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-between text-xs font-bold rounded-xl h-10 border-slate-250 text-slate-700 bg-white" onClick={() => downloadPaeMenuPDF(m)}>
                      <span>Minuta Patrón</span>
                      <Download className="w-4 h-4 text-indigo-650" />
                    </Button>
                    <Button variant="outline" className="justify-between text-xs font-bold rounded-xl h-10 border-slate-250 text-slate-700 bg-white" onClick={() => alert(`✓ Descargando Análisis Nutricional: ${m.nutrition_analysis_url}`)}>
                      <span>Análisis Nutricional</span>
                      <Download className="w-4 h-4 text-indigo-650" />
                    </Button>
                    <Button variant="outline" className="justify-between text-xs font-bold rounded-xl h-10 border-slate-250 text-slate-700 bg-white" onClick={() => alert(`✓ Descargando Guía de Preparación: ${m.preparation_guides_url}`)}>
                      <span>Guía de Preparación</span>
                      <Download className="w-4 h-4 text-indigo-650" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- MODAL EDIT OPERATOR --- */}
      {isEditOperatorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsEditOperatorModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveEditedOperator}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Editar Contratista Operador PAE
                  </h3>
                  <button type="button" onClick={() => setIsEditOperatorModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre del Operador *</label>
                    <input
                      type="text"
                      required
                      value={opName}
                      onChange={(e) => setOpName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">NIT *</label>
                      <input
                        type="text"
                        required
                        value={opNit}
                        onChange={(e) => setOpNit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Representante Legal *</label>
                      <input
                        type="text"
                        required
                        value={opRep}
                        onChange={(e) => setOpRep(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Número de Contrato *</label>
                      <input
                        type="text"
                        required
                        value={opContract}
                        onChange={(e) => setOpContract(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Estado del Contrato</label>
                      <div className="flex gap-4 pt-1 font-bold">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="opAct" checked={opActive} onChange={() => setOpActive(true)} className="w-4 h-4 cursor-pointer" />
                          Activo
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="opAct" checked={!opActive} onChange={() => setOpActive(false)} className="w-4 h-4 cursor-pointer" />
                          Inactivo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Vigencia desde *</label>
                      <input
                        type="date"
                        required
                        value={opStart}
                        onChange={(e) => setOpStart(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Vigencia hasta *</label>
                      <input
                        type="date"
                        required
                        value={opEnd}
                        onChange={(e) => setOpEnd(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Pólizas Constituidas (Una por línea)</label>
                    <textarea
                      rows={3}
                      value={opPoliciesText}
                      onChange={(e) => setOpPoliciesText(e.target.value)}
                      placeholder="Ej. Póliza de Calidad - Suramericana No. 45102&#10;Póliza de Cumplimiento - Seguros del Estado No. 90291"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsEditOperatorModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}

