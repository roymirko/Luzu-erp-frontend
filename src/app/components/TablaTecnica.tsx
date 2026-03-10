import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useTecnica } from '../contexts/TecnicaContext';
import { Button } from './ui/button';
import { ActionCard } from './ui/action-card';
import { Pencil, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { TableHeader } from './ui/table-header';
import { FilterToggle } from './ui/filter-toggle';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from './ui/data-table';
import { DataTablePagination } from './ui/data-table-pagination';
import { StatusBadge } from './ui/status-badge';
import { formatDateDDMMYYYY, formatMesServicio } from '../utils/dateFormatters';

const ITEMS_PER_PAGE = 10;

// Vista por Gasto (individual)
const COLUMNS_GASTO = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Orden de Publicidad', 'Unidad de negocio',
  'Proyecto', 'Subrubro', 'Empresa/Programa', 'Proveedor', 'Presupuesto', 'Neto', 'Acciones'
];

// Vista por Programa (agrupado)
const COLUMNS_PROGRAMA = [
  'Mes de servicio', 'Orden de Publicidad', 'Proyecto', 'Subrubro', 'Empresa/Programa', 'Cant. de gastos',
  'Asignado', 'Ejecutado', 'Dinero disponible', 'Acciones'
];

const VIEW_MODE_OPTIONS = [
  { value: 'gasto', label: 'Gasto' },
  { value: 'programa', label: 'Programa' },
];

type ViewMode = 'gasto' | 'programa';

type ProgramaRow = {
  id: string;
  formId: string;
  itemId?: string;
  linkedGastoId?: string;
  estado?: string;
  mesServicio: string;
  fechaRegistro: string;
  ordenPublicidad: string;
  unidadNegocio?: string;
  sector?: string;
  subrubro?: string;
  empresaPrograma: string;
  proveedor?: string;
  presupuesto: number;
  neto: number;
  cantidadGastos?: number;
  asignado?: number;
  ejecutado?: number;
  disponible?: number;
};

const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div>
    <span className="text-sm text-muted-foreground">{label}</span>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

interface TablaTecnicaProps {
  onOpen?: (formId: string, itemId?: string) => void;
  onOpenStandalone?: (gastoId: string) => void;
  onNew?: () => void;
}

