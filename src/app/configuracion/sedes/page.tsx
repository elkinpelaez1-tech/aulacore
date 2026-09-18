'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Blocks, Shield, Activity, Sparkles, 
  MapPin, Phone, User, Search, SlidersHorizontal, Trash2, 
  Plus, X, ChevronRight, Download, LayoutGrid, List, 
  Terminal, Camera, Check, AlertTriangle, RefreshCw, 
  Clock, Globe, CheckCircle2, Info, Eye, Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/providers/role-provider';

// TYPES & INTERFACES
interface SedeDetails {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  coordinator: string;
  studentsCount: number;
  teachersCount: number;
  coursesCount: number;
  capacityMax: number;
  jornadas: string[];
  levels: string[];
  rfidStatus: 'excellent' | 'warning' | 'critical';
  rfidDevicesCount: number;
  rfidOnlineCount: number;
  iaPredictive: boolean;
  enrollmentSynced: boolean;
  internetUptime: string;
  networkType: 'Fiber' | 'LTE Backup' | 'Cloud Server';
  alerts: { type: 'overcapacity' | 'rfid_offline' | 'attendance_critical' | 'sync_warning'; message: string }[];
  classroomsCount: number;
  labsCount: number;
  securityCamerasCount: number;
  geoCoordinates?: string;
  transportGpsUptime?: string;
}

interface LocalJourney {
  name: string;
  hours: string;
  students: number;
  capacity: number;
  status: 'active' | 'inactive';
}

interface LocalRfidDevice {
  id: string;
  name: string;
  zone: string;
  status: 'online' | 'offline';
  telemetryLog: string;
}

interface LocalCourse {
  name: string;
  students: number;
  capacity: number;
  teacher: string;
}

interface LocalAuditLog {
  time: string;
  user: string;
  action: string;
  ip: string;
}

// INITIAL HIGH FIDELITY SEED DATA
const SEED_CAMPUSES: SedeDetails[] = [];

