// Storage Utilities - LocalStorage management for query history
// Handles persistence of query history and user preferences

export interface QueryHistoryItem {
  id: string;
  query_text: string;
  execution_time: number;
  status: 'success' | 'error';
  timestamp: string;
  rowCount?: number;
}

const STORAGE_KEYS = {
  QUERY_HISTORY: 'datascript_query_history',
  PREFERENCES: 'datascript_preferences',
};

/**
 * Saves a query to history
 * @param query - SQL query text
 * @param executionTime - Execution time in milliseconds
 * @param status - Query execution status
 * @param rowCount - Number of rows returned (optional)
 */
export function saveQueryToHistory(
  query: string,
  executionTime: number,
  status: 'success' | 'error',
  rowCount?: number
): void {
  const history = getQueryHistory();
  
  const newItem: QueryHistoryItem = {
    id: generateId(),
    query_text: query.trim(),
    execution_time: executionTime,
    status,
    timestamp: new Date().toISOString(),
    rowCount,
  };
  
  // Add to beginning of array (most recent first)
  history.unshift(newItem);
  
  // Keep only last 100 queries
  const trimmedHistory = history.slice(0, 100);
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(trimmedHistory));
}

/**
 * Gets all query history
 * @returns Array of query history items
 */
export function getQueryHistory(): QueryHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUERY_HISTORY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading query history:', error);
    return [];
  }
}

/**
 * Clears all query history
 */
export function clearQueryHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.QUERY_HISTORY);
}

/**
 * Deletes a specific query from history
 * @param id - ID of query to delete
 */
export function deleteQueryFromHistory(id: string): void {
  const history = getQueryHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(filtered));
}

/**
 * Generates a unique ID
 * @returns Unique identifier string
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  darkMode: boolean;
  fontSize: number;
  autoSaveHistory: boolean;
  confirmDangerousQueries: boolean;
}

/**
 * Gets user preferences
 * @returns User preferences object
 */
export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!stored) {
      return getDefaultPreferences();
    }
    
    return { ...getDefaultPreferences(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return getDefaultPreferences();
  }
}

/**
 * Saves user preferences
 * @param preferences - Preferences to save
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
}

/**
 * Gets default preferences
 * @returns Default user preferences
 */
function getDefaultPreferences(): UserPreferences {
  return {
    darkMode: true,
    fontSize: 14,
    autoSaveHistory: true,
    confirmDangerousQueries: true,
  };
}

/**
 * Exports all data (history + preferences) as JSON
 * @returns JSON string of all stored data
 */
export function exportAllData(): string {
  return JSON.stringify({
    history: getQueryHistory(),
    preferences: getUserPreferences(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Imports data from JSON
 * @param jsonData - JSON string to import
 */
export function importData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(data.history));
    }
    
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
    }
  } catch (error) {
    throw new Error('Invalid import data format');
  }
}
