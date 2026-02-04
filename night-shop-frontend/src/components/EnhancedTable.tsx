import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface EnhancedTableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
  striped?: boolean;
}

const EnhancedTable: React.FC<EnhancedTableProps> = ({
  columns,
  rows,
  onRowClick,
  striped = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table stickyHeader aria-label="enhanced table">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              '& th': {
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              },
            }}
          >
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  width: column.width,
                  color: (theme) => theme.palette.text.primary,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.id || index}
              onClick={() => onRowClick?.(row)}
              sx={{
                backgroundColor:
                  striped && index % 2 === 1
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)'
                    : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                  transform: onRowClick ? 'scale(1.01)' : 'none',
                },
                '& td': {
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${row.id || index}-${column.id}`}
                  align={column.align || 'left'}
                  sx={{
                    fontSize: '0.875rem',
                  }}
                >
                  {column.render
                    ? column.render(row[column.id], row)
                    : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  No hay datos disponibles
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EnhancedTable;
