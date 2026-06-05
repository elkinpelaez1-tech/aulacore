'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Users, Search, Check, X, ShieldAlert, Award, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  grade?: string;
}

interface PaeBeneficiary {
  student_id: string;
  is_beneficiary: boolean;
  entry_date: string;
  exit_date?: string;
  modality: string;
  prioritization_reason: string;
  classifications: string[];
}

interface PaeBeneficiariesProps {
  userRole: string;
  students: Student[];
  beneficiaries: PaeBeneficiary[];
  onSaveBeneficiaries: (data: PaeBeneficiary[]) => void;
}

export function PaeBeneficiaries({
  userRole,
  students = [],
  beneficiaries = [],
  onSaveBeneficiaries
}: PaeBeneficiariesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBeneficiary, setFilterBeneficiary] = useState<'all' | 'beneficiary' | 'non_beneficiary'>('all');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Form states for editing/registering a beneficiary
  const [modality, setModality] = useState('Almuerzo Caliente Preparado en Sitio');
  const [reason, setReason] = useState('Jornada Única');
  const [classifications, setClassifications] = useState<string[]>([]);

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';

  const classificationOptions = [
    'Rural',
    'Discapacidad',
    'Comunidad étnica',
    'Jornada única',
    'Vulnerabilidad'
  ];

  // Map students and their PAE status
  const studentsWithPae = students.map(student => {
    const pae = beneficiaries.find(b => b.student_id === student.id);
    return {
      ...student,
      paeStatus: pae ? pae.is_beneficiary : false,
      modality: pae ? pae.modality : 'Ninguna',
      prioritization: pae ? pae.prioritization_reason : 'N/A',
      classifications: pae ? pae.classifications : [],
      entry_date: pae ? pae.entry_date : null
    };
  });

  // Filter students based on search and selected filter
  const filteredStudents = studentsWithPae.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || s.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBeneficiary === 'beneficiary') {
      return matchesSearch && s.paeStatus;
    }
    if (filterBeneficiary === 'non_beneficiary') {
      return matchesSearch && !s.paeStatus;
    }
    return matchesSearch;
  });

  const handleTogglePaeStatus = (studentId: string, currentPae: boolean) => {
    if (!canEdit) return;
    
    let updated: PaeBeneficiary[];
    if (currentPae) {
      // Retirar del programa: Modificamos el registro existente
      updated = beneficiaries.map(b => 
        b.student_id === studentId 
          ? { ...b, is_beneficiary: false, exit_date: new Date().toISOString().split('T')[0] } 
          : b
      );
    } else {
      // Inscribir en el programa
      const exists = beneficiaries.some(b => b.student_id === studentId);
      if (exists) {
        updated = beneficiaries.map(b => 
          b.student_id === studentId 
            ? { ...b, is_beneficiary: true, exit_date: undefined } 
            : b
        );
      } else {
        const newB: PaeBeneficiary = {
          student_id: studentId,
          is_beneficiary: true,
          entry_date: new Date().toISOString().split('T')[0],
          modality: 'Almuerzo Caliente Preparado en Sitio',
          prioritization_reason: 'Jornada Única',
          classifications: ['Jornada única']
        };
        updated = [...beneficiaries, newB];
      }
    }
    onSaveBeneficiaries(updated);
    alert('✓ Estado PAE actualizado.');
  };

  const handleOpenEdit = (studentId: string) => {
    const b = beneficiaries.find(x => x.student_id === studentId);
    if (b) {
      setModality(b.modality);
      setReason(b.prioritization_reason);
      setClassifications(b.classifications || []);
      setEditingStudentId(studentId);
    } else {
      setModality('Almuerzo Caliente Preparado en Sitio');
      setReason('Jornada Única');
      setClassifications(['Jornada única']);
      setEditingStudentId(studentId);
    }
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;

    let updated: PaeBeneficiary[];
    const exists = beneficiaries.some(b => b.student_id === editingStudentId);

    if (exists) {
      updated = beneficiaries.map(b => 
        b.student_id === editingStudentId 
          ? { 
              ...b, 
              is_beneficiary: true,
              modality, 
              prioritization_reason: reason, 
              classifications 
            } 
          : b
      );
    } else {
      const newB: PaeBeneficiary = {
        student_id: editingStudentId,
        is_beneficiary: true,
        entry_date: new Date().toISOString().split('T')[0],
        modality,
        prioritization_reason: reason,
        classifications
      };
      updated = [...beneficiaries, newB];
    }

    onSaveBeneficiaries(updated);
    setEditingStudentId(null);
    alert('✓ Ficha PAE del estudiante guardada.');
  };

  const handleToggleClassification = (val: string) => {
    if (classifications.includes(val)) {
      setClassifications(prev => prev.filter(c => c !== val));
    } else {
      setClassifications(prev => [...prev, val]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar estudiante por nombre o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
          />
        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl gap-1.5 self-stretch md:self-auto overflow-x-auto select-none">
          <button
            onClick={() => setFilterBeneficiary('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none",
              filterBeneficiary === 'all' ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-505"
            )}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterBeneficiary('beneficiary')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none",
              filterBeneficiary === 'beneficiary' ? "bg-white text-emerald-800 shadow-sm font-black" : "bg-transparent text-slate-505"
            )}
          >
            Beneficiarios ({beneficiaries.filter(b => b.is_beneficiary).length})
          </button>
          <button
            onClick={() => setFilterBeneficiary('non_beneficiary')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none",
              filterBeneficiary === 'non_beneficiary' ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-505"
            )}
          >
            No Beneficiarios ({students.length - beneficiaries.filter(b => b.is_beneficiary).length})
          </button>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estudiante</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Matrícula</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Beneficiario PAE</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Modalidad</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Clasificación Priorizada</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Ficha PAE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center text-xs text-slate-400 font-semibold">
                    No se encontraron estudiantes para los filtros actuales.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{s.first_name} {s.last_name}</TableCell>
                    <TableCell className="font-semibold text-slate-500 text-xs font-mono">{s.enrollment_number}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTogglePaeStatus(s.id, s.paeStatus)}
                          disabled={!canEdit}
                          className="bg-transparent border-none cursor-pointer outline-none text-slate-400 hover:text-indigo-650"
                          title={s.paeStatus ? 'Retirar del programa' : 'Inscribir en el programa'}
                        >
                          {s.paeStatus ? (
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                              <Check className="w-3.5 h-3.5" /> Beneficiario
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <X className="w-3.5 h-3.5" /> No Activo
                            </div>
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-655 font-bold">
                      {s.modality}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      <div className="flex flex-wrap gap-1">
                        {s.classifications?.map((c: string) => (
                          <span key={c} className="bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md border border-slate-200">
                            {c}
                          </span>
                        ))}
                        {s.classifications?.length === 0 && <span className="text-slate-400 italic text-[10px]">Ninguna</span>}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {canEdit ? (
                        <Button
                          onClick={() => handleOpenEdit(s.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 text-indigo-600 font-bold text-xs px-2.5 hover:bg-indigo-50"
                        >
                          Editar Ficha
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Ver Ficha</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- MODAL EDIT DETAILS --- */}
      {editingStudentId && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setEditingStudentId(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveDetails}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Editar Ficha PAE
                  </h3>
                  <button type="button" onClick={() => setEditingStudentId(null)} className="text-slate-400 hover:text-slate-600 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Modalidad Asignada</label>
                    <select
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Almuerzo Caliente Preparado en Sitio">Almuerzo Caliente Preparado en Sitio</option>
                      <option value="Ración Industrializada">Ración Industrializada</option>
                      <option value="Ración Transportada">Ración Transportada</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Criterio de Priorización</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Jornada Única">Jornada Única</option>
                      <option value="Ruralidad">Ruralidad</option>
                      <option value="Discapacidad">Discapacidad</option>
                      <option value="Víctima Conflicto">Víctima Conflicto</option>
                      <option value="Extrema Pobreza">Extrema Pobreza</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Clasificaciones del Beneficiario</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      {classificationOptions.map(val => (
                        <div
                          key={val}
                          onClick={() => handleToggleClassification(val)}
                          className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={classifications.includes(val)}
                            readOnly
                            className="w-4 h-4 rounded text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-slate-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setEditingStudentId(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
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
