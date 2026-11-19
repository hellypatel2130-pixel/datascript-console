// SQL Engine - Simulates MySQL query execution with JavaScript
// This file contains the core logic for parsing and executing SQL queries

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

export interface MockDatabase {
  [tableName: string]: {
    columns: string[];
    rows: any[][];
  };
}

// Mock database with sample tables
const mockDatabase: MockDatabase = {
  users: {
    columns: ['id', 'name', 'email', 'created_at', 'status'],
    rows: [
      [1, 'John Doe', 'john@example.com', '2024-01-15 10:30:00', 'active'],
      [2, 'Jane Smith', 'jane@example.com', '2024-01-16 14:20:00', 'active'],
      [3, 'Bob Johnson', 'bob@example.com', '2024-01-17 09:15:00', 'inactive'],
      [4, 'Alice Williams', 'alice@example.com', '2024-01-18 16:45:00', 'active'],
      [5, 'Charlie Brown', 'charlie@example.com', '2024-01-19 11:30:00', 'active'],
    ],
  },
  products: {
    columns: ['id', 'name', 'price', 'category', 'stock'],
    rows: [
      [1, 'Laptop', 999.99, 'Electronics', 50],
      [2, 'Mouse', 29.99, 'Electronics', 200],
      [3, 'Desk Chair', 199.99, 'Furniture', 75],
      [4, 'Monitor', 349.99, 'Electronics', 100],
      [5, 'Keyboard', 79.99, 'Electronics', 150],
    ],
  },
  orders: {
    columns: ['id', 'user_id', 'product_id', 'quantity', 'order_date'],
    rows: [
      [1, 1, 1, 1, '2024-02-01 10:00:00'],
      [2, 2, 2, 2, '2024-02-02 11:30:00'],
      [3, 1, 3, 1, '2024-02-03 14:15:00'],
      [4, 3, 4, 1, '2024-02-04 09:45:00'],
      [5, 4, 5, 3, '2024-02-05 16:20:00'],
      [6, 2, 1, 1, '2024-02-06 13:10:00'],
    ],
  },
  query_history: {
    columns: ['id', 'query_text', 'execution_time', 'status'],
    rows: [],
  },
};

// Execute SQL query
export async function executeQuery(query: string): Promise<QueryResult> {
  const startTime = performance.now();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  const trimmedQuery = query.trim().toLowerCase();
  
  // Handle SELECT queries
  if (trimmedQuery.startsWith('select')) {
    return executeSelectQuery(query, startTime);
  }
  
  // Handle SHOW TABLES
  if (trimmedQuery.startsWith('show tables')) {
    return executeShowTables(startTime);
  }
  
  // Handle DESCRIBE
  if (trimmedQuery.startsWith('describe') || trimmedQuery.startsWith('desc ')) {
    return executeDescribeTable(query, startTime);
  }
  
  // Handle INSERT
  if (trimmedQuery.startsWith('insert')) {
    return executeInsertQuery(query, startTime);
  }
  
  // Handle UPDATE
  if (trimmedQuery.startsWith('update')) {
    return executeUpdateQuery(query, startTime);
  }
  
  // Handle DELETE
  if (trimmedQuery.startsWith('delete')) {
    return executeDeleteQuery(query, startTime);
  }
  
  // Handle CREATE TABLE
  if (trimmedQuery.startsWith('create table')) {
    return executeCreateTable(query, startTime);
  }
  
  throw new Error('Unsupported query type. Supported: SELECT, SHOW TABLES, DESCRIBE, INSERT, UPDATE, DELETE, CREATE TABLE');
}

