// Sample Queries Component - Quick access to example queries
import { getSampleQueries } from '../utils/sqlEngine';
import { Button } from './ui/button';
import { Code2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface SampleQueriesProps {
  onSelectQuery: (query: string) => void;
}

export function SampleQueries({ onSelectQuery }: SampleQueriesProps) {
  const sampleQueries = getSampleQueries();

  const customQueries = [
    {
      label: 'Users with Active Status',
      query: 'SELECT id, name, email FROM users WHERE status = "active" ORDER BY created_at DESC',
    },
    {
      label: 'Products by Category',
      query: 'SELECT category, COUNT(*) as product_count FROM products GROUP BY category',
    },
    {
      label: 'Recent Orders with Details',
      query: 'SELECT o.id, u.name as user_name, p.name as product_name, o.quantity, o.order_date FROM orders o JOIN users u ON o.user_id = u.id JOIN products p ON o.product_id = p.id ORDER BY o.order_date DESC LIMIT 10',
    },
    {
      label: 'High Value Products',
      query: 'SELECT name, price, category FROM products WHERE price > 100 ORDER BY price DESC',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Code2 className="w-4 h-4 mr-2" />
          Sample Queries
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Basic Queries</DropdownMenuLabel>
        {sampleQueries.map((query, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelectQuery(query)}
            className="font-mono text-xs"
          >
            {query}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Advanced Examples</DropdownMenuLabel>
        {customQueries.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelectQuery(item.query)}
          >
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="font-mono text-xs text-muted-foreground mt-1 truncate">
                {item.query.substring(0, 50)}...
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
