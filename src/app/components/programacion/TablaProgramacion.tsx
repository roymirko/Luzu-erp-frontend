import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgramacion } from '../../contexts/ProgramacionContext';
import { Button } from '../ui/button';
import { ActionCard } from '../ui/action-card';
import { TableHeader } from '../ui/table-header';
import { FilterToggle } from '../ui/filter-toggle';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '../ui/data-table';
import { DataTablePagination } from '../ui/data-table-pagination';
import { StatusBadge } from '../ui/status-badge';
import { MoreVertical, Plus } from 'lucide-react';
import type { FormularioAgrupado, GastoProgramacion } from '../../types/programacion';
import { formatDateDDMMYYYY } from '../../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

type FilterMode = 'programa' | 'campana';

interface TablaProgramacionProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

const PROGRAMA_COLUMNS = [
  'Estado', 'Empresa/Programa', 'Campaña', 'Fecha de registro', 'Responsable', 'Factura emitida a',
  'Empresa', 'Unidad de negocio', 'Subrubro', 'Proveedor', 'Razón social', 'Neto', 'Acciones'
];

const CAMPANA_COLUMNS = [
  'Estado', 'Campaña', 'Fecha de registro', 'Responsable', 'Factura emitida a', 'Empresa',
  'Unidad de negocio', 'Subrubro', 'Proveedor', 'Razón social', 'Neto total', 'Acciones'
];

const FILTER_OPTIONS = [
  { value: 'programa', label: 'Programa' },
  { value: 'campana', label: 'Campaña' },
];

export function TablaProgramacion({ onOpen, onNew }: TablaProgramacionProps) {
  const { isDark } = useTheme();
  const { gastos, formulariosAgrupados, getGastosByFormularioId, loading } = useProgramacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('programa');

  const formatPesos = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };



  const getEstadoPagoVariant = (estadoPago: string) => {
    switch (estadoPago) {
      case 'pendiente':
      case 'pendiente-pago':
        return 'warning';
      case 'pago':
      case 'pagado':
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
      case 'pago':
      case 'pagado':
        return 'Pagado';
      case 'anulado':
        return 'Anulado';
      default:
        return 'Pendiente de carga';
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
      case 'pendiente':
        return 'neutral';
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
      case 'pendiente':
        return 'Pendiente de carga';
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

  const filteredFormularios = useMemo(() => {
    if (!searchTerm) return formulariosAgrupados;
    const s = searchTerm.toLowerCase();
    return formulariosAgrupados.filter((f) =>
      f.ejecutivo?.toLowerCase().includes(s) ||
      f.facturaEmitidaA?.toLowerCase().includes(s) ||
      f.empresa?.toLowerCase().includes(s) ||
      f.unidadNegocio?.toLowerCase().includes(s) ||
      f.subRubroEmpresa?.toLowerCase().includes(s) ||
      f.detalleCampana?.toLowerCase().includes(s) ||
      f.proveedor?.toLowerCase().includes(s) ||
      f.razonSocial?.toLowerCase().includes(s)
    );
  }, [formulariosAgrupados, searchTerm]);

  const currentData = filterMode === 'programa' ? filteredGastos : filteredFormularios;
  const columns = filterMode === 'programa' ? PROGRAMA_COLUMNS : CAMPANA_COLUMNS;

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

  const handleRowClick = (item: GastoProgramacion | FormularioAgrupado) => {
    if (filterMode === 'programa') {
      onOpen?.((item as GastoProgramacion).id);
    } else {
      const formulario = item as FormularioAgrupado;
      const formularioGastos = getGastosByFormularioId(formulario.id);
      if (formularioGastos.length > 0) {
        onOpen?.(formularioGastos[0].id);
      }
    }
  };

  const handleActionClick = (e: React.MouseEvent, item: GastoProgramacion | FormularioAgrupado) => {
    e.stopPropagation();
    handleRowClick(item);
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
          ) : filterMode === 'programa' ? (
            (currentRows as GastoProgramacion[]).map((gasto) => (
              <DataTableRow key={gasto.id} onClick={() => handleRowClick(gasto)}>
                <DataTableCell>
                  <StatusBadge label={getEstadoPagoLabel(gasto.estadoPago)} variant={getEstadoPagoVariant(gasto.estadoPago)} />
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
          ) : (
            (currentRows as FormularioAgrupado[]).map((formulario) => (
              <DataTableRow key={formulario.id} onClick={() => handleRowClick(formulario)}>
                <DataTableCell>
                  <StatusBadge label={getEstadoFormularioLabel(formulario.estado)} variant={getEstadoFormularioVariant(formulario.estado)} />
                </DataTableCell>
                <DataTableCell>{formulario.programa || '-'}</DataTableCell>
                <DataTableCell>{formatDateDDMMYYYY(formulario.createdAt)}</DataTableCell>
                <DataTableCell>{formulario.ejecutivo || '-'}</DataTableCell>
                <DataTableCell>{formulario.facturaEmitidaA || '-'}</DataTableCell>
                <DataTableCell>{formulario.empresa || '-'}</DataTableCell>
                <DataTableCell>{formulario.unidadNegocio || '-'}</DataTableCell>
                <DataTableCell>{formulario.subRubroEmpresa || '-'}</DataTableCell>
                <DataTableCell>{formulario.proveedor || '-'}</DataTableCell>
                <DataTableCell>{formulario.razonSocial || '-'}</DataTableCell>
                <DataTableCell>{formatPesos(formulario.netoTotal)}</DataTableCell>
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
