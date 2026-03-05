import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useMarketing } from '../../contexts/MarketingContext';
import { Button } from '../ui/button';
import { ActionCard } from '../ui/action-card';
import { TableHeader } from '../ui/table-header';
import { FilterToggle } from '../ui/filter-toggle';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '../ui/data-table';
import { DataTablePagination } from '../ui/data-table-pagination';
import { StatusBadge } from '../ui/status-badge';
import { MoreVertical, Plus, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatDateDDMMYYYY } from '../../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

type FilterMode = 'gasto' | 'programa';

const GASTO_COLUMNS = [
  'Estado', 'Fecha de registro', 'Empresa/Programa', 'Subrubro', 'Evento', 'Proveedor', 'Neto', 'Acciones'
];

const PROGRAMA_COLUMNS = [
  'Evento', 'Subrubro', 'Empresa/Programa', 'Cant. de Gastos', 'Neto Total', 'Acciones'
];

const FILTER_OPTIONS = [
  { value: 'gasto', label: 'Gasto' },
  { value: 'programa', label: 'Programa' },
];

interface TablaMarketingProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

export function TablaMarketing({ onOpen, onNew }: TablaMarketingProps) {
  const { isDark } = useTheme();
  const { gastos, formulariosAgrupados, loading } = useMarketing();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('gasto');

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
        return 'pending-factura';
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
        return 'Pendiente de Factura';
    }
  };

  const getEstadoFormularioVariant = (estado: string) => {
    switch (estado) {
      case 'activo':
      case 'abierto':
        return 'success';
      case 'cerrado':
        return 'neutral';
      case 'anulado':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getEstadoFormularioLabel = (estado: string) => {
    switch (estado) {
      case 'activo':
      case 'abierto':
        return 'Activo';
      case 'cerrado':
        return 'Cerrado';
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

  const filteredFormularios = useMemo(() => {
    if (!searchTerm) return formulariosAgrupados;
    const s = searchTerm.toLowerCase();
    return formulariosAgrupados.filter((f) =>
      f.nombreCampana?.toLowerCase().includes(s) ||
      f.subrubro?.toLowerCase().includes(s) ||
      f.empresaContext?.toLowerCase().includes(s) ||
      f.proveedor?.toLowerCase().includes(s)
    );
  }, [formulariosAgrupados, searchTerm]);

  const currentData = filterMode === 'gasto' ? filteredGastos : filteredFormularios;
  const columns = filterMode === 'gasto' ? GASTO_COLUMNS : PROGRAMA_COLUMNS;

  const totalPages = Math.max(1, Math.ceil(currentData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = currentData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleModeChange = (mode: string) => {
    setFilterMode(mode as FilterMode);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowClick = (item: typeof gastos[0] | typeof formulariosAgrupados[0]) => {
    if (filterMode === 'gasto') {
      onOpen?.((item as typeof gastos[0]).id);
    } else {
      const formulario = item as typeof formulariosAgrupados[0];
      const firstGasto = gastos.find(g => g.contextoComprobanteId === formulario.id);
      if (firstGasto) onOpen?.(firstGasto.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, item: typeof gastos[0] | typeof formulariosAgrupados[0]) => {
    e.stopPropagation();
    handleRowClick(item);
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
      >
        <FilterToggle
          options={FILTER_OPTIONS}
          value={filterMode}
          onChange={handleModeChange}
          className="w-[253px]"
        />
      </TableHeader>

      <DataTable>
        <DataTableHead>
          <tr>
            {columns.map((col) => (
              <DataTableHeaderCell key={col}>{col}</DataTableHeaderCell>
            ))}
          </tr>
        </DataTableHead>
        <DataTableBody>
          {currentRows.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              {searchTerm ? 'No se encontraron resultados' : 'Sin gastos registrados'}
            </DataTableEmpty>
          ) : filterMode === 'gasto' ? (
            (currentRows as typeof gastos).map((gasto) => (
              <DataTableRow key={gasto.id} onClick={() => handleRowClick(gasto)}>
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
                      onClick={(e) => handleActionClick(e, gasto)}
                      className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          ) : (
            (currentRows as typeof formulariosAgrupados).map((formulario) => (
              <DataTableRow key={formulario.id} onClick={() => handleRowClick(formulario)}>
                <DataTableCell>{formulario.nombreCampana || '-'}</DataTableCell>
                <DataTableCell>{formulario.subrubro || '-'}</DataTableCell>
                <DataTableCell>{formulario.empresaContext || '-'}</DataTableCell>
                <DataTableCell>{formulario.gastosCount}</DataTableCell>
                <DataTableCell>{formatPesos(formulario.netoTotal || 0)}</DataTableCell>
                <DataTableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleActionClick(e, formulario)}
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
