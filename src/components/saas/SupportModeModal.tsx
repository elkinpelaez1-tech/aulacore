'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { InstitutionData } from '@/providers/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, Key, Loader2, CheckCircle2, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SupportModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any | null;
  onConfirmSupportMode: (tenantId: string, tenantName: string, reason: string) => Promise<void>;
}

export function SupportModeModal({ isOpen, onClose, tenant, onConfirmSupportMode }: SupportModeModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Por favor ingresa un motivo detallado (mínimo 5 caracteres) para el registro de auditoría.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirmSupportMode(tenant.id, tenant.name, reason.trim());
      onClose();
    } catch (err: any) {
      console.error('Error al iniciar modo soporte:', err);
      setError(err.message || 'Ocurrió un error al intentar ingresar al tenant en modo soporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl bg-white">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300 block">Acceso Técnico RBAC</span>
              <DialogTitle className="text-xl font-black text-white">Ingresar en Modo Soporte</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-indigo-200 mt-2 leading-relaxed">
            Estás a punto de acceder al entorno del cliente <strong className="text-white underline">{tenant.name}</strong> para asistencia técnica o acompañamiento.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold block">Acción Auditada en Tiempo Real</span>
              <p className="text-[11px] text-amber-800 leading-normal">
                Por seguridad y cumplimiento legal, este acceso quedará registrado inmutablemente en la auditoría global de AulaCore con tu usuario, fecha, hora y el motivo escrito abajo.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Motivo o Justificación de Soporte <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Soporte técnico solicitado por rectoría para verificación de reportes del SIMAT en el periodo 2..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none shadow-inner"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Inquilino Destino:</span>
            <span className="font-black text-slate-800 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">{tenant.nit || 'NIT NO REGISTRADO'}</span>
          </div>

          <DialogFooter className="pt-2 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl font-bold text-xs px-4 py-2 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs px-5 py-2 shadow-md flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando y Accediendo...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Iniciar Sesión de Soporte
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
