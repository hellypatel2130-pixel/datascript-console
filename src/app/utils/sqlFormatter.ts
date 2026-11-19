// SQL Formatter - Beautifies and formats SQL queries
// Provides syntax highlighting hints and formatting utilities

export interface FormatOptions {
  indent: string;
  uppercase: boolean;
  lineBreaks: boolean;
}

const DEFAULT_OPTIONS: FormatOptions = {
  indent: '  ',
  uppercase: true,
  lineBreaks: true,
};

// SQL Keywords for syntax highlighting
export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
  'TABLE', 'DATABASE', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'INDEX', 'UNIQUE', 'NOT', 'NULL', 'DEFAULT', 'AUTO_INCREMENT',
  'VARCHAR', 'INT', 'DECIMAL', 'DATE', 'DATETIME', 'TEXT', 'BLOB',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'AND', 'OR',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'LIKE', 'IN', 'BETWEEN',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'ALL', 'ANY',
  'UNION', 'INTERSECT', 'EXCEPT', 'SHOW', 'DESCRIBE', 'DESC', 'ASC',
  'SET', 'VALUES', 'INTO', 'TRUNCATE', 'GRANT', 'REVOKE',
];

// SQL Functions
export const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UPPER', 'LOWER', 'LENGTH',
  'CONCAT', 'SUBSTRING', 'TRIM', 'NOW', 'CURDATE', 'CURTIME',
  'DATE_FORMAT', 'DATEDIFF', 'YEAR', 'MONTH', 'DAY',
];

/**
 * Formats SQL query with proper indentation and line breaks
 * @param query - SQL query to format
 * @param options - Formatting options
 * @returns Formatted SQL query
 */
export function formatSQL(query: string, options: Partial<FormatOptions> = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let formatted = query.trim();
  
  // Convert keywords to uppercase if requested
  if (opts.uppercase) {
    SQL_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword.toUpperCase());
    });
  }
  
  // Add line breaks if requested
  if (opts.lineBreaks) {
    formatted = formatted
      .replace(/\bSELECT\b/gi, '\nSELECT\n' + opts.indent)
      .replace(/\bFROM\b/gi, '\nFROM\n' + opts.indent)
      .replace(/\bWHERE\b/gi, '\nWHERE\n' + opts.indent)
      .replace(/\bJOIN\b/gi, '\nJOIN\n' + opts.indent)
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN\n' + opts.indent)
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN\n' + opts.indent)
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN\n' + opts.indent)
      .replace(/\bON\b/gi, '\nON\n' + opts.indent + opts.indent)
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY\n' + opts.indent)
      .replace(/\bORDER BY\b/gi, '\nORDER BY\n' + opts.indent)
      .replace(/\bHAVING\b/gi, '\nHAVING\n' + opts.indent)
      .replace(/\bLIMIT\b/gi, '\nLIMIT ')
      .replace(/\bAND\b/gi, '\n' + opts.indent + 'AND ')
      .replace(/\bOR\b/gi, '\n' + opts.indent + 'OR ');
  }
  
  // Clean up excessive whitespace
  formatted = formatted
    .replace(/\s+/g, ' ')
    .replace(/\n\s+\n/g, '\n')
    .trim();
  
  return formatted;
}

/**
 * Minifies SQL query by removing unnecessary whitespace
 * @param query - SQL query to minify
 * @returns Minified SQL query
 */
export function minifySQL(query: string): string {
  return query
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/,\s+/g, ',')
    .trim();
}

/**
 * Validates SQL syntax (basic check)
 * @param query - SQL query to validate
 * @returns Array of syntax issues found
 */
