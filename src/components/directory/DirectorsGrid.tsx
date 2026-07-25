'use client';

import React, { useState, useEffect } from 'react';
import { GroupDirectorCard, DirectorData } from './GroupDirectorCard';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { useRole } from '@/providers/role-provider';
import { supabase } from '@/lib/supabase';

export function DirectorsGrid() {
  const { institutionId } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [directors, setDirectors] = useState<DirectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDirectors() {
      if (!institutionId) {
        setDirectors([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_roles')
          .select('user_id, role, profiles(id, full_name, document_id, email, phone)')
          .eq('institution_id', institutionId)
          .eq('role', 'director_grupo');

        if (error) {
          console.error('Error cargando directores:', error);
          setDirectors([]);
        } else if (data) {
          const mapped: DirectorData[] = data.map((item: any, idx: number) => {
            const profile = item.profiles || {};
            return {
              id: profile.id || `dir-${idx}`,
              name: profile.full_name || 'Director Asignado',
              document: profile.document_id || '',
              email: profile.email || '',
              phone: profile.phone || '',
              groupAssigned: 'Por Asignar',
              studentCount: 0
            };
          });
          setDirectors(mapped);
        }
      } catch (err) {
        console.error('Error fetching directors:', err);
        setDirectors([]);
      } finally {
        setLoading(false);
      }
    }
    loadDirectors();
  }, [institutionId]);

  const filteredDirectors = directors.filter(d => 
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
        {filteredDirectors.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No existen directores de grupo registrados.</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Asigna la dirección de grupo a tus docentes desde el módulo de Cursos o Configuración de Roles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
