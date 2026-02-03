import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { useTheme } from '@/app/contexts/ThemeContext';
import { TableHeader } from '@/app/components/ui/table-header';
import { FilterToggle } from '@/app/components/ui/filter-toggle';
import { Button } from '@/app/components/ui/button';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from '@/app/components/ui/data-table';
import { DataTablePagination } from '@/app/components/ui/data-table-pagination';
import type {
  ComprobanteWithContext,
  TipoMovimiento,
  EstadoPago,
  AreaOrigen,
} from '@/app/types/comprobantes';
import {
  TIPO_MOVIMIENTO_LABELS,
  AREA_ORIGEN_LABELS,
  ESTADO_PAGO_LABELS,
} from '@/app/types/comprobantes';

const FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'egreso', label: 'Egresos' },
  { value: 'ingreso', label: 'Ingresos' },
];

const ITEMS_PER_PAGE = 10;

interface TablaComprobantesProps {
  comprobantes: ComprobanteWithContext[];
  loading?: boolean;
  onRowClick?: (comprobante: ComprobanteWithContext) => void;
  title?: string;
}

function formatCurrency(amount: number, moneda: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getEstadoPagoBadgeConfig(estadoPago: EstadoPago) {
  switch (estadoPago) {
    case 'pendiente':
      return {
        bg: 'bg-[#fffae8]',
        border: 'border-[#8f6e00]',
        text: 'text-[#8f6e00]',
        dot: 'bg-[#8f6e00]',
      };
    case 'pagado':
      return {
        bg: 'bg-[#ecffe9]',
        border: 'border-[#118f00]',
        text: 'text-[#118f00]',
        dot: 'bg-[#118f00]',
      };
    case 'pedir_info':
      return {
        bg: 'bg-[#FEF3C7]',
        border: 'border-[#D97706]',
        text: 'text-[#B45309]',
        dot: 'bg-[#D97706]',
      };
    case 'anulado':
      return {
        bg: 'bg-[#ffebef]',
        border: 'border-[#ea173e]',
        text: 'text-[#ea173e]',
        dot: 'bg-[#ea173e]',
      };
    default:
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-500',
        text: 'text-gray-600',
        dot: 'bg-gray-600',
      };
  }
}

function EstadoPagoBadge({ estadoPago }: { estadoPago: EstadoPago }) {
  const config = getEstadoPagoBadgeConfig(estadoPago);
  const label = ESTADO_PAGO_LABELS[estadoPago] || estadoPago;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap',
        config.bg,
        config.border,
        config.text
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dot)} />
      {label}
    </span>
  );
}

function TipoMovimientoBadge({ tipo }: { tipo: TipoMovimiento }) {
  const isIngreso = tipo === 'ingreso';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        isIngreso
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : 'bg-orange-100 text-orange-800 border border-orange-200'
      )}
    >
      {TIPO_MOVIMIENTO_LABELS[tipo]}
    </span>
  );
}

function AreaOrigenBadge({ area }: { area: AreaOrigen }) {
  const { isDark } = useTheme();
  return (
    <span
      className={cn(
        'text-xs',
        isDark ? 'text-gray-400' : 'text-gray-500'
      )}
    >
      {AREA_ORIGEN_LABELS[area]}
    </span>
  );
}

export function TablaComprobantes({
  comprobantes,
  loading = false,
  onRowClick,
  title = 'Comprobantes',
}: TablaComprobantesProps) {
  const { isDark } = useTheme();
  const [filterType, setFilterType] = useState<'todos' | TipoMovimiento>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredComprobantes = useMemo(() => {
    let result = comprobantes;

    // Filter by type
    if (filterType !== 'todos') {
      result = result.filter((c) => c.tipoMovimiento === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) => {
        return (
          c.entidadNombre?.toLowerCase().includes(term) ||
          c.concepto?.toLowerCase().includes(term) ||
          c.numeroComprobante?.toLowerCase().includes(term) ||
          c.implNombreCampana?.toLowerCase().includes(term) ||
          c.progPrograma?.toLowerCase().includes(term) ||
          c.expNombreCampana?.toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [comprobantes, filterType, searchTerm]);

  const totalPages = Math.ceil(filteredComprobantes.length / ITEMS_PER_PAGE);
  const paginatedComprobantes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredComprobantes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredComprobantes, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value as 'todos' | TipoMovimiento);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <TableHeader
        title={title}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por entidad, concepto, campaña..."
      >
        <FilterToggle
          options={FILTER_OPTIONS}
          value={filterType}
          onChange={handleFilterChange}
          className="w-[280px]"
        />
      </TableHeader>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Estado</DataTableHeaderCell>
            <DataTableHeaderCell>Tipo</DataTableHeaderCell>
            <DataTableHeaderCell>Área</DataTableHeaderCell>
            <DataTableHeaderCell>Fecha</DataTableHeaderCell>
            <DataTableHeaderCell>Entidad</DataTableHeaderCell>
            <DataTableHeaderCell>Concepto</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Neto</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Total</DataTableHeaderCell>
            <DataTableHeaderCell>Acciones</DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {loading ? (
            <DataTableEmpty colSpan={9}>Cargando comprobantes...</DataTableEmpty>
          ) : paginatedComprobantes.length === 0 ? (
            <DataTableEmpty colSpan={9}>
              {searchTerm || filterType !== 'todos'
                ? 'No se encontraron comprobantes con los filtros aplicados'
                : 'No hay comprobantes registrados'}
            </DataTableEmpty>
          ) : (
            paginatedComprobantes.map((comprobante) => (
              <DataTableRow
                key={comprobante.id}
                onClick={() => onRowClick?.(comprobante)}
              >
                <DataTableCell>
                  <EstadoPagoBadge estadoPago={comprobante.estadoPago} />
                </DataTableCell>
                <DataTableCell>
                  <TipoMovimientoBadge tipo={comprobante.tipoMovimiento} />
                </DataTableCell>
                <DataTableCell>
                  <AreaOrigenBadge area={comprobante.areaOrigen} />
                </DataTableCell>
                <DataTableCell muted>
                  {formatDate(comprobante.fechaComprobante)}
                </DataTableCell>
                <DataTableCell>
                  <div className="max-w-[200px] truncate" title={comprobante.entidadNombre}>
                    {comprobante.entidadNombre}
                  </div>
                </DataTableCell>
                <DataTableCell muted>
                  <div className="max-w-[200px] truncate" title={comprobante.concepto}>
                    {comprobante.concepto || '-'}
                  </div>
                </DataTableCell>
                <DataTableCell className="text-right">
                  {formatCurrency(comprobante.neto, comprobante.moneda)}
                </DataTableCell>
                <DataTableCell className="text-right font-medium">
                  {formatCurrency(comprobante.total, comprobante.moneda)}
                </DataTableCell>
                <DataTableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(comprobante);
                    }}
                    className={cn(
                      'h-8 w-8 p-0',
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    )}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <div
        className={cn(
          'text-sm',
          isDark ? 'text-gray-400' : 'text-gray-500'
        )}
      >
        Mostrando {paginatedComprobantes.length} de {filteredComprobantes.length} comprobantes
      </div>
    </div>
  );
}