export function checkSyntax(query: string): string[] {
  const issues: string[] = [];
  
  // Check for balanced parentheses
  const openParens = (query.match(/\(/g) || []).length;
  const closeParens = (query.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    issues.push('Unbalanced parentheses');
  }
  
  // Check for balanced quotes
  const singleQuotes = (query.match(/'/g) || []).length;
  const doubleQuotes = (query.match(/"/g) || []).length;
  
  if (singleQuotes % 2 !== 0) {
    issues.push('Unbalanced single quotes');
  }
  
  if (doubleQuotes % 2 !== 0) {
    issues.push('Unbalanced double quotes');
  }
  
  // Check for SELECT without FROM (unless it's a special case)
  if (/\bSELECT\b/i.test(query) && !/\bFROM\b/i.test(query)) {
    if (!/\bSELECT\s+\d+/i.test(query) && !/\bSELECT\s+COUNT/i.test(query)) {
      issues.push('SELECT query missing FROM clause');
    }
  }
  
  // Check for INSERT without VALUES
  if (/\bINSERT\s+INTO\b/i.test(query) && !/\bVALUES\b/i.test(query)) {
    issues.push('INSERT query missing VALUES clause');
  }
  
  return issues;
}

/**
 * Extracts table names from SQL query
 * @param query - SQL query to analyze
 * @returns Array of table names found
 */
export function extractTableNames(query: string): string[] {
  const tables: string[] = [];
  
  // Extract from FROM clause
  const fromMatch = query.match(/\bFROM\s+(\w+)/gi);
  if (fromMatch) {
    fromMatch.forEach(match => {
      const tableName = match.replace(/\bFROM\s+/i, '').trim();
      if (!tables.includes(tableName)) {
        tables.push(tableName);
      }
    });
  }
  
  // Extract from JOIN clauses
  const joinMatch = query.match(/\bJOIN\s+(\w+)/gi);
  if (joinMatch) {
    joinMatch.forEach(match => {
      const tableName = match.replace(/\bJOIN\s+/i, '').trim();
      if (!tables.includes(tableName)) {
        tables.push(tableName);
      }
    });
  }
  
  // Extract from INSERT INTO
  const insertMatch = query.match(/\bINSERT\s+INTO\s+(\w+)/i);
  if (insertMatch) {
    const tableName = insertMatch[1];
    if (!tables.includes(tableName)) {
      tables.push(tableName);
    }
  }
  
  // Extract from UPDATE
  const updateMatch = query.match(/\bUPDATE\s+(\w+)/i);
  if (updateMatch) {
    const tableName = updateMatch[1];
    if (!tables.includes(tableName)) {
      tables.push(tableName);
    }
  }
  
  return tables;
}

/**
 * Gets query type (SELECT, INSERT, UPDATE, etc.)
 * @param query - SQL query to analyze
 * @returns Query type or 'UNKNOWN'
 */
export function getQueryType(query: string): string {
  const trimmed = query.trim().toUpperCase();
  
  if (trimmed.startsWith('SELECT')) return 'SELECT';
  if (trimmed.startsWith('INSERT')) return 'INSERT';
  if (trimmed.startsWith('UPDATE')) return 'UPDATE';
  if (trimmed.startsWith('DELETE')) return 'DELETE';
  if (trimmed.startsWith('CREATE')) return 'CREATE';
  if (trimmed.startsWith('DROP')) return 'DROP';
  if (trimmed.startsWith('ALTER')) return 'ALTER';
  if (trimmed.startsWith('TRUNCATE')) return 'TRUNCATE';
  if (trimmed.startsWith('SHOW')) return 'SHOW';
  if (trimmed.startsWith('DESCRIBE') || trimmed.startsWith('DESC')) return 'DESCRIBE';
  
  return 'UNKNOWN';
}

/**
 * Estimates query complexity
 * @param query - SQL query to analyze
 * @returns Complexity score (1-10)
 */
export function estimateComplexity(query: string): number {
  let complexity = 1;
  
  // Base complexity by query type
  const type = getQueryType(query);
  if (type === 'SELECT') complexity += 1;
  if (type === 'INSERT' || type === 'UPDATE' || type === 'DELETE') complexity += 2;
  if (type === 'CREATE' || type === 'ALTER') complexity += 3;
  
  // Add complexity for clauses
  if (/\bWHERE\b/i.test(query)) complexity += 1;
  if (/\bJOIN\b/i.test(query)) complexity += 2;
  if (/\bGROUP BY\b/i.test(query)) complexity += 1;
  if (/\bHAVING\b/i.test(query)) complexity += 1;
  if (/\bORDER BY\b/i.test(query)) complexity += 1;
  if (/\bUNION\b/i.test(query)) complexity += 2;
  
  // Add complexity for functions
  SQL_FUNCTIONS.forEach(func => {
    if (new RegExp(`\\b${func}\\s*\\(`, 'i').test(query)) {
      complexity += 0.5;
    }
  });
  
  // Add complexity for subqueries
  const subqueryCount = (query.match(/\bSELECT\b/gi) || []).length - 1;
  complexity += subqueryCount * 2;
  
  return Math.min(Math.round(complexity), 10);
}
