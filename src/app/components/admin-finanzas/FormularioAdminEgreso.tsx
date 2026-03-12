import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { FormSelect } from '@/app/components/ui/form-select';
import { FormDatePicker } from '@/app/components/ui/form-date-picker';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { useTheme } from '@/app/contexts/ThemeContext';
import { CheckCircle, AlertCircle, CreditCard, ArrowLeft, Paperclip } from 'lucide-react';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import * as comprobantesService from '@/app/services/comprobantesService';
import type {
  ComprobanteWithContext,
  EstadoPago,
  FormaPago,
} from '@/app/types/comprobantes';
import {
  ESTADO_PAGO_LABELS,
  AREA_ORIGEN_LABELS,
  isComprobanteLocked,
} from '@/app/types/comprobantes';
import {
  FORMAS_PAGO_OPTIONS,
  ACUERDOS_PAGO_OPTIONS,
} from '@/app/utils/implementacionConstants';

interface FormularioAdminEgresoProps {
  comprobanteId: string;
  onClose: () => void;
}

function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function FormularioAdminEgreso({ comprobanteId, onClose }: FormularioAdminEgresoProps) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comprobante, setComprobante] = useState<ComprobanteWithContext | null>(null);

  const [form, setForm] = useState({
    facturaEmitidaA: '',
    empresa: '',
    empresaPrograma: '',
    formaPago: '' as FormaPago | '',
    acuerdoPago: '',
    fechaComprobante: '',
    numeroComprobante: '',
    proveedor: '',
    razonSocial: '',
    entidadCuit: '',
    neto: '',
    observaciones: '',
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
      const newForm = {
        facturaEmitidaA: data.facturaEmitidaA || data.entidadNombre || '',
        empresa: data.empresa || '',
        empresaPrograma: data.empresaPrograma || data.ctxPrograma || data.sector || '',
        formaPago: data.formaPago || '',
        acuerdoPago: data.acuerdoPago || data.opAcuerdoPago || '',
        fechaComprobante: formatDate(data.fechaComprobante),
        numeroComprobante: data.numeroComprobante || '',
        proveedor: data.entidadNombre || '',
        razonSocial: data.entidadNombre || '',
        entidadCuit: data.entidadCuit || '',
        neto: data.neto?.toString() || '',
        observaciones: data.observaciones || '',
      };
      setForm(newForm);
      setLoading(false);
    })();
  }, [comprobanteId]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Si cambia formaPago a "Efectivo (Contado)", limpiar acuerdoPago
      if (field === 'formaPago' && value === 'Efectivo (Contado)') {
        next.acuerdoPago = '';
      }
      return next;
    });
  };

  const handleGuardar = async (nuevoEstado: EstadoPago) => {
    if (!comprobante) return;
    setSaving(true);
    try {
      // Save form fields first
      const { error: updateError } = await comprobantesService.update({
        id: comprobante.id,
        facturaEmitidaA: form.facturaEmitidaA || undefined,
        empresa: form.empresa || undefined,
        entidadNombre: form.razonSocial,
        entidadCuit: form.entidadCuit || undefined,
        formaPago: form.formaPago as FormaPago || undefined,
        acuerdoPago: form.acuerdoPago || undefined,
        fechaComprobante: form.fechaComprobante ? new Date(form.fechaComprobante) : undefined,
        numeroComprobante: form.numeroComprobante || undefined,
        neto: parseFloat(form.neto) || 0,
        observaciones: form.observaciones || undefined,
      });
      if (updateError) { toast.error(updateError); return; }

      // Then change estado
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
   const shouldShowAcuerdoPago = form.formaPago !== 'Efectivo (Contado)' && form.formaPago !== '';

   // Build context card data
  const contextItems = buildContextItems(comprobante);

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

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-6 sm:space-y-8 pb-24">
          {/* Header */}
          <div>
            <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
              Revisión de gasto
            </h1>
            <p className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
              Revisá la información del gasto antes de avanzar con la facturación. Verificá que los datos sean correctos y estén completos.
            </p>
          </div>

          {/* Context Card */}
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
          <h2 className="text-base font-semibold text-blue-600 mb-5">Gasto #1</h2>

          <div className="space-y-5">
            {/* Row 1: Factura emitida a, Empresa, Empresa/Programa */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Factura emitida a <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.facturaEmitidaA}
                  onChange={(e) => handleChange('facturaEmitidaA', e.target.value)}
                  disabled={locked}
                  placeholder="Seleccionar"
                  className={inputClass}
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
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Empresa/Programa <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.empresaPrograma}
                  onChange={(e) => handleChange('empresaPrograma', e.target.value)}
                  disabled={locked}
                  placeholder="Seleccionar"
                  className={inputClass}
                />
              </div>
            </div>

             {/* Row 2: Forma de pago, Acuerdo de pago */}
             <div className="grid grid-cols-2 gap-4">
               <FormSelect
                 label="Forma de pago"
                 value={form.formaPago}
                 onChange={(v) => handleChange('formaPago', v)}
                 options={FORMAS_PAGO_OPTIONS}
                 required
                 disabled={locked}
                 isDark={isDark}
               />
               {shouldShowAcuerdoPago && (
                 <FormSelect
                   label="Acuerdo de pago"
                   value={form.acuerdoPago}
                   onChange={(v) => handleChange('acuerdoPago', v)}
                   options={ACUERDOS_PAGO_OPTIONS}
                   disabled={locked}
                   isDark={isDark}
                 />
               )}
             </div>

            {/* Row 3: Fecha comprobante, N° comprobante */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Row 4: ProveedorSelector */}
            <ProveedorSelector
              value={{
                proveedor: form.proveedor,
                razonSocial: form.razonSocial,
              }}
              onChange={(selection) => {
                setForm(prev => ({
                  ...prev,
                  proveedor: selection.proveedor,
                  razonSocial: selection.razonSocial,
                }));
              }}
              disabled={locked}
              allowCreate={false}
              required={true}
            />

            {/* Row 5: Neto (half width) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                  Neto <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 text-sm',
                    isDark ? 'text-gray-500' : 'text-gray-400',
                  )}>$</span>
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

            {/* Row 6: Concepto del gasto (full width) */}
            <div className="space-y-1.5">
              <Label className={cn('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-700')}>
                Concepto del gasto
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
                Aprobar Gasto
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
              Marcar Pagado
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
    </div>
  );
}

