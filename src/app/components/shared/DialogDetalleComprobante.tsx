import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { FormDatePicker } from '@/app/components/ui/form-date-picker';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { dialogFormStyles } from '@/app/components/shared/formStyles';
import { useTheme } from '@/app/contexts/ThemeContext';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import * as comprobantesService from '@/app/services/comprobantesService';
import type {
  ComprobanteWithContext,
  Comprobante,
  TipoComprobante,
  EstadoPago,
  FormaPago,
} from '@/app/types/comprobantes';
import {
  TIPO_COMPROBANTE_LABELS,
  TIPO_MOVIMIENTO_LABELS,
  AREA_ORIGEN_LABELS,
  ESTADO_PAGO_LABELS,
  FORMA_PAGO_LABELS,
  isComprobanteLocked,
  calcularDesdeTotal,
} from '@/app/types/comprobantes';

interface DialogDetalleComprobanteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comprobante: ComprobanteWithContext | null;
  onComprobanteUpdated?: (comprobante: Comprobante) => void;
}

const TIPO_COMPROBANTE_OPTIONS: TipoComprobante[] = [
  'FA', 'FB', 'FC', 'FE', 'NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC', 'REC', 'TKT', 'OTR'
];

const FORMA_PAGO_OPTIONS: FormaPago[] = ['transferencia', 'cheque', 'efectivo', 'tarjeta', 'otro'];

