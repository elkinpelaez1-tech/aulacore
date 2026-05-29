export type AttendanceSource = 'RFID' | 'QR' | 'Docente' | 'GPS';
export type AttendanceState = 'Presente' | 'Retardo' | 'Salida anticipada' | 'Ausente' | 'Ausencia justificada' | 'Ausencia injustificada';

export interface GPSGeofence {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationName: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  source: AttendanceSource;
  state: AttendanceState;
  device: string;
  location: string;
  operator: string;
  timestamp: number; // for chronological sorting
  history: string[]; // audit trail logs
}

// Validation Priority Map (Lower number = Higher priority)
export const PRIORITY_MAP: Record<AttendanceSource, number> = {
  'RFID': 1,
  'QR': 2,
  'Docente': 3,
  'GPS': 4
};

// Mock student baseline data specifically for 9-B attendance control
export interface AttendanceStudentSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  attendanceRateBefore: number;
  activeAlerts: string[];
}

export const ATTENDANCE_STUDENTS: AttendanceStudentSummary[] = [
  {
    id: 's-107',
    name: 'Sofía Ramírez',
    avatarUrl: 'https://i.pravatar.cc/150?u=sofia_ramirez',
    attendanceRateBefore: 75,
    activeAlerts: ['Ausentismo recurrente (>20%)']
  },
  {
    id: 's-108',
    name: 'Mateo López',
    avatarUrl: 'https://i.pravatar.cc/150?u=mateo_lopez',
    attendanceRateBefore: 82,
    activeAlerts: []
  },
  {
    id: 's-110',
    name: 'Andrés Gómez',
    avatarUrl: 'https://i.pravatar.cc/150?u=andres_gomez',
    attendanceRateBefore: 88,
    activeAlerts: []
  }
];

// Initial preloaded logs for today showcasing the validation conflict resolution
export const INITIAL_ATTENDANCE_LOGS: AttendanceRecord[] = [
  {
    id: 'log-101',
    studentId: 's-107',
    studentName: 'Sofía Ramírez',
    date: new Date().toISOString().split('T')[0],
    time: '07:35:12',
    source: 'Docente',
    state: 'Ausencia injustificada',
    device: 'Luz-Docente-PC',
    location: 'Aula 9-B - Bloque B',
    operator: 'Prof. Gómez (Docente)',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    history: ['[07:35:12] Registro inicial manual por el docente.']
  },
  {
    id: 'log-102',
    studentId: 's-108',
    studentName: 'Mateo López',
    date: new Date().toISOString().split('T')[0],
    time: '07:12:45',
    source: 'RFID',
    state: 'Presente',
    device: 'Torniquete Principal A',
    location: 'Portería Principal',
    operator: 'Sistema RFID',
    timestamp: Date.now() - 3600000 * 3, // 3 hours ago
    history: ['[07:12:45] Pase automático de tarjeta RFID registrado en torniquete.']
  },
  {
    id: 'log-103',
    studentId: 's-110',
    studentName: 'Andrés Gómez',
    date: new Date().toISOString().split('T')[0],
    time: '07:22:05',
    source: 'QR',
    state: 'Presente',
    device: 'Tablet-Portero-02',
    location: 'Portería Secundaria',
    operator: 'Portero Auxiliar',
    timestamp: Date.now() - 3600000 * 2.5, // 2.5 hours ago
    history: ['[07:22:05] Escaneo óptico de código QR escolar en portería auxiliar.']
  }
];

// Reusable geofences model ready for GPS geofencing extensions
export const MOCK_GPS_GEOFENCES: GPSGeofence[] = [
  {
    latitude: 4.60971,
    longitude: -74.08175,
    radiusMeters: 200,
    locationName: 'Museo Nacional (Salida Pedagógica 9-B)'
  },
  {
    latitude: 4.65832,
    longitude: -74.09392,
    radiusMeters: 150,
    locationName: 'Jardín Botánico (Trabajo de Campo)'
  }
];

// Helper algorithm to resolve the dominant record based on hierarchical priorities
export function getDominantRecord(records: AttendanceRecord[]): AttendanceRecord | null {
  if (records.length === 0) return null;

  return records.reduce((dominant, current) => {
    const dominantPriority = PRIORITY_MAP[dominant.source];
    const currentPriority = PRIORITY_MAP[current.source];

    if (currentPriority < dominantPriority) {
      return current; // Higher priority wins!
    } else if (currentPriority === dominantPriority) {
      // If same priority, take the most recent one chronologically
      return current.timestamp > dominant.timestamp ? current : dominant;
    }
    return dominant;
  });
}
