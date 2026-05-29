'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { CurriculumBuilder } from '@/components/dashboard/CurriculumBuilder';
import { UserRole } from '@/lib/navigation';
import { useRouter } from 'next/navigation';

export default function MallasPage() {
  const [role, setRole] = useState<UserRole>('docente');
  const [name, setName] = useState<string>('Usuario');
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('aulacore-user-role') as UserRole;
    const storedName = localStorage.getItem('aulacore-user-name') || 'Usuario';
    if (storedRole) setRole(storedRole);
    if (storedName) setName(storedName);
  }, []);

  return (
    <AppLayout userRole={role} userName={name}>
      <div className="space-y-6">
        <CurriculumBuilder onBack={() => router.push('/dashboard')} />
      </div>
    </AppLayout>
  );
}
