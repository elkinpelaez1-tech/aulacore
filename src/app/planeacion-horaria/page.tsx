'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { ScheduleBuilder } from '@/components/dashboard/ScheduleBuilder';
import { UserRole } from '@/lib/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function PlaneacionHorariaPage() {
  const { roles, activeRole, profile } = useAuth();
  
  // Si no ha cargado, o si no hay rol, podemos mostrar un loading o fallback
  // Por robustez, también revisamos localStorage
  const [roleToUse, setRoleToUse] = useState<UserRole>('coordinador');
  const [nameToUse, setNameToUse] = useState<string>('Usuario');

  useEffect(() => {
    const storedRole = localStorage.getItem('aulacore-user-role') as UserRole;
    const storedName = localStorage.getItem('aulacore-user-name') || 'Usuario';
    
    if (activeRole) {
      setRoleToUse(activeRole);
    } else if (storedRole) {
      setRoleToUse(storedRole);
    }

    if (profile) {
      setNameToUse(`${profile.first_name} ${profile.last_name}`);
    } else if (storedName) {
      setNameToUse(storedName);
    }
  }, [activeRole, profile]);

  return (
    <AppLayout userRole={roleToUse} userName={nameToUse}>
      <div className="space-y-6">
        <ScheduleBuilder />
      </div>
    </AppLayout>
  );
}
