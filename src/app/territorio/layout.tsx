import React from 'react';
import { TerritoryLayout } from '@/components/territorio/TerritoryLayout';

export default function RootTerritoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TerritoryLayout>{children}</TerritoryLayout>;
}
