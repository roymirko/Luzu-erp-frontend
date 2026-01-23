import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useImplementacion } from '../contexts/ImplementacionContext';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';
import { TableHeader } from './ui/table-header';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from './ui/data-table';
import { DataTablePagination } from './ui/data-table-pagination';
import { StatusBadge } from './ui/status-badge';
import { formatDateDDMMYYYY, formatMesServicio } from '../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

const COLUMNS = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Orden de Publicidad', 'Presupuesto', 'Cant. de programas',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Neto Total', 'Acciones'
];

interface TablaImplementacionesProps {
  onOpen?: (formId: string, itemId?: string) => void;
}

export function TablaImplementaciones({ onOpen }: TablaImplementacionesProps = {}) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const { gastos } = useImplementacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const formatPesos = (value: string | number) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(num);
  };

  const getStatusVariant = (estado: string) => {
    if (estado === 'Cargado' || estado === 'Activo') return 'success';
    if (estado === 'Pendiente de carga' || estado === 'Pendiente') return 'warning';
    if (estado === 'Cerrado') return 'neutral';
    if (estado === 'Anulado') return 'error';
    return 'warning';
  };

  const rows = useMemo(() => {
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
            estado: linkedGasto ? 'Cargado' : 'Pendiente de carga',
            mesServicio: formatMesServicio(linkedGasto?.mesServicio || form.mesServicio),
            fechaRegistro: formatDateDDMMYYYY(linkedGasto?.createdAt || form.fecha),
            responsable: linkedGasto?.responsable || form.responsable,
            unidadNegocio: form.unidadNegocio,
            categoriaNegocio: form.categoriaNegocio || 'N/A',
            marca: linkedGasto?.marca || form.marca || '-',
            ordenPublicidad: form.ordenPublicidad,
            presupuesto: presupuestoImpl,
            cantidadProgramas: 1,
            sector: 'Implementación',
            rubroGasto: linkedGasto?.rubroGasto || 'Gasto de venta',
            subRubro: linkedGasto?.subRubro || '-',
            nombreCampana: form.nombreCampana || '-',
            netoTotal: linkedGasto?.neto || 0,
            programa: item.programa,
          };
        });
    });

    const formItemIds = new Set(fromFormularios.map(r => r.linkedGastoId).filter(Boolean));
    
    const standaloneGastos = gastos
      .filter(g => !formItemIds.has(g.id))
      .map((gasto) => ({
        id: gasto.id,
        formId: gasto.id,
        itemId: undefined,
        linkedGastoId: gasto.id,
        estado: gasto.estado === 'pendiente' ? 'Pendiente' : gasto.estado === 'activo' ? 'Activo' : gasto.estado === 'cerrado' ? 'Cerrado' : 'Anulado',
        mesServicio: formatMesServicio(gasto.mesServicio),
        fechaRegistro: formatDateDDMMYYYY(gasto.createdAt),
        responsable: gasto.responsable || '-',
        unidadNegocio: gasto.unidadNegocio || '-',
        categoriaNegocio: gasto.categoriaNegocio || 'N/A',
        marca: gasto.marca || '-',
        ordenPublicidad: gasto.ordenPublicidad || '-',
        presupuesto: gasto.neto || 0,
        cantidadProgramas: 1,
        sector: gasto.sector || '-',
        rubroGasto: gasto.rubroGasto || '-',
        subRubro: gasto.subRubro || '-',
        nombreCampana: gasto.nombreCampana || '-',
        netoTotal: gasto.neto || 0,
        programa: undefined,
      }));

    const combined = [...fromFormularios, ...standaloneGastos];

    return combined.filter((row) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        row.ordenPublicidad?.toLowerCase().includes(s) ||
        row.responsable?.toLowerCase().includes(s) ||
        row.unidadNegocio?.toLowerCase().includes(s) ||
        row.categoriaNegocio?.toLowerCase().includes(s) ||
        row.nombreCampana?.toLowerCase().includes(s) ||
        row.sector?.toLowerCase().includes(s) ||
        row.marca?.toLowerCase().includes(s)
      );
    });
  }, [formularios, gastos, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
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
            currentRows.map((row) => (
              <DataTableRow key={row.id} onClick={() => onOpen && onOpen(row.formId, row.itemId)}>
                <DataTableCell>
                  <StatusBadge label={row.estado} variant={getStatusVariant(row.estado)} />
                </DataTableCell>
                <DataTableCell>{row.mesServicio}</DataTableCell>
                <DataTableCell>{row.fechaRegistro}</DataTableCell>
                <DataTableCell>{row.responsable}</DataTableCell>
                <DataTableCell>{row.unidadNegocio}</DataTableCell>
                <DataTableCell>{row.categoriaNegocio}</DataTableCell>
                <DataTableCell>{row.marca}</DataTableCell>
                <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                <DataTableCell>{formatPesos(row.presupuesto)}</DataTableCell>
                <DataTableCell>{row.cantidadProgramas}</DataTableCell>
                <DataTableCell muted>{row.sector}</DataTableCell>
                <DataTableCell muted>{row.rubroGasto}</DataTableCell>
                <DataTableCell muted>{row.subRubro}</DataTableCell>
                <DataTableCell muted>{row.nombreCampana}</DataTableCell>
                <DataTableCell>{formatPesos(row.netoTotal)}</DataTableCell>
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
