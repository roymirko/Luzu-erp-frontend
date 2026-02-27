import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { ActionCard } from '@/app/components/ui/action-card';
import { TablaComprobantes } from '@/app/components/shared/TablaComprobantes';
import { TableHeader } from '@/app/components/ui/table-header';
import { Button } from '@/app/components/ui/button';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from '@/app/components/ui/data-table';
import { DataTablePagination } from '@/app/components/ui/data-table-pagination';
import { cn } from '@/app/components/ui/utils';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatCurrency } from '@/app/utils/format';
import * as comprobantesService from '@/app/services/comprobantesService';
import * as ordenesService from '@/app/services/ordenesPublicidadService';
import type { ComprobanteWithContext } from '@/app/types/comprobantes';
import type { OrdenPublicidad } from '@/app/types/comercial';

const ESTADO_OP_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

function getEstadoOpBadgeConfig(estado: string) {
  switch (estado) {
    case 'aprobado':
      return { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', dot: 'bg-green-500' };
    case 'rechazado':
      return { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', dot: 'bg-red-500' };
    default:
      return { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', dot: 'bg-yellow-500' };
  }
}

function EstadoOpBadge({ estado }: { estado: string }) {
  const config = getEstadoOpBadgeConfig(estado);
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap',
      config.bg, config.border, config.text
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dot)} />
      {ESTADO_OP_LABELS[estado] || estado}
    </span>
  );
}

const OP_ITEMS_PER_PAGE = 10;

export function AdminFinanzas() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [comprobantes, setComprobantes] = useState<ComprobanteWithContext[]>([]);
  const [loadingComp, setLoadingComp] = useState(true);
  const [ordenes, setOrdenes] = useState<OrdenPublicidad[]>([]);
  const [loadingOP, setLoadingOP] = useState(true);
  const [opSearch, setOpSearch] = useState('');
  const [opPage, setOpPage] = useState(1);

  const fetchComprobantes = useCallback(async () => {
    setLoadingComp(true);
    try {
      const { data, error } = await comprobantesService.getAllWithContext();
      if (error) {
        console.error('Error fetching comprobantes:', error);
        return;
      }
      setComprobantes(data);
    } finally {
      setLoadingComp(false);
    }
  }, []);

  const fetchOrdenes = useCallback(async () => {
    setLoadingOP(true);
    try {
      const { data, error } = await ordenesService.getAll();
      if (error) {
        console.error('Error fetching ordenes:', error);
        return;
      }
      setOrdenes(data);
    } finally {
      setLoadingOP(false);
    }
  }, []);

  useEffect(() => {
    fetchComprobantes();
    fetchOrdenes();
  }, [fetchComprobantes, fetchOrdenes]);

  const handleRowClick = (comprobante: ComprobanteWithContext) => {
    if (comprobante.tipoMovimiento === 'ingreso') {
      navigate(`/admin-finanzas/ingreso/${comprobante.id}`);
    } else {
      navigate(`/admin-finanzas/egreso/${comprobante.id}`);
    }
  };

  const filteredOrdenes = useMemo(() => {
    if (!opSearch.trim()) return ordenes;
    const term = opSearch.toLowerCase();
    return ordenes.filter((op) =>
      op.ordenPublicidad?.toLowerCase().includes(term) ||
      op.nombreCampana?.toLowerCase().includes(term) ||
      op.razonSocial?.toLowerCase().includes(term)
    );
  }, [ordenes, opSearch]);

  const opTotalPages = Math.ceil(filteredOrdenes.length / OP_ITEMS_PER_PAGE);
  const paginatedOrdenes = useMemo(() => {
    const start = (opPage - 1) * OP_ITEMS_PER_PAGE;
    return filteredOrdenes.slice(start, start + OP_ITEMS_PER_PAGE);
  }, [filteredOrdenes, opPage]);

  return (
    <div className="space-y-6">
      <ActionCard
        title="Nuevo Formulario"
        description="Cargar nuevo ingreso/egreso"
        icon={Plus}
        onClick={() => navigate('/admin-finanzas/nuevo')}
      />

      {/* OP Table */}
      <div className="space-y-4">
        <TableHeader
          title="Órdenes de Publicidad"
          searchValue={opSearch}
          onSearchChange={(v) => { setOpSearch(v); setOpPage(1); }}
          searchPlaceholder="Buscar por OP, campaña, razón social..."
        />

        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>OP #</DataTableHeaderCell>
              <DataTableHeaderCell>Campaña</DataTableHeaderCell>
              <DataTableHeaderCell>Razón Social</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Total Venta</DataTableHeaderCell>
              <DataTableHeaderCell>Estado</DataTableHeaderCell>
              <DataTableHeaderCell>Acciones</DataTableHeaderCell>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {loadingOP ? (
              <DataTableEmpty colSpan={6}>Cargando órdenes...</DataTableEmpty>
            ) : paginatedOrdenes.length === 0 ? (
              <DataTableEmpty colSpan={6}>
                {opSearch ? 'No se encontraron órdenes' : 'No hay órdenes de publicidad'}
              </DataTableEmpty>
            ) : (
              paginatedOrdenes.map((op) => (
                <DataTableRow
                  key={op.id}
                  onClick={() => navigate(`/admin-finanzas/op/${op.id}`)}
                >
                  <DataTableCell>{op.ordenPublicidad}</DataTableCell>
                  <DataTableCell>
                    <div className="max-w-[200px] truncate" title={op.nombreCampana}>
                      {op.nombreCampana || '-'}
                    </div>
                  </DataTableCell>
                  <DataTableCell muted>
                    <div className="max-w-[200px] truncate" title={op.razonSocial}>
                      {op.razonSocial || '-'}
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-right font-medium">
                    {op.totalVenta ? formatCurrency(parseFloat(op.totalVenta)) : '-'}
                  </DataTableCell>
                  <DataTableCell>
                    <EstadoOpBadge estado={op.estadoOp} />
                  </DataTableCell>
                  <DataTableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin-finanzas/op/${op.id}`);
                      }}
                      className={cn(
                        'h-8 w-8 p-0',
                        isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      )}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>

        <DataTablePagination
          currentPage={opPage}
          totalPages={opTotalPages}
          onPageChange={setOpPage}
        />
      </div>

      <TablaComprobantes
        comprobantes={comprobantes}
        loading={loadingComp}
        onRowClick={handleRowClick}
        title="Comprobantes"
      />
    </div>
  );
}
