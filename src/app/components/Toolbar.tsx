// Toolbar Component - Action buttons for query operations
import { Button } from './ui/button';
import { Play, Save, Download, Copy, Eraser, Database, Moon, Sun, FileJson } from 'lucide-react';
import { DatabaseInfo } from './DatabaseInfo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ToolbarProps {
  onExecute: () => void;
  onSave: () => void;
  onClear: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onCopyResults: () => void;
  onToggleDarkMode: () => void;
  onShowTables: () => void;
  onSelectQuery: (query: string) => void;
  isExecuting: boolean;
  hasResults: boolean;
  isDarkMode: boolean;
}

export function Toolbar({
  onExecute,
  onSave,
  onClear,
  onExportCSV,
  onExportJSON,
  onCopyResults,
  onToggleDarkMode,
  onShowTables,
  onSelectQuery,
  isExecuting,
  hasResults,
  isDarkMode,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button
          onClick={onExecute}
          disabled={isExecuting}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-2" />
          {isExecuting ? 'Running...' : 'Run Query'}
        </Button>

        <Button
          onClick={onSave}
          variant="outline"
          disabled={isExecuting}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          onClick={onClear}
          variant="outline"
          disabled={isExecuting}
        >
          <Eraser className="w-4 h-4 mr-2" />
          Clear
        </Button>

        <Button
          onClick={onShowTables}
          variant="outline"
          disabled={isExecuting}
        >
          <Database className="w-4 h-4 mr-2" />
          Show Tables
        </Button>
        
        <DatabaseInfo onSelectQuery={onSelectQuery} />
      </div>

      <div className="flex items-center gap-2">
        {hasResults && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExecuting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={onCopyResults}
              variant="outline"
              disabled={isExecuting}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </>
        )}

        <Button
          onClick={onToggleDarkMode}
          variant="ghost"
          size="icon"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}