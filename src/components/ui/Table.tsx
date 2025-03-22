import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '', ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps) {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = '', ...props }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-gray-200 bg-white ${className}`} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = '', ...props }: TableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 ${className}`} {...props}>
      {children}
    </tr>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '', ...props }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-4 text-sm ${className}`}
      {...props}
    >
      {children}
    </td>
  );
} 