import { forwardRef } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={`w-full text-left ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`bg-beo-cream/30 ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = "TableHeader";

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={`divide-y divide-border ${className}`}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isClickable?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, isClickable = false, className = "", ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`
          ${isClickable ? "hover:bg-beo-cream/20 cursor-pointer" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, sortable = false, sortDirection, onSort, className = "", ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`
          px-4 py-3
          text-xs font-semibold uppercase tracking-wider text-text-secondary
          ${sortable ? "cursor-pointer select-none hover:text-foreground" : ""}
          ${className}
        `}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-1">
          {children}
          {sortable && (
            <span className="ml-1">
              {sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : sortDirection === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-4 py-3 text-sm ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = "TableCell";