export default function CampusOperationsCenterPage() {
  const { activeInstitution, institutionId, mounted } = useRole();
  const currentInstId = activeInstitution?.id || institutionId;
  const storageKey = currentInstId
    ? `aulacore-institucion-settings-${currentInstId}`
    : 'aulacore-institucion-settings';

  const [sedes, setSedes] = useState<SedeDetails[]>(SEED_CAMPUSES);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJornadas, setSelectedJornadas] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'optimal' | 'warning' | 'critical'>('all');
  const [rfidActiveOnly, setRfidActiveOnly] = useState(false);

  // Drawer Side panel State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'resumen' | 'jornadas' | 'cursos' | 'iot' | 'historial'>('resumen');

  // Interactive local states for Drawer details
  const [localRfidDevices, setLocalRfidDevices] = useState<Record<string, LocalRfidDevice[]>>({});
  const [localLogs, setLocalLogs] = useState<Record<string, LocalAuditLog[]>>({});
  
  // Modal State for Adding Campus
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSedeName, setNewSedeName] = useState('');
  const [newSedeCode, setNewSedeCode] = useState('');
  const [newSedeAddress, setNewSedeAddress] = useState('');
  const [newSedePhone, setNewSedePhone] = useState('');
  const [newSedeCoordinator, setNewSedeCoordinator] = useState('');
  const [newSedeCapacity, setNewSedeCapacity] = useState(500);
  const [newSedeJornadas, setNewSedeJornadas] = useState<string[]>(['Mañana']);
  const [newSedeLevels, setNewSedeLevels] = useState<string[]>(['Primaria', 'Bachillerato']);

  // Modal State for Editing Campus
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSedeId, setEditingSedeId] = useState<string | null>(null);
  const [editSedeName, setEditSedeName] = useState('');
  const [editSedeCode, setEditSedeCode] = useState('');
  const [editSedeAddress, setEditSedeAddress] = useState('');
  const [editSedePhone, setEditSedePhone] = useState('');
  const [editSedeCoordinator, setEditSedeCoordinator] = useState('');
  const [editSedeCapacity, setEditSedeCapacity] = useState(500);
  const [editSedeJornadas, setEditSedeJornadas] = useState<string[]>([]);
  const [editSedeLevels, setEditSedeLevels] = useState<string[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync with Institutional Settings (LocalStorage unificator)
  useEffect(() => {
    if (!mounted || !currentInstId) return;

    const loadData = () => {
      const rawSettings = localStorage.getItem(storageKey);
      if (rawSettings) {
        try {
          const settings = JSON.parse(rawSettings);
          if (settings.sedes && settings.sedes.length > 0) {
            // Merge institutional sedes with operational details
            const merged: SedeDetails[] = settings.sedes.map((s: any) => ({
              id: s.id || 's-' + Date.now(),
              name: s.name || 'Campus Principal',
              code: s.code || `CAMPUS-${(s.name || 'SEDE').replace(/\s+/g, '-').slice(0, 8).toUpperCase()}`,
              address: s.address || 'Dirección no registrada',
              phone: s.phone || '+57 1 601 9900',
              coordinator: s.coordinator || 'Coordinador Asignado',
              studentsCount: typeof s.studentsCount === 'number' ? s.studentsCount : 0,
              teachersCount: typeof s.teachersCount === 'number' ? s.teachersCount : 0,
              coursesCount: typeof s.coursesCount === 'number' ? s.coursesCount : 0,
              capacityMax: typeof s.capacityMax === 'number' && s.capacityMax > 0 ? s.capacityMax : 500,
              jornadas: Array.isArray(s.jornadas) && s.jornadas.length > 0 ? s.jornadas : ['Mañana'],
              levels: Array.isArray(s.levels) && s.levels.length > 0 ? s.levels : ['Primaria', 'Bachillerato'],
              rfidStatus: s.rfidStatus || 'excellent',
              rfidDevicesCount: typeof s.rfidDevicesCount === 'number' ? s.rfidDevicesCount : 0,
              rfidOnlineCount: typeof s.rfidOnlineCount === 'number' ? s.rfidOnlineCount : 0,
              iaPredictive: s.iaPredictive ?? true,
              enrollmentSynced: s.enrollmentSynced ?? true,
              internetUptime: s.internetUptime || '100%',
              networkType: s.networkType || 'Fiber',
              alerts: Array.isArray(s.alerts) ? s.alerts : [],
              classroomsCount: typeof s.classroomsCount === 'number' ? s.classroomsCount : 8,
              labsCount: typeof s.labsCount === 'number' ? s.labsCount : 1,
              securityCamerasCount: typeof s.securityCamerasCount === 'number' ? s.securityCamerasCount : 2,
              geoCoordinates: s.geoCoordinates || '4.7110, -74.0721',
              transportGpsUptime: s.transportGpsUptime || '100%'
            }));
            setSedes(merged);
          } else {
            setSedes([]);
          }
        } catch (e) {
          console.error('Error loading institutional settings on Sedes component', e);
        }
      } else {
        setSedes([]);
      }
    };

    loadData();

    // Listen for updates from other configuration pages in same session
    const handleStorageUpdate = () => loadData();
    window.addEventListener('aulacore-settings-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('aulacore-settings-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [mounted, currentInstId, storageKey]);

  // Map and write changes back to localStorage institutional settings
  const updateSettingsStorage = (updatedList: SedeDetails[]) => {
    if (typeof window === 'undefined') return;
    const rawSettings = localStorage.getItem(storageKey);
    let currentSettings = rawSettings ? JSON.parse(rawSettings) : {};
    
    currentSettings.sedes = updatedList.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      address: s.address,
      phone: s.phone,
      coordinator: s.coordinator,
      capacityMax: s.capacityMax,
      studentsCount: s.studentsCount,
      teachersCount: s.teachersCount,
      coursesCount: s.coursesCount,
      jornadas: s.jornadas,
      levels: s.levels,
      rfidStatus: s.rfidStatus,
      rfidDevicesCount: s.rfidDevicesCount,
      rfidOnlineCount: s.rfidOnlineCount,
      classroomsCount: s.classroomsCount,
      labsCount: s.labsCount,
      securityCamerasCount: s.securityCamerasCount,
      geoCoordinates: s.geoCoordinates,
      transportGpsUptime: s.transportGpsUptime,
      internetUptime: s.internetUptime,
      networkType: s.networkType,
      alerts: s.alerts
    }));
    
    localStorage.setItem(storageKey, JSON.stringify(currentSettings));
    window.dispatchEvent(new CustomEvent('aulacore-settings-updated', { detail: { sedes: currentSettings.sedes } }));
  };

  // Generate RFID and log data dynamically on selected Sede
  const getSedeRfidDevices = (sedeId: string): LocalRfidDevice[] => {
    if (localRfidDevices[sedeId]) return localRfidDevices[sedeId];
    
    let devices: LocalRfidDevice[] = [];
    
    // Store in local cache
    localRfidDevices[sedeId] = devices;
    return devices;
  };

  const getSedeLogs = (sedeId: string): LocalAuditLog[] => {
    if (localLogs[sedeId]) return localLogs[sedeId];
    
    let logs: LocalAuditLog[] = [];
    
    localLogs[sedeId] = logs;
    return logs;
  };

  // Get active Sede details
  const selectedSede = sedes.find(s => s.id === selectedSedeId) || null;

  // Toggle RFID Device Status virtual switch inside drawer
  const handleToggleRfidDevice = (deviceId: string) => {
    if (!selectedSedeId) return;
    
    const devices = getSedeRfidDevices(selectedSedeId);
    const updatedDevices = devices.map(d => {
      if (d.id === deviceId) {
        const nextStatus = d.status === 'online' ? 'offline' as const : 'online' as const;
        
        // Log telemetry entry
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newLog: LocalAuditLog = {
          time: timeStr,
          user: 'Mariana Restrepo (Admin)',
          action: `Alternó virtualmente terminal ${d.name} a estado: ${nextStatus.toUpperCase()}`,
          ip: '190.24.45.12'
        };
        localLogs[selectedSedeId] = [newLog, ...getSedeLogs(selectedSedeId)];
        
        triggerToast(`📡 Terminal ${d.name} cambiada a ${nextStatus.toUpperCase()}`);
        return { ...d, status: nextStatus, telemetryLog: nextStatus === 'online' ? 'Sincronizado. Operación reanudada por Admin' : 'Detenido manualmente por el administrador' };
      }
      return d;
    });

    // Update caches
    setLocalRfidDevices({ ...localRfidDevices, [selectedSedeId]: updatedDevices });

    // Update parent Sede metrics
    const onlineCount = updatedDevices.filter(d => d.status === 'online').length;
    const rfidState = onlineCount === updatedDevices.length ? 'excellent' : onlineCount === 0 ? 'critical' : 'warning';
    
    const updatedSedes = sedes.map(s => {
      if (s.id === selectedSedeId) {
        return {
          ...s,
          rfidOnlineCount: onlineCount,
          rfidStatus: rfidState as any,
          alerts: rfidState !== 'excellent' 
            ? [{ type: 'rfid_offline' as const, message: `Lector RFID ${updatedDevices.find(d => d.status === 'offline')?.name} desconectado` }]
            : []
        };
      }
      return s;
    });
    setSedes(updatedSedes);
    updateSettingsStorage(updatedSedes);
  };

  // Add a new campus physical unit
  const handleAddSede = () => {
    if (!newSedeName.trim()) {
      triggerToast('⚠️ Por favor escribe el nombre del campus o sede.');
      return;
    }

    const assignedCode = newSedeCode.trim() || `CAMPUS-${newSedeName.trim().replace(/\s+/g, '-').slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const instLocation = activeInstitution ? [activeInstitution.municipality, activeInstitution.department].filter(Boolean).join(', ') : '';
    const assignedAddress = newSedeAddress.trim() || instLocation || 'Dirección no especificada';
    const assignedCoordinator = newSedeCoordinator.trim() || (activeInstitution?.rector_name || 'Coordinador General');
    const assignedJornadas = newSedeJornadas.length > 0 ? newSedeJornadas : ['Mañana'];
    const assignedLevels = newSedeLevels.length > 0 ? newSedeLevels : ['Primaria', 'Bachillerato'];

    const newS: SedeDetails = {
      id: 's-' + Date.now(),
      name: newSedeName.trim(),
      code: assignedCode,
      address: assignedAddress,
      phone: newSedePhone.trim() || '+57 1 601 9900',
      coordinator: assignedCoordinator,
      studentsCount: 0,
      teachersCount: 0,
      coursesCount: 0,
      capacityMax: newSedeCapacity > 0 ? newSedeCapacity : 500,
      jornadas: assignedJornadas,
      levels: assignedLevels,
      rfidStatus: 'excellent',
      rfidDevicesCount: 0,
      rfidOnlineCount: 0,
      iaPredictive: true,
      enrollmentSynced: true,
      internetUptime: '100%',
      networkType: 'Fiber',
      alerts: [],
      classroomsCount: 8,
      labsCount: 1,
      securityCamerasCount: 2,
      geoCoordinates: '4.7110, -74.0721',
      transportGpsUptime: '100%'
    };

    const updatedList = [...sedes, newS];
    setSedes(updatedList);
    updateSettingsStorage(updatedList);
    
    // Reset inputs
    setNewSedeName('');
    setNewSedeCode('');
    setNewSedeAddress('');
    setNewSedePhone('');
    setNewSedeCoordinator('');
    setNewSedeCapacity(500);
    setNewSedeJornadas(['Mañana']);
    setNewSedeLevels(['Primaria', 'Bachillerato']);
    setAddModalOpen(false);

    triggerToast(`✓ Campus ${newSedeName} registrado y sincronizado.`);
  };

  // Open modal with smart institutional defaults
  const handleOpenAddModal = () => {
    const instLocation = activeInstitution ? [activeInstitution.municipality, activeInstitution.department].filter(Boolean).join(', ') : '';
    setNewSedeName('');
    setNewSedeCode('');
    setNewSedeAddress(instLocation);
    setNewSedePhone('+57 1 601 9900');
    setNewSedeCoordinator(activeInstitution?.rector_name || 'Coordinador General');
    setNewSedeCapacity(500);
    setNewSedeJornadas(['Mañana', 'Tarde']);
    setNewSedeLevels(['Primaria', 'Bachillerato']);
    setAddModalOpen(true);
  };

  // Open modal to edit existing campus
  const handleOpenEditModal = (sede: SedeDetails, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSedeId(sede.id);
    setEditSedeName(sede.name);
    setEditSedeCode(sede.code);
    setEditSedeAddress(sede.address);
    setEditSedePhone(sede.phone);
    setEditSedeCoordinator(sede.coordinator);
    setEditSedeCapacity(sede.capacityMax);
    setEditSedeJornadas(sede.jornadas || ['Mañana']);
    setEditSedeLevels(sede.levels || ['Primaria', 'Bachillerato']);
    setEditModalOpen(true);
  };

  // Save changes to edited campus
  const handleSaveEditSede = () => {
    if (!editingSedeId || !editSedeName.trim()) {
      triggerToast('⚠️ Por favor escribe el nombre del campus.');
      return;
    }

    const updatedList = sedes.map(s => {
      if (s.id === editingSedeId) {
        return {
          ...s,
          name: editSedeName.trim(),
          code: editSedeCode.trim() || s.code,
          address: editSedeAddress.trim() || s.address,
          phone: editSedePhone.trim() || s.phone,
          coordinator: editSedeCoordinator.trim() || s.coordinator,
          capacityMax: editSedeCapacity > 0 ? editSedeCapacity : 500,
          jornadas: editSedeJornadas.length > 0 ? editSedeJornadas : ['Mañana'],
          levels: editSedeLevels.length > 0 ? editSedeLevels : ['Primaria', 'Bachillerato']
        };
      }
      return s;
    });

    setSedes(updatedList);
    updateSettingsStorage(updatedList);
    setEditModalOpen(false);
    triggerToast(`✓ Campus ${editSedeName} actualizado y sincronizado.`);
  };

  // Fast toggle a specific jornada directly on a campus
  const handleToggleSedeJornada = (sedeId: string, jornadaName: string) => {
    const updatedList = sedes.map(s => {
      if (s.id === sedeId) {
        const hasIt = s.jornadas.some(j => j.toLowerCase() === jornadaName.toLowerCase());
        const newJornadas = hasIt
          ? s.jornadas.filter(j => j.toLowerCase() !== jornadaName.toLowerCase())
          : [...s.jornadas, jornadaName];
        return {
          ...s,
          jornadas: newJornadas.length > 0 ? newJornadas : [jornadaName]
        };
      }
      return s;
    });

    setSedes(updatedList);
    updateSettingsStorage(updatedList);
    triggerToast(`✓ Jornada ${jornadaName} actualizada para esta sede.`);
  };

  // Delete Sede physically
  const handleDeleteSede = (id: string, name: string) => {
    const updatedList = sedes.filter(s => s.id !== id);
    setSedes(updatedList);
    updateSettingsStorage(updatedList);
    triggerToast(`✓ Campus ${name} eliminado del ecosistema.`);
    if (selectedSedeId === id) setDrawerOpen(false);
  };

  // Export to Excel / CSV toast
  const handleExportCSV = () => {
    triggerToast('✓ Exportando Campus Operations Center a Excel/CSV con firmas...');
  };

  // Dynamic filter chips logic
  const handleToggleJornadaFilter = (j: string) => {
    if (selectedJornadas.some(x => x.toLowerCase() === j.toLowerCase())) {
      setSelectedJornadas(selectedJornadas.filter(x => x.toLowerCase() !== j.toLowerCase()));
    } else {
      setSelectedJornadas([...selectedJornadas, j]);
    }
  };

  const handleToggleLevelFilter = (l: string) => {
    if (selectedLevels.some(x => x.toLowerCase() === l.toLowerCase())) {
      setSelectedLevels(selectedLevels.filter(x => x.toLowerCase() !== l.toLowerCase()));
    } else {
      setSelectedLevels([...selectedLevels, l]);
    }
  };

  const isFilterActive = searchQuery !== '' || selectedJornadas.length > 0 || selectedLevels.length > 0 || statusFilter !== 'all' || rfidActiveOnly;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedJornadas([]);
    setSelectedLevels([]);
    setStatusFilter('all');
    setRfidActiveOnly(false);
    triggerToast('✓ Filtros operativos limpiados.');
  };

  // Filtered campuses list
  const filteredSedes = sedes.filter(sede => {
    const matchesSearch = 
      sede.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJornadas = selectedJornadas.length === 0 || selectedJornadas.some(j => 
      sede.jornadas?.some(sj => sj.trim().toLowerCase() === j.trim().toLowerCase())
    );
    const matchesLevels = selectedLevels.length === 0 || selectedLevels.some(l => 
      sede.levels?.some(sl => sl.trim().toLowerCase() === l.trim().toLowerCase())
    );
    
    // Status classification: overcapacity is classify as warning/critical
    const occupancyRatio = (sede.studentsCount / (sede.capacityMax || 1)) * 100;
    const isSedeWarning = occupancyRatio > 75 || sede.rfidStatus !== 'excellent' || sede.alerts.length > 0;
    const isSedeCritical = occupancyRatio > 90 || sede.rfidStatus === 'critical';
    
    let matchesStatus = true;
    if (statusFilter === 'optimal') matchesStatus = !isSedeWarning;
    else if (statusFilter === 'warning') matchesStatus = isSedeWarning && !isSedeCritical;
    else if (statusFilter === 'critical') matchesStatus = isSedeCritical;

    const matchesRfid = !rfidActiveOnly || sede.rfidDevicesCount > 0;

    return matchesSearch && matchesJornadas && matchesLevels && matchesStatus && matchesRfid;
  });

  // Calculate high-fidelity KPIs
  const totalSedes = sedes.length;
  const totalStudents = sedes.reduce((acc, curr) => acc + curr.studentsCount, 0);
  const totalCapacity = sedes.reduce((acc, curr) => acc + curr.capacityMax, 0);
  const capacityUsedPercent = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
  
  const totalRfidDevices = sedes.reduce((acc, curr) => acc + curr.rfidDevicesCount, 0);
  const onlineRfidDevices = sedes.reduce((acc, curr) => acc + curr.rfidOnlineCount, 0);
  
  const activeJornadasSet = new Set<string>();
  sedes.forEach(s => s.jornadas?.forEach(j => activeJornadasSet.add(j)));
  const totalJornadasCount = activeJornadasSet.size;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Campus operations header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Blocks className="w-6 h-6 text-indigo-600" /> Campus Operations Center
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Centro operativo maestro y control de aforo multisede</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agregar Campus
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE KPIs ROW (Power BI Minimalist UI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Campuses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Campus Totales</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{totalSedes}</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Activos</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">100% de la red de planteles vinculada</div>
        </div>

        {/* KPI 2: General Capacity occupancy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Ocupación Red Global</span>
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-850">{totalStudents}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {totalCapacity} alumnos</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden flex">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-550",
                  capacityUsedPercent > 90 ? "bg-rose-500" : capacityUsedPercent > 75 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${capacityUsedPercent}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-450 font-medium">
            <span>Matrícula Digital</span>
            <span className="font-semibold text-slate-600">{capacityUsedPercent}% Capacidad</span>
          </div>
        </div>

        {/* KPI 3: Journeys Actives */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Jornadas Operacionales</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{totalJornadasCount}</span>
            <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">Mixtas</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Mañana, Tarde, Sabatina, Nocturna</div>
        </div>

        {/* KPI 4: Active telemetry hardware IoT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Lectores RFID Biométricos</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{onlineRfidDevices} <span className="text-sm font-semibold text-slate-400">/ {totalRfidDevices}</span></span>
            <span className={cn(
              "text-[9px] font-semibold px-1.5 py-0.5 rounded",
              onlineRfidDevices === totalRfidDevices ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            )}>
              {onlineRfidDevices === totalRfidDevices ? '100% Online' : 'Falla en terminal'}
            </span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Telemetría de accesos activa en red local</div>
        </div>

      </div>

      {/* 2. ADVANCED FILTERS PANEL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Main search bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Buscar por sede, rector, dirección o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls & Layout toggler */}
          <div className="flex items-center gap-3">
            
            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none hover:bg-slate-100 cursor-pointer"
            >
              <option value="all">Todos los Estados</option>
              <option value="optimal">Estado Óptimo</option>
              <option value="warning">Ocupación / RFID Warning</option>
              <option value="critical">Alerta de Sobrecupo</option>
            </select>

            {/* IoT RFID switch filter */}
            <button
              onClick={() => setRfidActiveOnly(!rfidActiveOnly)}
              className={cn(
                "px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                rfidActiveOnly 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              Con RFID Lector
            </button>

            <span className="w-px h-6 bg-slate-200 mx-1" />

            {/* Grid vs Table toggler */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all cursor-pointer",
                  viewMode === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-slate-450 hover:text-slate-700"
                )}
                title="Vista de Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 rounded-lg transition-all cursor-pointer",
                  viewMode === 'table' ? "bg-white shadow-sm text-indigo-600" : "text-slate-450 hover:text-slate-700"
                )}
                title="Vista Analítica de Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {viewMode === 'table' && (
              <button
                onClick={handleExportCSV}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                title="Exportar Reporte"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

        {/* Dynamic filters chip list */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
          
          {/* Journeys selective row */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
            <span className="mr-1">Jornadas:</span>
            {['Mañana', 'Tarde', 'Única', 'Nocturna', 'Sabatina'].map(j => {
              const isSelected = selectedJornadas.includes(j);
              return (
                <button
                  key={j}
                  onClick={() => handleToggleJornadaFilter(j)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all lowercase first-letter:uppercase cursor-pointer",
                    isSelected 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {j}
                </button>
              );
            })}
          </div>

          {/* Academic levels row */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
            <span className="mr-1">Niveles:</span>
            {['Preescolar', 'Primaria', 'Bachillerato', 'Media'].map(l => {
              const isSelected = selectedLevels.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => handleToggleLevelFilter(l)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all lowercase first-letter:uppercase cursor-pointer",
                    isSelected 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>

        </div>

        {/* Filter Applied Badge indicators */}
        {isFilterActive && (
          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Filtros Activos:</span>
              {searchQuery && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">Búsqueda: "{searchQuery}"</span>}
              {selectedJornadas.map(j => <span key={j} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">{j}</span>)}
              {selectedLevels.map(l => <span key={l} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">{l}</span>)}
              {statusFilter !== 'all' && <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">Estado: {statusFilter}</span>}
              {rfidActiveOnly && <span className="bg-slate-900 text-slate-100 px-2 py-0.5 rounded-md font-semibold text-[10px]">Con RFID</span>}
            </div>
            <button 
              onClick={handleClearFilters}
              className="text-rose-600 hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
            >
              Limpiar Todo
            </button>
          </div>
        )}

      </div>

      {/* 3. EXECUTIVE CAMPUS GRID VIEW (Primary Screen View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSedes.map(sede => {
            const occupancyRatio = (sede.studentsCount / (sede.capacityMax || 1)) * 100;
            const occupancyColor = occupancyRatio > 90 ? 'bg-rose-500' : occupancyRatio > 75 ? 'bg-amber-500' : 'bg-emerald-500';
            const isOverloaded = occupancyRatio > 90;

            return (
              <div 
                key={sede.id}
                onClick={() => {
                  setSelectedSedeId(sede.id);
                  setDrawerTab('resumen');
                  setDrawerOpen(true);
                }}
                className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between space-y-4 cursor-pointer relative"
              >
                
                {/* Overcapacity warning flashing dot */}
                {isOverloaded && (
                  <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}

                {/* Identity header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      {sede.code}
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <button
                        onClick={(e) => handleOpenEditModal(sede, e)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Editar Campus"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSede(sede.id, sede.name);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar Campus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {sede.iaPredictive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="IA Activa" />}
                      {sede.rfidDevicesCount > 0 && (
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          sede.rfidOnlineCount === sede.rfidDevicesCount ? "bg-emerald-500" : "bg-rose-500"
                        )} title="RFID Portería" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold text-slate-800 tracking-tight leading-tight pt-1.5 group-hover:text-indigo-700 transition-colors">
                    {sede.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium leading-none mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{sede.address}</span>
                  </div>
                </div>

                {/* Local KPIs metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 border border-slate-150/50 rounded-2xl p-3 text-center text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Alumnos</p>
                    <p className="font-bold text-slate-750 leading-none">{sede.studentsCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Docentes</p>
                    <p className="font-bold text-slate-750 leading-none">{sede.teachersCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Cursos</p>
                    <p className="font-bold text-slate-750 leading-none">{sede.coursesCount}</p>
                  </div>
                </div>

                {/* Capacity occupancy indicator */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 leading-none">
                    <span>Aforo Utilizado</span>
                    <span className={cn(
                      "font-bold",
                      occupancyRatio > 90 ? "text-rose-600" : occupancyRatio > 75 ? "text-amber-600" : "text-emerald-600"
                    )}>{Math.round(occupancyRatio)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-300", occupancyColor)}
                      style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Micro Visual Educational levels bars (Stripe analytics look) */}
                <div className="space-y-1 border-t border-slate-100 pt-2.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Distribución de Niveles</span>
                  <div className="flex gap-1.5 text-[8px] font-semibold text-slate-500 uppercase tracking-widest pt-1">
                    {sede.levels.map(lvl => (
                      <span key={lvl} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium lowercase first-letter:uppercase">
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contextual warning Alerts lists */}
                {sede.alerts.length > 0 && (
                  <div className="space-y-1 bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 text-[10px] font-medium text-rose-700 leading-snug">
                    {sede.alerts.map((al, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{al.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer interactive card button trigger */}
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-450 font-medium font-mono text-[9px] uppercase">
                    Sync: Uptime {sede.internetUptime}
                  </span>
                  
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    Ver Sede 360 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}

          {filteredSedes.length === 0 && (
            <div className="col-span-full border border-dashed border-slate-250 bg-slate-50/30 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-350" />
              <h3 className="text-sm font-semibold text-slate-750 uppercase">
                {sedes.length === 0 ? 'No se hallaron sedes registradas' : 'No hay sedes con los filtros aplicados'}
              </h3>
              <p className="text-xs text-slate-450 font-medium max-w-sm">
                {sedes.length === 0 
                  ? 'Registra el primer campus de tu institución usando el botón superior "Agregar Campus" para habilitar las jornadas y aulas.' 
                  : 'Prueba ajustando los filtros de jornadas, los niveles académicos o escribe otro término en el buscador.'}
              </p>
              {sedes.length === 0 ? (
                <button 
                  onClick={handleOpenAddModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Agregar Primer Campus
                </button>
              ) : (
                <button 
                  onClick={handleClearFilters}
                  className="bg-indigo-50 border border-indigo-150 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer hover:bg-indigo-100"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. ALTERNATIVE ANALYTICAL TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-200 rounded-3xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-650">
            <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Campus / Código</th>
                <th className="px-6 py-4">Dirección / Contacto</th>
                <th className="px-6 py-4">Coordinador</th>
                <th className="px-6 py-4">Capacidad Local</th>
                <th className="px-6 py-4">Jornadas</th>
                <th className="px-6 py-4">Hardware RFID</th>
                <th className="px-6 py-4">Uptime Red</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150/70">
              {filteredSedes.map(sede => {
                const occupancyRatio = (sede.studentsCount / (sede.capacityMax || 1)) * 100;
                return (
                  <tr 
                    key={sede.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSedeId(sede.id);
                      setDrawerTab('resumen');
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="bg-indigo-50 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono block w-fit mb-1">
                          {sede.code}
                        </span>
                        <p className="font-semibold text-slate-800">{sede.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[11px] text-slate-650 font-medium">{sede.address}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{sede.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{sede.coordinator}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-850">{sede.studentsCount} / {sede.capacityMax} alumnos</p>
                        <div className="w-24 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              occupancyRatio > 90 ? "bg-rose-500" : occupancyRatio > 75 ? "bg-amber-500" : "bg-emerald-500"
                            )} 
                            style={{ width: `${Math.min(occupancyRatio, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {sede.jornadas.map(j => (
                          <span key={j} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-medium lowercase first-letter:uppercase">{j}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          sede.rfidStatus === 'excellent' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="text-[11px] font-mono font-medium">{sede.rfidOnlineCount} / {sede.rfidDevicesCount} lectores</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                        {sede.internetUptime}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleOpenEditModal(sede, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSede(sede.id, sede.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. INTERACTIVE SEDE 360 DRAWER CENTER PANEL (Mac-style Sliding Drawer) */}
      {drawerOpen && selectedSede && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark glass background overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Sliding Panel wrapper */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-slate-900 text-white border-l border-slate-800 shadow-2xl transition-all duration-300">
                
                <div className="flex h-full flex-col overflow-y-scroll py-6 px-6 space-y-6">
                  
                  {/* Drawer Header Area */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                          {selectedSede.code}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                        <span className="text-[9px] font-semibold text-emerald-400 font-mono">Sincronizado & Operativo</span>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-slate-100 tracking-tight leading-tight pt-1">
                        {selectedSede.name}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {selectedSede.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(selectedSede)}
                        className="text-slate-350 hover:text-white px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5"
                        title="Editar Campus"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Editar</span>
                      </button>
                      <button 
                        onClick={() => setDrawerOpen(false)}
                        className="text-slate-450 hover:text-white p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tabbed Navigation Inside Drawer for highly structural look */}
                  <div className="flex border-b border-slate-800/80 pb-0.5 gap-2 overflow-x-auto scrollbar-thin">
                    {[
                      { id: 'resumen' as const, label: 'Visión 360', icon: Building2 },
                      { id: 'jornadas' as const, label: 'Operación Horaria', icon: Clock },
                      { id: 'cursos' as const, label: 'Infraestructura & Salones', icon: Blocks },
                      { id: 'iot' as const, label: 'IoT & RFID Lectores', icon: Activity },
                      { id: 'historial' as const, label: 'Audit Bitácora', icon: Shield }
                    ].map(tab => {
                      const isActive = drawerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDrawerTab(tab.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer border-t border-x border-transparent",
                            isActive 
                              ? "bg-slate-850 text-indigo-400 border-slate-800 border-b-2 border-b-indigo-500 font-bold" 
                              : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Overview & general local telemetry */}
                  {drawerTab === 'resumen' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Stylized campus cover illustration placeholder */}
                      <div className="border border-slate-800 rounded-2xl bg-slate-950 p-6 flex flex-col justify-center items-center text-center space-y-2 relative overflow-hidden shadow-lg h-36">
                        <div className="absolute inset-0 bg-indigo-500/5" />
                        <Building2 className="w-10 h-10 text-indigo-400 mb-1 z-10" />
                        <span className="text-[10px] font-semibold text-slate-350 tracking-wide uppercase leading-none z-10">Campus Local Telemetry Node</span>
                        <p className="text-[8.5px] font-mono text-slate-500 z-10">Coordenadas GPS: {selectedSede.geoCoordinates || '4.7110, -74.0721'} | Latencia: 12ms</p>
                      </div>

                      {/* Sede metrics locally */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-850 border border-slate-800/80 rounded-xl p-3.5 text-center">
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Capacidad Instalada</span>
                          <span className="text-lg font-bold text-slate-100 leading-none">{selectedSede.capacityMax} <span className="text-[10px] font-medium text-slate-400">Cupos</span></span>
                        </div>
                        <div className="bg-slate-850 border border-slate-800/80 rounded-xl p-3.5 text-center">
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Docentes Asignados</span>
                          <span className="text-lg font-bold text-slate-100 leading-none">{selectedSede.teachersCount} <span className="text-[10px] font-medium text-slate-400">Staff</span></span>
                        </div>
                        <div className="bg-slate-850 border border-slate-800/80 rounded-xl p-3.5 text-center">
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Clases Concurrentes</span>
                          <span className="text-lg font-bold text-slate-100 leading-none">{selectedSede.coursesCount} <span className="text-[10px] font-medium text-slate-400">Cursos</span></span>
                        </div>
                      </div>

                      {/* Dynamic gauge aforo locally */}
                      <div className="bg-slate-850 border border-slate-800/80 rounded-2xl p-4.5 space-y-3.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Uso de Infraestructura Física</span>
                          <span className="text-xs font-bold text-slate-200">{selectedSede.studentsCount} / {selectedSede.capacityMax} Alumnos</span>
                        </div>
                        
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              selectedSede.studentsCount / selectedSede.capacityMax > 0.9 ? "bg-rose-500" : selectedSede.studentsCount / selectedSede.capacityMax > 0.75 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${(selectedSede.studentsCount / (selectedSede.capacityMax || 1)) * 100}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold">
                          <span>0 (Mínimo)</span>
                          <span>Capacidad Máxima Legal ({selectedSede.capacityMax})</span>
                        </div>
                      </div>

                      {/* Tech Telemetry panel */}
                      <div className="bg-slate-850 border border-slate-800/80 rounded-2xl p-4.5 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block border-b border-slate-800 pb-1.5">Telemetría Tecnológica Activa</span>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> IA DESERCIÓN:</span>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase">Habilitado</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> SYNC EXPEDIENTES:</span>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase">Al día</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-indigo-400" /> CONEXIÓN RED:</span>
                            <span className="text-slate-200 font-mono text-[10px]">{selectedSede.networkType} (Uptime {selectedSede.internetUptime})</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-indigo-400" /> DISPOSITIVOS GPS:</span>
                            <span className="text-slate-200 font-mono text-[10px]">Uptime {selectedSede.transportGpsUptime || '100%'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Tab 2: Operation Hours & journeys local matrix */}
                  {drawerTab === 'jornadas' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">Distribución Horaria y Cobertura</h3>
                          <p className="text-xs text-slate-450 font-medium">Asignación local de estudiantes y habilitación de turnos en este campus.</p>
                        </div>
                        <button
                          onClick={() => handleOpenEditModal(selectedSede)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                        >
                          <Edit2 className="w-3 h-3" /> Configurar Sede
                        </button>
                      </div>

                      <div className="space-y-3 pt-2">
                        {[
                          { name: 'Mañana', hours: '06:00 AM - 12:30 PM' },
                          { name: 'Tarde', hours: '12:30 PM - 06:00 PM' },
                          { name: 'Única', hours: '07:00 AM - 03:00 PM' },
                          { name: 'Nocturna', hours: '06:00 PM - 10:00 PM' },
                          { name: 'Sabatina', hours: '08:00 AM - 01:00 PM' }
                        ].map(j => {
                          const isActive = selectedSede.jornadas?.some(sj => sj.toLowerCase() === j.name.toLowerCase());
                          return (
                            <div key={j.name} className={cn(
                              "bg-slate-850 border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all",
                              isActive ? "border-indigo-500/40 bg-slate-850/90 shadow-sm" : "border-slate-800 opacity-60"
                            )}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-[8.5px] font-bold px-2 py-0.5 rounded uppercase",
                                    isActive 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                      : "bg-slate-800 text-slate-400 border border-slate-700"
                                  )}>
                                    {isActive ? 'Activa en este campus' : 'No Habilitada'}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-100 pt-0.5 flex items-center gap-2">
                                  {j.name} <span className="text-xs text-slate-500 font-medium font-mono">({j.hours})</span>
                                </h4>
                              </div>

                              <button
                                onClick={() => handleToggleSedeJornada(selectedSede.id, j.name)}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border",
                                  isActive
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                    : "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 shadow-sm"
                                )}
                              >
                                {isActive ? 'Desactivar' : 'Activar Jornada'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Infrastructure, Classrooms and courses occupancy */}
                  {drawerTab === 'cursos' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">Distribución Física y Cursos</h3>
                        <p className="text-xs text-slate-450 font-medium">Asignación curricular y ocupación local de salones.</p>
                      </div>

                      {/* Infrastructure details */}
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="bg-slate-850 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                            🏫
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Aulas Físicas</p>
                            <p className="font-semibold text-slate-200 text-sm mt-1">{selectedSede.classroomsCount} salones habilitados</p>
                          </div>
                        </div>

                        <div className="bg-slate-850 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                            🔬
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Laboratorios</p>
                            <p className="font-semibold text-slate-200 text-sm mt-1">{selectedSede.labsCount} centros activos</p>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Courses active list */}
                      <div className="space-y-3.5 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Expediente de Cursos Asignados</span>
                        
                        {[
                          { name: 'Grado 11-A', students: 38, capacity: 40, teacher: 'Dr. Carlos Mario Hoyos', parentId: 's-1' },
                          { name: 'Grado 10-B', students: 42, capacity: 40, teacher: 'Dra. Mariana Restrepo', parentId: 's-1' },
                          { name: 'Grado 9-C', students: 35, capacity: 40, teacher: 'Lic. Claudia Gómez', parentId: 's-1' },
                          { name: 'Jardín A Preschool', students: 28, capacity: 30, teacher: 'Lic. Claudia Gómez', parentId: 's-2' },
                          { name: 'Transición B Preschool', students: 32, capacity: 30, teacher: 'Lic. María Clara Restrepo', parentId: 's-2' },
                          { name: 'Primaria 1-A', students: 30, capacity: 30, teacher: 'Lic. Sofia Tobón', parentId: 's-2' },
                          { name: 'Aula Digital Bachillerato 1', students: 80, capacity: 200, teacher: 'Ing. Andrés Beltrán', parentId: 's-3' },
                          { name: 'Aula Digital Media 2', students: 70, capacity: 200, teacher: 'Ing. Andrés Beltrán', parentId: 's-3' }
                        ]
                          .filter(c => c.parentId === selectedSede.id)
                          .map(c => {
                            const isOver = c.students > c.capacity;
                            return (
                              <div key={c.name} className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                                    {c.name} {isOver && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[7px] font-bold px-1 py-0.2 rounded uppercase">Sobrecupo</span>}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-medium">Docente líder: {c.teacher}</p>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-semibold text-slate-200">{c.students} / {c.capacity} alumnos</p>
                                  <span className="text-[8.5px] text-slate-500 font-mono font-semibold uppercase tracking-wider">Aforo de Salón</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                    </div>
                  )}

                  {/* Tab 4: IoT hardware details, RFID readers with virtual switches */}
                  {drawerTab === 'iot' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">Dispositivos Biométricos IoT & Cámaras</h3>
                          <p className="text-xs text-slate-450 font-medium">Controles virtuales de telemetría y estado de aforo en zonas físicas.</p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase">IoT Core Activo</span>
                      </div>

                      {/* Surveillance virtual cameras placeholder */}
                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
                          <Camera className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{selectedSede.securityCamerasCount} cámaras de seguridad indexadas</p>
                          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Detección de aforo por IA de imagen en tiempo real</p>
                        </div>
                      </div>

                      {/* Dynamic list of RFID Biometric terminals with local virtual switch togglers */}
                      <div className="space-y-3.5 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-455 block">Lectores de Portería Vinculados</span>
                        
                        {getSedeRfidDevices(selectedSede.id).map(device => {
                          const isOnline = device.status === 'online';
                          return (
                            <div key={device.id} className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 flex justify-between items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold border",
                                  isOnline 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                )}>
                                  📡
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-100 leading-none">{device.name}</h4>
                                  <p className="text-[8.5px] text-slate-500 font-semibold mt-1">Ubicación física: {device.zone}</p>
                                  <p className="text-[9px] text-slate-400 font-mono mt-1 font-semibold italic">{device.telemetryLog}</p>
                                </div>
                              </div>

                              {/* Virtual power toggle switch */}
                              <button
                                onClick={() => handleToggleRfidDevice(device.id)}
                                className={cn(
                                  "px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase transition-all tracking-wider cursor-pointer border",
                                  isOnline 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                )}
                              >
                                {device.status}
                              </button>
                            </div>
                          );
                        })}

                        {getSedeRfidDevices(selectedSede.id).length === 0 && (
                          <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                            <span>📡 No se registran dispositivos RFID físicos en este campus.</span>
                            <span className="text-[10px] text-slate-550 max-w-xs font-medium">Ideal para la sede digital virtual donde la asistencia es registrada por token de logueo.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Tab 5: Localized chronological audit logs */}
                  {drawerTab === 'historial' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">Registro de Cambios y Auditoría</h3>
                        <p className="text-xs text-slate-450 font-medium">Bitácora forense de operaciones administrativas locales en la sede.</p>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        {getSedeLogs(selectedSede.id).map((log, idx) => (
                          <div key={idx} className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-300">
                            <div>
                              <p className="text-slate-100 font-semibold">{log.action}</p>
                              <p className="text-[9px] text-slate-500 font-semibold mt-1">Operario: {log.user}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-[9px] text-slate-400 font-mono">{log.time} GMT-5</p>
                              <p className="text-[8px] text-slate-500 font-mono mt-0.5">IP: {log.ip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drawer Footer controls */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(selectedSede)}
                        className="text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Editar Parámetros
                      </button>
                      <button
                        onClick={() => handleDeleteSede(selectedSede.id, selectedSede.name)}
                        className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-3.5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Eliminar Sede
                      </button>
                    </div>
                    
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold leading-none">
                      AulaCore CoreEngine 2026
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. NOTION-STYLE NEW CAMPUS CREATION MODAL OVERLAY */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Backdrop shadow */}
            <div 
              onClick={() => setAddModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Trick center block */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" /> Registrar Nuevo Campus
                  </h3>
                  <button 
                    onClick={() => setAddModalOpen(false)}
                    className="text-slate-450 hover:text-slate-650"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre del Campus</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Sede Norte Bachillerato"
                      value={newSedeName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewSedeName(val);
                        if (!newSedeCode || newSedeCode.startsWith('CAMPUS-')) {
                          setNewSedeCode(val ? `CAMPUS-${val.trim().replace(/\s+/g, '-').slice(0, 8).toUpperCase()}` : '');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Código Único</label>
                      <input 
                        type="text" 
                        placeholder="Ej. CAMPUS-NORTE-04"
                        value={newSedeCode}
                        onChange={(e) => setNewSedeCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Capacidad Instalada</label>
                      <input 
                        type="number" 
                        placeholder="Ej. 400"
                        value={newSedeCapacity}
                        onChange={(e) => setNewSedeCapacity(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Dirección Física</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Carrera 15 # 100 - 32, Bogotá"
                      value={newSedeAddress}
                      onChange={(e) => setNewSedeAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Teléfono</label>
                      <input 
                        type="text" 
                        placeholder="Ej. +57 1 601 8800"
                        value={newSedePhone}
                        onChange={(e) => setNewSedePhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Coordinador a Cargo</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Lic. Alberto Gómez"
                        value={newSedeCoordinator}
                        onChange={(e) => setNewSedeCoordinator(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Checkboxes levels */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Niveles Educativos Dictados</label>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                      {['Preescolar', 'Primaria', 'Bachillerato', 'Media'].map(lvl => {
                        const isChecked = newSedeLevels.includes(lvl);
                        return (
                          <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) setNewSedeLevels(newSedeLevels.filter(x => x !== lvl));
                                else setNewSedeLevels([...newSedeLevels, lvl]);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{lvl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checkboxes journeys */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Jornadas Operacionales Habilitadas</label>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                      {['Mañana', 'Tarde', 'Única', 'Nocturna', 'Sabatina'].map(j => {
                        const isChecked = newSedeJornadas.includes(j);
                        return (
                          <label key={j} className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) setNewSedeJornadas(newSedeJornadas.filter(x => x !== j));
                                else setNewSedeJornadas([...newSedeJornadas, j]);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{j}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddSede}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Confirmar Registro
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. EDIT CAMPUS MODAL OVERLAY */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-edit-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Backdrop shadow */}
            <div 
              onClick={() => setEditModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-indigo-600" /> Editar Campus / Sede
                  </h3>
                  <button 
                    onClick={() => setEditModalOpen(false)}
                    className="text-slate-450 hover:text-slate-650"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre del Campus</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Sede Norte Bachillerato"
                      value={editSedeName}
                      onChange={(e) => setEditSedeName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Código Único</label>
                      <input 
                        type="text" 
                        placeholder="Ej. CAMPUS-NORTE-04"
                        value={editSedeCode}
                        onChange={(e) => setEditSedeCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Capacidad Instalada</label>
                      <input 
                        type="number" 
                        placeholder="Ej. 500"
                        value={editSedeCapacity}
                        onChange={(e) => setEditSedeCapacity(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Dirección Física</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Carrera 15 # 100 - 32, Bogotá"
                      value={editSedeAddress}
                      onChange={(e) => setEditSedeAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Teléfono</label>
                      <input 
                        type="text" 
                        placeholder="Ej. +57 1 601 8800"
                        value={editSedePhone}
                        onChange={(e) => setEditSedePhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Coordinador a Cargo</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Lic. Alberto Gómez"
                        value={editSedeCoordinator}
                        onChange={(e) => setEditSedeCoordinator(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Checkboxes levels */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Niveles Educativos Dictados</label>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                      {['Preescolar', 'Primaria', 'Bachillerato', 'Media'].map(lvl => {
                        const isChecked = editSedeLevels.includes(lvl);
                        return (
                          <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) setEditSedeLevels(editSedeLevels.filter(x => x !== lvl));
                                else setEditSedeLevels([...editSedeLevels, lvl]);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{lvl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checkboxes journeys */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Jornadas Operacionales Habilitadas</label>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                      {['Mañana', 'Tarde', 'Única', 'Nocturna', 'Sabatina'].map(j => {
                        const isChecked = editSedeJornadas.some(x => x.toLowerCase() === j.toLowerCase());
                        return (
                          <label key={j} className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) setEditSedeJornadas(editSedeJornadas.filter(x => x.toLowerCase() !== j.toLowerCase()));
                                else setEditSedeJornadas([...editSedeJornadas, j]);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{j}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditSede}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
