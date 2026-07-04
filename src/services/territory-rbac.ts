'use client';

// =================================================================
// 🔐 SISTEMA DE SEGURIDAD OPERATIVA Y RBAC (PORTAL TERRITORIAL)
// =================================================================

export type TerritoryRole = 
  | 'Secretario de Educación'
  | 'Director de Calidad'
  | 'Director de Inspección, Vigilancia y Control'
  | 'Director de Cobertura'
  | 'Inspección y Vigilancia';

export type TerritoryAction =
  | 'emitir_circular'
  | 'programar_visita'
  | 'ajustar_configuracion_secretaria'
  | 'ajustar_umbrales_alertas'
  | 'acceder_motor_ia'
  | 'descargar_reportes_financieros';

// Matriz de Permisos por Rol
const PERMISSIONS_MATRIX: Record<TerritoryRole, TerritoryAction[]> = {
  'Secretario de Educación': [
    'emitir_circular',
    'programar_visita',
    'ajustar_configuracion_secretaria',
    'ajustar_umbrales_alertas',
    'acceder_motor_ia',
    'descargar_reportes_financieros'
  ],
  'Director de Calidad': [
    'programar_visita',
    'ajustar_umbrales_alertas',
    'acceder_motor_ia'
  ],
  'Director de Inspección, Vigilancia y Control': [
    'emitir_circular',
    'programar_visita',
    'ajustar_configuracion_secretaria',
    'ajustar_umbrales_alertas',
    'acceder_motor_ia'
  ],
  'Director de Cobertura': [
    'programar_visita'
  ],
  'Inspección y Vigilancia': [
    'programar_visita'
  ]
};

/**
 * Helper para verificar si un rol territorial tiene permiso para realizar una acción
 */
export function hasTerritoryPermission(role: string, action: TerritoryAction): boolean {
  if (!role || role === 'super_admin' || role === 'Super Administrador SaaS' || role === 'Super Admin' || role.toLowerCase().includes('admin')) return true;
  const normalizedRole = role as TerritoryRole;
  const permissions = PERMISSIONS_MATRIX[normalizedRole];
  if (!permissions) return false;
  return permissions.includes(action);
}

/**
 * Propiedades de UI preparadas para deshabilitar o restringir componentes visuales según el rol
 */
export function getRbacControlAttrs(role: string, action: TerritoryAction) {
  const permitted = hasTerritoryPermission(role, action);
  
  return {
    disabled: !permitted,
    'data-rbac-required': action,
    'data-rbac-permitted': permitted ? 'true' : 'false',
    title: permitted 
      ? undefined 
      : `Acción restringida. Requiere permisos de nivel superior (${action}).`
  };
}
