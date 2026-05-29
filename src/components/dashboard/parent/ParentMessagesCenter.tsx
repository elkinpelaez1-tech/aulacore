'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function ParentMessagesCenter() {
  return (
    <Card className="border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex flex-col h-[400px]">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=68" alt="Director" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-800 leading-tight">Lic. Carlos Ruiz</CardTitle>
            <p className="text-xs font-semibold text-slate-500">Director de Grupo (11° B)</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full p-4">
          <div className="space-y-4">
            
            {/* Timestamp */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">Hoy</span>
            </div>

            {/* Received Message */}
            <div className="flex items-end gap-2 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0 mb-1">
                <img src="https://i.pravatar.cc/150?img=68" alt="Director" className="w-full h-full object-cover" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  Buenos días, Sra. María Fernanda. Quería felicitar el desempeño de Alejandro en Matemáticas. Sin embargo, me preocupa un poco su rendimiento en Física. ¿Podríamos programar una breve llamada esta semana?
                </p>
                <p className="text-[10px] font-bold text-slate-400 text-right mt-1">08:30 AM</p>
              </div>
            </div>

            {/* Sent Message */}
            <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
              <div className="bg-indigo-600 rounded-2xl rounded-br-sm px-4 py-2.5 text-white">
                <p className="text-sm font-medium leading-relaxed">
                  Profesor Carlos, muchas gracias por avisarme. Claro que sí, estoy disponible el jueves a las 4:00 PM.
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-[10px] font-bold text-indigo-200">09:15 AM</p>
                  <CheckCircle2 className="w-3 h-3 text-indigo-300" />
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t border-slate-100 bg-slate-50/50">
        <form className="flex w-full items-center gap-2" onSubmit={(e) => e.preventDefault()}>
          <Input 
            placeholder="Escribe un mensaje al director..." 
            className="flex-1 rounded-full border-slate-200 bg-white px-4 focus-visible:ring-indigo-500"
          />
          <Button type="submit" size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
