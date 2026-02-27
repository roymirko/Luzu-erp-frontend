import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { FormDatePicker } from '@/app/components/ui/form-date-picker';
import { OrdenPublicidadSelector } from '@/app/components/shared/OrdenPublicidadSelector';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { formatCurrency } from '@/app/utils/format';
import { useTheme } from '@/app/contexts/ThemeContext';
import { CheckCircle, AlertCircle, CreditCard, ArrowLeft, Paperclip } from 'lucide-react';
import * as comprobantesService from '@/app/services/comprobantesService';
import type {
  ComprobanteWithContext,
  EstadoPago,
  FormaPago,
} from '@/app/types/comprobantes';
import type { OrdenPublicidad } from '@/app/types/comercial';
import {
  ESTADO_PAGO_LABELS,
  FORMA_PAGO_LABELS,
  isComprobanteLocked,
} from '@/app/types/comprobantes';

interface FormularioAdminIngresoProps {
  comprobanteId: string;
  onClose: () => void;
}

const FORMA_PAGO_OPTIONS: FormaPago[] = ['transferencia', 'cheque', 'efectivo', 'tarjeta', 'otro'];

const ACUERDO_PAGO_OPTIONS = [
  { value: '0', label: 'Contado' },
  { value: '30', label: '30 días' },
  { value: '60', label: '60 días' },
  { value: '90', label: '90 días' },
  { value: '120', label: '120 días' },
];

