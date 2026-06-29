import { supabase } from '@/lib/supabase';

export interface TerritorialKpis {
  totalSchools: number;
  totalCampuses: string; // Marcado como "Pendiente de implementación" por solicitud del usuario
  totalStudents: number;
  totalTeachers: number;
  totalDirectives: number;
  totalAdministratives: number;
  consolidatedEnrollment: number;
  activeUsers: number;
  
  // --- HEALTH SCORE PROVISIONAL ---
  // NOTA IMPORTANTE: Este cálculo basado en módulos es temporal y preliminar.
  // Será reemplazado en una fase futura por un algoritmo complejo multidimensional.
  healthScore: number;
  
  // Estado de implementación de módulos individuales
  implementation: {
    mallas: number;
    rfid: number;
    pei: number;
    horaria: number;
  };
}

/**
 * Servicio para consultar indicadores agregados del territorio desde Supabase.
 * Todas las consultas son estrictamente agregadas para respetar la privacidad
 * de la información y el aislamiento multitenant.
 */
export async function getTerritorialKpis(): Promise<TerritorialKpis> {
  try {
    // 1. Total de Instituciones Educativas (Colegios)
    const { count: schoolCount, error: schoolErr } = await supabase
      .from('institutions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_type', 'school');
      
    if (schoolErr) throw schoolErr;

    // 2. Total de Estudiantes activos
    const { count: studentCount, error: studentErr } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'activo');

    if (studentErr) throw studentErr;

    // 3. Total de Docentes únicos
    const { count: teacherCount, error: teacherErr } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'docente');

    if (teacherErr) throw teacherErr;

    // 4. Total de Directivos (Rector, Coordinador)
    const { count: directiveCount, error: directiveErr } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['rector', 'coordinador']);

    if (directiveErr) throw directiveErr;

    // 5. Total de Personal Administrativo (Secretaria)
    const { count: adminCount, error: adminErr } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'secretaria');

    if (adminErr) throw adminErr;

    // 6. Matrícula Consolidada
    const { count: enrollmentCount, error: enrollErr } = await supabase
      .from('student_enrollments')
      .select('*', { count: 'exact', head: true });

    if (enrollErr) throw enrollErr;

    // 7. Usuarios Activos Totales
    const { data: rolesData, error: rolesErr } = await supabase
      .from('user_roles')
      .select('user_id');

    if (rolesErr) throw rolesErr;
    const uniqueUserIds = new Set(rolesData?.map(r => r.user_id) || []);
    const activeUsersCount = uniqueUserIds.size;

    // 8. Consulta de módulos activos para el cálculo de Health Score e Implementación
    const { data: instData, error: instErr } = await supabase
      .from('institutions')
      .select('active_modules')
      .eq('organization_type', 'school');

    if (instErr) throw instErr;

    // --- CÁLCULO PROVISIONAL DEL HEALTH SCORE (PRELIMINAR Y REEMPLAZABLE) ---
    let totalScoreSum = 0;
    let mallasCount = 0;
    let rfidCount = 0;
    let peiCount = 0;
    let horariaCount = 0;

    const totalSchoolsCount = instData?.length || 0;

    if (totalSchoolsCount > 0 && instData) {
      instData.forEach((inst: any) => {
        const modules = inst.active_modules || [];
        // Sumar 25% por cada módulo activo
        const score = modules.length * 25;
        totalScoreSum += score;

        if (modules.includes('mallas')) mallasCount++;
        if (modules.includes('rfid')) rfidCount++;
        if (modules.includes('pei')) peiCount++;
        if (modules.includes('planeacion_horaria')) horariaCount++;
      });
    }

    const averageHealthScore = totalSchoolsCount > 0 
      ? Math.round(totalScoreSum / totalSchoolsCount) 
      : 0;

    return {
      totalSchools: schoolCount || 0,
      totalCampuses: 'Pendiente de implementación', // Sedes físicas excluidas por solicitud del usuario
      totalStudents: studentCount || 0,
      totalTeachers: teacherCount || 0,
      totalDirectives: directiveCount || 0,
      totalAdministratives: adminCount || 0,
      consolidatedEnrollment: enrollmentCount || 0,
      activeUsers: activeUsersCount,
      healthScore: averageHealthScore,
      implementation: {
        mallas: mallasCount,
        rfid: rfidCount,
        pei: peiCount,
        horaria: horariaCount,
      }
    };
  } catch (error) {
    console.error('Error fetching territorial KPIs from Supabase:', error);
    // Retornar fallback seguro en caso de error para no romper la navegación del portal
    return {
      totalSchools: 0,
      totalCampuses: 'Pendiente de implementación',
      totalStudents: 0,
      totalTeachers: 0,
      totalDirectives: 0,
      totalAdministratives: 0,
      consolidatedEnrollment: 0,
      activeUsers: 0,
      healthScore: 0,
      implementation: { mallas: 0, rfid: 0, pei: 0, horaria: 0 }
    };
  }
}

