'use client';

import React, { useState } from 'react';
import { GroupDirectorCard, DirectorData } from './GroupDirectorCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const MOCK_DIRECTORS: DirectorData[] = [
  {
    id: '1',
    name: 'Carolina Martínez Restrepo',
    document: '1020456789',
    email: 'cmartinez@aulacore.edu.co',
    phone: '+57 300 123 4567',
    groupAssigned: '10-A (Media Académica)',
    studentCount: 35,
    avatarUrl: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '2',
    name: 'Andrés Felipe Gómez',
    document: '1030987654',
    email: 'agomez@aulacore.edu.co',
    phone: '+57 310 987 6543',
    groupAssigned: '11-B (Media Académica)',
    studentCount: 32,
    avatarUrl: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '3',
    name: 'Luisa Fernanda Ortiz',
    document: '45678123',
    email: 'lortiz@aulacore.edu.co',
    phone: '+57 315 456 7890',
    groupAssigned: '9-C (Básica Secundaria)',
    studentCount: 40,
    avatarUrl: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: '4',
    name: 'Javier Ramírez Soto',
    document: '78901234',
    email: 'jramirez@aulacore.edu.co',
    phone: '+57 320 567 1234',
    groupAssigned: '8-A (Básica Secundaria)',
    studentCount: 38,
    avatarUrl: 'https://i.pravatar.cc/150?u=4'
  },
  {
    id: '5',
    name: 'María Camila Jaramillo',
    document: '10101010',
    email: 'mjaramillo@aulacore.edu.co',
    phone: '+57 312 345 6789',
    groupAssigned: '6-B (Básica Secundaria)',
    studentCount: 42,
    avatarUrl: 'https://i.pravatar.cc/150?u=5'
  }
];

export function DirectorsGrid() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDirectors = MOCK_DIRECTORS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.groupAssigned.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            placeholder="Buscar por nombre o grupo (ej. 10-A)..." 
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm font-bold text-slate-500">
          Mostrando {filteredDirectors.length} directores
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDirectors.map(director => (
          <GroupDirectorCard key={director.id} director={director} />
        ))}
        {filteredDirectors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-semibold">
            No se encontraron directores que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
