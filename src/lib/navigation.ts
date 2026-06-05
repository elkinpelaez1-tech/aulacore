import {
  LayoutDashboard,
  Users,
  BookOpen,
  QrCode,
  BarChart3,
  Bell,
  Settings,
  Eye,
  FileText,
  PenTool,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  TrendingUp,
  Target,
  FileBadge,
  ClipboardList,
  Utensils,
  Database,
} from 'lucide-react';

export type UserRole = 'rector' | 'coordinador' | 'director_grupo' | 'docente' | 'secretaria' | 'padre_familia' | 'estudiante';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  header?: string;
}

export interface NavMenu {
  role: UserRole;
  displayName: string;
  items: NavItem[];
}

export const NAVIGATION_MENUS: Record<UserRole, NavItem[]> = {
  rector: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: '2',
    },
    {
      label: 'Directores de Grupo',
      href: '/directores',
      icon: Users,
    },
    {
      label: 'Docentes',
      href: '/docentes',
      icon: Users,
    },
    {
      label: 'Estudiantes',
      href: '/estudiantes',
      icon: Users,
    },
    {
      label: 'Cursos',
      href: '/cursos',
      icon: BookOpen,
    },
    {
      label: 'Reportes',
      href: '/reportes',
      icon: BarChart3,
    },
    {
      label: 'Alertas',
      href: '/alertas',
      icon: Bell,
    },
    {
      label: 'Evaluaciones IA',
      href: '/evaluaciones',
      icon: BrainCircuit,
    },
    {
      label: 'Proyecto Educativo (PEI)',
      href: '/pei',
      icon: Target,
      header: 'Gestión Institucional',
    },
    {
      label: 'Programa Alimentación (PAE)',
      href: '/pae',
      icon: Utensils,
    },
    {
      label: 'Centro de Migración',
      href: '/migracion',
      icon: Database,
    },
    {
      label: 'Configuración',
      href: '/configuracion',
      icon: Settings,
    },
  ],

  coordinador: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Mis Alumnos',
      href: '/mis-alumnos',
      icon: Users,
    },
    {
      label: 'Planeación Horaria',
      href: '/planeacion-horaria',
      icon: BookOpen,
      badge: '3',
    },
    {
      label: 'Directores de Grupo',
      href: '/directores',
      icon: Users,
    },
    {
      label: 'Docentes',
      href: '/docentes',
      icon: Users,
    },
    {
      label: 'Mallas Curriculares',
      href: '/mallas',
      icon: BrainCircuit,
      badge: 'Nuevo'
    },
    {
      label: 'Estudiantes',
      href: '/estudiantes',
      icon: Users,
    },
    {
      label: 'Observaciones',
      href: '/observaciones',
      icon: FileText,
    },
    {
      label: 'Evaluaciones IA',
      href: '/evaluaciones',
      icon: BrainCircuit,
    },
    {
      label: 'Proyecto Educativo (PEI)',
      href: '/pei',
      icon: Target,
      header: 'Gestión Institucional',
    },
    {
      label: 'Programa Alimentación (PAE)',
      href: '/pae',
      icon: Utensils,
    },
    {
      label: 'Centro de Migración',
      href: '/migracion',
      icon: Database,
    },
    {
      label: 'Alertas',
      href: '/alertas',
      icon: Bell,
    },
  ],

  director_grupo: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Estudiantes',
      href: '/estudiantes',
      icon: Users,
    },
    {
      label: 'Mallas Curriculares',
      href: '/mallas',
      icon: BrainCircuit,
    },
    {
      label: 'Asistencia QR',
      href: '/asistencia',
      icon: QrCode,
    },
    {
      label: 'Observaciones',
      href: '/observaciones',
      icon: FileText,
    },
    {
      label: 'Alertas',
      href: '/alertas',
      icon: AlertCircle,
    },
    {
      label: 'Proyecto Educativo (PEI)',
      href: '/pei',
      icon: Target,
      header: 'Gestión Institucional',
    },
    {
      label: 'Programa Alimentación (PAE)',
      href: '/pae',
      icon: Utensils,
    },
    {
      label: 'Reportes',
      href: '/reportes',
      icon: BarChart3,
    },
  ],

  docente: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Mis Alumnos',
      href: '/mis-alumnos',
      icon: Users,
    },
    {
      label: 'Cursos',
      href: '/cursos',
      icon: BookOpen,
    },
    {
      label: 'Notas',
      href: '/notas',
      icon: PenTool,
    },
    {
      label: 'Evaluaciones IA',
      href: '/evaluaciones',
      icon: BrainCircuit,
    },
    {
      label: 'Mallas Curriculares',
      href: '/mallas',
      icon: BrainCircuit,
    },
    {
      label: 'Asistencia',
      href: '/asistencia',
      icon: QrCode,
    },
    {
      label: 'Proyecto Educativo (PEI)',
      href: '/pei',
      icon: Target,
      header: 'Gestión Institucional',
    },
    {
      label: 'Programa Alimentación (PAE)',
      href: '/pae',
      icon: Utensils,
    },
  ],

  secretaria: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Estudiantes',
      href: '/estudiantes',
      icon: Users,
    },
    {
      label: 'Docentes',
      href: '/docentes',
      icon: Users,
    },
    {
      label: 'Documentos',
      href: '/documentos',
      icon: FileText,
    },
    {
      label: 'Proyecto Educativo (PEI)',
      href: '/pei',
      icon: Target,
      header: 'Gestión Institucional',
    },
    {
      label: 'Programa Alimentación (PAE)',
      href: '/pae',
      icon: Utensils,
    },
    {
      label: 'Centro de Migración',
      href: '/migracion',
      icon: Database,
    },
    {
      label: 'Configuración',
      href: '/configuracion',
      icon: Settings,
    },
  ],

  padre_familia: [
    {
      label: 'Dashboard',
      href: '/dashboard?tab=actividad',
      icon: LayoutDashboard,
    },
    {
      label: 'Anotaciones',
      href: '/dashboard?tab=observador',
      icon: ClipboardList,
    },
    {
      label: 'Notas',
      href: '/dashboard?tab=notas',
      icon: BarChart3,
    },
    {
      label: 'Alertas',
      href: '/dashboard?tab=actividad',
      icon: Bell,
    },
  ],
  estudiante: [
    {
      label: 'Mi Panel',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Notas Académicas',
      href: '/notas-academicas',
      icon: BookOpen,
    },
    {
      label: 'Mi Rendimiento',
      href: '/rendimiento',
      icon: TrendingUp,
    },
    {
      label: 'Plan Académico',
      href: '/plan-academico',
      icon: Target,
    },
    {
      label: 'Documentos',
      href: '/documentos',
      icon: FileBadge,
    },
    {
      label: 'Mensajes',
      href: '/mensajes',
      icon: Bell,
    },
  ],
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  rector: 'Rector',
  coordinador: 'Coordinador Académico/Convivencial',
  director_grupo: 'Director de Grupo',
  docente: 'Docente',
  secretaria: 'Secretaria',
  padre_familia: 'Padre de Familia',
  estudiante: 'Estudiante',
};

export const ACADEMIC_PERIODS = [
  { value: 'p1', label: 'Periodo 1' },
  { value: 'p2', label: 'Periodo 2' },
  { value: 'p3', label: 'Periodo 3' },
  { value: 'p4', label: 'Periodo 4' },
  { value: 'p5', label: 'Periodo 5' },
];
