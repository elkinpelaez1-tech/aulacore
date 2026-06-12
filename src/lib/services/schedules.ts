import { supabase } from '@/lib/supabase';
import { Database } from '../database.types';

export type AcademicSchedule = Database['public']['Tables']['academic_schedules']['Row'];
export type CurriculumSubject = Database['public']['Tables']['curriculum_subjects']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type EnrichedSchedule = AcademicSchedule & {
  curriculum_subjects?: { name: string } | null;
  profiles?: { first_name: string | null; last_name: string | null } | null;
  courses?: { grade_level: string | null; group_name: string | null } | null;
};

/**
 * Validar conflictos de horarios
 * Verifica choques de salón, docente o curso simultáneo.
 */
export async function checkScheduleConflict(
  institutionId: string,
  academicPeriodId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  teacherId: string,
  classroom: string,
  courseId: string,
  excludeScheduleId?: string
) {
  // Query schedules in the same day and period
  let query = supabase
    .from('academic_schedules')
    .select('id, teacher_id, classroom, course_id, start_time, end_time')
    .eq('institution_id', institutionId)
    .eq('academic_period_id', academicPeriodId)
    .eq('day_of_week', dayOfWeek)
    .neq('status', 'cancelled');

  if (excludeScheduleId) {
    query = query.neq('id', excludeScheduleId);
  }

  const { data: overlapping, error } = await query;
  if (error) throw new Error(error.message);

  // Verificamos overlap de tiempo manualmente o con SQL si tuvieramos PostGIS/Range types.
  // Aquí lo hacemos en memoria por ser más sencillo y con pocos registros por día.
  const isOverlapping = (sStart: string, sEnd: string, tStart: string, tEnd: string) => {
    return (sStart < tEnd && sEnd > tStart);
  };

  const conflicts = (overlapping || []).filter((schedule: any) => 
    isOverlapping(schedule.start_time, schedule.end_time, startTime, endTime)
  );

  for (const conflict of conflicts) {
    if (conflict.teacher_id === teacherId) {
      return { hasConflict: true, type: 'teacher', message: 'El docente ya tiene una clase asignada en ese horario.' };
    }
    if (conflict.classroom === classroom) {
      return { hasConflict: true, type: 'classroom', message: 'El salón ya está ocupado en ese horario.' };
    }
    if (conflict.course_id === courseId) {
      return { hasConflict: true, type: 'course', message: 'El curso ya tiene otra materia asignada en ese bloque.' };
    }
  }

  return { hasConflict: false };
}

/**
 * Obtener horario por curso (Vista Estudiante / Director / Padre)
 */
export async function getSchedulesByCourse(courseId: string, periodId: string) {
  const { data, error } = await supabase
    .from('academic_schedules')
    .select(`
      *,
      curriculum_subjects ( name ),
      profiles ( first_name, last_name )
    `)
    .eq('course_id', courseId)
    .eq('academic_period_id', periodId)
    .eq('status', 'active')
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return data as EnrichedSchedule[];
}

/**
 * Obtener horario por docente (Vista Docente)
 */
