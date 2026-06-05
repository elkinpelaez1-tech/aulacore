'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Blocks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeiPedagogicalModelProps {
  userRole: string;
  modelData: {
    modelType: string;
    description: string;
  };
  onSave: (data: any) => void;
}

export function PeiPedagogicalModel({ userRole, modelData, onSave }: PeiPedagogicalModelProps) {
  const [formData, setFormData] = useState(modelData);
  const [saving, setSaving] = useState(false);

  const canEdit = userRole === 'rector' || userRole === 'secretaria';

  const modelsList = [
    { value: 'Tradicional', label: 'Tradicional', desc: 'Enfoque centrado en la transmisión de conocimientos del docente al alumno.' },
    { value: 'Constructivista', label: 'Constructivista', desc: 'Construcción activa de conocimientos basada en experiencias previas y resolución de problemas.' },
    { value: 'Montessori', label: 'Montessori', desc: 'Educación basada en la autonomía, el aprendizaje práctico y la libre elección guiada.' },
    { value: 'Reggio Emilia', label: 'Reggio Emilia', desc: 'Metodología que valora las capacidades expresivas innatas y la auto-dirección del niño.' },
    { value: 'ABP', label: 'ABP (Proyectos)', desc: 'Aprendizaje Basado en Proyectos y resolución de retos transversales del entorno real.' },
    { value: 'Aprendizaje Significativo', label: 'Aprendizaje Significativo', desc: 'Asociación e integración lógica de saberes nuevos en la estructura cognitiva.' },
    { value: 'Personalizado', label: 'Personalizado / Híbrido', desc: 'Adaptación curricular a los ritmos individuales y competencias del alumno.' }
  ];

  const handleSelectModel = (value: string) => {
    if (!canEdit) return;
    handleChange('modelType', value);
  };

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
      alert('✓ Modelo Pedagógico actualizado y registrado formalmente.');
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <Blocks className="w-5 h-5 text-indigo-600" />
              Modelo Pedagógico
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Selección y justificación del modelo pedagógico y metodologías educativas.
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
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 font-semibold">
              ⚠️ Tienes acceso de solo lectura. Solo el Rector y la Secretaría pueden editar el Modelo Pedagógico.
            </div>
          )}

          {/* Model Selection grid */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Seleccionar Enfoque Curricular
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {modelsList.map((m) => {
                const isSelected = formData.modelType === m.value;
                return (
                  <div
                    key={m.value}
                    onClick={() => handleSelectModel(m.value)}
                    className={cn(
                      "p-4 border rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between select-none min-h-[120px] text-left",
                      isSelected
                        ? "bg-indigo-50/50 border-indigo-500 shadow-sm"
                        : "bg-slate-50/20 border-slate-200 hover:border-slate-350 hover:bg-slate-50/50",
                      !canEdit && "cursor-default opacity-80"
                    )}
                  >
                    <div>
                      <h4 className={cn("text-xs font-black", isSelected ? "text-indigo-900" : "text-slate-900")}>
                        {m.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1.5">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Descripción y Justificación Pedagógica
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={!canEdit}
              placeholder="Describa cómo se operativiza el modelo pedagógico en la institución..."
              rows={8}
              className="w-full text-xs font-semibold placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 transition-all font-medium leading-relaxed resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