// Execute SELECT query
function executeSelectQuery(query: string, startTime: number): QueryResult {
  const trimmedQuery = query.trim().toLowerCase();
  
  // Parse table name - simple regex approach
  const fromMatch = trimmedQuery.match(/from\s+(\w+)/);
  if (!fromMatch) {
    throw new Error('Invalid SELECT query: FROM clause not found');
  }
  
  const tableName = fromMatch[1];
  const table = mockDatabase[tableName];
  
  if (!table) {
    throw new Error(`Table '${tableName}' doesn't exist. Available tables: ${Object.keys(mockDatabase).join(', ')}`);
  }
  
  let columns = [...table.columns];
  let rows = table.rows.map(row => [...row]);
  
  // Parse SELECT columns
  const selectMatch = query.trim().match(/^select\s+(.*?)\s+from/i);
  if (selectMatch) {
    const selectPart = selectMatch[1].trim();
    
    if (selectPart !== '*') {
      // Parse specific columns
      const requestedColumns = selectPart.split(',').map(col => col.trim().toLowerCase());
      const columnIndices: number[] = [];
      const newColumns: string[] = [];
      
      requestedColumns.forEach(col => {
        const index = columns.findIndex(c => c.toLowerCase() === col);
        if (index !== -1) {
          columnIndices.push(index);
          newColumns.push(columns[index]);
        }
      });
      
      columns = newColumns;
      rows = rows.map(row => columnIndices.map(i => row[i]));
    }
  }
  
  // Simple WHERE clause handling
  const whereMatch = trimmedQuery.match(/where\s+(.+?)(?:order|limit|$)/);
  if (whereMatch) {
    const whereClause = whereMatch[1].trim();
    rows = filterRows(rows, columns, whereClause, table.columns);
  }
  
  // Simple ORDER BY handling
  const orderMatch = trimmedQuery.match(/order by\s+(\w+)(?:\s+(asc|desc))?/);
  if (orderMatch) {
    const orderColumn = orderMatch[1];
    const orderDir = orderMatch[2] || 'asc';
    const colIndex = columns.findIndex(c => c.toLowerCase() === orderColumn.toLowerCase());
    
    if (colIndex !== -1) {
      rows.sort((a, b) => {
        const valA = a[colIndex];
        const valB = b[colIndex];
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return orderDir === 'desc' ? -comparison : comparison;
      });
    }
  }
  
  // Simple LIMIT handling
  const limitMatch = trimmedQuery.match(/limit\s+(\d+)/);
  if (limitMatch) {
    const limit = parseInt(limitMatch[1]);
    rows = rows.slice(0, limit);
  }
  
  // COUNT handling
  if (trimmedQuery.includes('count(')) {
    return {
      columns: ['count(*)'],
      rows: [[rows.length]],
      rowCount: 1,
      executionTime: performance.now() - startTime,
    };
  }
  
  return {
    columns,
    rows,
    rowCount: rows.length,
    executionTime: performance.now() - startTime,
  };
}