function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DialogDetalleComprobante({
  open,
  onOpenChange,
  comprobante,
  onComprobanteUpdated,
}: DialogDetalleComprobanteProps) {
  const { isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    entidadNombre: '',
    entidadCuit: '',
    tipoComprobante: '' as TipoComprobante | '',
    puntoVenta: '',
    numeroComprobante: '',
    fechaComprobante: '',
    cae: '',
    fechaVencimientoCae: '',
    neto: '',
    ivaAlicuota: '',
    ivaMonto: '',
    percepciones: '',
    total: '',
    empresa: '',
    concepto: '',
    observaciones: '',
    // Payment fields
    formaPago: '' as FormaPago | '',
    cotizacion: '',
    banco: '',
    numeroOperacion: '',
    fechaPago: '',
  });

  const isLocked = comprobante ? isComprobanteLocked(comprobante.estadoPago) : false;

  useEffect(() => {
    if (comprobante) {
      setForm({
        entidadNombre: comprobante.entidadNombre || '',
        entidadCuit: comprobante.entidadCuit || '',
        tipoComprobante: comprobante.tipoComprobante || '',
        puntoVenta: comprobante.puntoVenta || '',
        numeroComprobante: comprobante.numeroComprobante || '',
        fechaComprobante: formatDate(comprobante.fechaComprobante),
        cae: comprobante.cae || '',
        fechaVencimientoCae: formatDate(comprobante.fechaVencimientoCae),
        neto: comprobante.neto?.toString() || '',
        ivaAlicuota: comprobante.ivaAlicuota?.toString() || '21',
        ivaMonto: comprobante.ivaMonto?.toString() || '',
        percepciones: comprobante.percepciones?.toString() || '0',
        total: comprobante.total?.toString() || '',
        empresa: comprobante.empresa || '',
        concepto: comprobante.concepto || '',
        observaciones: comprobante.observaciones || '',
        // Payment fields
        formaPago: comprobante.formaPago || '',
        cotizacion: comprobante.cotizacion?.toString() || '',
        banco: comprobante.banco || '',
        numeroOperacion: comprobante.numeroOperacion || '',
        fechaPago: formatDate(comprobante.fechaPago),
      });
    }
  }, [comprobante]);

  // Auto-calculate IVA and Neto from Total
  useEffect(() => {
    const total = parseFloat(form.total) || 0;
    const ivaAlicuota = parseFloat(form.ivaAlicuota) || 0;
    const percepciones = parseFloat(form.percepciones) || 0;

    const { ivaMonto, neto } = calcularDesdeTotal(total, ivaAlicuota, percepciones);

    setForm(prev => ({
      ...prev,
      ivaMonto: ivaMonto.toFixed(2),
      neto: neto.toFixed(2),
    }));
  }, [form.total, form.ivaAlicuota, form.percepciones]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!comprobante) return;

    setSaving(true);
    try {
      const { data, error } = await comprobantesService.update({
        id: comprobante.id,
        entidadNombre: form.entidadNombre,
        entidadCuit: form.entidadCuit || undefined,
        tipoComprobante: form.tipoComprobante as TipoComprobante || undefined,
        puntoVenta: form.puntoVenta || undefined,
        numeroComprobante: form.numeroComprobante || undefined,
        fechaComprobante: form.fechaComprobante ? new Date(form.fechaComprobante) : undefined,
        cae: form.cae || undefined,
        fechaVencimientoCae: form.fechaVencimientoCae ? new Date(form.fechaVencimientoCae) : undefined,
        neto: parseFloat(form.neto) || 0,
        ivaAlicuota: parseFloat(form.ivaAlicuota) || 21,
        ivaMonto: parseFloat(form.ivaMonto) || 0,
        percepciones: parseFloat(form.percepciones) || 0,
        total: parseFloat(form.total) || 0,
        empresa: form.empresa || undefined,
        concepto: form.concepto || undefined,
        observaciones: form.observaciones || undefined,
        // Payment fields
        formaPago: form.formaPago as FormaPago || undefined,
        cotizacion: form.cotizacion ? parseFloat(form.cotizacion) : undefined,
        banco: form.banco || undefined,
        numeroOperacion: form.numeroOperacion || undefined,
        fechaPago: form.fechaPago ? new Date(form.fechaPago) : undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (data) {
        toast.success('Comprobante actualizado');
        onComprobanteUpdated?.(data);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoPago) => {
    if (!comprobante) return;

    setSaving(true);
    try {
      const { data, error } = await comprobantesService.updateEstadoPagoWithValidation(
        comprobante.id,
        nuevoEstado
      );

      if (error) {
        toast.error(error);
        return;
      }

      if (data) {
        const label = ESTADO_PAGO_LABELS[nuevoEstado];
        toast.success(`Estado cambiado a "${label}"`);
        onComprobanteUpdated?.(data);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!comprobante) return null;

  const styles = dialogFormStyles(isDark);
  const labelClass = styles.label;
  const inputClass = cn(styles.input, isLocked && "opacity-60 cursor-not-allowed");

  const readonlyInputClass = cn(inputClass, "bg-gray-100 dark:bg-gray-900");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[800px] max-h-[90vh]", isDark && "bg-[#1e1e1e] border-gray-800")}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            Detalle de {TIPO_MOVIMIENTO_LABELS[comprobante.tipoMovimiento]}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Estado y Info básica */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                    Estado:
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    comprobante.estadoPago === 'pagado' && "bg-green-100 text-green-800",
                    comprobante.estadoPago === 'pendiente' && "bg-yellow-100 text-yellow-800",
                    comprobante.estadoPago === 'pedir_info' && "bg-orange-100 text-orange-800",
                    comprobante.estadoPago === 'anulado' && "bg-red-100 text-red-800",
                  )}>
                    {ESTADO_PAGO_LABELS[comprobante.estadoPago]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    Área origen:
                  </span>
                  <span className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                    {AREA_ORIGEN_LABELS[comprobante.areaOrigen]}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {!isLocked && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCambiarEstado('pagado')}
                    disabled={saving}
                    className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar Pagado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCambiarEstado('pedir_info')}
                    disabled={saving}
                    className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Pedir Info
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCambiarEstado('anulado')}
                    disabled={saving}
                    className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Anular
                  </Button>
                </div>
              )}
            </div>

            {/* Context info */}
            {comprobante.areaOrigen !== 'directo' && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Información de Contexto
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {comprobante.areaOrigen === 'implementacion' && (
                    <>
                      {comprobante.implOrdenPublicidad && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Orden:</span>{' '}
                          <span className="font-medium">{comprobante.implOrdenPublicidad}</span>
                        </div>
                      )}
                      {comprobante.implNombreCampana && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Campaña:</span>{' '}
                          <span className="font-medium">{comprobante.implNombreCampana}</span>
                        </div>
                      )}
                      {comprobante.sector && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Sector:</span>{' '}
                          <span className="font-medium">{comprobante.sector}</span>
                        </div>
                      )}
                      {comprobante.rubro && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Rubro:</span>{' '}
                          <span className="font-medium">{comprobante.rubro}</span>
                        </div>
                      )}
                    </>
                  )}
                  {comprobante.areaOrigen === 'programacion' && (
                    <>
                      {comprobante.progPrograma && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Programa:</span>{' '}
                          <span className="font-medium">{comprobante.progPrograma}</span>
                        </div>
                      )}
                      {comprobante.progMesGestion && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Mes Gestión:</span>{' '}
                          <span className="font-medium">{comprobante.progMesGestion}</span>
                        </div>
                      )}
                      {comprobante.progUnidadNegocio && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Unidad:</span>{' '}
                          <span className="font-medium">{comprobante.progUnidadNegocio}</span>
                        </div>
                      )}
                    </>
                  )}
                  {comprobante.areaOrigen === 'experience' && (
                    <>
                      {comprobante.expNombreCampana && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Campaña:</span>{' '}
                          <span className="font-medium">{comprobante.expNombreCampana}</span>
                        </div>
                      )}
                      {comprobante.expMesGestion && (
                        <div>
                          <span className="text-blue-600 dark:text-blue-400">Mes Gestión:</span>{' '}
                          <span className="font-medium">{comprobante.expMesGestion}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Entidad */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Entidad</Label>
                <Input
                  value={form.entidadNombre}
                  onChange={(e) => handleChange('entidadNombre', e.target.value)}
                  disabled={isLocked}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>CUIT</Label>
                <Input
                  value={form.entidadCuit}
                  onChange={(e) => handleChange('entidadCuit', e.target.value.replace(/[^0-9-]/g, ''))}
                  disabled={isLocked}
                  maxLength={13}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Comprobante Info */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Datos del Comprobante
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Tipo Comprobante</Label>
                  <Select
                    value={form.tipoComprobante}
                    onValueChange={(v) => handleChange('tipoComprobante', v)}
                    disabled={isLocked}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_COMPROBANTE_OPTIONS.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {TIPO_COMPROBANTE_LABELS[tipo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Punto de Venta</Label>
                  <Input
                    value={form.puntoVenta}
                    onChange={(e) => handleChange('puntoVenta', e.target.value)}
                    disabled={isLocked}
                    maxLength={5}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Número</Label>
                  <Input
                    value={form.numeroComprobante}
                    onChange={(e) => handleChange('numeroComprobante', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormDatePicker
                  label="Fecha Comprobante"
                  value={form.fechaComprobante}
                  onChange={(v) => handleChange('fechaComprobante', v)}
                  disabled={isLocked}
                />
                <div className="space-y-2">
                  <Label className={labelClass}>CAE</Label>
                  <Input
                    value={form.cae}
                    onChange={(e) => handleChange('cae', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormDatePicker
                  label="Vencimiento CAE"
                  value={form.fechaVencimientoCae}
                  onChange={(v) => handleChange('fechaVencimientoCae', v)}
                  disabled={isLocked}
                />
              </div>
            </div>

            {/* Montos */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Importes ({comprobante.moneda})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Total *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.total}
                    onChange={(e) => handleChange('total', e.target.value)}
                    disabled={isLocked}
                    className={cn(inputClass, "font-semibold")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>IVA Alícuota (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ivaAlicuota}
                    onChange={(e) => handleChange('ivaAlicuota', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={labelClass}>IVA Monto</Label>
                  <Input
                    type="number"
                    value={form.ivaMonto}
                    readOnly
                    className={readonlyInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Percepciones</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.percepciones}
                    onChange={(e) => handleChange('percepciones', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Neto</Label>
                  <Input
                    type="number"
                    value={form.neto}
                    readOnly
                    className={readonlyInputClass}
                  />
                </div>
              </div>
            </div>

            {/* Pago/Cobro */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Datos de {comprobante.tipoMovimiento === 'ingreso' ? 'Cobro' : 'Pago'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Forma de Pago</Label>
                  <Select
                    value={form.formaPago}
                    onValueChange={(v) => handleChange('formaPago', v)}
                    disabled={isLocked}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMA_PAGO_OPTIONS.map((fp) => (
                        <SelectItem key={fp} value={fp}>
                          {FORMA_PAGO_LABELS[fp]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormDatePicker
                  label={`Fecha de ${comprobante.tipoMovimiento === 'ingreso' ? 'Cobro' : 'Pago'}`}
                  value={form.fechaPago}
                  onChange={(v) => handleChange('fechaPago', v)}
                  disabled={isLocked}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Banco</Label>
                  <Input
                    value={form.banco}
                    onChange={(e) => handleChange('banco', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Nro. Operación</Label>
                  <Input
                    value={form.numeroOperacion}
                    onChange={(e) => handleChange('numeroOperacion', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
                {comprobante.moneda === 'USD' && (
                  <div className="space-y-2">
                    <Label className={labelClass}>Cotización</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={form.cotizacion}
                      onChange={(e) => handleChange('cotizacion', e.target.value)}
                      disabled={isLocked}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Concepto */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Descripción
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Empresa</Label>
                  <Input
                    value={form.empresa}
                    onChange={(e) => handleChange('empresa', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Concepto</Label>
                  <Input
                    value={form.concepto}
                    onChange={(e) => handleChange('concepto', e.target.value)}
                    disabled={isLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Observaciones</Label>
                  <Textarea
                    value={form.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                    disabled={isLocked}
                    rows={3}
                    className={cn(
                      isDark
                        ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
                        : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]",
                      isLocked && "opacity-60 cursor-not-allowed"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cerrar
          </Button>
          {!isLocked && (
            <Button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-[#fb2c36] hover:bg-[#fb2c36]/90 text-white"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
