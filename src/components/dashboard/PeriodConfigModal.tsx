'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { useRole } from '@/providers/role-provider';

export interface AcademicPeriodConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface PeriodConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (periods: AcademicPeriodConfig[]) => void;
}

export function PeriodConfigModal({ isOpen, onClose, onSave }: PeriodConfigModalProps) {
  const { userRole } = useRole();
  const [periods, setPeriods] = useState<AcademicPeriodConfig[]>([]);

  useEffect(() => {
    // Load from local storage or set defaults
    const stored = localStorage.getItem('aulacore-periods-config');
    if (stored) {
      setPeriods(JSON.parse(stored));
    } else {
      setPeriods([
        { id: '1', name: 'Periodo 1', startDate: '2026-01-15', endDate: '2026-03-30' },
        { id: '2', name: 'Periodo 2', startDate: '2026-04-01', endDate: '2026-06-15' },
        { id: '3', name: 'Periodo 3', startDate: '2026-07-05', endDate: '2026-09-15' },
        { id: '4', name: 'Periodo 4', startDate: '2026-09-20', endDate: '2026-11-30' },
      ]);
    }
  }, [isOpen]);

  const handleAddPeriod = () => {
    setPeriods([
      ...periods,
      {
        id: Date.now().toString(),
        name: `Periodo ${periods.length + 1}`,
        startDate: '',
        endDate: '',
      },
    ]);
  };

  const handleRemovePeriod = (id: string) => {
    setPeriods(periods.filter((p) => p.id !== id));
  };

  const handleChange = (id: string, field: keyof AcademicPeriodConfig, value: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSave = () => {
    localStorage.setItem('aulacore-periods-config', JSON.stringify(periods));
    onSave(periods);
    onClose();
  };

  // Only Rectores or Coordinadores should ideally configure this.
  const canEdit = userRole === 'rector' || userRole === 'coordinador';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Configuración del Año Lectivo
          </DialogTitle>
          <DialogDescription>
            Define los periodos académicos y sus fechas de corte. Esto afectará la visibilidad de los boletines y las mallas curriculares.
          </DialogDescription>
        </DialogHeader>

        {!canEdit && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-center gap-2 text-sm font-medium mb-4">
            <AlertCircle className="w-4 h-4" />
            Solo el Rector o Coordinador pueden modificar estas fechas.
          </div>
        )}

        <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {periods.map((period, index) => (
            <div key={period.id} className="grid grid-cols-12 gap-3 items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div className="col-span-1 flex justify-center text-slate-400 font-bold text-sm">
                #{index + 1}
              </div>
              <div className="col-span-3">
                <Input
                  value={period.name}
                  onChange={(e) => handleChange(period.id, 'name', e.target.value)}
                  placeholder="Nombre..."
                  disabled={!canEdit}
                  className="h-8 text-sm font-bold border-slate-300"
                />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Inicio</label>
                <Input
                  type="date"
                  value={period.startDate}
                  onChange={(e) => handleChange(period.id, 'startDate', e.target.value)}
                  disabled={!canEdit}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-4">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Fin (Cierre Notas)</label>
                <Input
                  type="date"
                  value={period.endDate}
                  onChange={(e) => handleChange(period.id, 'endDate', e.target.value)}
                  disabled={!canEdit}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePeriod(period.id)}
                    className="text-slate-400 hover:text-red-600 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {canEdit && (
          <Button
            variant="outline"
            className="w-full border-dashed border-2 border-slate-300 text-slate-600 hover:text-indigo-700 hover:border-indigo-300 font-bold"
            onClick={handleAddPeriod}
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar Nuevo Periodo
          </Button>
        )}

        <DialogFooter className="mt-6 border-t pt-4 border-slate-100">
          <Button variant="ghost" onClick={onClose} className="font-bold text-slate-600">
            Cancelar
          </Button>
          {canEdit && (
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
              <Save className="w-4 h-4" /> Guardar Calendario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
