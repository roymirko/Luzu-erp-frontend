import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { ActionCard } from '../ui/action-card';
import { TableHeader } from '../ui/table-header';
import { FilterToggle } from '../ui/filter-toggle';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '../ui/data-table';
import { DataTablePagination } from '../ui/data-table-pagination';
import { StatusBadge } from '../ui/status-badge';
import { MoreVertical, Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

type FilterMode = 'programa' | 'campana';

interface GastoExperience {
  id: string;
  estado: 'pendiente-pago' | 'pago' | 'anulado';
  fechaRegistro: string;
  responsable: string;
  empresaPgm: string;
  facturaEmitidaA: string;
  empresa: string;
  unidadNegocio: string;
  subrubro: string;
  campana: string;
  proveedor: string;
  razonSocial: string;
  neto: number;
}

interface TablaExperienceProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

const PROGRAMA_COLUMNS = [
  'Estado', 'Fecha de registro', 'Responsable', 'Empresa/Programa', 'Factura emitida a',
  'Empresa', 'Unidad de negocio', 'Subrubro', 'Campaña', 'Proveedor', 'Razón social', 'Neto', 'Acciones'
];

const CAMPANA_COLUMNS = [
  'Estado', 'Campaña', 'Fecha de registro', 'Responsable', 'Factura emitida a', 'Empresa',
  'Unidad de negocio', 'Subrubro', 'Proveedor', 'Razón social', 'Neto total', 'Acciones'
];

const FILTER_OPTIONS = [
  { value: 'programa', label: 'Programa' },
  { value: 'campana', label: 'Campaña' },
];

const MOCK_GASTOS: GastoExperience[] = [
  {
    id: '1',
    estado: 'pendiente-pago',
    fechaRegistro: '10 - 2025',
    responsable: 'Gabriela Rivero',
    empresaPgm: 'OMG Argentina SRL',
    facturaEmitidaA: 'Luzu SA',
    empresa: 'Luzu SA',
    unidadNegocio: 'Experience',
    subrubro: 'Diseño',
    campana: 'Verano 2026',
    proveedor: 'OMG Argentina SRL',
    razonSocial: 'OMG Argentina SRL',
    neto: 22500000,
  },
  {
    id: '2',
    estado: 'pago',
    fechaRegistro: '09 - 2025',
    responsable: 'Martín López',
    empresaPgm: 'Media Interactive',
    facturaEmitidaA: 'Luzu SA',
    empresa: 'Luzu SA',
    unidadNegocio: 'Experience',
    subrubro: 'Producción',
    campana: 'Navidad 2025',
    proveedor: 'Media Interactive SA',
    razonSocial: 'Media Interactive SA',
    neto: 18750000,
  },
  {
    id: '3',
    estado: 'anulado',
    fechaRegistro: '08 - 2025',
    responsable: 'Ana García',
    empresaPgm: 'Creative Studio',
    facturaEmitidaA: 'Luzu SA',
    empresa: 'Luzu SA',
    unidadNegocio: 'Experience',
    subrubro: 'Eventos',
    campana: 'Primavera 2025',
    proveedor: 'Creative Studio SRL',
    razonSocial: 'Creative Studio SRL',
    neto: 15000000,
  },
  {
    id: '4',
    estado: 'pendiente-pago',
    fechaRegistro: '11 - 2025',
    responsable: 'Carlos Rodríguez',
    empresaPgm: 'Digital Ads',
    facturaEmitidaA: 'Luzu SA',
    empresa: 'Luzu SA',
    unidadNegocio: 'Experience',
    subrubro: 'Marketing',
    campana: 'Black Friday 2025',
    proveedor: 'Digital Ads SA',
    razonSocial: 'Digital Ads SA',
    neto: 35000000,
  },
  {
    id: '5',
    estado: 'pago',
    fechaRegistro: '07 - 2025',
    responsable: 'Laura Fernández',
    empresaPgm: 'Brand Solutions',
    facturaEmitidaA: 'Luzu SA',
    empresa: 'Luzu SA',
    unidadNegocio: 'Experience',
    subrubro: 'Branding',
    campana: 'Día del Padre 2025',
    proveedor: 'Brand Solutions SRL',
    razonSocial: 'Brand Solutions SRL',
    neto: 12500000,
  },
];

export function TablaExperience({ onOpen, onNew }: TablaExperienceProps) {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('programa');

  const formatPesos = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'pendiente-pago': return 'warning';
      case 'pago': return 'success';
      case 'anulado': return 'error';
      default: return 'neutral';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente-pago': return 'Pendiente de pago';
      case 'pago': return 'Pago';
      case 'anulado': return 'Anulado';
      default: return estado;
    }
  };

  const filteredGastos = useMemo(() => {
    if (!searchTerm) return MOCK_GASTOS;
    const s = searchTerm.toLowerCase();
    return MOCK_GASTOS.filter((g) =>
      g.responsable?.toLowerCase().includes(s) ||
      g.empresaPgm?.toLowerCase().includes(s) ||
      g.facturaEmitidaA?.toLowerCase().includes(s) ||
      g.empresa?.toLowerCase().includes(s) ||
      g.unidadNegocio?.toLowerCase().includes(s) ||
      g.subrubro?.toLowerCase().includes(s) ||
      g.campana?.toLowerCase().includes(s) ||
      g.proveedor?.toLowerCase().includes(s) ||
      g.razonSocial?.toLowerCase().includes(s)
    );
  }, [searchTerm]);

  // For campaña mode, group by campaign
  const groupedByCampana = useMemo(() => {
    const groups: Record<string, { campana: string; gastos: GastoExperience[]; netoTotal: number }> = {};
    filteredGastos.forEach((g) => {
      const key = g.campana;
      if (!groups[key]) {
        groups[key] = { campana: key, gastos: [], netoTotal: 0 };
      }
      groups[key].gastos.push(g);
      groups[key].netoTotal += g.neto;
    });
    return Object.values(groups);
  }, [filteredGastos]);

  const currentData = filterMode === 'programa' ? filteredGastos : groupedByCampana;
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

  const handleRowClick = (item: GastoExperience | typeof groupedByCampana[0]) => {
    if (filterMode === 'programa') {
      onOpen?.((item as GastoExperience).id);
    } else {
      const group = item as typeof groupedByCampana[0];
      if (group.gastos.length > 0) {
        onOpen?.(group.gastos[0].id);
      }
    }
  };

  const handleActionClick = (e: React.MouseEvent, item: GastoExperience | typeof groupedByCampana[0]) => {
    e.stopPropagation();
    handleRowClick(item);
  };

  return (
    <div className="space-y-6">
      {onNew && (
        <ActionCard
          title="Nuevo Formulario"
          description="Crear gasto de experience"
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
            (currentRows as GastoExperience[]).map((gasto) => (
              <DataTableRow key={gasto.id} onClick={() => handleRowClick(gasto)}>
                <DataTableCell>
                  <StatusBadge label={getEstadoLabel(gasto.estado)} variant={getEstadoVariant(gasto.estado)} />
                </DataTableCell>
                <DataTableCell>{gasto.fechaRegistro}</DataTableCell>
                <DataTableCell>{gasto.responsable}</DataTableCell>
                <DataTableCell>{gasto.empresaPgm}</DataTableCell>
                <DataTableCell>{gasto.facturaEmitidaA}</DataTableCell>
                <DataTableCell>{gasto.empresa}</DataTableCell>
                <DataTableCell>{gasto.unidadNegocio}</DataTableCell>
                <DataTableCell>{gasto.subrubro}</DataTableCell>
                <DataTableCell>{gasto.campana}</DataTableCell>
                <DataTableCell>{gasto.proveedor}</DataTableCell>
                <DataTableCell>{gasto.razonSocial}</DataTableCell>
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
            (currentRows as typeof groupedByCampana).map((group) => {
              const firstGasto = group.gastos[0];
              return (
                <DataTableRow key={group.campana} onClick={() => handleRowClick(group)}>
                  <DataTableCell>
                    <StatusBadge label={getEstadoLabel(firstGasto.estado)} variant={getEstadoVariant(firstGasto.estado)} />
                  </DataTableCell>
                  <DataTableCell>{group.campana}</DataTableCell>
                  <DataTableCell>{firstGasto.fechaRegistro}</DataTableCell>
                  <DataTableCell>{firstGasto.responsable}</DataTableCell>
                  <DataTableCell>{firstGasto.facturaEmitidaA}</DataTableCell>
                  <DataTableCell>{firstGasto.empresa}</DataTableCell>
                  <DataTableCell>{firstGasto.unidadNegocio}</DataTableCell>
                  <DataTableCell>{firstGasto.subrubro}</DataTableCell>
                  <DataTableCell>{firstGasto.proveedor}</DataTableCell>
                  <DataTableCell>{firstGasto.razonSocial}</DataTableCell>
                  <DataTableCell>{formatPesos(group.netoTotal)}</DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleActionClick(e, group)}
                        className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              );
            })
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
