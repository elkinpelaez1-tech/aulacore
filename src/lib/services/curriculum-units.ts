import { supabase } from '@/lib/supabase';

// ============================================================================
// TIPOS CURRICULARES (compatibles con CurriculumBuilder y Malla 360)
// ============================================================================

export interface Competency {
  id: string;
  type: 'saber' | 'hacer' | 'ser' | 'convivir';
  description: string;
}

export interface ContenidoItem {
  id: string;
  periodLabel: string;
  content: string;
}

export interface EvaluationItem {
  id: string;
  component: string;
  activities: string;
  percentage: number;
}

export interface CurriculumDraft {
  objetivoGeneral: string;
  competencies: Competency[];
  contenidos: ContenidoItem[];
  metodologia: string;
  recursos: string;
  evaluations: EvaluationItem[];
  status: 'draft' | 'submitted' | 'revision' | 'approved';
  subject?: string;
  grade?: string;
  area?: string;
  period?: string;
  axisTopic?: string;
  updatedAt?: string;
}

export type CurriculumUnitStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected';

export interface CurriculumUnitRecord {
  id: string;
  institution_id: string;
  academic_year: string;
  area_name: string;
  area_code: string | null;
  subject_name: string;
  grade: string;
  period: string;
  status: CurriculumUnitStatus;
  content: CurriculumDraft;
  created_by: string | null;
  created_by_name: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurriculumUnitAuditRecord {
  id: string;
  unit_id: string;
  institution_id: string;
  action: 'created' | 'updated' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  actor_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  feedback: string | null;
  snapshot: CurriculumDraft | null;
  created_at: string;
}

// Parámetros de consulta y mutación
export interface GetCurriculumUnitParams {
  institutionId: string;
  academicYear?: string;
  subject: string;
  grade: string;
  period: string;
}

export interface SaveCurriculumUnitParams {
  institutionId: string;
  academicYear?: string;
  area: string;
  areaCode?: string | null;
  subject: string;
  grade: string;
  period: string;
  content: CurriculumDraft;
  status?: CurriculumUnitStatus;
  userId?: string | null;
  userName?: string | null;
  recordAudit?: boolean;
}

export interface SubmitCurriculumUnitParams {
  institutionId: string;
  academicYear?: string;
  subject: string;
  grade: string;
  period: string;
  content?: CurriculumDraft;
  userId?: string | null;
  userName?: string | null;
}

// ============================================================================
// FUNCIONES DEL SERVICIO
// ============================================================================

/**
 * Consulta una unidad curricular específica por institución, año, asignatura, grado y período.
 * Devuelve null si no existe, o un error controlado si ocurre un fallo.
 */
export async function getCurriculumUnit(
  params: GetCurriculumUnitParams,
  client = supabase
): Promise<{ data: CurriculumUnitRecord | null; error: Error | null }> {
  try {
    const { institutionId, academicYear = '2026', subject, grade, period } = params;

    if (!institutionId || !subject || !grade || !period) {
      return {
        data: null,
        error: new Error('Faltan parámetros requeridos (institutionId, subject, grade, period).'),
      };
    }

    const { data, error } = await client
      .from('curriculum_units')
      .select('*')
      .eq('institution_id', institutionId)
      .eq('academic_year', academicYear)
      .eq('subject_name', subject)
      .eq('grade', grade)
      .eq('period', period)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: (data as CurriculumUnitRecord) ?? null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Guarda o actualiza una unidad curricular institucional respetando la restricción UNIQUE.
 * Si ya existe, actualiza el registro e incrementa updated_at.
 * Si no existe, inserta un nuevo registro.
 * Opcionalmente registra la acción en curriculum_unit_audit.
 */
export async function saveCurriculumUnit(
  params: SaveCurriculumUnitParams,
  client = supabase
): Promise<{ data: CurriculumUnitRecord | null; error: Error | null }> {
  try {
    const {
      institutionId,
      academicYear = '2026',
      area,
      areaCode = null,
      subject,
      grade,
      period,
      content,
      status = 'draft',
      userId = null,
      userName = null,
      recordAudit = true,
    } = params;

    if (!institutionId || !area || !subject || !grade || !period) {
      return {
        data: null,
        error: new Error('Faltan campos requeridos (institutionId, area, subject, grade, period).'),
      };
    }

    // 1. Verificar si ya existe en Supabase
    const checkResult = await getCurriculumUnit({
      institutionId,
      academicYear,
      subject,
      grade,
      period,
    }, client);

    if (checkResult.error) {
      return { data: null, error: checkResult.error };
    }

    let savedRecord: CurriculumUnitRecord;
    let auditAction: 'created' | 'updated';

    if (checkResult.data) {
      // 2A. Actualización de unidad existente
      const updatePayload: Record<string, any> = {
        area_name: area,
        area_code: areaCode,
        content,
        status,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from('curriculum_units')
        .update(updatePayload)
        .eq('id', checkResult.data.id)
        .select('*')
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      savedRecord = data as CurriculumUnitRecord;
      auditAction = 'updated';
    } else {
      // 2B. Inserción de nueva unidad
      const insertPayload: Record<string, any> = {
        institution_id: institutionId,
        academic_year: academicYear,
        area_name: area,
        area_code: areaCode,
        subject_name: subject,
        grade,
        period,
        status,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (userId) {
        insertPayload.created_by = userId;
      }
      if (userName) {
        insertPayload.created_by_name = userName;
      }

      const { data, error } = await client
        .from('curriculum_units')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      savedRecord = data as CurriculumUnitRecord;
      auditAction = 'created';
    }

    // 3. Registrar auditoría técnica si se solicita
    if (recordAudit && savedRecord?.id) {
      try {
        await client.from('curriculum_unit_audit').insert({
          unit_id: savedRecord.id,
          institution_id: institutionId,
          action: auditAction,
          actor_id: userId,
          actor_name: userName,
          snapshot: content as any,
        });
      } catch (auditErr) {
        console.warn('Advertencia al registrar auditoría curricular:', auditErr);
      }
    }

    return { data: savedRecord, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Marca una unidad existente como 'submitted' y registra la auditoría correspondiente.
 * No ejecuta aprobación institucional (reservado para fase posterior).
 */
export async function submitCurriculumUnit(
  params: SubmitCurriculumUnitParams,
  client = supabase
): Promise<{ data: CurriculumUnitRecord | null; error: Error | null }> {
  try {
    const {
      institutionId,
      academicYear = '2026',
      subject,
      grade,
      period,
      content,
      userId = null,
      userName = null,
    } = params;

    const checkResult = await getCurriculumUnit({
      institutionId,
      academicYear,
      subject,
      grade,
      period,
    }, client);

    if (checkResult.error) {
      return { data: null, error: checkResult.error };
    }

    if (!checkResult.data) {
      return {
        data: null,
        error: new Error('No se puede enviar a revisión una unidad curricular que no existe en Supabase.'),
      };
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      status: 'submitted',
      submitted_at: now,
      updated_at: now,
    };

    if (content) {
      updatePayload.content = content;
    }

    const { data, error } = await client
      .from('curriculum_units')
      .update(updatePayload)
      .eq('id', checkResult.data.id)
      .select('*')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const updatedRecord = data as CurriculumUnitRecord;

    // Registrar en auditoría
    try {
      await client.from('curriculum_unit_audit').insert({
        unit_id: updatedRecord.id,
        institution_id: institutionId,
        action: 'submitted',
        actor_id: userId,
        actor_name: userName,
        snapshot: (content || updatedRecord.content) as any,
      });
    } catch (auditErr) {
      console.warn('Advertencia al registrar auditoría de envío:', auditErr);
    }

    return { data: updatedRecord, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

// ============================================================================
// UTILIDADES LOCALSTORAGE (lectura y fallback sin mutación ni migración)
// ============================================================================

/**
 * Genera la clave canónica de localStorage utilizada actualmente por AulaCore.
 */
export function getLocalStorageDraftKey(
  institutionId: string,
  subject: string,
  grade: string,
  period: string,
  curriculumId: string = 'default'
): string {
  return `aulacore-curriculum-draft-${institutionId}-${curriculumId}-${subject}-${grade}-${period}`;
}

/**
 * Consulta segura en localStorage sin mutar ni migrar ningún dato.
 */
export function getLocalStorageDraft(
  institutionId: string,
  subject: string,
  grade: string,
  period: string,
  curriculumId: string = 'default'
): CurriculumDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getLocalStorageDraftKey(institutionId, subject, grade, period, curriculumId);
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as CurriculumDraft;
  } catch {
    return null;
  }
}
