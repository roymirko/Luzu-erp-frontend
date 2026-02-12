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

const COLUMNS_ORDEN = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Orden de Publicidad', 'Presupuesto', 'Dinero Disponible', 'Cant. de programas',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Neto Total', 'Acciones'
];

const COLUMNS_PROGRAMA = [
  'Estado', 'Mes de servicio', 'Fecha de registro', 'Responsable', 'Unidad de negocio',
  'Categoría de negocio', 'Marca', 'Empresa/Programa', 'Detalle de Publicidad', 'Presupuesto', 'Dinero Disponible',
  'Sector', 'Rubro de gasto', 'Sub rubro', 'Nombre de campaña', 'Acuerdo de pago', 'Neto', 'Acciones'
];

const VIEW_MODE_OPTIONS = [
  { value: 'programa', label: 'Programa' },
  { value: 'orden', label: 'Orden de Publicidad' },
];

type ViewMode = 'orden' | 'programa';

type ProgramaRow = {
  id: string;
  formId: string;
  itemId?: string;
  linkedGastoId?: string;
  isStandalone?: boolean;
  estado: string;
  mesServicio: string;
  fechaRegistro: string;
  responsable: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  marca: string;
  empresaPrograma: string;
  ordenPublicidad: string;
  presupuesto: number;
  sector: string;
  rubro: string;
  subRubro: string;
  nombreCampana: string;
  acuerdoPago: string;
  neto: number;
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
  const [viewMode, setViewMode] = useState<ViewMode>('orden');
  const [selectedRow, setSelectedRow] = useState<ProgramaRow | null>(null);

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

  // Rows for "Orden de Publicidad" view (grouped)
  const rowsOrden = useMemo(() => {
    const fromFormularios = formularios.flatMap((form) => {
      if (!Array.isArray(form.importeRows)) return [] as any[];

      const itemsWithTecnica = form.importeRows.filter((item) => {
        const v = parseFloat(String(item.tecnica || '0').replace(/[^0-9.-]/g, ''));
        return !isNaN(v) && v > 0;
      });

      if (itemsWithTecnica.length === 0) return [];

      const linkedGastos = gastos.filter(g =>
        g.ordenPublicidadId === form.id
      );

      const totalPresupuesto = itemsWithTecnica.reduce((sum, item) => {
        return sum + parseFloat(String(item.tecnica || '0').replace(/[^0-9.-]/g, ''));
      }, 0);

      const totalNeto = linkedGastos.reduce((sum, g) => sum + (g.neto || 0), 0);

      const fechaRegistro = linkedGastos.length > 0
        ? formatDateDDMMYYYY(linkedGastos.reduce((earliest, g) =>
            new Date(g.createdAt) < new Date(earliest.createdAt) ? g : earliest
          ).createdAt)
        : '-';

      return [{
        id: form.id,
        formId: form.id,
        itemId: undefined,
        estado: linkedGastos.length > 0 ? 'Activo' : 'Pendiente de carga',
        mesServicio: formatMesServicio(form.mesServicio),
        fechaRegistro,
        responsable: form.responsable,
        unidadNegocio: form.unidadNegocio,
        categoriaNegocio: form.categoriaNegocio || 'N/A',
        marca: form.marca || '-',
        ordenPublicidad: form.ordenPublicidad,
        presupuesto: totalPresupuesto,
        dineroDisponible: totalPresupuesto - totalNeto,
        cantidadProgramas: itemsWithTecnica.length,
        sector: 'Técnica',
        rubro: 'Gasto de venta',
        subRubro: '-',
        nombreCampana: form.nombreCampana || '-',
        netoTotal: totalNeto,
      }];
    });

    const formIds = new Set(formularios.map(f => f.id));
    const standaloneRaw = gastos.filter(g => !g.ordenPublicidadId || !formIds.has(g.ordenPublicidadId));

    // Group standalone gastos by nombreCampana so they appear as one row
    const groupedByName = new Map<string, typeof standaloneRaw>();
    for (const g of standaloneRaw) {
      const key = g.nombreCampana || g.id;
      const group = groupedByName.get(key) || [];
      group.push(g);
      groupedByName.set(key, group);
    }

    const standaloneGastos = Array.from(groupedByName.values()).map((group) => {
      const first = group[0];
      const netoTotal = group.reduce((sum, g) => sum + (g.neto || 0), 0);
      return {
        id: first.id,
        formId: '',
        itemId: undefined,
        isStandalone: true,
        estado: first.estado === 'pendiente' ? 'Pendiente' : first.estado === 'activo' ? 'Activo' : first.estado === 'cerrado' ? 'Cerrado' : 'Anulado',
        mesServicio: formatMesServicio(first.mesServicio),
        fechaRegistro: formatDateDDMMYYYY(first.createdAt),
        responsable: first.responsable || '-',
        unidadNegocio: first.unidadNegocio || '-',
        categoriaNegocio: first.categoriaNegocio || 'N/A',
        marca: first.marca || '-',
        ordenPublicidad: '-',
        presupuesto: 0,
        dineroDisponible: 0,
        cantidadProgramas: group.length,
        sector: first.sector || '-',
        rubro: first.rubro || '-',
        subRubro: first.subRubro || '-',
        nombreCampana: first.nombreCampana || '-',
        netoTotal,
      };
    });

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

  // Rows for "Programa" view (individual)
  const rowsPrograma = useMemo(() => {
    const fromFormularios = formularios.flatMap((form) => {
      if (!Array.isArray(form.importeRows)) return [] as any[];
      return form.importeRows
        .filter((item) => {
          const v = parseFloat(String(item.tecnica || '0').replace(/[^0-9.-]/g, ''));
          return !isNaN(v) && v > 0;
        })
        .map((item) => {
          const linkedGasto = gastos.find(g =>
            g.ordenPublicidadId === form.id &&
            g.itemOrdenPublicidadId === item.id
          );

          const presupuestoTecnica = parseFloat(String(item.tecnica || '0').replace(/[^0-9.-]/g, ''));
          const netoGastado = linkedGasto?.neto || 0;

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
            presupuesto: presupuestoTecnica,
            dineroDisponible: presupuestoTecnica - netoGastado,
            sector: 'Técnica',
            rubro: linkedGasto?.rubro || 'Gasto de venta',
            subRubro: linkedGasto?.subRubro || '-',
            nombreCampana: form.nombreCampana || '-',
            acuerdoPago: linkedGasto?.acuerdoPago || '-',
            neto: netoGastado,
          };
        });
    });

    const formItemIds = new Set(fromFormularios.map(r => r.linkedGastoId).filter(Boolean));

    const standaloneImportes = gastos
      .filter(g => !formItemIds.has(g.id))
      .map((gasto) => {
        const netoGasto = gasto.neto || 0;
        return {
          id: gasto.id,
          formId: '',
          itemId: undefined,
          linkedGastoId: gasto.id,
          isStandalone: true,
          estado: gasto.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente de pago',
          mesServicio: formatMesServicio(gasto.mesServicio),
          fechaRegistro: formatDateDDMMYYYY(gasto.createdAt),
          responsable: gasto.responsable || '-',
          unidadNegocio: gasto.unidadNegocio || '-',
          categoriaNegocio: gasto.categoriaNegocio || 'N/A',
          marca: gasto.marca || '-',
          empresaPrograma: gasto.sector || '-',
          ordenPublicidad: gasto.ordenPublicidad || '-',
          presupuesto: netoGasto,
          dineroDisponible: 0,
          sector: gasto.sector || '-',
          rubro: gasto.rubro || '-',
          subRubro: gasto.subRubro || '-',
          nombreCampana: gasto.nombreCampana || '-',
          acuerdoPago: gasto.acuerdoPago || '-',
          neto: netoGasto,
        };
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
                } else if (row.isStandalone) {
                  onOpenStandalone?.(row.id);
                } else {
                  onOpen?.(row.formId, row.itemId);
                }
              }}>
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
                    <DataTableCell>{formatPesos(row.dineroDisponible)}</DataTableCell>
                    <DataTableCell>{row.cantidadProgramas}</DataTableCell>
                    <DataTableCell muted>{row.sector}</DataTableCell>
                    <DataTableCell muted>{row.rubro}</DataTableCell>
                    <DataTableCell muted>{row.subRubro}</DataTableCell>
                    <DataTableCell muted>{row.nombreCampana}</DataTableCell>
                    <DataTableCell>{formatPesos(row.netoTotal)}</DataTableCell>
                  </>
                ) : (
                  <>
                    <DataTableCell>{row.empresaPrograma}</DataTableCell>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{formatPesos(row.presupuesto)}</DataTableCell>
                    <DataTableCell>{formatPesos(row.dineroDisponible)}</DataTableCell>
                    <DataTableCell muted>{row.sector}</DataTableCell>
                    <DataTableCell muted>{row.rubro}</DataTableCell>
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
                        if (row.isStandalone) {
                          onOpenStandalone?.(row.id);
                        } else {
                          onOpen?.(row.formId, row.itemId);
                        }
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
            <DialogTitle>Detalle del Gasto</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <InfoRow label="Estado" value={selectedRow?.estado} />
            <InfoRow label="Programa" value={selectedRow?.empresaPrograma} />
            <InfoRow label="Orden Publicidad" value={selectedRow?.ordenPublicidad} />
            <InfoRow label="Presupuesto" value={formatPesos(selectedRow?.presupuesto || 0)} />
            <InfoRow label="Neto" value={formatPesos(selectedRow?.neto || 0)} />
            <InfoRow label="Responsable" value={selectedRow?.responsable} />
            <InfoRow label="Mes Servicio" value={selectedRow?.mesServicio} />
            <InfoRow label="Acuerdo Pago" value={selectedRow?.acuerdoPago} />

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
                if ((selectedRow as any).isStandalone) {
                  onOpenStandalone?.(selectedRow.id);
                } else {
                  onOpen?.(selectedRow.formId, selectedRow.itemId);
                }
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
