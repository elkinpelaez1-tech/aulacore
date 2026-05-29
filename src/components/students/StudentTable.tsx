'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentMockData } from '@/lib/data/mock-students';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  students: StudentMockData[];
  onClick: (student: StudentMockData) => void;
}

export function StudentTable({ students, onClick }: Props) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-xl bg-white">
        <p>No se encontraron estudiantes con los filtros actuales.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[250px]">Estudiante</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Grado/Curso</TableHead>
            <TableHead>Sede</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Prom.</TableHead>
            <TableHead className="text-right">Asist.</TableHead>
            <TableHead className="text-right">Alertas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const hasAlerts = student.alerts.length > 0;
            const gpaColor = student.gpa >= 4.0 ? 'text-emerald-600' : student.gpa >= 3.0 ? 'text-amber-600' : student.gpa > 0 ? 'text-rose-600' : 'text-slate-400';

            return (
              <TableRow 
                key={student.id} 
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onClick(student)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{student.name}</p>
                      <p className="text-[10px] text-slate-500">{student.gender}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 text-xs font-medium">{student.document}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                    {student.group}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-700">{student.campus}</div>
                  <div className="text-[10px] text-slate-500">{student.shift}</div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    student.status === 'Activo' ? "bg-emerald-50 text-emerald-700" :
                    student.status === 'Retirado' ? "bg-rose-50 text-rose-700" :
                    student.status === 'Suspendido' ? "bg-amber-50 text-amber-700" :
                    "bg-blue-50 text-blue-700"
                  )}>
                    {student.status}
                  </span>
                </TableCell>
                <TableCell className={cn("text-right font-bold text-xs", gpaColor)}>
                  {student.gpa > 0 ? student.gpa.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell className="text-right font-bold text-xs">
                  <span className={student.attendanceRate >= 90 ? 'text-emerald-600' : 'text-rose-600'}>
                    {student.attendanceRate}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {hasAlerts ? (
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-bold border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        {student.alerts.length}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
