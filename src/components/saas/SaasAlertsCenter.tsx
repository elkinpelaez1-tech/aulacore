'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, ShieldAlert, Cpu, Clock, RefreshCw, CheckCircle2, 
  HardDrive, Zap, Server, ExternalLink, ArrowRight, Check, Eye, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SaasAlert {
  id: string;
  category: 'inactividad' | 'licencia' | 'ia_quota' | 'simat_error' | 'backup_status' | 'seguridad';
  priority: 'critica' | 'alta' | 'media' | 'baja';
  tenantName?: string;
  institution_id?: string;
  title: string;
  description: string;
  created_at: string;
  status: 'abierta' | 'en_proceso' | 'resuelta';
  suggested_action?: string;
}

export function SaasAlertsCenter() {
  const [alerts, setAlerts] = useState<SaasAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>('todas');
  const [filterPriority, setFilterPriority] = useState<string>('todas');

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        // Supabase select on saas_alerts
        const { data, error } = await supabase
          .from('saas_alerts')
          .select(`
            *,
            institutions (name)
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching saas_alerts:", error);
          setAlerts([]);
          return;
        }

        if (data) {
          const mapped = data.map((row: any) => ({
            ...row,
            tenantName: row.institutions?.name || 'Sistema Global',
          }));
          setAlerts(mapped as SaasAlert[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saas_alerts')
        .update({ status: 'resuelta', resolved_at: new Date().toISOString() })
        .eq('id', id);

      if (!error) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resuelta' } : a));
      }
    } catch(e) {
      console.error(e);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterCat !== 'todas' && a.category !== filterCat) return false;
    if (filterPriority !== 'todas' && a.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'critica':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Crítica</Badge>;
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Media</Badge>;
      case 'baja':
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">Baja</Badge>;
      default:
        return <Badge>{prio}</Badge>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'inactividad': return <Clock className="w-5 h-5 text-slate-400" />;
      case 'licencia': return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      case 'ia_quota': return <Cpu className="w-5 h-5 text-purple-500" />;
      case 'simat_error': return <RefreshCw className="w-5 h-5 text-red-500" />;
      case 'backup_status': return <HardDrive className="w-5 h-5 text-emerald-500" />;
      case 'seguridad': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Centro de Alertas & Monitoreo
          </h3>
          <p className="text-xs text-slate-500 mt-1">Gestión de incidentes, cuotas excedidas y salud del ecosistema</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs font-bold bg-slate-50 border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="todas">Todas las Prioridades</option>
            <option value="critica">Solo Críticas</option>
            <option value="alta">Solo Altas</option>
          </select>
          <select 
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="text-xs font-bold bg-slate-50 border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="todas">Todas las Categorías</option>
            <option value="licencia">Suscripciones / Licencias</option>
            <option value="simat_error">Integración SIMAT</option>
            <option value="ia_quota">Consumo IA</option>
            <option value="inactividad">Adopción / Inactividad</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold">Cargando alertas desde la base de datos...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black text-emerald-900">0 Alertas Activas</h4>
          <p className="text-emerald-700 mt-2 font-medium">El ecosistema SaaS opera con absoluta normalidad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAlerts.map(alert => (
            <Card key={alert.id} className={`p-5 rounded-2xl border ${alert.status === 'resuelta' ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'} shadow-xs hover:shadow-md transition-all`}>
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(alert.category)}
                </div>
                
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(alert.priority)}
                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                      {alert.category.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                    {alert.status === 'resuelta' && (
                      <Badge className="bg-emerald-100 text-emerald-800 ml-auto">Resuelta</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className={`text-base font-black ${alert.status === 'resuelta' ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                      {alert.title}
                    </h4>
                    <span className="text-xs font-bold text-indigo-600 block mt-0.5">
                      📍 {alert.tenantName}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 font-medium">
                    {alert.description}
                  </p>

                  {alert.suggested_action && alert.status !== 'resuelta' && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start mt-3">
                      <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block">Acción Sugerida AI</span>
                        <span className="text-xs text-blue-900 font-medium">{alert.suggested_action}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-2 md:min-w-[140px]">
                  {alert.status !== 'resuelta' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleResolve(alert.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Marcar Resuelta
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="w-full font-bold">
                    <Eye className="w-4 h-4 mr-1.5" />
                    Detalles
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
