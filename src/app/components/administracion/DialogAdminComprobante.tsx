import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatCurrency } from '@/app/utils/format';
import { dialogFormStyles } from '@/app/components/shared/formStyles';
import { useTheme } from '@/app/contexts/ThemeContext';
import { CheckCircle, XCircle, HelpCircle, Ban, CreditCard, ExternalLink } from 'lucide-react';
import * as comprobantesService from '@/app/services/comprobantesService';
import type {
  ComprobanteWithContext,
  Comprobante,
  TipoComprobante,
  EstadoPago,
  FormaPago,
  CondicionIva,
} from '@/app/types/comprobantes';
import {
  TIPO_COMPROBANTE_LABELS,
  TIPO_MOVIMIENTO_LABELS,
  AREA_ORIGEN_LABELS,
  ESTADO_PAGO_LABELS,
  FORMA_PAGO_LABELS,
  CONDICION_IVA_LABELS,
  isComprobanteLocked,
} from '@/app/types/comprobantes';

interface DialogAdminComprobanteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comprobante: ComprobanteWithContext | null;
  onComprobanteUpdated?: (comprobante: Comprobante) => void;
}

const TIPO_COMPROBANTE_OPTIONS: TipoComprobante[] = [
  'FA', 'FB', 'FC', 'FE', 'NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC', 'REC', 'TKT', 'OTR'
];

const FORMA_PAGO_OPTIONS: FormaPago[] = ['transferencia', 'cheque', 'efectivo', 'tarjeta', 'otro'];

const CONDICION_IVA_OPTIONS: CondicionIva[] = [
  'responsable_inscripto', 'monotributista', 'exento', 'consumidor_final', 'no_responsable'
];

const COMPROBANTE_PAGO_OPTIONS = [
  { value: 'recibo', label: 'Recibo' },
  { value: 'orden_pago', label: 'Orden de Pago' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'otro', label: 'Otro' },
];

function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


