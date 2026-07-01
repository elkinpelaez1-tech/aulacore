'use client';

export interface SyncItem {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  payload: any;
  priority: 1 | 2 | 3; // 1: Crítico, 2: Operativo, 3: Pesado/Multimedia
  status: 'pending' | 'syncing' | 'failed' | 'success';
  attempts: number;
  error?: string;
}

export interface SyncStats {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingCount: number;
  criticalCount: number; // P1
  operationalCount: number; // P2
  heavyCount: number; // P3
  failedCount: number;
  successCount: number;
}

// Fallback en memoria si IndexedDB no está disponible (ej. SSR o navegación privada restrictiva)
let inMemoryQueue: SyncItem[] = [];
let lastSyncTimestamp: string | null = null;
let simulatedOnlineState = true;

// Inicialización de la base de datos de IndexedDB en el cliente
const DB_NAME = 'AulaCore_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'sync_queue';

function getDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Obtener el estado actual del detector de conectividad (real o simulado)
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Para la demo, permitimos simular el estado offline de forma manual
  const simulated = sessionStorage.getItem('offline_simulated_state');
  if (simulated !== null) {
    return simulated === 'online';
  }
  
  return navigator.onLine;
}

/**
 * Forzar el estado de conexión de forma reactiva (Para la Demo)
 */
export function setSimulatedOnlineState(state: boolean): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem('offline_simulated_state', state ? 'online' : 'offline');
  simulatedOnlineState = state;
  
  // Despachar evento para que los componentes del Header se actualicen en caliente
  const event = new CustomEvent('connectivity-changed', { detail: { online: state } });
  window.dispatchEvent(event);
  
  if (state) {
    // Si vuelve a estar online, lanzar autostart de sincronización en 1 segundo
    setTimeout(() => {
      syncQueueAutomatically();
    }, 1000);
  }
}

/**
 * Obtener todos los elementos de la cola local en IndexedDB (o memoria)
 */
export async function getSyncQueue(): Promise<SyncItem[]> {
  const db = await getDB();
  
  if (!db) {
    // Retornar fallback en memoria
    return [...inMemoryQueue];
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Ordenar por prioridad (1 primero, luego 2, luego 3) y luego por timestamp
        const items = request.result as SyncItem[];
        items.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        resolve(items);
      };

      request.onerror = () => {
        resolve([...inMemoryQueue]);
      };
    } catch (e) {
      resolve([...inMemoryQueue]);
    }
  });
}

/**
 * Guardar o actualizar un elemento en IndexedDB
 */
async function saveSyncItem(item: SyncItem): Promise<boolean> {
  const db = await getDB();
  
  if (!db) {
    const idx = inMemoryQueue.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      inMemoryQueue[idx] = item;
    } else {
      inMemoryQueue.push(item);
    }
    return true;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Eliminar un elemento de IndexedDB
 */
async function deleteSyncItem(id: string): Promise<boolean> {
  const db = await getDB();
  
  if (!db) {
    inMemoryQueue = inMemoryQueue.filter(i => i.id !== id);
    return true;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Agregar una acción a la cola de sincronización
 */
export async function addToSyncQueue(
  module: string,
  action: string,
  payload: any,
  priority: 1 | 2 | 3 = 2
): Promise<SyncItem> {
  const newItem: SyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    module,
    action,
    payload,
    priority,
    status: 'pending',
    attempts: 0
  };

  await saveSyncItem(newItem);
  
  // Despachar evento para alertar al dashboard
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync-queue-changed'));
  }
  
  // Si estamos online, intentar sincronizar de inmediato
  if (isOnline()) {
    setTimeout(() => {
      syncQueueAutomatically();
    }, 800);
  }

  return newItem;
}

/**
 * Limpiar toda la cola
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  if (!db) {
    inMemoryQueue = [];
    return;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync-queue-changed'));
        }
        resolve();
      };
      request.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

/**
 * Obtener estadísticas consolidadas del motor offline
 */
export async function getSyncStats(): Promise<SyncStats> {
  const queue = await getSyncQueue();
  const online = isOnline();
  
  if (typeof window !== 'undefined') {
    const savedTime = sessionStorage.getItem('last_sync_timestamp');
    if (savedTime) {
      lastSyncTimestamp = savedTime;
    }
  }

  return {
    isOnline: online,
    lastSyncTime: lastSyncTimestamp,
    pendingCount: queue.filter(i => i.status === 'pending' || i.status === 'failed').length,
    criticalCount: queue.filter(i => i.priority === 1 && i.status !== 'success').length,
    operationalCount: queue.filter(i => i.priority === 2 && i.status !== 'success').length,
    heavyCount: queue.filter(i => i.priority === 3 && i.status !== 'success').length,
    failedCount: queue.filter(i => i.status === 'failed').length,
    successCount: queue.filter(i => i.status === 'success').length
  };
}

/**
 * Ejecutar sincronización manual por lotes y prioridades
 */
export async function syncQueueNow(
  onProgress?: (msg: string, progress: number) => void
): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
  if (!isOnline()) {
    return { success: false, syncedCount: 0, errors: ['No hay conexión a internet activa para sincronizar.'] };
  }

  const queue = await getSyncQueue();
  const pendingItems = queue.filter(i => i.status !== 'success');
  
  if (pendingItems.length === 0) {
    return { success: true, syncedCount: 0, errors: [] };
  }

  let successCount = 0;
  const errors: string[] = [];
  const total = pendingItems.length;

  // Despachar evento del estado: Sincronizando
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync-state-changed', { detail: { state: 'syncing' } }));
  }

  // Agrupar por prioridades y procesar en cascada modular
  for (let idx = 0; idx < total; idx++) {
    const item = pendingItems[idx];
    item.status = 'syncing';
    await saveSyncItem(item);
    
    if (onProgress) {
      onProgress(`Sincronizando ${item.module} (${item.action}) - Prioridad ${item.priority}`, Math.round((idx / total) * 100));
    }

    // Simular latencia de red de 600ms por petición
    await new Promise(r => setTimeout(r, 600));

    // Simulación del motor: Las faltas graves Tipo III simulan un conflicto de validación a veces
    const isConflictCase = item.action === 'CREATE_FALTA' && item.payload.type === 'Tipo III' && Math.random() > 0.8;

    if (isConflictCase) {
      item.status = 'failed';
      item.attempts += 1;
      item.error = 'Conflicto: El expediente ya fue modificado por un supervisor regional en la SED. Se requiere mediación.';
      await saveSyncItem(item);
      errors.push(`Error en folio ${item.id}: ${item.error}`);
    } else {
      // Éxito: Sincronizado
      item.status = 'success';
      await saveSyncItem(item);
      successCount++;
      
      // Eliminar de IndexedDB tras sincronizarse con éxito para mantenerla ligera
      await deleteSyncItem(item.id);
    }
  }

  lastSyncTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' de hoy';
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('last_sync_timestamp', lastSyncTimestamp);
    window.dispatchEvent(new CustomEvent('sync-queue-changed'));
    window.dispatchEvent(new CustomEvent('sync-state-changed', { detail: { state: 'idle' } }));
  }

  return {
    success: errors.length === 0,
    syncedCount: successCount,
    errors
  };
}

/**
 * Gatillar sincronización automática en segundo plano
 */
let isSyncingInProgress = false;
async function syncQueueAutomatically() {
  if (isSyncingInProgress || !isOnline()) return;
  
  isSyncingInProgress = true;
  try {
    await syncQueueNow();
  } catch (e) {
  } finally {
    isSyncingInProgress = false;
  }
}