export interface TerritorialInstitution {
  id: string;
  name: string;
  daneCode: string;
  municipality: string;
  nature: 'Oficial' | 'Privado';
  rector: string;
  students: number;
  teachers: number;
  healthScore: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  adoption: {
    matricula: number;
    rfid: number;
    mallas: number;
    pei: number;
  };
  iaInsight?: string;
}

export async function getTerritorialInstitutions(): Promise<TerritorialInstitution[]> {
  try {
    // 1. Consultar colegios reales
    const { data: schools, error: schoolErr } = await supabase
      .from('institutions')
      .select('*')
      .eq('organization_type', 'school');

    if (schoolErr) throw schoolErr;
    if (!schools) return [];

    // 2. Consultar roles para contar estudiantes/docentes por institución
    const { data: roles, error: rolesErr } = await supabase
      .from('user_roles')
      .select('institution_id, role');

    if (rolesErr) throw rolesErr;

    // Agrupar conteos
    const countsMap: Record<string, { students: number; teachers: number }> = {};
    roles?.forEach((r) => {
      const instId = r.institution_id;
      if (!countsMap[instId]) {
        countsMap[instId] = { students: 0, teachers: 0 };
      }
      if (r.role === 'estudiante') {
        countsMap[instId].students++;
      } else if (r.role === 'docente') {
        countsMap[instId].teachers++;
      }
    });

    // Mapear al tipo de datos interactivo
    return schools.map((s: any) => {
      const instCounts = countsMap[s.id] || { students: 0, teachers: 0 };
      const modules = s.active_modules || [];
      const score = modules.length * 25; // Provisional

      // Fallbacks dinámicos para campos faltantes de contacto
      const nature = s.legal_nature === 'Privado' ? 'Privado' : 'Oficial';
      const email = s.rector_name 
        ? `${s.rector_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@aulacore.edu.co`
        : `rectoria@${s.slug || 'colegio'}.edu.co`;

      return {
        id: s.id,
        name: s.name,
        daneCode: s.dane_code || 'No Registrado',
        municipality: s.municipality || 'Medellín',
        nature,
        rector: s.rector_name || 'Sin Asignar',
        students: instCounts.students,
        teachers: instCounts.teachers,
        healthScore: score,
        contactEmail: email,
        contactPhone: s.phone || '+57 4 300-0000',
        address: s.address || 'Área Metropolitana',
        adoption: {
          matricula: modules.includes('matricula') ? 100 : 0,
          rfid: modules.includes('rfid') ? 100 : 0,
          mallas: modules.includes('mallas') ? 100 : 0,
          pei: modules.includes('pei') ? 100 : 0,
        },
        iaInsight: score < 75 
          ? `Adopción crítica de AulaCore. Se sugiere priorizar un plan de acompañamiento tecnológico.`
          : `Adopción óptima. Cumple con los estándares gubernamentales de madurez.`
      };
    });
  } catch (error) {
    console.error('Error fetching territorial institutions from Supabase:', error);
    return [];
  }
}