export function TablaTecnica({ onOpen, onOpenStandalone, onNew }: TablaTecnicaProps = {}) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const { gastos, getGastoById } = useTecnica();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('gasto');
  const [selectedRow, setSelectedRow] = useState<ProgramaRow | null>(null);

  // Get linked gasto details when a row is selected
  const selectedGasto = useMemo(() => {
    if (!selectedRow?.linkedGastoId) return null;
    return getGastoById(selectedRow.linkedGastoId);
  }, [selectedRow?.linkedGastoId, getGastoById]);

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

  // Rows for "Gasto" view (individual)
  const rowsGasto = useMemo(() => {
    return gastos
      .map((gasto) => {
        const formulario = formularios.find(f => f.id === gasto.ordenPublicidadId);
        
        return {
          id: gasto.id,
          formId: gasto.ordenPublicidadId || '',
          linkedGastoId: gasto.id,
          estado: gasto.estado === 'pendiente' ? 'Pendiente' : gasto.estado === 'activo' ? 'Activo' : gasto.estado === 'cerrado' ? 'Cerrado' : 'Anulado',
          mesServicio: formatMesServicio(gasto.mesServicio || formulario?.mesServicio || ''),
          fechaRegistro: formatDateDDMMYYYY(gasto.createdAt),
          ordenPublicidad: formulario?.ordenPublicidad || gasto.ordenPublicidad || '-',
          unidadNegocio: gasto.unidadNegocio || formulario?.unidadNegocio || '-',
          sector: gasto.sector || '-',
          subrubro: gasto.subRubro || '-',
          empresaPrograma: gasto.empresaPrograma || '-',
          proveedor: gasto.proveedor || '-',
          presupuesto: gasto.neto || 0,
          neto: gasto.neto || 0,
        };
      })
      .filter((row) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
          row.ordenPublicidad?.toLowerCase().includes(s) ||
          row.empresaPrograma?.toLowerCase().includes(s) ||
          row.unidadNegocio?.toLowerCase().includes(s) ||
          row.proveedor?.toLowerCase().includes(s)
        );
      });
  }, [gastos, formularios, searchTerm]);

  // Rows for "Programa" view (grouped by program)
  const rowsPrograma = useMemo(() => {
    const programasMap = new Map<string, {
      formulario: any;
      item: any;
      gastos: any[];
    }>();

    // Build map of programs with their associated gastos
    formularios.forEach((form) => {
      form.importeRows?.forEach((item) => {
        if (!item.programa) return;
        const key = `${form.id}-${item.id}`;
        const itemGastos = gastos.filter(g => 
          g.ordenPublicidadId === form.id && 
          g.itemOrdenPublicidadId === item.id
        );
        
        programasMap.set(key, {
          formulario: form,
          item,
          gastos: itemGastos
        });
      });
    });

    const programa_rows = Array.from(programasMap.values()).map(({ formulario, item, gastos: itemGastos }) => {
      const presupuesto = parseFloat(String(item.tecnica || '0').replace(/[^0-9.-]/g, '')) || 0;
      const ejecutado = itemGastos.reduce((sum, g) => sum + (g.neto || 0), 0);
      const disponible = presupuesto - ejecutado;

      return {
        id: `${formulario.id}-${item.id}`,
        formId: formulario.id,
        itemId: item.id,
        linkedGastoId: itemGastos.length > 0 ? itemGastos[0].id : undefined,
        mesServicio: formatMesServicio(formulario.mesServicio),
        fechaRegistro: itemGastos.length > 0 ? formatDateDDMMYYYY(itemGastos[0].createdAt) : '-',
        ordenPublicidad: formulario.ordenPublicidad,
        sector: item.sector || '-',
        subrubro: item.subRubro || '-',
        empresaPrograma: item.programa || '-',
        cantidadGastos: itemGastos.length,
        asignado: presupuesto,
        ejecutado: ejecutado,
        disponible: disponible,
        neto: ejecutado,
        presupuesto: presupuesto,
      };
    });

    return programa_rows.filter((row) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        row.ordenPublicidad?.toLowerCase().includes(s) ||
        row.empresaPrograma?.toLowerCase().includes(s)
      );
    });
  }, [formularios, gastos, searchTerm]);

  const rows = viewMode === 'gasto' ? rowsGasto : rowsPrograma;
  const columns = viewMode === 'gasto' ? COLUMNS_GASTO : COLUMNS_PROGRAMA;

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
      {onNew && (
        <ActionCard
          title="Nuevo Formulario"
          description="Crear gasto de técnica"
          icon={Plus}
          onClick={onNew}
        />
      )}

      <TableHeader
        title="Detalle de gastos - Técnica"
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
              <DataTableRow key={row.id} onClick={() => {
                if (viewMode === 'programa') {
                  setSelectedRow(row as ProgramaRow);
                } else {
                  onOpen?.(row.formId, row.itemId);
                }
              }}>
                <DataTableCell>
                  <StatusBadge label={getStatusLabel(row.estado)} variant={getStatusVariant(row.estado)} />
                </DataTableCell>
                <DataTableCell>{row.mesServicio}</DataTableCell>

                {viewMode === 'gasto' ? (
                  <>
                    <DataTableCell>{row.fechaRegistro}</DataTableCell>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{row.unidadNegocio}</DataTableCell>
                    <DataTableCell>{row.sector}</DataTableCell>
                    <DataTableCell>{row.subrubro}</DataTableCell>
                    <DataTableCell>{row.empresaPrograma}</DataTableCell>
                    <DataTableCell>{row.proveedor}</DataTableCell>
                    <DataTableCell>{formatPesos(row.presupuesto)}</DataTableCell>
                    <DataTableCell>{formatPesos(row.neto)}</DataTableCell>
                  </>
                ) : (
                  <>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{row.sector}</DataTableCell>
                    <DataTableCell>{row.subrubro}</DataTableCell>
                    <DataTableCell>{row.empresaPrograma}</DataTableCell>
                    <DataTableCell>{row.cantidadGastos}</DataTableCell>
                    <DataTableCell>{formatPesos(row.asignado)}</DataTableCell>
                    <DataTableCell>{formatPesos(row.ejecutado)}</DataTableCell>
                    <DataTableCell>{formatPesos(row.disponible)}</DataTableCell>
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

      <Dialog open={!!selectedRow} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del {viewMode === 'gasto' ? 'Gasto' : 'Programa'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {viewMode === 'gasto' && (
              <>
                <InfoRow label="Estado" value={selectedRow?.estado} />
                <InfoRow label="Mes Servicio" value={selectedRow?.mesServicio} />
                <InfoRow label="Fecha Registro" value={selectedRow?.fechaRegistro} />
                <InfoRow label="Orden Publicidad" value={selectedRow?.ordenPublicidad} />
                <InfoRow label="Unidad Negocio" value={selectedRow?.unidadNegocio} />
                <InfoRow label="Proyecto" value={selectedRow?.sector} />
                <InfoRow label="Subrubro" value={selectedRow?.subrubro} />
                <InfoRow label="Empresa/Programa" value={selectedRow?.empresaPrograma} />
                <InfoRow label="Proveedor" value={selectedRow?.proveedor} />
                <InfoRow label="Presupuesto" value={formatPesos(selectedRow?.presupuesto || 0)} />
                <InfoRow label="Neto" value={formatPesos(selectedRow?.neto || 0)} />
              </>
            )}

            {viewMode === 'programa' && (
              <>
                <InfoRow label="Mes Servicio" value={selectedRow?.mesServicio} />
                <InfoRow label="Orden Publicidad" value={selectedRow?.ordenPublicidad} />
                <InfoRow label="Proyecto" value={selectedRow?.sector} />
                <InfoRow label="Subrubro" value={selectedRow?.subrubro} />
                <InfoRow label="Empresa/Programa" value={selectedRow?.empresaPrograma} />
                <InfoRow label="Cant. de gastos" value={selectedRow?.cantidadGastos} />
                <InfoRow label="Asignado" value={formatPesos(selectedRow?.asignado || 0)} />
                <InfoRow label="Ejecutado" value={formatPesos(selectedRow?.ejecutado || 0)} />
                <InfoRow label="Dinero disponible" value={formatPesos(selectedRow?.disponible || 0)} />
              </>
            )}

            {selectedGasto && (
              <>
                <div className="col-span-2 border-t pt-3 mt-2">
                  <span className="text-sm font-medium text-muted-foreground">Datos del gasto cargado</span>
                </div>
                <InfoRow label="Proveedor" value={selectedGasto.proveedor} />
                <InfoRow label="Razón Social" value={selectedGasto.razonSocial} />
                <InfoRow label="Empresa" value={selectedGasto.empresa} />
                <InfoRow label="Factura emitida a" value={selectedGasto.facturaEmitidaA} />
                <InfoRow label="Fecha Factura" value={selectedGasto.fechaFactura ? formatDateDDMMYYYY(selectedGasto.fechaFactura) : '-'} />
                <InfoRow label="Condición Pago" value={selectedGasto.condicionPago ? `${selectedGasto.condicionPago} días` : '-'} />
                <InfoRow label="Forma Pago" value={selectedGasto.formaPago} />
                <InfoRow label="Concepto" value={selectedGasto.conceptoGasto} />
                {selectedGasto.observaciones && (
                  <div className="col-span-2">
                    <InfoRow label="Observaciones" value={selectedGasto.observaciones} />
                  </div>
                )}
              </>
            )}

            {!selectedGasto && selectedRow?.linkedGastoId === undefined && (
              <div className="col-span-2 text-sm text-muted-foreground italic">
                Sin gasto cargado aún
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedRow(null)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              if (selectedRow) {
                onOpen?.(selectedRow.formId, selectedRow.itemId);
                setSelectedRow(null);
              }
            }}>
              Ver más
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
