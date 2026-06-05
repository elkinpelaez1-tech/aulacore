'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Users, Save, X } from 'lucide-react';

interface GovernmentMember {
  id: string;
  body_type: string;
  member_name: string;
  role_title: string;
  period: string;
}

interface PeiSchoolGovernmentProps {
  userRole: string;
  members: GovernmentMember[];
  onSave: (members: GovernmentMember[]) => void;
}

export function PeiSchoolGovernment({ userRole, members, onSave }: PeiSchoolGovernmentProps) {
  const [localMembers, setLocalMembers] = useState<GovernmentMember[]>(members);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GovernmentMember | null>(null);

  // Form states
  const [bodyType, setBodyType] = useState('Consejo Directivo');
  const [memberName, setMemberName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [period, setPeriod] = useState('2026');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';
  const canDelete = userRole === 'rector';

  const bodyTypes = [
    'Rector',
    'Consejo Directivo',
    'Consejo Académico',
    'Consejo Estudiantil',
    'Personero',
    'Contralor Escolar',
    'Consejo de Padres'
  ];

  const handleOpenAdd = () => {
    setEditingMember(null);
    setBodyType('Consejo Directivo');
    setMemberName('');
    setRoleTitle('');
    setPeriod('2026');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: GovernmentMember) => {
    setEditingMember(member);
    setBodyType(member.body_type);
    setMemberName(member.member_name);
    setRoleTitle(member.role_title);
    setPeriod(member.period);
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!memberName.trim() || !roleTitle.trim()) {
      alert('Por favor complete todos los campos.');
      return;
    }

    let updated: GovernmentMember[];
    if (editingMember) {
      updated = localMembers.map(m => 
        m.id === editingMember.id 
          ? { ...m, body_type: bodyType, member_name: memberName, role_title: roleTitle, period } 
          : m
      );
    } else {
      const newMember: GovernmentMember = {
        id: 'gov-' + Date.now(),
        body_type: bodyType,
        member_name: memberName,
        role_title: roleTitle,
        period
      };
      updated = [...localMembers, newMember];
    }

    setLocalMembers(updated);
    onSave(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!canDelete) return;
    if (confirm(`¿Está seguro de remover a ${name} del Gobierno Escolar?`)) {
      const updated = localMembers.filter(m => m.id !== id);
      setLocalMembers(updated);
      onSave(updated);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Gobierno Escolar
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Organigrama y miembros activos de los consejos y comités de gobierno escolar.
            </p>
          </div>
          {canEdit && (
            <Button
              onClick={handleOpenAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer border-none outline-none"
            >
              <Plus className="w-4 h-4" />
              Registrar Integrante
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {!canEdit && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-650 font-semibold">
              ⚠️ Tienes acceso de solo lectura. Solo los roles directivos pueden registrar o modificar integrantes.
            </div>
          )}
          {canEdit && !canDelete && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-amber-700 font-semibold">
              ℹ️ Rol Secretaría / Coordinador: Tienes permisos para crear y editar, pero el Rector retiene los privilegios exclusivos para eliminar registros.
            </div>
          )}

          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estamento / Órgano</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Integrante</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Cargo Asignado</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Periodo Lectivo</TableHead>
                {canEdit && <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {localMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="p-8 text-center text-xs text-slate-400 font-semibold">
                    No se registran integrantes en el Gobierno Escolar de este año lectivo.
                  </TableCell>
                </TableRow>
              ) : (
                localMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{member.body_type}</TableCell>
                    <TableCell className="font-semibold text-slate-700 text-xs">{member.member_name}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">{member.role_title}</TableCell>
                    <TableCell className="text-center font-extrabold text-slate-800 text-xs">{member.period}</TableCell>
                    {canEdit && (
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleOpenEdit(member)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {canDelete && (
                            <Button
                              onClick={() => handleDelete(member.id, member.member_name)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />
          
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveMember}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    {editingMember ? 'Editar Integrante' : 'Registrar Integrante'}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 outline-none border-none bg-transparent cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Estamento / Órgano</label>
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      {bodyTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre Integrante</label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Ortiz"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Cargo Interno</label>
                      <input
                        type="text"
                        placeholder="Ej. Representante, Vocal..."
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Periodo Lectivo</label>
                      <input
                        type="text"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer h-9 border-none"
                >
                  {editingMember ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
