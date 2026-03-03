import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useMarketing } from '../../contexts/MarketingContext';
import { Button } from '../ui/button';
import { ActionCard } from '../ui/action-card';
import { TableHeader } from '../ui/table-header';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '../ui/data-table';
import { DataTablePagination } from '../ui/data-table-pagination';
import { StatusBadge } from '../ui/status-badge';
import { MoreVertical, Plus, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatDateDDMMYYYY } from '../../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

const COLUMNS = [
  'Estado', 'Fecha de registro', 'Empresa/Programa', 'Subrubro', 'Evento', 'Proveedor', 'Neto', 'Acciones'
];

interface TablaMarketingProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

export function TablaMarketing({ onOpen, onNew }: TablaMarketingProps) {
  const { isDark } = useTheme();
  const { gastos, loading } = useMarketing();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const formatPesos = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const getEstadoPagoVariant = (estadoPago: string) => {
    switch (estadoPago) {
      case 'pendiente':
      case 'pendiente-pago':
        return 'warning';
      case 'pagado':
      case 'pago':
        return 'success';
      case 'anulado':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getEstadoPagoLabel = (estadoPago: string) => {
    switch (estadoPago) {
      case 'pendiente':
      case 'pendiente-pago':
        return 'Pendiente de pago';
      case 'pagado':
      case 'pago':
        return 'Pagado';
      case 'anulado':
        return 'Anulado';
      default:
        return 'Pendiente de carga';
    }
  };

  const filteredGastos = useMemo(() => {
    if (!searchTerm) return gastos;
    const s = searchTerm.toLowerCase();
    return gastos.filter((g) =>
      g.empresaPrograma?.toLowerCase().includes(s) ||
      g.ctxSubRubro?.toLowerCase().includes(s) ||
      g.ctxNombreCampana?.toLowerCase().includes(s) ||
      g.proveedor?.toLowerCase().includes(s)
    );
  }, [gastos, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredGastos.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = filteredGastos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowClick = (gastoId: string) => {
    onOpen?.(gastoId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {onNew && (
          <ActionCard
            title="Nuevo Formulario"
            description="Crear gasto de marketing"
            icon={Plus}
            onClick={onNew}
          />
        )}
        <div className={cn(
          'flex items-center justify-center py-12 rounded-lg border',
          isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'
        )}>
          <Loader2 className={cn('h-8 w-8 animate-spin', isDark ? 'text-gray-400' : 'text-gray-500')} />
          <span className={cn('ml-3', isDark ? 'text-gray-400' : 'text-gray-500')}>Cargando gastos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onNew && (
        <ActionCard
          title="Nuevo Formulario"
          description="Crear gasto de marketing"
          icon={Plus}
          onClick={onNew}
        />
      )}

      <TableHeader
        title="Detalle de gastos"
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <DataTable>
        <DataTableHead>
          <tr>
            {COLUMNS.map((col) => (
              <DataTableHeaderCell key={col}>{col}</DataTableHeaderCell>
            ))}
          </tr>
        </DataTableHead>
        <DataTableBody>
          {currentRows.length === 0 ? (
            <DataTableEmpty colSpan={COLUMNS.length}>
              {searchTerm ? 'No se encontraron resultados' : 'Sin gastos registrados'}
            </DataTableEmpty>
          ) : (
            currentRows.map((gasto) => (
              <DataTableRow key={gasto.id} onClick={() => handleRowClick(gasto.id)}>
                <DataTableCell>
                  <StatusBadge label={getEstadoPagoLabel(gasto.estadoPago || 'pendiente')} variant={getEstadoPagoVariant(gasto.estadoPago || 'pendiente')} />
                </DataTableCell>
                <DataTableCell>{formatDateDDMMYYYY(gasto.createdAt)}</DataTableCell>
                <DataTableCell>{gasto.empresaPrograma || '-'}</DataTableCell>
                <DataTableCell>{gasto.ctxSubRubro || gasto.subRubro || '-'}</DataTableCell>
                <DataTableCell>{gasto.ctxNombreCampana || gasto.nombreCampana || '-'}</DataTableCell>
                <DataTableCell>{gasto.proveedor || '-'}</DataTableCell>
                <DataTableCell>{formatPesos(gasto.neto || 0)}</DataTableCell>
                <DataTableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleRowClick(gasto.id); }}
                      className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
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
    </div>
  );
}
