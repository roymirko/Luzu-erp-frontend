import { useState } from 'react';
import { useImplementacion, BloqueImporte } from '../contexts/ImplementacionContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Key, MoreVertical } from 'lucide-react';
import { ActionCard } from './ui/action-card';
import { TableHeader } from './ui/table-header';
import { FilterToggle } from './ui/filter-toggle';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from './ui/data-table';
import { DataTablePagination } from './ui/data-table-pagination';
import { StatusBadge } from './ui/status-badge';

const ITEMS_PER_PAGE = 10;

const VIEW_MODE_OPTIONS = [
  { value: 'programa', label: 'Programa' },
  { value: 'orden', label: 'Orden de Publicidad' },
];

const COLUMNS_PROGRAMA = [
  'Estado', 'Fecha de registro', 'Responsable', 'Unidad de negocio', 'Categoría de negocio',
  'Empresa/PGM', 'Orden de Publicidad', 'Presupuesto', 'Sector', 'Rubro de gasto',
  'Sub rubro', 'Nombre de campaña', 'Acuerdo de pago', 'Neto', 'Acciones'
];

const COLUMNS_ORDEN = [
  'Estado', 'Fecha de registro', 'Responsable', 'Unidad de negocio', 'Categoría de negocio',
  'Orden de Publicidad', 'Presupuesto', 'Cant. de programas', 'Sector', 'Rubro de gasto',
  'Sub rubro', 'Nombre de campaña', 'Neto Total', 'Acciones'
];

interface TablaImplementacionProps {
  onNewGasto?: () => void;
  onEditGasto?: (id: string) => void;
}

export function TablaImplementacion({ onNewGasto, onEditGasto }: TablaImplementacionProps) {
  const { isDark } = useTheme();
  const { gastos } = useImplementacion();
  const [viewMode, setViewMode] = useState<'orden' | 'programa'>('programa');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (id: string) => {
    onEditGasto?.(id);
  };

  const handleNew = () => {
    onNewGasto?.();
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '-' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(num);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pendiente':
      case 'pendiente-pago':
        return 'warning';
      case 'pagado':
      case 'activo':
        return 'success';
      case 'cerrado':
        return 'neutral';
      case 'anulado':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente-pago': return 'Pendiente de pago';
      case 'pagado': return 'Pagado';
      case 'anulado': return 'Anulado';
      case 'pendiente': return 'Pendiente';
      case 'activo': return 'Activo';
      case 'cerrado': return 'Cerrado';
      default: return status;
    }
  };

  interface ImporteWithParent extends BloqueImporte {
    parentId: string;
    parentOP: string;
    responsable: string;
    unidadNegocio: string;
    sector: string;
    rubroGasto: string;
    subRubro: string;
    nombreCampana: string;
    acuerdoPago: string;
    presupuesto: string;
    categoriaNegocio?: string;
  }

  const filteredGastos = gastos.filter(g => {
    const term = searchTerm.toLowerCase();
    return (
      g.ordenPublicidad.toLowerCase().includes(term) ||
      g.responsable.toLowerCase().includes(term) ||
      g.nombreCampana.toLowerCase().includes(term)
    );
  });

  const allImportes: ImporteWithParent[] = gastos.flatMap(g =>
    g.importes.map(imp => ({
      ...imp,
      parentId: g.id,
      parentOP: g.ordenPublicidad,
      responsable: g.responsable,
      unidadNegocio: g.unidadNegocio,
      sector: g.sector,
      rubroGasto: g.rubroGasto,
      subRubro: g.subRubro,
      nombreCampana: g.nombreCampana,
      acuerdoPago: g.acuerdoPago,
      presupuesto: g.presupuesto,
      categoriaNegocio: g.categoriaNegocio
    }))
  );

  const filteredImportes = allImportes.filter(imp => {
    const term = searchTerm.toLowerCase();
    return (
      imp.parentOP.toLowerCase().includes(term) ||
      imp.programa.toLowerCase().includes(term)
    );
  });

  const currentData = viewMode === 'orden' ? filteredGastos : filteredImportes;
  const columns = viewMode === 'programa' ? COLUMNS_PROGRAMA : COLUMNS_ORDEN;
  const totalPages = Math.max(1, Math.ceil(currentData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = currentData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleModeChange = (mode: string) => {
    setViewMode(mode as 'programa' | 'orden');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <ActionCard
        title="Nuevo Gasto"
        description="Cargar Gasto de implementación"
        icon={Key}
        onClick={handleNew}
      />

      <TableHeader
        title="Detalle de gastos"
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
      >
        <FilterToggle
          options={VIEW_MODE_OPTIONS}
          value={viewMode}
          onChange={handleModeChange}
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
          ) : (
            currentRows.map((item: any) => {
              const status = viewMode === 'orden' ? item.estadoOP : item.estadoPgm;
              const id = viewMode === 'orden' ? item.id : item.parentId;

              return (
                <DataTableRow key={viewMode === 'orden' ? item.id : item.id} onClick={() => handleEdit(id)}>
                  <DataTableCell>
                    <StatusBadge label={getStatusLabel(status)} variant={getStatusVariant(status)} />
                  </DataTableCell>
                  <DataTableCell>{viewMode === 'orden' ? item.fechaRegistro : item.fechaComprobante}</DataTableCell>
                  <DataTableCell>{item.responsable}</DataTableCell>
                  <DataTableCell>{item.unidadNegocio}</DataTableCell>
                  <DataTableCell>{item.categoriaNegocio || '-'}</DataTableCell>

                  {viewMode === 'programa' ? (
                    <>
                      <DataTableCell>{item.empresaPgm}</DataTableCell>
                      <DataTableCell>{item.parentOP}</DataTableCell>
                      <DataTableCell>{formatCurrency(item.presupuesto)}</DataTableCell>
                      <DataTableCell muted>{item.sector}</DataTableCell>
                      <DataTableCell muted>{item.rubroGasto}</DataTableCell>
                      <DataTableCell muted>{item.subRubro}</DataTableCell>
                      <DataTableCell muted>{item.nombreCampana}</DataTableCell>
                      <DataTableCell>{item.acuerdoPago}</DataTableCell>
                      <DataTableCell>{formatCurrency(item.neto)}</DataTableCell>
                    </>
                  ) : (
                    <>
                      <DataTableCell>{item.ordenPublicidad}</DataTableCell>
                      <DataTableCell>{formatCurrency(item.presupuesto)}</DataTableCell>
                      <DataTableCell>{item.cantidadProgramas}</DataTableCell>
                      <DataTableCell muted>{item.sector}</DataTableCell>
                      <DataTableCell muted>{item.rubroGasto}</DataTableCell>
                      <DataTableCell muted>{item.subRubro}</DataTableCell>
                      <DataTableCell muted>{item.nombreCampana}</DataTableCell>
                      <DataTableCell>
                        {item.importes ? formatCurrency(item.importes.reduce((sum: number, i: any) => sum + (parseFloat(i.neto) || 0), 0)) : '-'}
                      </DataTableCell>
                    </>
                  )}

                  <DataTableCell>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleEdit(id); }}
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
