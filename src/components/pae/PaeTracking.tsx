'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  ShieldCheck, DollarSign, Plus, Eye, 
  MapPin, Calendar, Percent, Sparkles, 
  AlertCircle, CheckCircle2, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadPaePurchasePDF, downloadPaeVisitPDF } from '@/lib/utils/PdfGenerator';

interface LocalPurchase {
  id: string;
  supplier_name: string;
  municipality: string;
  product_name: string;
  purchase_value: number;
  purchase_date: string;
  invoice_pdf?: string;
}

interface Visit {
  id: string;
  control_type: string;
  control_date: string;
  inspector_name: string;
  score_percentage: number;
  findings: string;
  action_plan?: string;
}

interface PaeTrackingProps {
  userRole: string;
  localPurchases: LocalPurchase[];
  onSavePurchases: (data: LocalPurchase[]) => void;
  visits: Visit[];
  onSaveVisits: (data: Visit[]) => void;
  totalContractValue?: number;
}

export function PaeTracking({
  userRole,
  localPurchases = [],
  onSavePurchases,
  visits = [],
  onSaveVisits,
  totalContractValue = 80000000 // default 80 million COP
}: PaeTrackingProps) {
  const [activeSubTab, setActiveSubTab] = useState<'supervision' | 'local_purchases'>('supervision');

  // Local purchase form state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [municipality, setMunicipality] = useState('San Antonio de Tequendama');
  const [product, setProduct] = useState('');
  const [value, setValue] = useState(1000000);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  // Visit form state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [controlType, setControlType] = useState<'Supervisión' | 'Interventoría'>('Supervisión');
  const [controlDate, setControlDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState('');
  const [scorePercentage, setScorePercentage] = useState(90);
  const [findings, setFindings] = useState('');
  const [actionPlan, setActionPlan] = useState('');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';

  // Calculate percentages
  const totalLocalPurchases = localPurchases.reduce((acc, curr) => acc + curr.purchase_value, 0);
  const localPurchasesPercentage = parseFloat(((totalLocalPurchases / totalContractValue) * 100).toFixed(2));
  const meetsMeta = localPurchasesPercentage >= 20.0;

  const handleOpenAddPurchase = () => {
    setSupplier('');
    setProduct('');
    setValue(1500000);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setIsPurchaseModalOpen(true);
  };

  const handleOpenAddVisit = () => {
    setControlType('Supervisión');
    setControlDate(new Date().toISOString().split('T')[0]);
    setInspectorName('');
    setScorePercentage(90);
    setFindings('');
    setActionPlan('');
    setIsVisitModalOpen(true);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!inspectorName.trim() || !findings.trim()) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const newVisit: Visit = {
      id: 'vis-' + Date.now(),
      control_type: controlType,
      control_date: controlDate,
      inspector_name: inspectorName,
      score_percentage: scorePercentage,
      findings: findings,
      action_plan: actionPlan
    };

    const updated = [...visits, newVisit];
    onSaveVisits(updated);
    setIsVisitModalOpen(false);
    alert('✓ Visita de interventoría registrada correctamente.');
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!supplier.trim() || !product.trim() || value <= 0) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const newPurchase: LocalPurchase = {
      id: 'pur-' + Date.now(),
      supplier_name: supplier,
      municipality,
      product_name: product,
      purchase_value: value,
      purchase_date: purchaseDate,
      invoice_pdf: '/facturas/factura_nueva.pdf'
    };

    const updated = [...localPurchases, newPurchase];
    onSavePurchases(updated);
    setIsPurchaseModalOpen(false);
    alert('✓ Compra local registrada correctamente.');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('supervision')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'supervision' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Visitas de Supervisión e Interventoría
        </button>
        <button
          onClick={() => setActiveSubTab('local_purchases')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'local_purchases' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Compras Locales Agrícolas (Ley 2046)
        </button>
      </div>

      {/* --- SUBTAB: SUPERVISION --- */}
      {activeSubTab === 'supervision' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Visitas de Interventoría de la Secretaría y Entes de Control
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Historial de inspecciones oficiales recibidas para auditar el cumplimiento del operador.</p>
            </div>
            {canEdit && (
              <Button onClick={handleOpenAddVisit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" /> Registrar Visita
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha Visita</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Inspector / Entidad</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Calificación Obtenida</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Detalle de Hallazgos</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acta Soporte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.filter(v => v.control_type === 'Supervisión' || v.control_type === 'Interventoría').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran visitas de supervisión de entes externos en esta vigencia.
                    </TableCell>
                  </TableRow>
                ) : (
                  visits.filter(v => v.control_type === 'Supervisión' || v.control_type === 'Interventoría').map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold text-slate-950 text-xs pl-6">{v.control_date}</TableCell>
                      <TableCell className="font-black text-slate-800 text-xs">{v.inspector_name}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full border text-[10px] font-black",
                          v.score_percentage >= 90 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                        )}>
                          {v.score_percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-550 max-w-sm truncate" title={v.findings}>
                        {v.findings}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-650 hover:bg-indigo-50" onClick={() => downloadPaeVisitPDF(v)}>
                          Ver Acta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: LOCAL PURCHASES --- */}
      {activeSubTab === 'local_purchases' && (
        <div className="space-y-6">
          
          {/* Panel Indicador del Cumplimiento de la Meta (Mín 20%) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden flex flex-col justify-between md:col-span-1">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                  <Percent className="w-5 h-5 text-indigo-600" />
                  Meta Legal de Compra Local
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 flex flex-col items-center justify-center text-center">
                <div className={cn(
                  "w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 font-black shadow-inner",
                  meetsMeta ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-amber-400 bg-amber-50 text-amber-800"
                )}>
                  <span className="text-2xl">{localPurchasesPercentage}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Alcanzado</span>
                </div>
                <div className="text-xs font-semibold text-slate-550 leading-relaxed">
                  {meetsMeta ? (
                    <p className="text-emerald-700 font-extrabold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Cumple con el 20% mínimo
                    </p>
                  ) : (
                    <p className="text-amber-700 font-extrabold flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4 animate-bounce" /> Falta para el 20% legal
                    </p>
                  )}
                  <p className="text-[10px] text-slate-450 mt-1.5 font-bold">
                    Total Compras Locales: ${totalLocalPurchases.toLocaleString('co-CO')} COP
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden md:col-span-2">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black text-slate-955 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Registro de Compras a Productores Locales
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Trazabilidad de suministros agrícolas adquiridos a pequeños productores de la región.</p>
                </div>
                {canEdit && (
                  <Button onClick={handleOpenAddPurchase} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                    <Plus className="w-4 h-4" /> Registrar Compra
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Proveedor Local</TableHead>
                      <TableHead className="font-extrabold text-slate-800 text-xs">Municipio</TableHead>
                      <TableHead className="font-extrabold text-slate-800 text-xs">Producto Adquirido</TableHead>
                      <TableHead className="font-extrabold text-slate-800 text-xs text-right">Valor Compra</TableHead>
                      <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Factura Soporte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localPurchases.map((pur) => (
                      <TableRow key={pur.id}>
                        <TableCell className="font-black text-slate-955 text-xs pl-6">{pur.supplier_name}</TableCell>
                        <TableCell className="font-semibold text-slate-600 text-xs">{pur.municipality}</TableCell>
                        <TableCell className="font-bold text-slate-700 text-xs">{pur.product_name}</TableCell>
                        <TableCell className="font-mono font-black text-slate-900 text-xs text-right">
                          ${pur.purchase_value.toLocaleString('co-CO', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" className="h-8 text-[11px] font-black text-indigo-650 hover:bg-indigo-50" onClick={() => downloadPaePurchasePDF(pur)}>
                            Factura
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* --- MODAL ADD LOCAL PURCHASE --- */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsPurchaseModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSavePurchase}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Registrar Compra Agrícola Local
                  </h3>
                  <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre del Productor / Proveedor *</label>
                    <input
                      type="text"
                      placeholder="Ej. Cooperativa Agropecuaria"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Municipio *</label>
                      <input
                        type="text"
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha Compra *</label>
                      <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Producto Adquirido *</label>
                    <input
                      type="text"
                      placeholder="Ej. Plátano, Yuca, Papaya..."
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Valor Total de Compra (COP) *</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Compra
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL ADD VISIT --- */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsVisitModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveVisit}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Registrar Visita de Interventoría
                  </h3>
                  <button type="button" onClick={() => setIsVisitModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Tipo de Control *</label>
                      <select
                        value={controlType}
                        onChange={(e) => setControlType(e.target.value as 'Supervisión' | 'Interventoría')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-slate-900"
                      >
                        <option value="Supervisión" className="bg-white text-slate-900">Supervisión</option>
                        <option value="Interventoría" className="bg-white text-slate-900">Interventoría</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha Visita *</label>
                      <input
                        type="date"
                        value={controlDate}
                        onChange={(e) => setControlDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Inspector / Entidad *</label>
                    <input
                      type="text"
                      placeholder="Ej. Secretaría de Educación Municipal"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Calificación Obtenida (0 - 100%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scorePercentage}
                      onChange={(e) => setScorePercentage(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Detalle de Hallazgos *</label>
                    <textarea
                      placeholder="Describa los hallazgos principales de la inspección..."
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Plan de Acción / Medidas Correctivas</label>
                    <textarea
                      placeholder="Ej. Reemplazar licuadora, mejorar cadena de frío..."
                      value={actionPlan}
                      onChange={(e) => setActionPlan(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsVisitModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Visita
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
