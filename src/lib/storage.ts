export interface UserProfile {
  startDate: string; // ISO Date string YYYY-MM-DD
  lastLogin: string; // ISO Date string YYYY-MM-DD
}

export interface LogEntry {
  id: number;
  date: string; // YYYY-MM-DD
  distance: number; // in km
  note?: string;
}

export interface LocalStorageSchema {
  userProfile: UserProfile;
  logs: LogEntry[];
}

export const STORAGE_KEY = 'mordor_tracker_v1';

export const DEFAULT_STATE: LocalStorageSchema = {
  userProfile: {
    startDate: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString().split('T')[0]
  },
  logs: []
};

// Helper to ensure we're in the browser
const isBrowser = () => typeof localStorage !== 'undefined';

export function loadData(): LocalStorageSchema {
  if (!isBrowser()) return DEFAULT_STATE;
  
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;

  try {
    const parsed = JSON.parse(raw);
    // Basic structural validation could go here, but for now we assume it's correct 
    // or merge with default to ensure fields exist
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.error('Failed to parse journey data', e);
    return DEFAULT_STATE;
  }
}

export function saveData(data: LocalStorageSchema): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addLog(entry: Omit<LogEntry, 'id'>): LocalStorageSchema {
  const current = loadData();
  const newEntry: LogEntry = {
    ...entry,
    id: Date.now()
  };
  
  // Check if new entry is before current start date
  let newStartDate = current.userProfile.startDate;
  if (entry.date < newStartDate) {
    newStartDate = entry.date;
  }
  
  // Update last login implicitly? Or just update logs
  const updated: LocalStorageSchema = {
    ...current,
    logs: [newEntry, ...current.logs],
    userProfile: {
      ...current.userProfile,
      startDate: newStartDate,
      lastLogin: new Date().toISOString().split('T')[0]
    }
  };

  saveData(updated);
  return updated;
}

export function deleteLog(id: number): LocalStorageSchema {
  const current = loadData();
  const updated: LocalStorageSchema = {
    ...current,
    logs: current.logs.filter(log => log.id !== id)
  };
  saveData(updated);
  return updated;
}

export function resetData(): LocalStorageSchema {
    if(isBrowser()) {
        localStorage.removeItem(STORAGE_KEY);
    }
    return DEFAULT_STATE;
}