export async function getSchedulesByTeacher(teacherId: string, periodId: string) {
  const { data, error } = await supabase
    .from('academic_schedules')
    .select(`
      *,
      curriculum_subjects ( name ),
      courses ( grade_level, group_name )
    `)
    .eq('teacher_id', teacherId)
    .eq('academic_period_id', periodId)
    .eq('status', 'active')
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);

  if (data && data.length > 0) {
    return data;
  }

  // Fallback to onboarding schedules if no active schedules found
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId);
    if (!isUuid) return [];

    // 1. Try by onboarding ID
    const { data: byId } = await supabase
      .from('teacher_onboardings')
      .select('selected_slots, subject_area, academic_level, sede')
      .eq('id', teacherId)
      .maybeSingle();

    let onboarding = byId;
    
    // 2. Try by user_id if not found
    if (!onboarding) {
      const { data: byUserId } = await supabase
        .from('teacher_onboardings')
        .select('selected_slots, subject_area, academic_level, sede')
        .eq('user_id', teacherId)
        .maybeSingle();
      onboarding = byUserId;
    }

    if (onboarding && onboarding.selected_slots && onboarding.selected_slots.length > 0) {
      const dayMapping: Record<string, number> = {
        'Lunes': 1,
        'Martes': 2,
        'Miércoles': 3,
        'Miercoles': 3,
        'Jueves': 4,
        'Viernes': 5,
        'Sábado': 6,
        'Sabado': 6
      };

      const parsedSchedules: EnrichedSchedule[] = [];

      for (const slot of onboarding.selected_slots) {
        const parts = slot.split('-');
        if (parts.length !== 2) continue;
        const dayName = parts[0];
        const blockIdStr = parts[1];
        const dayId = dayMapping[dayName];
        const blockId = parseInt(blockIdStr, 10);

        if (!dayId || isNaN(blockId)) continue;

        const startHour = 6 + blockId;
        const endHour = 6 + blockId + 1;
        const startTime = `${String(startHour).padStart(2, '0')}:00:00`;
        const endTime = `${String(endHour).padStart(2, '0')}:00:00`;

        parsedSchedules.push({
          id: `onboarding-${teacherId}-${slot}`,
          institution_id: '11111111-1111-1111-1111-111111111111',
          course_id: '',
          subject_id: '',
          teacher_id: teacherId,
          classroom: onboarding.sede || 'Por definir',
          academic_period_id: periodId,
          day_of_week: dayId,
          start_time: startTime,
          end_time: endTime,
          school_day: 'unica',
          status: 'active',
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          curriculum_subjects: onboarding.subject_area ? { name: onboarding.subject_area } : null,
          courses: onboarding.academic_level ? { grade_level: onboarding.academic_level, group_name: 'Asignado' } : null
        } as any);
      }

      // Sort by day and start time
      return parsedSchedules.sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.start_time.localeCompare(b.start_time);
      });
    }
  } catch (fallbackErr) {
    console.error('Error fetching onboarding schedules fallback:', fallbackErr);
  }

  return [];
}

/**
 * Solicitar un cambio de horario (Rol Docente)
 */
export async function requestScheduleChange(
  scheduleId: string,
  teacherId: string,
  reason: string,
  proposedDay: number,
  proposedStart: string,
  proposedEnd: string,
  proposedClassroom: string
) {
  const { data, error } = await supabase
    .from('schedule_change_requests')
    .insert({
      schedule_id: scheduleId,
      requested_by: teacherId,
      reason,
      proposed_day: proposedDay,
      proposed_start_time: proposedStart,
      proposed_end_time: proposedEnd,
      proposed_classroom: proposedClassroom,
      status: 'pending'
    });
  
  if (error) throw new Error(error.message);
  return data;
}

// ============================================================================
// CRUD OPERATIONS FOR SCHEDULE BUILDER
// ============================================================================

export async function createSchedule(scheduleData: Omit<AcademicSchedule, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('academic_schedules')
    .insert(scheduleData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSchedule(scheduleId: string, scheduleData: Partial<AcademicSchedule>) {
  const { data, error } = await supabase
    .from('academic_schedules')
    .update(scheduleData)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSchedule(scheduleId: string) {
  const { error } = await supabase
    .from('academic_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw new Error(error.message);
  return true;
}

// Lookup data for the Schedule Builder forms
export async function getInstitutionCourses(institutionId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, grade_level, group_name')
    .eq('institution_id', institutionId)
    .order('grade_level', { ascending: true })
    .order('group_name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getInstitutionSubjects(institutionId: string) {
  const { data, error } = await supabase
    .from('curriculum_subjects')
    .select('id, name')
    .eq('institution_id', institutionId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getInstitutionTeachers(institutionId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      profiles:user_id ( id, first_name, last_name )
    `)
    .eq('institution_id', institutionId)
    .eq('role', 'docente');

  if (error) throw new Error(error.message);
  
  const teachers = data
    .filter((d: any) => d.profiles)
    .map((d: any) => ({
      id: d.profiles!.id,
      first_name: d.profiles!.first_name,
      last_name: d.profiles!.last_name,
    }));
    
  return teachers;
}