export function DialogAdminComprobante({
  open,
  onOpenChange,
  comprobante,
  onComprobanteUpdated,
}: DialogAdminComprobanteProps) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Get URL to source form based on area origen
  const getFormularioUrl = (): string | null => {
    if (!comprobante) return null;
    switch (comprobante.areaOrigen) {
      case 'implementacion':
        if (!comprobante.ordenPublicidadId) return null;
        // Include itemId if available for proper form loading
        return comprobante.itemOrdenPublicidadId
          ? `/implementacion/gasto/${comprobante.ordenPublicidadId}/${comprobante.itemOrdenPublicidadId}`
          : `/implementacion/gasto/${comprobante.ordenPublicidadId}`;
      case 'programacion':
        // FormularioProgramacion expects the comprobante/gasto ID, not formulario ID
        return `/programacion/editar/${comprobante.id}`;
      case 'tecnica':
        if (comprobante.tecOrdenPublicidadId) {
          return `/tecnica/gasto/${comprobante.tecOrdenPublicidadId}`;
        }
        return null;
      case 'experience':
        // ExperienceForm expects the comprobante/gasto ID, not formulario ID
        return `/experience/editar/${comprobante.id}`;
      default:
        return null;
    }
  };

  const handleIrAFormulario = () => {
    const url = getFormularioUrl();
    if (url) {
      onOpenChange(false);
      navigate(url);
    }
  };
  const [form, setForm] = useState({
    // Base comprobante fields
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
    // Admin fields
    condicionIva: '' as CondicionIva | '',
    comprobantePago: '',
    ingresosBrutos: '',
    retencionGanancias: '',
    fechaEstimadaPago: '',
    notaAdmin: '',
  });

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
        // Admin fields
        condicionIva: comprobante.condicionIva || '',
        comprobantePago: comprobante.comprobantePago || '',
        ingresosBrutos: comprobante.ingresosBrutos?.toString() || '0',
        retencionGanancias: comprobante.retencionGanancias?.toString() || '0',
        fechaEstimadaPago: formatDate(comprobante.fechaEstimadaPago),
        notaAdmin: comprobante.notaAdmin || '',
      });
    }
  }, [comprobante]);

  // Note: IVA and Neto are editable (Finnegans integration pending)

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!comprobante) return;

    setSaving(true);
    try {
      const { data, error } = await comprobantesService.update({
        id: comprobante.id,
        // Base fields
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
        // Admin fields
        condicionIva: form.condicionIva as CondicionIva || undefined,
        comprobantePago: form.comprobantePago || undefined,
        ingresosBrutos: parseFloat(form.ingresosBrutos) || 0,
        retencionGanancias: parseFloat(form.retencionGanancias) || 0,
        fechaEstimadaPago: form.fechaEstimadaPago ? new Date(form.fechaEstimadaPago) : undefined,
        notaAdmin: form.notaAdmin || undefined,
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

  // Financial fields locked when aprobado, rechazado, or pagado
  const isFinancialLocked = isComprobanteLocked(comprobante.estadoPago);
  // Admin/payment fields only locked when fully closed (rechazado or pagado)
  const isAdminLocked = comprobante.estadoPago === 'rechazado' || comprobante.estadoPago === 'pagado';
  const canMarkPagado = comprobante.estadoPago === 'aprobado';

  const { label: labelClass, input: inputClass } = dialogFormStyles(isDark);

  const financialInputClass = cn(inputClass, isFinancialLocked && "opacity-60 cursor-not-allowed");
  const adminInputClass = cn(inputClass, isAdminLocked && "opacity-60 cursor-not-allowed");

  // Calculate total neto (after retentions)
  const netoFinal = (
    (parseFloat(form.neto) || 0) -
    (parseFloat(form.ingresosBrutos) || 0) -
    (parseFloat(form.retencionGanancias) || 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[900px] max-h-[90vh]", isDark && "bg-[#1e1e1e] border-gray-800")}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            Admin - {TIPO_MOVIMIENTO_LABELS[comprobante.tipoMovimiento]}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Estado y Acciones */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                    Estado:
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    comprobante.estadoPago === 'creado' && "bg-gray-100 text-gray-800",
                    comprobante.estadoPago === 'aprobado' && "bg-blue-100 text-blue-800",
                    comprobante.estadoPago === 'requiere_info' && "bg-orange-100 text-orange-800",
                    comprobante.estadoPago === 'rechazado' && "bg-red-100 text-red-800",
                    comprobante.estadoPago === 'pagado' && "bg-green-100 text-green-800",
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
                  {getFormularioUrl() && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleIrAFormulario}
                      className="h-6 px-2 text-xs gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver formulario
                    </Button>
                  )}
                </div>
              </div>

              {/* Action buttons based on current state */}
              <div className="flex gap-2 flex-wrap">
                {/* From creado/requiere_info: can approve, request info, or reject */}
                {(comprobante.estadoPago === 'creado' || comprobante.estadoPago === 'requiere_info') && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCambiarEstado('aprobado')}
                      disabled={saving}
                      className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCambiarEstado('requiere_info')}
                      disabled={saving}
                      className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Req. Info
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCambiarEstado('rechazado')}
                      disabled={saving}
                      className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </>
                )}
                {/* From aprobado: can mark as paid */}
                {canMarkPagado && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCambiarEstado('pagado')}
                    disabled={saving}
                    className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    Marcar Pagado
                  </Button>
                )}
              </div>
            </div>

            {/* Contexto (solo lectura) */}
            {comprobante.areaOrigen !== 'directo' && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Contexto del Área
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {comprobante.areaOrigen === 'implementacion' && (
                    <>
                      {comprobante.implOrdenPublicidad && (
                        <div><span className="text-blue-600 dark:text-blue-400">OP:</span> {comprobante.implOrdenPublicidad}</div>
                      )}
                      {comprobante.implNombreCampana && (
                        <div><span className="text-blue-600 dark:text-blue-400">Campaña:</span> {comprobante.implNombreCampana}</div>
                      )}
                      {comprobante.sector && (
                        <div><span className="text-blue-600 dark:text-blue-400">Sector:</span> {comprobante.sector}</div>
                      )}
                      {comprobante.rubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">Rubro:</span> {comprobante.rubro}</div>
                      )}
                      {comprobante.subRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">SubRubro:</span> {comprobante.subRubro}</div>
                      )}
                    </>
                  )}
                  {comprobante.areaOrigen === 'programacion' && (
                    <>
                      {comprobante.progPrograma && (
                        <div><span className="text-blue-600 dark:text-blue-400">Programa:</span> {comprobante.progPrograma}</div>
                      )}
                      {comprobante.progMesGestion && (
                        <div><span className="text-blue-600 dark:text-blue-400">Mes:</span> {comprobante.progMesGestion}</div>
                      )}
                      {comprobante.progUnidadNegocio && (
                        <div><span className="text-blue-600 dark:text-blue-400">Unidad:</span> {comprobante.progUnidadNegocio}</div>
                      )}
                      {comprobante.progRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">Rubro:</span> {comprobante.progRubro}</div>
                      )}
                      {comprobante.progSubRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">SubRubro:</span> {comprobante.progSubRubro}</div>
                      )}
                    </>
                  )}
                  {comprobante.areaOrigen === 'tecnica' && (
                    <>
                      {comprobante.tecOrdenPublicidad && (
                        <div><span className="text-blue-600 dark:text-blue-400">OP:</span> {comprobante.tecOrdenPublicidad}</div>
                      )}
                      {comprobante.tecNombreCampana && (
                        <div><span className="text-blue-600 dark:text-blue-400">Campaña:</span> {comprobante.tecNombreCampana}</div>
                      )}
                      {comprobante.tecUnidadNegocio && (
                        <div><span className="text-blue-600 dark:text-blue-400">Unidad:</span> {comprobante.tecUnidadNegocio}</div>
                      )}
                      {comprobante.tecCategoriaNegocio && (
                        <div><span className="text-blue-600 dark:text-blue-400">Categoría:</span> {comprobante.tecCategoriaNegocio}</div>
                      )}
                      {comprobante.tecSector && (
                        <div><span className="text-blue-600 dark:text-blue-400">Sector:</span> {comprobante.tecSector}</div>
                      )}
                      {comprobante.tecRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">Rubro:</span> {comprobante.tecRubro}</div>
                      )}
                      {comprobante.tecSubRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">SubRubro:</span> {comprobante.tecSubRubro}</div>
                      )}
                    </>
                  )}
                  {comprobante.areaOrigen === 'experience' && (
                    <>
                      {comprobante.expNombreCampana && (
                        <div><span className="text-blue-600 dark:text-blue-400">Campaña:</span> {comprobante.expNombreCampana}</div>
                      )}
                      {comprobante.expMesGestion && (
                        <div><span className="text-blue-600 dark:text-blue-400">Mes:</span> {comprobante.expMesGestion}</div>
                      )}
                      {comprobante.expRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">Rubro:</span> {comprobante.expRubro}</div>
                      )}
                      {comprobante.expSubRubro && (
                        <div><span className="text-blue-600 dark:text-blue-400">SubRubro:</span> {comprobante.expSubRubro}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Proveedor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Proveedor/Razón Social</Label>
                <Input
                  value={form.entidadNombre}
                  onChange={(e) => handleChange('entidadNombre', e.target.value)}
                  disabled={isFinancialLocked}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>CUIT</Label>
                <Input
                  value={form.entidadCuit}
                  onChange={(e) => handleChange('entidadCuit', e.target.value.replace(/[^0-9-]/g, ''))}
                  disabled={isFinancialLocked}
                  maxLength={13}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Admin: Condición IVA */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Condición IVA</Label>
                <Select
                  value={form.condicionIva}
                  onValueChange={(v) => handleChange('condicionIva', v)}
                  disabled={isAdminLocked}
                >
                  <SelectTrigger className={adminInputClass}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDICION_IVA_OPTIONS.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {CONDICION_IVA_LABELS[cond]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Tipo Comprobante</Label>
                <Select
                  value={form.tipoComprobante}
                  onValueChange={(v) => handleChange('tipoComprobante', v)}
                  disabled={isFinancialLocked}
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
                <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Comprobante Pago</Label>
                <Select
                  value={form.comprobantePago}
                  onValueChange={(v) => handleChange('comprobantePago', v)}
                  disabled={isAdminLocked}
                >
                  <SelectTrigger className={adminInputClass}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPROBANTE_PAGO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Factura */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Punto Venta</Label>
                <Input
                  value={form.puntoVenta}
                  onChange={(e) => handleChange('puntoVenta', e.target.value)}
                  disabled={isFinancialLocked}
                  maxLength={5}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Nro Comprobante</Label>
                <Input
                  value={form.numeroComprobante}
                  onChange={(e) => handleChange('numeroComprobante', e.target.value)}
                  disabled={isFinancialLocked}
                  className={inputClass}
                />
              </div>
              <FormDatePicker
                label="Fecha Comprobante"
                value={form.fechaComprobante}
                onChange={(v) => handleChange('fechaComprobante', v)}
                disabled={isFinancialLocked}
              />
            </div>

            {/* Importes */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Importes ({comprobante.moneda})
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Total Factura</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.total}
                    onChange={(e) => handleChange('total', e.target.value)}
                    disabled={isFinancialLocked}
                    className={cn(inputClass, "font-semibold")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>IVA % </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ivaAlicuota}
                    onChange={(e) => handleChange('ivaAlicuota', e.target.value)}
                    disabled={isFinancialLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>IVA Monto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ivaMonto}
                    onChange={(e) => handleChange('ivaMonto', e.target.value)}
                    disabled={isFinancialLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Neto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.neto}
                    onChange={(e) => handleChange('neto', e.target.value)}
                    disabled={isFinancialLocked}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Retenciones */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Percepciones</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.percepciones}
                    onChange={(e) => handleChange('percepciones', e.target.value)}
                    disabled={isFinancialLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Ret. IIBB</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ingresosBrutos}
                    onChange={(e) => handleChange('ingresosBrutos', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Ret. Ganancias</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.retencionGanancias}
                    onChange={(e) => handleChange('retencionGanancias', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(labelClass, "font-bold")}>Neto a Pagar</Label>
                  <div className={cn(
                    "h-9 px-3 flex items-center rounded-md border font-bold",
                    isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-100 border-gray-300 text-gray-900"
                  )}>
                    {formatCurrency(netoFinal, comprobante.moneda)}
                  </div>
                </div>
              </div>
            </div>

            {/* Pago */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Datos de Pago
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Forma Pago</Label>
                  <Select
                    value={form.formaPago}
                    onValueChange={(v) => handleChange('formaPago', v)}
                    disabled={isAdminLocked}
                  >
                    <SelectTrigger className={adminInputClass}>
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
                <div className="space-y-2">
                  <Label className={labelClass}>Banco</Label>
                  <Input
                    value={form.banco}
                    onChange={(e) => handleChange('banco', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Nro Operación</Label>
                  <Input
                    value={form.numeroOperacion}
                    onChange={(e) => handleChange('numeroOperacion', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <FormDatePicker
                  label="Fecha Estimada Pago"
                  value={form.fechaEstimadaPago}
                  onChange={(v) => handleChange('fechaEstimadaPago', v)}
                  disabled={isAdminLocked}
                />
                <FormDatePicker
                  label="Fecha Real Pago"
                  value={form.fechaPago}
                  onChange={(v) => handleChange('fechaPago', v)}
                  disabled={isAdminLocked}
                />
                {comprobante.moneda === 'USD' && (
                  <div className="space-y-2">
                    <Label className={labelClass}>Cotización</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={form.cotizacion}
                      onChange={(e) => handleChange('cotizacion', e.target.value)}
                      disabled={isAdminLocked}
                      className={adminInputClass}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Concepto y Nota Admin */}
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Empresa</Label>
                  <Input
                    value={form.empresa}
                    onChange={(e) => handleChange('empresa', e.target.value)}
                    disabled={isFinancialLocked}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Concepto</Label>
                  <Input
                    value={form.concepto}
                    onChange={(e) => handleChange('concepto', e.target.value)}
                    disabled={isFinancialLocked}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Observaciones (área)</Label>
                  <Textarea
                    value={form.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                    disabled={isFinancialLocked}
                    rows={3}
                    className={cn(
                      isDark
                        ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
                        : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]",
                      isFinancialLocked && "opacity-60 cursor-not-allowed"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Nota Admin</Label>
                  <Textarea
                    value={form.notaAdmin}
                    onChange={(e) => handleChange('notaAdmin', e.target.value)}
                    disabled={isAdminLocked}
                    rows={3}
                    placeholder="Notas internas de Administración/Finanzas..."
                    className={cn(
                      isDark
                        ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
                        : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]",
                      isAdminLocked && "opacity-60 cursor-not-allowed"
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
          {!isAdminLocked && (
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
