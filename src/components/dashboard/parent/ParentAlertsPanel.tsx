'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Clock, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ParentAlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      const { data: { user } } = await supabase.auth.getUser();
      // No explicit institution filter; RLS will scope alerts to the tenant.
      const { data, error } = await supabase
        .from('early_alerts')
        .select('*');
      if (data && !error) setAlerts(data);
    }
    fetchAlerts();
  }, []);

  return (
    <Card className="border-slate-200 shadow-sm col-span-1">
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Alertas Importantes
          </CardTitle>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">
            {alerts?.length ?? 0}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100">
          {alerts?.map((alert) => (
            <div key={alert.id} className="p-4 bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-1">
                  <FileWarning className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-800">{alert.title || 'Alerta'}</h4>
                    <span className="text-[10px] font-bold text-rose-500 uppercase">{alert.priority || 'Alta'}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    {alert.description || 'Sin descripción'}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs font-bold text-rose-700 mt-2">
                    Ver detalle
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {alerts?.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay alertas.</p>
        )}
      </CardContent>
    </Card>
  );
}
