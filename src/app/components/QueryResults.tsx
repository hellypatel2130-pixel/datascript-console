// Query Results Component - Displays query execution results in a table
import { QueryResult } from '../utils/sqlEngine';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { formatExecutionTime } from '../utils/queryValidator';

interface QueryResultsProps {
  result: QueryResult | null;
  error: string | null;
}

export function QueryResults({ result, error }: QueryResultsProps) {
  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-lg">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-destructive mt-0.5"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-destructive mb-1">Query Error</h3>
            <p className="text-sm text-destructive/90">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
          </svg>
          <p>No results yet. Execute a query to see results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
          </span>
          <span className="text-muted-foreground">
            Execution time: {formatExecutionTime(result.executionTime)}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {result.columns.map((column, index) => (
                  <TableHead key={index} className="font-semibold bg-muted/30">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={result.columns.length}
                    className="text-center text-muted-foreground py-8"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                result.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-muted/50">
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="font-mono text-sm">
                        {cell === null || cell === undefined ? (
                          <span className="text-muted-foreground italic">NULL</span>
                        ) : (
                          String(cell)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
