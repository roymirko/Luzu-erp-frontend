import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgramacion } from '../../contexts/ProgramacionContext';
import { Button } from '../ui/button';
import { ActionCard } from '../ui/action-card';
import { TableHeader } from '../ui/table-header';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '../ui/data-table';
import { DataTablePagination } from '../ui/data-table-pagination';
import { StatusBadge } from '../ui/status-badge';
import { MoreVertical, Plus } from 'lucide-react';
import type { GastoProgramacion } from '../../types/programacion';
import { formatDateDDMMYYYY } from '../../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

interface TablaProgramacionProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

const PROGRAMA_COLUMNS = [
  'Estado', 'Empresa/Programa', 'Campaña', 'Fecha de registro', 'Responsable', 'Factura emitida a',
  'Empresa', 'Unidad de negocio', 'Subrubro', 'Proveedor', 'Razón social', 'Neto', 'Acciones'
];

export function TablaProgramacion({ onOpen, onNew }: TablaProgramacionProps) {
  const { isDark } = useTheme();
  const { gastos, loading } = useProgramacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const formatPesos = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const getEstadoPagoVariant = (estadoPago: string, hasFormulario: boolean) => {
    switch (estadoPago) {
      case 'pendiente':
      case 'pendiente-pago':
        return 'warning';
      case 'pago':
      case 'pagado':
        return 'success';
      case 'anulado':
        return 'error';
      case 'creado':
        return hasFormulario ? 'info' : 'neutral';
      default:
        return 'neutral';
    }
  };

  const getEstadoPagoLabel = (estadoPago: string, hasFormulario: boolean) => {
    switch (estadoPago) {
      case 'pendiente':
      case 'pendiente-pago':
        return 'Pendiente de pago';
      case 'pago':
      case 'pagado':
        return 'Pagado';
      case 'anulado':
        return 'Anulado';
      case 'creado':
        return hasFormulario ? 'A Facturar' : 'Pendiente de carga';
      default:
        return 'Pendiente de carga';
    }
  };

  const filteredGastos = useMemo(() => {
    if (!searchTerm) return gastos;
    const s = searchTerm.toLowerCase();
    return gastos.filter((g) =>
      g.ejecutivo?.toLowerCase().includes(s) ||
      g.programa?.toLowerCase().includes(s) ||
      g.facturaEmitidaA?.toLowerCase().includes(s) ||
      g.empresa?.toLowerCase().includes(s) ||
      g.unidadNegocio?.toLowerCase().includes(s) ||
      g.subRubroEmpresa?.toLowerCase().includes(s) ||
      g.detalleCampana?.toLowerCase().includes(s) ||
      g.proveedor?.toLowerCase().includes(s) ||
      g.razonSocial?.toLowerCase().includes(s)
    );
  }, [gastos, searchTerm]);

  const currentData = filteredGastos;
  const columns = PROGRAMA_COLUMNS;

  const totalPages = Math.max(1, Math.ceil(currentData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = currentData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowClick = (gasto: GastoProgramacion) => {
    onOpen?.(gasto.id);
  };

  const handleActionClick = (e: React.MouseEvent, gasto: GastoProgramacion) => {
    e.stopPropagation();
    handleRowClick(gasto);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cargando gastos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onNew && (
        <ActionCard
          title="Nuevo Formulario"
          description="Crear importe de gasto"
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
          ) : (
            (currentRows as GastoProgramacion[]).map((gasto) => (
              <DataTableRow key={gasto.id} onClick={() => handleRowClick(gasto)}>
                <DataTableCell>
                  <StatusBadge label={getEstadoPagoLabel(gasto.estadoPago, !!gasto.formularioId)} variant={getEstadoPagoVariant(gasto.estadoPago, !!gasto.formularioId)} />
                </DataTableCell>
                <DataTableCell>{gasto.categoria || '-'}</DataTableCell>
                <DataTableCell>{gasto.programa || '-'}</DataTableCell>
                <DataTableCell>{formatDateDDMMYYYY(gasto.createdAt)}</DataTableCell>
                <DataTableCell>{gasto.ejecutivo || '-'}</DataTableCell>
                <DataTableCell>{gasto.facturaEmitidaA || '-'}</DataTableCell>
                <DataTableCell>{gasto.empresa || '-'}</DataTableCell>
                <DataTableCell>{gasto.unidadNegocio || '-'}</DataTableCell>
                <DataTableCell>{gasto.subRubroEmpresa || '-'}</DataTableCell>
                <DataTableCell>{gasto.proveedor || '-'}</DataTableCell>
                <DataTableCell>{gasto.razonSocial || '-'}</DataTableCell>
                <DataTableCell>{formatPesos(gasto.neto)}</DataTableCell>
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
