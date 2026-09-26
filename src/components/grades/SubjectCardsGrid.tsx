'use client';

import React, { useState } from 'react';
import { SubjectCard } from './SubjectCard';
import { SubjectDetailModal } from './SubjectDetailModal';
import { BookOpen } from 'lucide-react';

interface SubjectCardsGridProps {
  subjects?: any[];
}

export function SubjectCardsGrid({ subjects = [] }: SubjectCardsGridProps) {
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  const handleSubjectClick = (subject: any) => {
    setSelectedSubject(subject);
  };

  const handleCloseModal = () => {
    setSelectedSubject(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Calificaciones por Materia</h3>
      </div>

      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={handleSubjectClick}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
            <BookOpen className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">Sin asignaciones académicas activas</h4>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            No tienes cursos o asignaturas asignadas para el periodo escolar actual. Cuando la coordinación parametrice la carga académica y matricule a los estudiantes, tus planillas aparecerán aquí.
          </p>
        </div>
      )}

      <SubjectDetailModal
        subject={selectedSubject}
        isOpen={!!selectedSubject}
        onClose={handleCloseModal}
      />
    </div>
  );
}