/** Build context card items from comprobante data */
function buildContextItems(c: ComprobanteWithContext): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];

  // OP-linked areas (impl/tec/talentos)
  if (['implementacion', 'tecnica', 'talentos'].includes(c.areaOrigen || '')) {
    if (c.opNumeroOrden) items.push({ label: 'Orden de Publicidad', value: c.opNumeroOrden });
    if (c.neto) items.push({ label: 'Presupuesto Total', value: `$ ${c.neto.toLocaleString('es-AR')}` });
    if (c.opMesServicio) items.push({ label: 'Mes de Servicio', value: c.opMesServicio });
    if (c.opUnidadNegocio || c.unidadNegocio) items.push({ label: 'Unidad de Negocio', value: c.opUnidadNegocio || c.unidadNegocio || '' });
    if (c.opCategoriaNegocio || c.categoriaNegocio) items.push({ label: 'Categoría de Negocio', value: c.opCategoriaNegocio || c.categoriaNegocio || '' });
    if (c.opMarca) items.push({ label: 'Marca', value: c.opMarca });
    if (c.rubroContexto) items.push({ label: 'Rubro de Gasto', value: c.rubroContexto });
    if (c.subRubroContexto) items.push({ label: 'Subrubro', value: c.subRubroContexto });
  }

  // Programacion
  if (c.areaOrigen === 'programacion') {
    if (c.ctxPrograma) items.push({ label: 'Programa', value: c.ctxPrograma });
    if (c.ctxMesGestion) items.push({ label: 'Mes de Gestión', value: c.ctxMesGestion });
    if (c.ctxUnidadNegocio) items.push({ label: 'Unidad de Negocio', value: c.ctxUnidadNegocio });
    if (c.rubroContexto) items.push({ label: 'Rubro de Gasto', value: c.rubroContexto });
    if (c.subRubroContexto) items.push({ label: 'Subrubro', value: c.subRubroContexto });
  }

  // Experience
  if (c.areaOrigen === 'experience') {
    if (c.ctxNombreCampana) items.push({ label: 'Campaña', value: c.ctxNombreCampana });
    if (c.ctxMesGestion) items.push({ label: 'Mes de Gestión', value: c.ctxMesGestion });
    if (c.ctxRubro) items.push({ label: 'Rubro de Gasto', value: c.ctxRubro });
    if (c.ctxSubRubro) items.push({ label: 'Subrubro', value: c.ctxSubRubro });
  }

  // Productora
  if (c.areaOrigen === 'productora') {
    if (c.ctxNombreCampana) items.push({ label: 'Campaña', value: c.ctxNombreCampana });
    if (c.ctxUnidadNegocio) items.push({ label: 'Unidad de Negocio', value: c.ctxUnidadNegocio });
    if (c.ctxRubro) items.push({ label: 'Rubro de Gasto', value: c.ctxRubro });
    if (c.ctxSubRubro) items.push({ label: 'Subrubro', value: c.ctxSubRubro });
  }

  // Directo (admin/finanzas)
  if (c.areaOrigen === 'directo') {
    if (c.rubroContexto) items.push({ label: 'Rubro de Gasto', value: c.rubroContexto });
    if (c.subRubroContexto) items.push({ label: 'Subrubro', value: c.subRubroContexto });
    items.push({ label: 'Área', value: AREA_ORIGEN_LABELS.directo });
  }

  return items;
}
