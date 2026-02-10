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

// Columns for "Orden de Publicidad" view (grouped by OP)
const COLUMNS_ORDEN = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Orden de Publicidad', 'Presupuesto', 'Cant. de programas',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Neto Total', 'Acciones'
];

// Columns for "Programa" view (individual gastos)
const COLUMNS_PROGRAMA = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Empresa/Programa', 'Detalle de Publicidad', 'Presupuesto',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Acuerdo de pago', 'Neto', 'Acciones'
];

interface TablaImplementacionProps {
  onNewGasto?: () => void;
  onEditGasto?: (id: string) => void;
}

export function TablaImplementacion({ onNewGasto, onEditGasto }: TablaImplementacionProps) {
  const { isDark } = useTheme();
  const { gastos } = useImplementacion();
  // Default to 'orden' (Orden de Publicidad view)
  const [viewMode, setViewMode] = useState<'orden' | 'programa'>('orden');
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
    rubro: string;
    subRubro: string;
    nombreCampana: string;
    acuerdoPago: string;
    presupuesto: string;
    categoriaNegocio?: string;
    marca?: string;
    mesServicio?: string;
    fechaRegistro?: string;
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
      rubro: g.rubro,
      subRubro: g.subRubro,
      nombreCampana: g.nombreCampana,
      acuerdoPago: g.acuerdoPago,
      presupuesto: g.presupuesto,
      categoriaNegocio: g.categoriaNegocio,
      marca: g.marca,
      mesServicio: g.mesServicio,
      fechaRegistro: g.fechaRegistro,
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
  const columns = viewMode === 'orden' ? COLUMNS_ORDEN : COLUMNS_PROGRAMA;
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
          className="w-[280px]"
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
                <DataTableRow key={item.id} onClick={() => handleEdit(id)}>
                  {/* Estado */}
                  <DataTableCell>
                    <StatusBadge label={getStatusLabel(status)} variant={getStatusVariant(status)} />
                  </DataTableCell>
                  {/* Mes de servicio */}
                  <DataTableCell>{item.mesServicio || '-'}</DataTableCell>
                  {/* Fecha de registro */}
                  <DataTableCell>{item.fechaRegistro || item.fechaComprobante || '-'}</DataTableCell>
                  {/* Responsable */}
                  <DataTableCell>{item.responsable}</DataTableCell>
                  {/* Unidad de negocio */}
                  <DataTableCell>{item.unidadNegocio}</DataTableCell>
                  {/* Categoría de negocio */}
                  <DataTableCell>{item.categoriaNegocio || '-'}</DataTableCell>
                  {/* Marca */}
                  <DataTableCell>{item.marca || '-'}</DataTableCell>

                  {viewMode === 'orden' ? (
                    <>
                      {/* Orden de Publicidad */}
                      <DataTableCell>{item.ordenPublicidad}</DataTableCell>
                      {/* Presupuesto */}
                      <DataTableCell>{formatCurrency(item.presupuesto)}</DataTableCell>
                      {/* Cant. de programas */}
                      <DataTableCell>{item.importes?.length || 0}</DataTableCell>
                      {/* Sector */}
                      <DataTableCell muted>{item.sector}</DataTableCell>
                      {/* Rubro de gasto */}
                      <DataTableCell muted>{item.rubro}</DataTableCell>
                      {/* Sub rubro */}
                      <DataTableCell muted>{item.subRubro}</DataTableCell>
                      {/* Nombre de campaña */}
                      <DataTableCell muted>{item.nombreCampana}</DataTableCell>
                      {/* Neto Total */}
                      <DataTableCell>
                        {item.importes ? formatCurrency(item.importes.reduce((sum: number, i: any) => sum + (parseFloat(i.neto) || 0), 0)) : '-'}
                      </DataTableCell>
                    </>
                  ) : (
                    <>
                      {/* Empresa/Programa */}
                      <DataTableCell>{item.empresaPgm}</DataTableCell>
                      {/* Detalle de Publicidad (Orden de Publicidad) */}
                      <DataTableCell>{item.parentOP}</DataTableCell>
                      {/* Presupuesto */}
                      <DataTableCell>{formatCurrency(item.presupuesto)}</DataTableCell>
                      {/* Sector */}
                      <DataTableCell muted>{item.sector}</DataTableCell>
                      {/* Rubro de gasto */}
                      <DataTableCell muted>{item.rubro}</DataTableCell>
                      {/* Sub rubro */}
                      <DataTableCell muted>{item.subRubro}</DataTableCell>
                      {/* Nombre de campaña */}
                      <DataTableCell muted>{item.nombreCampana}</DataTableCell>
                      {/* Acuerdo de pago */}
                      <DataTableCell>{item.acuerdoPago || item.condicionPago || '-'}</DataTableCell>
                      {/* Neto */}
                      <DataTableCell>{formatCurrency(item.neto)}</DataTableCell>
                    </>
                  )}

                  {/* Acciones */}
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
