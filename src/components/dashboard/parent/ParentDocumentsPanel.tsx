'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ParentDocumentsPanel() {
  return (
    <Card className="border-slate-200 shadow-sm col-span-1">
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Documentos Oficiales
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-3">
        
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-none mb-1">Boletín Periodo 2</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Generado: 10 May 2026</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-none mb-1">Constancia de Estudio</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Año Lectivo 2026</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="outline" className="w-full mt-2 border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 font-bold">
          Solicitar otro documento
        </Button>

      </CardContent>
    </Card>
  );
}