function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calcularDiasTranscurridos(fechaVencimiento: string | undefined): number {
  if (!fechaVencimiento) return 0;
  const venc = new Date(fechaVencimiento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  venc.setHours(0, 0, 0, 0);
  const diff = Math.floor((hoy.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function FormularioAdminIngreso({ comprobanteId, onClose }: FormularioAdminIngresoProps) {
  const { isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comprobante, setComprobante] = useState<ComprobanteWithContext | null>(null);
  const [selectedOp, setSelectedOp] = useState<OrdenPublicidad | null>(null);

  const [form, setForm] = useState({
    entidadNombre: '',
    entidadCuit: '',
    empresa: '',
    formaPago: '' as FormaPago | '',
    acuerdoPago: '',
    fechaComprobante: '',
    fechaVencimiento: '',
    numeroComprobante: '',
    neto: '',
    total: '',
    retencionIva: '0',
    ingresosBrutos: '0',
    retencionGanancias: '0',
    retencionSuss: '0',
    certificacionEnviadaFecha: '',
    observaciones: '',
    ordenPublicidadIdIngreso: '',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await comprobantesService.getByIdWithContext(comprobanteId);
      if (error || !data) {
        toast.error(error || 'Comprobante no encontrado');
        onClose();
        return;
      }
      setComprobante(data);
      setForm({
        entidadNombre: data.entidadNombre || '',
        entidadCuit: data.entidadCuit || '',
        empresa: data.empresa || '',
        formaPago: data.formaPago || '',
        acuerdoPago: data.acuerdoPago || '',
        fechaComprobante: formatDate(data.fechaComprobante),
        fechaVencimiento: formatDate(data.fechaVencimiento),
        numeroComprobante: data.numeroComprobante || '',
        neto: data.neto?.toString() || '',
        total: data.total?.toString() || '',
        retencionIva: data.retencionIva?.toString() || '0',
        ingresosBrutos: data.ingresosBrutos?.toString() || '0',
        retencionGanancias: data.retencionGanancias?.toString() || '0',
        retencionSuss: data.retencionSuss?.toString() || '0',
        certificacionEnviadaFecha: formatDate(data.certificacionEnviadaFecha),
        observaciones: data.observaciones || '',
        ordenPublicidadIdIngreso: data.ordenPublicidadIdIngreso || '',
      });
      if (data.ingresoOpId) {
        setSelectedOp({
          id: data.ingresoOpId,
          ordenPublicidad: data.ingresoOpNumero || '',
          responsable: data.ingresoOpResponsable || '',
          unidadNegocio: data.ingresoOpUnidadNegocio || '',
          nombreCampana: data.ingresoOpNombreCampana || '',
          marca: data.ingresoOpMarca || '',
          razonSocial: data.ingresoOpRazonSocial || '',
          totalVenta: data.ingresoOpImporte || '',
          acuerdoPago: data.ingresoOpAcuerdoPago || '',
          mesServicio: data.ingresoOpMesServicio || '',
        } as OrdenPublicidad);
      }
      setLoading(false);
    })();
  }, [comprobanteId]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpSelect = (op: OrdenPublicidad | null) => {
    setSelectedOp(op);
    setForm(prev => ({ ...prev, ordenPublicidadIdIngreso: op?.id || '' }));
  };

  const totalACobrar = useMemo(() => {
    const total = parseFloat(form.total) || 0;
    const retIva = parseFloat(form.retencionIva) || 0;
    const retIIBB = parseFloat(form.ingresosBrutos) || 0;
    const retGanancias = parseFloat(form.retencionGanancias) || 0;
    const retSuss = parseFloat(form.retencionSuss) || 0;
    return total - retIva - retIIBB - retGanancias - retSuss;
  }, [form.total, form.retencionIva, form.ingresosBrutos, form.retencionGanancias, form.retencionSuss]);

  const diasTranscurridos = useMemo(() => calcularDiasTranscurridos(form.fechaVencimiento), [form.fechaVencimiento]);

  const handleGuardar = async (nuevoEstado: EstadoPago) => {
    if (!comprobante) return;
    setSaving(true);
    try {
      const { error: updateError } = await comprobantesService.update({
        id: comprobante.id,
        entidadNombre: form.entidadNombre,
        entidadCuit: form.entidadCuit || undefined,
        empresa: form.empresa || undefined,
        formaPago: form.formaPago as FormaPago || undefined,
        acuerdoPago: form.acuerdoPago || undefined,
        fechaComprobante: form.fechaComprobante ? new Date(form.fechaComprobante) : undefined,
        fechaVencimiento: form.fechaVencimiento ? new Date(form.fechaVencimiento) : undefined,
        numeroComprobante: form.numeroComprobante || undefined,
        neto: parseFloat(form.neto) || 0,
        total: parseFloat(form.total) || 0,
        retencionIva: parseFloat(form.retencionIva) || 0,
        ingresosBrutos: parseFloat(form.ingresosBrutos) || 0,
        retencionGanancias: parseFloat(form.retencionGanancias) || 0,
        retencionSuss: parseFloat(form.retencionSuss) || 0,
        certificacionEnviadaFecha: form.certificacionEnviadaFecha ? new Date(form.certificacionEnviadaFecha) : undefined,
        observaciones: form.observaciones || undefined,
        ordenPublicidadIdIngreso: form.ordenPublicidadIdIngreso || undefined,
      });
      if (updateError) { toast.error(updateError); return; }

      const { data, error } = await comprobantesService.updateEstadoPagoWithValidation(comprobante.id, nuevoEstado);
      if (error) { toast.error(error); return; }
      if (data) {
        toast.success(`Estado cambiado a "${ESTADO_PAGO_LABELS[nuevoEstado]}"`);
        onClose();
      }
    } finally { setSaving(false); }
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoPago) => {
    if (!comprobante) return;
    setSaving(true);
    try {
      const { data, error } = await comprobantesService.updateEstadoPagoWithValidation(comprobante.id, nuevoEstado);
      if (error) { toast.error(error); return; }
      if (data) {
        toast.success(`Estado cambiado a "${ESTADO_PAGO_LABELS[nuevoEstado]}"`);
        onClose();
      }
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!comprobante) return null;

  const locked = isComprobanteLocked(comprobante.estadoPago);
  const isCerrado = comprobante.estadoPago === 'rechazado' || comprobante.estadoPago === 'pagado';

  const inputClass = cn(
    'h-9 text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    locked && 'opacity-60 cursor-not-allowed',
  );

  const selectClass = cn(
    'h-9 w-full text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white'
      : 'bg-white border-[#d1d5db] text-gray-900',
    locked && 'opacity-60 cursor-not-allowed',
  );

  // Context items from OP
  const contextItems: { label: string; value: string }[] = [];
  if (selectedOp) {
    if (selectedOp.ordenPublicidad) contextItems.push({ label: 'Orden de Publicidad', value: selectedOp.ordenPublicidad });
    if (selectedOp.totalVenta) contextItems.push({ label: 'Importe OP', value: `$ ${Number(selectedOp.totalVenta).toLocaleString('es-AR')}` });
    if (selectedOp.mesServicio) contextItems.push({ label: 'Mes de Servicio', value: selectedOp.mesServicio });
    if (selectedOp.unidadNegocio) contextItems.push({ label: 'Unidad de Negocio', value: selectedOp.unidadNegocio });
    if (selectedOp.nombreCampana) contextItems.push({ label: 'Campaña', value: selectedOp.nombreCampana });
    if (selectedOp.marca) contextItems.push({ label: 'Marca', value: selectedOp.marca });
    if (selectedOp.razonSocial) contextItems.push({ label: 'Razón Social', value: selectedOp.razonSocial });
    if (selectedOp.acuerdoPago) contextItems.push({ label: 'Condición Pago', value: `${selectedOp.acuerdoPago} días` });
  }

  return (
    <div className="pb-24">
      <div className="max-w-[620px] mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
            Revisión de ingreso
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
            Revisá la información del ingreso antes de avanzar. Verificá que los datos sean correctos y estén completos.
          </p>
        </div>

        {/* OP Selector */}
        <div className={cn(
          'rounded-lg border p-6',
          isDark ? 'border-gray-800 bg-[#141414]' : 'border-gray-200 bg-white',
        )}>
          <div className="space-y-1.5">
            <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
              Vincular a Orden de Publicidad
            </Label>
            <OrdenPublicidadSelector value={form.ordenPublicidadIdIngreso} onChange={handleOpSelect} disabled={locked} />
          </div>
        </div>

        {/* Context Card (from OP) */}
        {contextItems.length > 0 && (
          <div className={cn(
            'rounded-lg border p-6',
            isDark ? 'border-gray-800 bg-[#141414]' : 'border-gray-200 bg-white',
          )}>
            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
              {contextItems.map((item, i) => (
                <div key={i}>
                  <p className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>{item.label}</p>
                  <p className={cn('text-sm font-semibold mt-0.5', isDark ? 'text-white' : 'text-gray-900')}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className={cn(
          'rounded-lg border p-6',
          isDark ? 'border-gray-800 bg-[#141414]' : 'border-gray-200 bg-white',
        )}>
          <h2 className="text-base font-semibold text-blue-600 mb-5">Ingreso #1</h2>

          <div className="space-y-5">
            {/* Row 1: Razón Social, CUIT, Empresa */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Razón Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.entidadNombre}
                  onChange={(e) => handleChange('entidadNombre', e.target.value)}
                  disabled={locked}
                  placeholder="Buscar por nombre o cuit"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  CUIT
                </Label>
                <Input
                  value={form.entidadCuit}
                  disabled
                  placeholder="Se autocompleta"
                  className={cn(inputClass, 'opacity-60 cursor-not-allowed')}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  disabled={locked}
                  placeholder="Seleccionar"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: Forma de pago, Acuerdo de pago */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Forma de pago <span className="text-red-500">*</span>
                </Label>
                <Select value={form.formaPago} onValueChange={(v) => handleChange('formaPago', v)} disabled={locked}>
                  <SelectTrigger className={selectClass}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {FORMA_PAGO_OPTIONS.map((fp) => (
                      <SelectItem key={fp} value={fp}>{FORMA_PAGO_LABELS[fp]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Acuerdo de pago
                </Label>
                <Select value={form.acuerdoPago} onValueChange={(v) => handleChange('acuerdoPago', v)} disabled={locked}>
                  <SelectTrigger className={selectClass}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {ACUERDO_PAGO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Fecha comprobante, N° comprobante, Fecha vencimiento */}
            <div className="grid grid-cols-3 gap-4">
              <FormDatePicker
                label="Fecha de comprobante"
                value={form.fechaComprobante}
                onChange={(v) => handleChange('fechaComprobante', v)}
                disabled={locked}
              />
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  N° de comprobante
                </Label>
                <Input
                  value={form.numeroComprobante}
                  onChange={(e) => handleChange('numeroComprobante', e.target.value)}
                  disabled={locked}
                  placeholder="xx"
                  className={inputClass}
                />
              </div>
              <FormDatePicker
                label="Fecha vencimiento"
                value={form.fechaVencimiento}
                onChange={(v) => handleChange('fechaVencimiento', v)}
                disabled={locked}
              />
            </div>

            {/* Row 4: Total, Neto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Total Factura <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.total}
                    onChange={(e) => handleChange('total', e.target.value)}
                    disabled={locked}
                    placeholder="0"
                    className={cn(inputClass, 'pl-7')}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Neto
                </Label>
                <div className="relative">
                  <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.neto}
                    onChange={(e) => handleChange('neto', e.target.value)}
                    disabled={locked}
                    placeholder="0"
                    className={cn(inputClass, 'pl-7')}
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Retenciones */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>Ret. IVA</Label>
                <div className="relative">
                  <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>$</span>
                  <Input type="number" step="0.01" value={form.retencionIva} onChange={(e) => handleChange('retencionIva', e.target.value)} disabled={locked} className={cn(inputClass, 'pl-7')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>Ret. IIBB</Label>
                <div className="relative">
                  <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>$</span>
                  <Input type="number" step="0.01" value={form.ingresosBrutos} onChange={(e) => handleChange('ingresosBrutos', e.target.value)} disabled={locked} className={cn(inputClass, 'pl-7')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>Ret. Ganancias</Label>
                <div className="relative">
                  <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>$</span>
                  <Input type="number" step="0.01" value={form.retencionGanancias} onChange={(e) => handleChange('retencionGanancias', e.target.value)} disabled={locked} className={cn(inputClass, 'pl-7')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>Ret. SUSS</Label>
                <div className="relative">
                  <span className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>$</span>
                  <Input type="number" step="0.01" value={form.retencionSuss} onChange={(e) => handleChange('retencionSuss', e.target.value)} disabled={locked} className={cn(inputClass, 'pl-7')} />
                </div>
              </div>
            </div>

            {/* Row 6: Total a Cobrar + Días transcurridos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-semibold', isDark ? 'text-green-400' : 'text-green-700')}>Total a Cobrar</Label>
                <div className={cn(
                  'h-9 px-3 flex items-center rounded-md border text-sm font-bold',
                  isDark ? 'bg-gray-900 border-gray-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700',
                )}>
                  {formatCurrency(totalACobrar, comprobante.moneda)}
                </div>
              </div>
              {diasTranscurridos > 0 && (
                <div className="space-y-1.5">
                  <Label className={cn('text-xs font-medium', isDark ? 'text-red-400' : 'text-red-600')}>Días transcurridos</Label>
                  <div className={cn(
                    'h-9 px-3 flex items-center rounded-md border text-sm font-medium',
                    isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700',
                  )}>
                    {diasTranscurridos} días
                  </div>
                </div>
              )}
            </div>

            {/* Row 7: Certificación */}
            <div className="grid grid-cols-2 gap-4">
              <FormDatePicker
                label="Certificación enviada"
                value={form.certificacionEnviadaFecha}
                onChange={(v) => handleChange('certificacionEnviadaFecha', v)}
                disabled={locked}
              />
            </div>

            {/* Row 8: Concepto / Observaciones */}
            <div className="space-y-1.5">
              <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                Concepto del ingreso
              </Label>
              <Textarea
                value={form.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                disabled={locked}
                placeholder="Escribe aqui"
                rows={3}
                className={cn(
                  'resize-none text-sm',
                  isDark
                    ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
                    : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
                  locked && 'opacity-60 cursor-not-allowed',
                )}
              />
            </div>

            {/* Adjuntos link */}
            <div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Adjuntos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 border-t z-50',
        isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-white border-gray-200',
      )}>
        <div className="max-w-[620px] mx-auto flex items-center justify-end gap-3 py-3 px-4">
          {(comprobante.estadoPago === 'creado' || comprobante.estadoPago === 'requiere_info') && (
            <>
              <Button
                variant="outline"
                onClick={() => handleCambiarEstado('requiere_info')}
                disabled={saving}
                className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                <AlertCircle className="h-4 w-4" />
                Solicitar más información
              </Button>
              <Button
                onClick={() => handleGuardar('aprobado')}
                disabled={saving}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Aprobar Ingreso
              </Button>
            </>
          )}
          {comprobante.estadoPago === 'aprobado' && (
            <Button
              onClick={() => handleCambiarEstado('pagado')}
              disabled={saving}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="h-4 w-4" />
              Marcar Cobrado
            </Button>
          )}
          {isCerrado && (
            <Button
              variant="outline"
              onClick={onClose}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
