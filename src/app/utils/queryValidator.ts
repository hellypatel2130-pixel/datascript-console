// Query Validator - Security checks for dangerous SQL queries
// This module prevents execution of dangerous database operations

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// List of dangerous SQL keywords and patterns
const DANGEROUS_PATTERNS = [
  /drop\s+database/i,
  /drop\s+table/i,
  /truncate\s+database/i,
  /truncate\s+table/i,
  /alter\s+database/i,
  /grant\s+/i,
  /revoke\s+/i,
  /create\s+user/i,
  /drop\s+user/i,
  /shutdown/i,
  /exec\s+/i,
  /execute\s+/i,
  /xp_/i,
  /sp_/i,
];

// List of warning patterns (allowed but should warn user)
const WARNING_PATTERNS = [
  /delete\s+from\s+\w+\s*$/i, // DELETE without WHERE
  /update\s+\w+\s+set.*?(?!where)/i, // UPDATE without WHERE
];

/**
 * Validates SQL query for security issues
 * @param query - The SQL query to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateQuery(query: string): ValidationResult {
  const trimmedQuery = query.trim();
  
  // Check if query is empty
  if (!trimmedQuery) {
    return {
      isValid: false,
      error: 'Query cannot be empty',
    };
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      return {
        isValid: false,
        error: `Dangerous query detected: ${pattern.source.replace(/\\/g, '')}. This operation is not allowed for security reasons.`,
      };
    }
  }
  
  // Check query length
  if (trimmedQuery.length > 10000) {
    return {
      isValid: false,
      error: 'Query is too long (maximum 10,000 characters)',
    };
  }
  
  // Check for multiple statements (basic SQL injection prevention)
  const statements = trimmedQuery.split(';').filter(s => s.trim());
  if (statements.length > 1) {
    return {
      isValid: false,
      error: 'Multiple statements are not allowed. Please execute one query at a time.',
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Checks if query has warning-level issues
 * @param query - The SQL query to check
 * @returns Warning message if found, null otherwise
 */
export function getQueryWarning(query: string): string | null {
  const trimmedQuery = query.trim();
  
  // Check for DELETE without WHERE
  if (/delete\s+from\s+\w+\s*$/i.test(trimmedQuery)) {
    return 'Warning: DELETE without WHERE clause will remove all rows from the table.';
  }
  
  // Check for UPDATE without WHERE
  if (/update\s+\w+\s+set.*?$/i.test(trimmedQuery) && !/where/i.test(trimmedQuery)) {
    return 'Warning: UPDATE without WHERE clause will modify all rows in the table.';
  }
  
  return null;
}

/**
 * Sanitizes query text for display
 * @param query - The SQL query to sanitize
 * @returns Sanitized query string
 */
export function sanitizeQuery(query: string): string {
  // Remove excessive whitespace
  return query
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formats execution time in human-readable format
 * @param timeMs - Time in milliseconds
 * @returns Formatted time string
 */
export function formatExecutionTime(timeMs: number): string {
  if (timeMs < 1) {
    return `${(timeMs * 1000).toFixed(0)}μs`;
  } else if (timeMs < 1000) {
    return `${timeMs.toFixed(2)}ms`;
  } else {
    return `${(timeMs / 1000).toFixed(2)}s`;
  }
}

/**
 * Checks if query is a read-only operation
 * @param query - The SQL query to check
 * @returns True if query is read-only
 */
export function isReadOnlyQuery(query: string): boolean {
  const trimmedQuery = query.trim().toLowerCase();
  return (
    trimmedQuery.startsWith('select') ||
    trimmedQuery.startsWith('show') ||
    trimmedQuery.startsWith('describe') ||
    trimmedQuery.startsWith('desc ') ||
    trimmedQuery.startsWith('explain')
  );
}
