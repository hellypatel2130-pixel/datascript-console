// Query History Component - Displays saved query history
import { useState, useEffect } from 'react';
import { QueryHistoryItem, getQueryHistory, deleteQueryFromHistory, clearQueryHistory } from '../utils/storageUtils';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { formatExecutionTime } from '../utils/queryValidator';
import { Trash2, Clock, CheckCircle2, XCircle, Trash } from 'lucide-react';

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
}

export function QueryHistory({ onSelectQuery }: QueryHistoryProps) {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load history on mount and set up refresh
  useEffect(() => {
    loadHistory();
    
    // Refresh history every second to catch updates
    const interval = setInterval(loadHistory, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = () => {
    setHistory(getQueryHistory());
  };

  const handleSelectQuery = (item: QueryHistoryItem) => {
    setSelectedId(item.id);
    onSelectQuery(item.query_text);
  };

  const handleDeleteQuery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteQueryFromHistory(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      clearQueryHistory();
      loadHistory();
      setSelectedId(null);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncateQuery = (query: string, maxLength: number = 60): string => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r">
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Query History</h2>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 text-xs"
            >
              <Trash className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {history.length} {history.length === 1 ? 'query' : 'queries'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        {history.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No query history yet</p>
            <p className="text-xs mt-1">Executed queries will appear here</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectQuery(item)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all
                  ${selectedId === item.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-background hover:bg-muted/50'
                  }
                  border
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteQuery(item.id, e)}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-sm font-mono mb-2 leading-relaxed break-words">
                  {truncateQuery(item.query_text)}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatExecutionTime(item.execution_time)}</span>
                  {item.rowCount !== undefined && (
                    <span>
                      {item.rowCount} {item.rowCount === 1 ? 'row' : 'rows'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