// Filter rows based on WHERE clause
function filterRows(rows: any[][], columns: string[], whereClause: string, originalColumns: string[]): any[][] {
  // Simple WHERE parsing - supports basic conditions
  const conditionMatch = whereClause.match(/(\w+)\s*(=|>|<|>=|<=|!=|like)\s*(.+)/);
  
  if (!conditionMatch) {
    return rows;
  }
  
  const [, column, operator, value] = conditionMatch;
  const colIndex = columns.findIndex(c => c.toLowerCase() === column.toLowerCase());
  
  if (colIndex === -1) {
    return rows;
  }
  
  // Clean up value (remove quotes)
  let cleanValue: any = value.trim().replace(/^['"]|['"]$/g, '');
  
  // Try to parse as number
  if (!isNaN(Number(cleanValue))) {
    cleanValue = Number(cleanValue);
  }
  
  return rows.filter(row => {
    const cellValue = row[colIndex];
    
    switch (operator) {
      case '=':
        return cellValue == cleanValue;
      case '!=':
        return cellValue != cleanValue;
      case '>':
        return cellValue > cleanValue;
      case '<':
        return cellValue < cleanValue;
      case '>=':
        return cellValue >= cleanValue;
      case '<=':
        return cellValue <= cleanValue;
      case 'like':
        const pattern = cleanValue.replace(/%/g, '.*');
        return new RegExp(pattern, 'i').test(String(cellValue));
      default:
        return true;
    }
  });
}

// Execute SHOW TABLES
function executeShowTables(startTime: number): QueryResult {
  const tables = Object.keys(mockDatabase);
  return {
    columns: ['Tables'],
    rows: tables.map(t => [t]),
    rowCount: tables.length,
    executionTime: performance.now() - startTime,
  };
}

// Execute DESCRIBE TABLE
function executeDescribeTable(query: string, startTime: number): QueryResult {
  const tableMatch = query.trim().match(/(?:describe|desc)\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Invalid DESCRIBE query');
  }
  
  const tableName = tableMatch[1].toLowerCase();
  const table = mockDatabase[tableName];
  
  if (!table) {
    throw new Error(`Table '${tableName}' doesn't exist`);
  }
  
  const rows = table.columns.map((col, index) => {
    let type = 'VARCHAR(255)';
    if (col.toLowerCase().includes('id')) type = 'INT';
    if (col.toLowerCase().includes('price') || col.toLowerCase().includes('stock')) type = 'DECIMAL(10,2)';
    if (col.toLowerCase().includes('date') || col.toLowerCase().includes('time')) type = 'DATETIME';
    
    return [col, type, 'YES', '', null, ''];
  });
  
  return {
    columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
    rows,
    rowCount: rows.length,
    executionTime: performance.now() - startTime,
  };
}

// Execute INSERT query
function executeInsertQuery(query: string, startTime: number): QueryResult {
  const tableMatch = query.trim().match(/insert\s+into\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Invalid INSERT query');
  }
  
  const tableName = tableMatch[1].toLowerCase();
  const table = mockDatabase[tableName];
  
  if (!table) {
    throw new Error(`Table '${tableName}' doesn't exist`);
  }
  
  // Simple INSERT parsing
  const valuesMatch = query.match(/values\s*\((.*?)\)/i);
  if (valuesMatch) {
    const values = valuesMatch[1].split(',').map(v => {
      const trimmed = v.trim().replace(/^['"]|['"]$/g, '');
      return isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
    });
    
    table.rows.push(values);
  }
  
  return {
    columns: ['Result'],
    rows: [['Query OK, 1 row affected']],
    rowCount: 1,
    executionTime: performance.now() - startTime,
  };
}

// Execute UPDATE query
function executeUpdateQuery(query: string, startTime: number): QueryResult {
  const tableMatch = query.trim().match(/update\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Invalid UPDATE query');
  }
  
  const tableName = tableMatch[1].toLowerCase();
  const table = mockDatabase[tableName];
  
  if (!table) {
    throw new Error(`Table '${tableName}' doesn't exist`);
  }
  
  // Simulate update
  const affectedRows = Math.floor(Math.random() * 3) + 1;
  
  return {
    columns: ['Result'],
    rows: [[`Query OK, ${affectedRows} rows affected`]],
    rowCount: 1,
    executionTime: performance.now() - startTime,
  };
}

// Execute DELETE query
function executeDeleteQuery(query: string, startTime: number): QueryResult {
  const tableMatch = query.trim().match(/delete\s+from\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Invalid DELETE query');
  }
  
  const tableName = tableMatch[1].toLowerCase();
  const table = mockDatabase[tableName];
  
  if (!table) {
    throw new Error(`Table '${tableName}' doesn't exist`);
  }
  
  // Simulate delete
  const affectedRows = Math.floor(Math.random() * 2) + 1;
  
  return {
    columns: ['Result'],
    rows: [[`Query OK, ${affectedRows} rows deleted`]],
    rowCount: 1,
    executionTime: performance.now() - startTime,
  };
}

// Execute CREATE TABLE
function executeCreateTable(query: string, startTime: number): QueryResult {
  const tableMatch = query.trim().match(/create\s+table\s+(\w+)/i);
  
  if (!tableMatch) {
    throw new Error('Invalid CREATE TABLE query');
  }
  
  const tableName = tableMatch[1].toLowerCase();
  
  if (mockDatabase[tableName]) {
    throw new Error(`Table '${tableName}' already exists`);
  }
  
  // Create empty table
  mockDatabase[tableName] = {
    columns: ['id'],
    rows: [],
  };
  
  return {
    columns: ['Result'],
    rows: [['Query OK, table created']],
    rowCount: 1,
    executionTime: performance.now() - startTime,
  };
}

// Get available tables
export function getAvailableTables(): string[] {
  return Object.keys(mockDatabase);
}

// Get sample queries
export function getSampleQueries(): string[] {
  return [
    'SELECT * FROM users',
    'SELECT * FROM products WHERE price > 100',
    'SELECT name, email FROM users WHERE status = "active"',
    'SELECT * FROM orders ORDER BY order_date DESC',
    'SELECT COUNT(*) FROM users',
    'SHOW TABLES',
    'DESCRIBE users',
  ];
}
