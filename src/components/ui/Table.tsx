import React from 'react';
import { clsx } from 'clsx';
import { TableColumn } from '@/types';

interface TableProps<T = any> {
  columns: TableColumn[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
  onRowClick?: (record: T) => void;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = 'لا توجد بيانات',
  className,
  onRowClick
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-12 rounded mb-2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-10 rounded mb-1"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={clsx(
                  'px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider',
                  index === 0 && 'rounded-tr-lg',
                  index === columns.length - 1 && 'rounded-tl-lg'
                )}
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((record, rowIndex) => (
            <tr
              key={rowIndex}
              className={clsx(
                'hover:bg-gray-50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(record)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(record[column.key], record)
                    : record[column.key] || '-'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;