// Query Editor Component - SQL editor with syntax highlighting
import { useEffect, useRef } from 'react';
import { Textarea } from './ui/textarea';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function QueryEditor({ 
  value, 
  onChange, 
  onExecute, 
  disabled = false,
  placeholder = 'Enter your SQL query here...'
}: QueryEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!disabled) {
          onExecute();
        }
      }
      
      // Tab key for indentation
      if (e.key === 'Tab' && textareaRef.current) {
        e.preventDefault();
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        
        // Set cursor position after tab
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [value, onChange, onExecute, disabled]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="relative h-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="font-mono text-sm min-h-[200px] h-full resize-none bg-background border-border focus:border-primary transition-colors"
        spellCheck={false}
      />
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Press Ctrl+Enter to execute
      </div>
    </div>
  );
}
