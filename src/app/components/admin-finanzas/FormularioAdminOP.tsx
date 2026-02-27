import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { useTheme } from '@/app/contexts/ThemeContext';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import * as ordenesService from '@/app/services/ordenesPublicidadService';
import { formatCurrency } from '@/app/utils/format';
import type { OrdenPublicidad, ItemOrdenPublicidad } from '@/app/types/comercial';

interface FormularioAdminOPProps {
  ordenId: string;
  onClose: () => void;
}

function parseNum(val: string | undefined): number {
  const n = parseFloat(String(val || '0').replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function computeSummary(items: ItemOrdenPublicidad[]) {
  let totalVenta = 0;
  let totalNC = 0;
  let totalFee = 0;
  let totalGastoVenta = 0;

  for (const item of items) {
    const monto = parseNum(item.monto);
    const nc = parseNum(item.ncPrograma);
    const fee = parseNum(item.feePrograma);
    const impl = parseNum(item.implementacion);
    const tal = parseNum(item.talentos);
    const tec = parseNum(item.tecnica);

    totalVenta += monto;
    totalNC += nc;
    totalFee += fee;
    totalGastoVenta += impl + tal + tec;
  }

  const utilidad = totalVenta - totalNC - totalFee - totalGastoVenta;
  return { totalVenta, totalNC, totalFee, totalGastoVenta, utilidad };
}

function pct(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export function FormularioAdminOP({ ordenId, onClose }: FormularioAdminOPProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orden, setOrden] = useState<OrdenPublicidad | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await ordenesService.getById(ordenId);
      if (error || !data) {
        toast.error('Error al cargar la orden de publicidad');
        onClose();
        return;
      }
      setOrden(data);
      setLoading(false);
    })();
  }, [ordenId, onClose]);

  const handleUpdateEstado = async (estado: 'aprobado' | 'rechazado') => {
    if (!orden) return;
    setSaving(true);
    const { success, error } = await ordenesService.updateEstadoOp(orden.id, estado);
    setSaving(false);
    if (error || !success) {
      toast.error(`Error al ${estado === 'aprobado' ? 'aprobar' : 'rechazar'} la OP`);
      return;
    }
    setOrden({ ...orden, estadoOp: estado });
    toast.success(estado === 'aprobado' ? 'OP aprobada correctamente' : 'OP rechazada');
  };

  if (loading || !orden) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  const summary = computeSummary(orden.items);
  const isAprobado = orden.estadoOp === 'aprobado';
  const isRechazado = orden.estadoOp === 'rechazado';
  const isPendiente = orden.estadoOp === 'pendiente';

  const cardBg = isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200';
  const grayBg = isDark ? 'bg-[#111] border-gray-800' : 'bg-gray-50 border-gray-200';

  // Parse mes_servicio "2024-01" into year + month
  const [mesYear, mesMonth] = (orden.mesServicio || '').split('-');

  const monthNames: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
  };

  return (
    <div className="max-w-[620px] mx-auto pb-28 space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          Orden de Publicidad: {orden.ordenPublicidad}
        </h1>
        <p className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
          Revisá la información de la OP antes de avanzar con la facturación. Verificá que los datos sean correctos y estén completos.
        </p>
      </div>

      {/* Context card */}
      <div className={cn('rounded-lg border p-4', grayBg)}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>Responsable</Label>
            <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>
              {orden.responsable || '-'}
            </p>
          </div>
          <div>
            <Label className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>Fecha de creación</Label>
            <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>
              {orden.fecha || orden.createdAt.toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Form card — all readonly */}
      <div className={cn('rounded-lg border p-5 space-y-4', cardBg)}>
        {/* Row: OP, Total Venta, Mes servicio */}
        <div className="grid grid-cols-3 gap-3">
          <ReadonlyField label="Orden de Publicidad *" value={orden.ordenPublicidad} isDark={isDark} />
          <ReadonlyField label="Total de Venta *" value={orden.totalVenta ? `$${orden.totalVenta}` : '-'} isDark={isDark} />
          <div>
            <Label className={cn('text-xs mb-1 block', isDark ? 'text-gray-400' : 'text-gray-600')}>Mes de servicio *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={mesYear || ''} disabled className="text-sm" />
              <Input value={monthNames[mesMonth] || mesMonth || ''} disabled className="text-sm" />
            </div>
          </div>
        </div>

        {/* Row: Unidad Negocio, Categoria Negocio */}
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Unidad de Negocio *" value={orden.unidadNegocio} isDark={isDark} />
          <ReadonlyField label="Categoría de Negocio" value={orden.categoriaNegocio} isDark={isDark} />
        </div>

        {/* Proyecto */}
        <ReadonlyField label="Proyecto" value={orden.proyecto} isDark={isDark} />

        {/* Row: Razón Social, Proveedor */}
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Razón Social *" value={orden.razonSocial} isDark={isDark} />
          <ReadonlyField label="Proveedor *" value={orden.empresaAgencia} isDark={isDark} />
        </div>

        {/* Row: Categoría, Marca */}
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Categoría *" value={orden.categoria} isDark={isDark} />
          <ReadonlyField label="Marca *" value={orden.marca} isDark={isDark} />
        </div>

        {/* Nombre de Campaña */}
        <ReadonlyField label="Nombre de Campaña" value={orden.nombreCampana} isDark={isDark} />
      </div>

      {/* Carga de importes */}
      <div className="space-y-4">
        <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
          Carga de importes
        </h2>

        {/* Acuerdo de Pago */}
        <ReadonlyField label="Acuerdo de Pago" value={orden.acuerdoPago} isDark={isDark} />

        {/* Items */}
        {orden.items.map((item, idx) => (
          <ItemCard key={item.id} item={item} index={idx} isDark={isDark} />
        ))}

        {/* Canje / Factura */}
        <div className="flex items-center gap-3">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm',
            orden.tipoImporte === 'canje'
              ? 'bg-gray-100 border-gray-300 text-gray-700 font-medium'
              : isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
          )}>
            Canje
          </span>
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm',
            orden.tipoImporte === 'factura'
              ? 'bg-green-50 border-green-400 text-green-700 font-medium'
              : isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
          )}>
            {orden.tipoImporte === 'factura' && <CheckCircle className="h-3.5 w-3.5" />}
            Factura
          </span>
        </div>

        {/* Concepto del gasto */}
        <div>
          <Label className={cn('text-sm mb-1 block', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Concepto del gasto
          </Label>
          <Textarea
            value={orden.observaciones || ''}
            disabled
            placeholder="Agregar observaciones adicionales"
            className="resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="space-y-3">
        <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
          Resumen
        </h2>
        <div className="grid grid-cols-5 gap-2">
          <SummaryTile label="Total de venta" value={formatCurrency(summary.totalVenta)} sub={pct(summary.totalVenta, summary.totalVenta)} isDark={isDark} />
          <SummaryTile label="Total Nota de Crédito" value={formatCurrency(summary.totalNC)} sub={pct(summary.totalNC, summary.totalVenta)} isDark={isDark} />
          <SummaryTile label="Total FEE Facturado" value={formatCurrency(summary.totalFee)} sub={pct(summary.totalFee, summary.totalVenta)} isDark={isDark} />
          <SummaryTile label="Total gasto de venta" value={formatCurrency(summary.totalGastoVenta)} sub={pct(summary.totalGastoVenta, summary.totalVenta)} isDark={isDark} />
          <SummaryTile label="Utilidad de Proyecto" value={formatCurrency(summary.utilidad)} sub={pct(summary.utilidad, summary.totalVenta)} isDark={isDark} />
        </div>
      </div>

      {/* Estado badge (when not pendiente) */}
      {isAprobado && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-400 text-green-700 font-medium">
            <CheckCircle className="h-4 w-4" /> OP Aprobada
          </span>
        </div>
      )}
      {isRechazado && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-400 text-red-700 font-medium">
            <XCircle className="h-4 w-4" /> OP Rechazada
          </span>
        </div>
      )}

      {/* Sticky footer */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 border-t px-6 py-3 flex items-center justify-end gap-3 z-40',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'
      )}>
        {isPendiente ? (
          <>
            <Button
              variant="outline"
              onClick={() => handleUpdateEstado('rechazado')}
              disabled={saving}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Rechazar OP
            </Button>
            <Button
              onClick={() => handleUpdateEstado('aprobado')}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Aprobar OP
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Volver
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function ReadonlyField({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div>
      <Label className={cn('text-xs mb-1 block', isDark ? 'text-gray-400' : 'text-gray-600')}>{label}</Label>
      <Input value={value || '-'} disabled className="text-sm" />
    </div>
  );
}

function ItemCard({ item, index, isDark }: { item: ItemOrdenPublicidad; index: number; isDark: boolean }) {
  const cardBg = isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200';

  return (
    <div className={cn('rounded-lg border p-4 space-y-3', cardBg)}>
      <h3 className={cn('text-sm font-semibold text-red-500')}>Programa {index + 1}</h3>

      {/* Row: Programa, Monto, NC Programa, % */}
      <div className="grid grid-cols-4 gap-2">
        <ReadonlyField label="Programa" value={item.programa} isDark={isDark} />
        <ReadonlyField label="Monto" value={item.monto ? `$${item.monto}` : '-'} isDark={isDark} />
        <ReadonlyField label="NC Programa" value={item.ncPrograma ? `$${item.ncPrograma}` : '$0'} isDark={isDark} />
        <ReadonlyField label="%" value={item.ncPorcentaje || '0'} isDark={isDark} />
      </div>

      {/* Row: Proveedor FEE, FEE Programa, % */}
      <div className="grid grid-cols-3 gap-2">
        <ReadonlyField label="Proveedor FEE" value={item.proveedorFee} isDark={isDark} />
        <ReadonlyField label="FEE Programa" value={item.feePrograma} isDark={isDark} />
        <ReadonlyField label="%" value={item.feePorcentaje || '0'} isDark={isDark} />
      </div>

      {/* Row: Implementación, Talentos, Técnica */}
      <div className="grid grid-cols-3 gap-2">
        <ReadonlyField label="Implementación" value={item.implementacion ? `$${item.implementacion}` : '-'} isDark={isDark} />
        <ReadonlyField label="Talentos" value={item.talentos} isDark={isDark} />
        <ReadonlyField label="Técnica" value={item.tecnica} isDark={isDark} />
      </div>
    </div>
  );
}

function SummaryTile({ label, value, sub, isDark }: { label: string; value: string; sub: string; isDark: boolean }) {
  return (
    <div className={cn(
      'rounded-lg border p-3 text-center',
      isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-50 border-gray-200'
    )}>
      <p className={cn('text-[10px] leading-tight mb-1', isDark ? 'text-gray-400' : 'text-gray-500')}>{label}</p>
      <p className={cn('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>{value}</p>
      <p className={cn('text-[10px]', isDark ? 'text-gray-500' : 'text-gray-400')}>{sub}</p>
    </div>
  );
}
