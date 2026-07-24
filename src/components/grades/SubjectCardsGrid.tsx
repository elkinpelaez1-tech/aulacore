'use client';

import React, { useState } from 'react';
import { SubjectCard } from './SubjectCard';
import { SubjectDetailModal } from './SubjectDetailModal';
const MOCK_SUBJECTS: any[] = [];

export function SubjectCardsGrid() {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_SUBJECTS.map((subject) => (
          <SubjectCard 
            key={subject.id} 
            subject={subject} 
            onClick={handleSubjectClick} 
          />
        ))}
      </div>

      <SubjectDetailModal 
        subject={selectedSubject} 
        isOpen={!!selectedSubject} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
