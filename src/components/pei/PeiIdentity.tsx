'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, FileSignature, Sparkles } from 'lucide-react';

interface PeiIdentityProps {
  userRole: string;
  identityData: {
    mission: string;
    vision: string;
    principles: string;
    values: string;
    studentProfile: string;
    teacherProfile: string;
    graduateProfile: string;
  };
  onSave: (data: any) => void;
}

export function PeiIdentity({ userRole, identityData, onSave }: PeiIdentityProps) {
  const [formData, setFormData] = useState(identityData);
  const [saving, setSaving] = useState(false);

  const canEdit = userRole === 'rector' || userRole === 'secretaria';

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    setSaving(true);
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      alert('✓ Identidad Institucional actualizada exitosamente en los registros.');
    }, 800);
  };

  const fields = [
    { id: 'mission', label: 'Misión del Plantel', placeholder: 'Escriba la misión institucional...', rows: 3 },
    { id: 'vision', label: 'Visión del Plantel', placeholder: 'Escriba la visión institucional...', rows: 3 },
    { id: 'principles', label: 'Principios Institucionales', placeholder: 'Escriba los principios rectores del colegio...', rows: 3 },
    { id: 'values', label: 'Valores Institucionales', placeholder: 'Ej. Respeto, Tolerancia, Compromiso...', rows: 3 },
    { id: 'studentProfile', label: 'Perfil del Estudiante', placeholder: 'Defina las competencias y rasgos esperados en el estudiante...', rows: 3 },
    { id: 'teacherProfile', label: 'Perfil del Docente', placeholder: 'Defina el perfil idóneo de los docentes del plantel...', rows: 3 },
    { id: 'graduateProfile', label: 'Perfil del Egresado', placeholder: 'Defina la impronta y rasgos del egresado institucional...', rows: 3 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-600" />
              Identidad Institucional
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Definición del propósito y fundamentos misionales de la institución.
            </p>
          </div>
          {canEdit && (
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer border-none outline-none"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!canEdit && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 font-semibold mb-2">
              ⚠️ Tienes acceso de solo lectura. Solo el Rector y la Secretaría pueden editar la Identidad Institucional.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div 
                key={field.id} 
                className={field.id === 'mission' || field.id === 'vision' ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}
              >
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  {field.label}
                </label>
                <textarea
                  value={(formData as any)[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  className="w-full text-xs font-semibold placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 transition-all font-medium leading-relaxed resize-none"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
