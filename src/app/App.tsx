// DataScript Console - Browser-based SQL query console
import { useState, useEffect } from 'react';
import { QueryEditor } from './components/QueryEditor';
import { QueryResults } from './components/QueryResults';
import { QueryHistory } from './components/QueryHistory';
import { Toolbar } from './components/Toolbar';
import { SampleQueries } from './components/SampleQueries';
import { DatabaseInfo } from './components/DatabaseInfo';
import { LoadingOverlay } from './components/LoadingOverlay';
import { executeQuery, getAvailableTables, QueryResult } from './utils/sqlEngine';
import { validateQuery } from './utils/queryValidator';
import { exportToCSV, exportToJSON, copyResultsToClipboard } from './utils/exportUtils';
import { saveQueryToHistory, getUserPreferences, saveUserPreferences } from './utils/storageUtils';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Database, Info } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const prefs = getUserPreferences();
    setIsDarkMode(prefs.darkMode);
    
    // Apply dark mode class to document
    if (prefs.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle query execution
  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    // Validate query
    const validation = validateQuery(query);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid query');
      setError(validation.error || 'Invalid query');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Execute query
      const queryResult = await executeQuery(query);
      
      // Update results
      setResult(queryResult);
      setError(null);
      
      // Save to history
      const prefs = getUserPreferences();
      if (prefs.autoSaveHistory) {
        saveQueryToHistory(query, queryResult.executionTime, 'success', queryResult.rowCount);
      }
      
      // Show success toast
      toast.success(
        `Query executed successfully! ${queryResult.rowCount} ${queryResult.rowCount === 1 ? 'row' : 'rows'} returned.`,
        {
          description: `Execution time: ${queryResult.executionTime.toFixed(2)}ms`,
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setResult(null);
      
      // Save error to history
      saveQueryToHistory(query, 0, 'error');
      
      // Show error toast
      toast.error('Query execution failed', {
        description: errorMessage,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle save query
  const handleSaveQuery = () => {
    if (!query.trim()) {
      toast.error('No query to save');
      return;
    }

    saveQueryToHistory(query, 0, 'success');
    toast.success('Query saved to history');
  };

  // Handle clear editor
  const handleClearEditor = () => {
    setQuery('');
    setResult(null);
    setError(null);
    toast.info('Editor cleared');
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!result) {
      toast.error('No results to export');
      return;
    }

    try {
      exportToCSV(result, `query_results_${Date.now()}.csv`);
      toast.success('Results exported as CSV');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  // Handle export to JSON
  const handleExportJSON = () => {
    if (!result) {
      toast.error('No results to export');
      return;
    }

    try {
      exportToJSON(result, `query_results_${Date.now()}.json`);
      toast.success('Results exported as JSON');
    } catch (err) {
      toast.error('Failed to export JSON');
    }
  };

  // Handle copy results
  const handleCopyResults = async () => {
    if (!result) {
      toast.error('No results to copy');
      return;
    }

    try {
      await copyResultsToClipboard(result);
      toast.success('Results copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy results');
    }
  };

  // Handle dark mode toggle
  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveUserPreferences({ darkMode: newMode });
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.info(newMode ? 'Dark mode enabled' : 'Light mode enabled');
  };

  // Handle show tables
  const handleShowTables = () => {
    setQuery('SHOW TABLES');
  };

  // Handle select query from history
  const handleSelectFromHistory = (selectedQuery: string) => {
    setQuery(selectedQuery);
    toast.info('Query loaded from history');
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">DataScript Console</h1>
              <p className="text-sm text-muted-foreground">
                Browser-based SQL Query Console
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <SampleQueries onSelectQuery={setQuery} />
          </div>
        </div>
      </header>

      {/* Info Alert */}
      <div className="p-4 pb-0">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Available Tables:</strong> {getAvailableTables().join(', ')} | 
            <strong className="ml-2">Tip:</strong> Press Ctrl+Enter to execute queries
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Query History Sidebar */}
        {showHistory && (
          <div className="w-80 flex-shrink-0">
            <QueryHistory onSelectQuery={handleSelectFromHistory} />
          </div>
        )}

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <Toolbar
            onExecute={handleExecuteQuery}
            onSave={handleSaveQuery}
            onClear={handleClearEditor}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            onCopyResults={handleCopyResults}
            onToggleDarkMode={handleToggleDarkMode}
            onShowTables={handleShowTables}
            onSelectQuery={setQuery}
            isExecuting={isExecuting}
            hasResults={!!result}
            isDarkMode={isDarkMode}
          />

          {/* Editor and Results Split View */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Query Editor */}
            <div className="h-1/3 border-b p-4 overflow-auto">
              <QueryEditor
                value={query}
                onChange={setQuery}
                onExecute={handleExecuteQuery}
                disabled={isExecuting}
              />
            </div>

            {/* Query Results */}
            <div className="flex-1 overflow-hidden">
              <QueryResults result={result} error={error} />
            </div>

            {/* Loading Overlay */}
            <LoadingOverlay isLoading={isExecuting} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card p-2 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <span>DataScript Console v1.0</span>
          <span>•</span>
          <span>JavaScript-powered SQL Query Engine</span>
          <span>•</span>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="hover:text-foreground transition-colors"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}