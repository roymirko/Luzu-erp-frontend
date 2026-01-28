import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useImplementacion } from '../contexts/ImplementacionContext';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';
import { TableHeader } from './ui/table-header';
import { FilterToggle } from './ui/filter-toggle';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from './ui/data-table';
import { DataTablePagination } from './ui/data-table-pagination';
import { StatusBadge } from './ui/status-badge';
import { formatDateDDMMYYYY, formatMesServicio } from '../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

// Vista por Orden de Publicidad (agrupado)
const COLUMNS_ORDEN = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Orden de Publicidad', 'Presupuesto', 'Cant. de programas',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Neto Total', 'Acciones'
];

// Vista por Programa (individual)
const COLUMNS_PROGRAMA = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Empresa/Programa', 'Detalle de Publicidad', 'Presupuesto',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Acuerdo de pago', 'Neto', 'Acciones'
];

const VIEW_MODE_OPTIONS = [
  { value: 'programa', label: 'Programa' },
  { value: 'orden', label: 'Orden de Publicidad' },
];

type ViewMode = 'orden' | 'programa';

interface TablaImplementacionesProps {
  onOpen?: (formId: string, itemId?: string) => void;
}

export function TablaImplementaciones({ onOpen }: TablaImplementacionesProps = {}) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const { gastos } = useImplementacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('orden');

  const formatPesos = (value: string | number) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(num);
  };

  const getStatusVariant = (estado: string) => {
    const normalizedEstado = estado?.toLowerCase() || '';
    if (normalizedEstado === 'cargado' || normalizedEstado === 'activo' || normalizedEstado === 'pagado' || normalizedEstado === 'pago') return 'success';
    if (normalizedEstado === 'pendiente de carga' || normalizedEstado === 'pendiente' || normalizedEstado === 'pendiente de pago' || normalizedEstado === 'pendiente-pago') return 'warning';
    if (normalizedEstado === 'cerrado') return 'neutral';
    if (normalizedEstado === 'anulado') return 'error';
    return 'neutral';
  };

  const getStatusLabel = (estado: string) => {
    const normalizedEstado = estado?.toLowerCase() || '';
    switch (normalizedEstado) {
      case 'pendiente-pago':
      case 'pendiente de pago':
        return 'Pendiente de pago';
      case 'pagado':
      case 'pago':
        return 'Pagado';
      case 'activo':
      case 'cargado':
        return 'Activo';
      case 'pendiente':
      case 'pendiente de carga':
        return 'Pendiente de carga';
      case 'cerrado':
        return 'Cerrado';
      case 'anulado':
        return 'Anulado';
      default:
        return 'Pendiente de carga';
    }
  };

  // Rows for "Orden de Publicidad" view (grouped)
  const rowsOrden = useMemo(() => {
    const fromFormularios = formularios.flatMap((form) => {
      if (!Array.isArray(form.importeRows)) return [] as any[];

      // Group by orden de publicidad
      const itemsWithImpl = form.importeRows.filter((item) => {
        const v = parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));
        return !isNaN(v) && v > 0;
      });

      if (itemsWithImpl.length === 0) return [];

      const linkedGastos = gastos.filter(g =>
        (g as any).idFormularioComercial === form.id
      );

      const totalPresupuesto = itemsWithImpl.reduce((sum, item) => {
        return sum + parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));
      }, 0);

      const totalNeto = linkedGastos.reduce((sum, g) => sum + (g.neto || 0), 0);

      // Get fecha de registro from first saved gasto (earliest createdAt)
      const fechaRegistro = linkedGastos.length > 0
        ? formatDateDDMMYYYY(linkedGastos.reduce((earliest, g) =>
            new Date(g.createdAt) < new Date(earliest.createdAt) ? g : earliest
          ).createdAt)
        : '-';

      return [{
        id: form.id,
        formId: form.id,
        itemId: itemsWithImpl[0]?.id,
        estado: linkedGastos.length > 0 ? 'Activo' : 'Pendiente de carga',
        mesServicio: formatMesServicio(form.mesServicio),
        fechaRegistro,
        responsable: form.responsable,
        unidadNegocio: form.unidadNegocio,
        categoriaNegocio: form.categoriaNegocio || 'N/A',
        marca: form.marca || '-',
        ordenPublicidad: form.ordenPublicidad,
        presupuesto: totalPresupuesto,
        cantidadProgramas: itemsWithImpl.length,
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: '-',
        nombreCampana: form.nombreCampana || '-',
        netoTotal: totalNeto,
      }];
    });

    // Add standalone gastos not linked to formularios
    const formIds = new Set(formularios.map(f => f.id));
    const standaloneGastos = gastos
      .filter(g => !(g as any).idFormularioComercial || !formIds.has((g as any).idFormularioComercial))
      .map((gasto) => ({
        id: gasto.id,
        formId: gasto.id,
        itemId: undefined,
        estado: gasto.estado === 'pendiente' ? 'Pendiente' : gasto.estado === 'activo' ? 'Activo' : gasto.estado === 'cerrado' ? 'Cerrado' : 'Anulado',
        mesServicio: formatMesServicio(gasto.mesServicio),
        fechaRegistro: formatDateDDMMYYYY(gasto.createdAt),
        responsable: gasto.responsable || '-',
        unidadNegocio: gasto.unidadNegocio || '-',
        categoriaNegocio: gasto.categoriaNegocio || 'N/A',
        marca: gasto.marca || '-',
        ordenPublicidad: gasto.ordenPublicidad || '-',
        presupuesto: gasto.neto || 0,
        cantidadProgramas: gasto.importes?.length || 1,
        sector: gasto.sector || '-',
        rubroGasto: gasto.rubroGasto || '-',
        subRubro: gasto.subRubro || '-',
        nombreCampana: gasto.nombreCampana || '-',
        netoTotal: gasto.importes?.reduce((sum: number, imp: any) => sum + (parseFloat(imp.neto) || 0), 0) || gasto.neto || 0,
      }));

    return [...fromFormularios, ...standaloneGastos].filter((row) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        row.ordenPublicidad?.toLowerCase().includes(s) ||
        row.responsable?.toLowerCase().includes(s) ||
        row.unidadNegocio?.toLowerCase().includes(s) ||
        row.nombreCampana?.toLowerCase().includes(s)
      );
    });
  }, [formularios, gastos, searchTerm]);

  // Rows for "Programa" view (individual gastos)
  const rowsPrograma = useMemo(() => {
    const fromFormularios = formularios.flatMap((form) => {
      if (!Array.isArray(form.importeRows)) return [] as any[];
      return form.importeRows
        .filter((item) => {
          const v = parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));
          return !isNaN(v) && v > 0;
        })
        .map((item) => {
          const linkedGasto = gastos.find(g =>
            (g as any).idFormularioComercial === form.id &&
            (g as any).formItemId === item.id
          );

          const presupuestoImpl = parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));

          return {
            id: linkedGasto ? linkedGasto.id : `${form.id}-${item.id}`,
            formId: form.id,
            itemId: item.id,
            linkedGastoId: linkedGasto?.id,
            estado: linkedGasto ? (linkedGasto.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente de pago') : 'Pendiente de carga',
            mesServicio: formatMesServicio(linkedGasto?.mesServicio || form.mesServicio),
            fechaRegistro: linkedGasto ? formatDateDDMMYYYY(linkedGasto.createdAt) : '-',
            responsable: linkedGasto?.responsable || form.responsable,
            unidadNegocio: form.unidadNegocio,
            categoriaNegocio: form.categoriaNegocio || 'N/A',
            marca: linkedGasto?.marca || form.marca || '-',
            empresaPrograma: item.programa || '-',
            ordenPublicidad: form.ordenPublicidad,
            presupuesto: presupuestoImpl,
            sector: 'Implementación',
            rubroGasto: linkedGasto?.rubroGasto || 'Gasto de venta',
            subRubro: linkedGasto?.subRubro || '-',
            nombreCampana: form.nombreCampana || '-',
            acuerdoPago: linkedGasto?.acuerdoPago || '-',
            neto: linkedGasto?.neto || 0,
          };
        });
    });

    // Add standalone gastos importes
    const formItemIds = new Set(fromFormularios.map(r => r.linkedGastoId).filter(Boolean));

    const standaloneImportes = gastos
      .filter(g => !formItemIds.has(g.id))
      .flatMap((gasto) => {
        if (gasto.importes && gasto.importes.length > 0) {
          return gasto.importes.map((imp: any) => ({
            id: imp.id,
            formId: gasto.id,
            itemId: imp.id,
            linkedGastoId: gasto.id,
            estado: imp.estadoPgm === 'pagado' ? 'Pagado' : 'Pendiente de pago',
            mesServicio: formatMesServicio(gasto.mesServicio),
            fechaRegistro: formatDateDDMMYYYY(gasto.createdAt),
            responsable: gasto.responsable || '-',
            unidadNegocio: gasto.unidadNegocio || '-',
            categoriaNegocio: gasto.categoriaNegocio || 'N/A',
            marca: gasto.marca || '-',
            empresaPrograma: imp.empresaPgm || imp.programa || '-',
            ordenPublicidad: gasto.ordenPublicidad || '-',
            presupuesto: parseFloat(imp.neto) || 0,
            sector: gasto.sector || '-',
            rubroGasto: gasto.rubroGasto || '-',
            subRubro: gasto.subRubro || '-',
            nombreCampana: gasto.nombreCampana || '-',
            acuerdoPago: imp.condicionPago || gasto.acuerdoPago || '-',
            neto: parseFloat(imp.neto) || 0,
          }));
        }
        return [{
          id: gasto.id,
          formId: gasto.id,
          itemId: undefined,
          linkedGastoId: gasto.id,
          estado: gasto.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente de pago',
          mesServicio: formatMesServicio(gasto.mesServicio),
          fechaRegistro: formatDateDDMMYYYY(gasto.createdAt),
          responsable: gasto.responsable || '-',
          unidadNegocio: gasto.unidadNegocio || '-',
          categoriaNegocio: gasto.categoriaNegocio || 'N/A',
          marca: gasto.marca || '-',
          empresaPrograma: '-',
          ordenPublicidad: gasto.ordenPublicidad || '-',
          presupuesto: gasto.neto || 0,
          sector: gasto.sector || '-',
          rubroGasto: gasto.rubroGasto || '-',
          subRubro: gasto.subRubro || '-',
          nombreCampana: gasto.nombreCampana || '-',
          acuerdoPago: gasto.acuerdoPago || '-',
          neto: gasto.neto || 0,
        }];
      });

    return [...fromFormularios, ...standaloneImportes].filter((row) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        row.ordenPublicidad?.toLowerCase().includes(s) ||
        row.empresaPrograma?.toLowerCase().includes(s) ||
        row.responsable?.toLowerCase().includes(s) ||
        row.nombreCampana?.toLowerCase().includes(s)
      );
    });
  }, [formularios, gastos, searchTerm]);

  const rows = viewMode === 'orden' ? rowsOrden : rowsPrograma;
  const columns = viewMode === 'orden' ? COLUMNS_ORDEN : COLUMNS_PROGRAMA;

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleModeChange = (mode: string) => {
    setViewMode(mode as ViewMode);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
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
            currentRows.map((row) => (
              <DataTableRow key={row.id} onClick={() => onOpen && onOpen(row.formId, row.itemId)}>
                <DataTableCell>
                  <StatusBadge label={getStatusLabel(row.estado)} variant={getStatusVariant(row.estado)} />
                </DataTableCell>
                <DataTableCell>{row.mesServicio}</DataTableCell>
                <DataTableCell>{row.fechaRegistro}</DataTableCell>
                <DataTableCell>{row.responsable}</DataTableCell>
                <DataTableCell>{row.unidadNegocio}</DataTableCell>
                <DataTableCell>{row.categoriaNegocio}</DataTableCell>
                <DataTableCell>{row.marca}</DataTableCell>

                {viewMode === 'orden' ? (
                  <>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{formatPesos(row.presupuesto)}</DataTableCell>
                    <DataTableCell>{row.cantidadProgramas}</DataTableCell>
                    <DataTableCell muted>{row.sector}</DataTableCell>
                    <DataTableCell muted>{row.rubroGasto}</DataTableCell>
                    <DataTableCell muted>{row.subRubro}</DataTableCell>
                    <DataTableCell muted>{row.nombreCampana}</DataTableCell>
                    <DataTableCell>{formatPesos(row.netoTotal)}</DataTableCell>
                  </>
                ) : (
                  <>
                    <DataTableCell>{row.empresaPrograma}</DataTableCell>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{formatPesos(row.presupuesto)}</DataTableCell>
                    <DataTableCell muted>{row.sector}</DataTableCell>
                    <DataTableCell muted>{row.rubroGasto}</DataTableCell>
                    <DataTableCell muted>{row.subRubro}</DataTableCell>
                    <DataTableCell muted>{row.nombreCampana}</DataTableCell>
                    <DataTableCell>{row.acuerdoPago}</DataTableCell>
                    <DataTableCell>{formatPesos(row.neto)}</DataTableCell>
                  </>
                )}

                <DataTableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen && onOpen(row.formId, row.itemId);
                      }}
                      className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    >
                      <Pencil className="h-4 w-4" />
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
