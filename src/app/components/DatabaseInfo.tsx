// Database Info Component - Shows available tables and schema information
import { useState } from 'react';
import { getAvailableTables } from '../utils/sqlEngine';
import { Database, Table as TableIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface DatabaseInfoProps {
  onSelectQuery: (query: string) => void;
}

interface TableSchema {
  name: string;
  description: string;
  columns: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  sampleQueries: string[];
}

const tableSchemas: TableSchema[] = [
  {
    name: 'users',
    description: 'User accounts and profiles',
    columns: [
      { name: 'id', type: 'INT', description: 'Primary key' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Full name' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Email address' },
      { name: 'created_at', type: 'DATETIME', description: 'Account creation date' },
      { name: 'status', type: 'VARCHAR(50)', description: 'Account status' },
    ],
    sampleQueries: [
      'SELECT * FROM users',
      'SELECT * FROM users WHERE status = "active"',
      'SELECT COUNT(*) FROM users',
    ],
  },
  {
    name: 'products',
    description: 'Product catalog',
    columns: [
      { name: 'id', type: 'INT', description: 'Primary key' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Product name' },
      { name: 'price', type: 'DECIMAL(10,2)', description: 'Product price' },
      { name: 'category', type: 'VARCHAR(100)', description: 'Product category' },
      { name: 'stock', type: 'INT', description: 'Available stock' },
    ],
    sampleQueries: [
      'SELECT * FROM products',
      'SELECT * FROM products WHERE price > 100',
      'SELECT category, COUNT(*) FROM products GROUP BY category',
    ],
  },
  {
    name: 'orders',
    description: 'Customer orders',
    columns: [
      { name: 'id', type: 'INT', description: 'Primary key' },
      { name: 'user_id', type: 'INT', description: 'Foreign key to users' },
      { name: 'product_id', type: 'INT', description: 'Foreign key to products' },
      { name: 'quantity', type: 'INT', description: 'Order quantity' },
      { name: 'order_date', type: 'DATETIME', description: 'Order date' },
    ],
    sampleQueries: [
      'SELECT * FROM orders',
      'SELECT * FROM orders ORDER BY order_date DESC',
      'SELECT COUNT(*) FROM orders WHERE user_id = 1',
    ],
  },
  {
    name: 'query_history',
    description: 'Query execution history',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', description: 'Primary key' },
      { name: 'query_text', type: 'TEXT', description: 'SQL query' },
      { name: 'execution_time', type: 'DECIMAL(10,2)', description: 'Execution time (ms)' },
      { name: 'status', type: 'VARCHAR(20)', description: 'Execution status' },
    ],
    sampleQueries: [
      'SELECT * FROM query_history',
      'SELECT * FROM query_history WHERE status = "success"',
    ],
  },
];

export function DatabaseInfo({ onSelectQuery }: DatabaseInfoProps) {
  const [expandedTables, setExpandedTables] = useState<string[]>([]);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev =>
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="w-4 h-4 mr-2" />
          Database Schema
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Schema
          </DialogTitle>
          <DialogDescription>
            Available tables and their structure. Click on a sample query to load it.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {tableSchemas.map((table) => (
              <div key={table.name} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleTable(table.name)}
                  className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TableIcon className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <h3 className="font-semibold">{table.name}</h3>
                      <p className="text-sm text-muted-foreground">{table.description}</p>
                    </div>
                  </div>
                  {expandedTables.includes(table.name) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {expandedTables.includes(table.name) && (
                  <div className="p-4 space-y-4">
                    {/* Columns */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Columns</h4>
                      <div className="space-y-2">
                        {table.columns.map((column) => (
                          <div
                            key={column.name}
                            className="flex items-start gap-3 p-2 bg-background rounded text-sm"
                          >
                            <code className="font-mono font-semibold text-primary min-w-[120px]">
                              {column.name}
                            </code>
                            <span className="text-muted-foreground min-w-[100px]">
                              {column.type}
                            </span>
                            <span className="text-muted-foreground flex-1">
                              {column.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sample Queries */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Sample Queries</h4>
                      <div className="space-y-2">
                        {table.sampleQueries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              onSelectQuery(query);
                            }}
                            className="w-full text-left p-2 bg-background hover:bg-muted rounded font-mono text-xs transition-colors"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
