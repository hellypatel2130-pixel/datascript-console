// Export Utilities - Functions for exporting query results
// Provides CSV and JSON export capabilities

import { QueryResult } from './sqlEngine';

/**
 * Exports query results as CSV file
 * @param result - Query result to export
 * @param filename - Optional filename (default: query_results.csv)
 */
export function exportToCSV(result: QueryResult, filename: string = 'query_results.csv'): void {
  // Create CSV content
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push(result.columns.map(col => escapeCsvValue(col)).join(','));
  
  // Add data rows
  result.rows.forEach(row => {
    csvRows.push(row.map(cell => escapeCsvValue(String(cell ?? ''))).join(','));
  });
  
  const csvContent = csvRows.join('\n');
  
  // Create download link
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Exports query results as JSON file
 * @param result - Query result to export
 * @param filename - Optional filename (default: query_results.json)
 */
export function exportToJSON(result: QueryResult, filename: string = 'query_results.json'): void {
  // Convert rows to objects
  const data = result.rows.map(row => {
    const obj: any = {};
    result.columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
  
  const jsonContent = JSON.stringify({
    data,
    metadata: {
      rowCount: result.rowCount,
      executionTime: result.executionTime,
      exportedAt: new Date().toISOString(),
    },
  }, null, 2);
  
  // Create download link
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Copies query results to clipboard as formatted text
 * @param result - Query result to copy
 * @returns Promise that resolves when copied
 */
export async function copyResultsToClipboard(result: QueryResult): Promise<void> {
  // Create formatted text
  const lines: string[] = [];
  
  // Add headers
  lines.push(result.columns.join('\t'));
  
  // Add separator
  lines.push(result.columns.map(() => '---').join('\t'));
  
  // Add data rows
  result.rows.forEach(row => {
    lines.push(row.map(cell => String(cell ?? '')).join('\t'));
  });
  
  const text = lines.join('\n');
  
  // Copy to clipboard
  await navigator.clipboard.writeText(text);
}

/**
 * Escapes a value for CSV format
 * @param value - Value to escape
 * @returns Escaped CSV value
 */
function escapeCsvValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Creates and triggers a file download
 * @param content - File content
 * @param filename - Name of file to download
 * @param mimeType - MIME type of file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Formats query results as SQL INSERT statements
 * @param result - Query result to format
 * @param tableName - Name of table for INSERT statements
 * @returns Formatted SQL INSERT statements
 */
export function formatAsInsertStatements(result: QueryResult, tableName: string = 'table_name'): string {
  const statements: string[] = [];
  
  result.rows.forEach(row => {
    const values = row.map(cell => {
      if (cell === null || cell === undefined) {
        return 'NULL';
      } else if (typeof cell === 'number') {
        return String(cell);
      } else {
        return `'${String(cell).replace(/'/g, "''")}'`;
      }
    });
    
    statements.push(
      `INSERT INTO ${tableName} (${result.columns.join(', ')}) VALUES (${values.join(', ')});`
    );
  });
  
  return statements.join('\n');
}

/**
 * Formats bytes to human-readable size
 * @param bytes - Number of bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
