import { useState, useEffect, useMemo } from 'react';
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
import { OrdenPublicidadSelector } from '@/app/components/shared/OrdenPublicidadSelector';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { formatCurrency } from '@/app/utils/format';
import { dialogFormStyles } from '@/app/components/shared/formStyles';
import { useTheme } from '@/app/contexts/ThemeContext';
import { CheckCircle, XCircle, HelpCircle, Ban, CreditCard } from 'lucide-react';
import * as comprobantesService from '@/app/services/comprobantesService';
import type {
  ComprobanteWithContext,
  Comprobante,
  TipoComprobante,
  EstadoPago,
  FormaPago,
  CondicionIva,
} from '@/app/types/comprobantes';
import type { OrdenPublicidad } from '@/app/types/comercial';
import {
  TIPO_COMPROBANTE_LABELS,
  ESTADO_PAGO_LABELS,
  FORMA_PAGO_LABELS,
  CONDICION_IVA_LABELS,
  isComprobanteLocked,
} from '@/app/types/comprobantes';

interface DialogIngresoAdminProps {
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

export function DialogIngresoAdmin({
  open,
  onOpenChange,
  comprobante,
  onComprobanteUpdated,
}: DialogIngresoAdminProps) {
  const { isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedOp, setSelectedOp] = useState<OrdenPublicidad | null>(null);

  const [form, setForm] = useState({
    // Entidad (factura emitida por)
    entidadNombre: '',
    entidadCuit: '',
    empresa: '',
    // Factura
    tipoComprobante: '' as TipoComprobante | '',
    puntoVenta: '',
    numeroComprobante: '',
    fechaComprobante: '',
    fechaVencimiento: '',
    // Importes
    total: '',
    ivaAlicuota: '21',
    ivaMonto: '',
    neto: '',
    // Retenciones
    retencionIva: '0',
    ingresosBrutos: '0',
    retencionGanancias: '0',
    retencionSuss: '0',
    // Pago/Cobro
    formaPago: '' as FormaPago | '',
    banco: '',
    numeroOperacion: '',
    fechaIngresoCheque: '',
    fechaPago: '',
    // Certificación
    certificacionEnviadaFecha: '',
    portal: '',
    contacto: '',
    fechaEnvio: '',
    // Notas
    observaciones: '',
    notaAdmin: '',
    // Admin
    condicionIva: '' as CondicionIva | '',
    // OP
    ordenPublicidadIdIngreso: '',
  });

  useEffect(() => {
    if (comprobante) {
      setForm({
        entidadNombre: comprobante.entidadNombre || '',
        entidadCuit: comprobante.entidadCuit || '',
        empresa: comprobante.empresa || '',
        tipoComprobante: comprobante.tipoComprobante || '',
        puntoVenta: comprobante.puntoVenta || '',
        numeroComprobante: comprobante.numeroComprobante || '',
        fechaComprobante: formatDate(comprobante.fechaComprobante),
        fechaVencimiento: formatDate(comprobante.fechaVencimiento),
        total: comprobante.total?.toString() || '',
        ivaAlicuota: comprobante.ivaAlicuota?.toString() || '21',
        ivaMonto: comprobante.ivaMonto?.toString() || '',
        neto: comprobante.neto?.toString() || '',
        retencionIva: comprobante.retencionIva?.toString() || '0',
        ingresosBrutos: comprobante.ingresosBrutos?.toString() || '0',
        retencionGanancias: comprobante.retencionGanancias?.toString() || '0',
        retencionSuss: comprobante.retencionSuss?.toString() || '0',
        formaPago: comprobante.formaPago || '',
        banco: comprobante.banco || '',
        numeroOperacion: comprobante.numeroOperacion || '',
        fechaIngresoCheque: formatDate(comprobante.fechaIngresoCheque),
        fechaPago: formatDate(comprobante.fechaPago),
        certificacionEnviadaFecha: formatDate(comprobante.certificacionEnviadaFecha),
        portal: comprobante.portal || '',
        contacto: comprobante.contacto || '',
        fechaEnvio: formatDate(comprobante.fechaEnvio),
        observaciones: comprobante.observaciones || '',
        notaAdmin: comprobante.notaAdmin || '',
        condicionIva: comprobante.condicionIva || '',
        ordenPublicidadIdIngreso: comprobante.ordenPublicidadIdIngreso || '',
      });
      // If has linked OP, create fake selected op from context data
      if (comprobante.ingresoOpId) {
        setSelectedOp({
          id: comprobante.ingresoOpId,
          ordenPublicidad: comprobante.ingresoOpNumero || '',
          responsable: comprobante.ingresoOpResponsable || '',
          unidadNegocio: comprobante.ingresoOpUnidadNegocio || '',
          nombreCampana: comprobante.ingresoOpNombreCampana || '',
          marca: comprobante.ingresoOpMarca || '',
          razonSocial: comprobante.ingresoOpRazonSocial || '',
          totalVenta: comprobante.ingresoOpImporte || '',
          acuerdoPago: comprobante.ingresoOpAcuerdoPago || '',
          mesServicio: comprobante.ingresoOpMesServicio || '',
        } as OrdenPublicidad);
      } else {
        setSelectedOp(null);
      }
    }
  }, [comprobante]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpSelect = (op: OrdenPublicidad | null) => {
    setSelectedOp(op);
    if (op) {
      setForm(prev => ({
        ...prev,
        ordenPublicidadIdIngreso: op.id,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        ordenPublicidadIdIngreso: '',
      }));
    }
  };

  // Calculated values
  const totalACobrar = useMemo(() => {
    const total = parseFloat(form.total) || 0;
    const retIva = parseFloat(form.retencionIva) || 0;
    const retIIBB = parseFloat(form.ingresosBrutos) || 0;
    const retGanancias = parseFloat(form.retencionGanancias) || 0;
    const retSuss = parseFloat(form.retencionSuss) || 0;
    return total - retIva - retIIBB - retGanancias - retSuss;
  }, [form.total, form.retencionIva, form.ingresosBrutos, form.retencionGanancias, form.retencionSuss]);

  const diasTranscurridos = useMemo(() => {
    return calcularDiasTranscurridos(form.fechaVencimiento);
  }, [form.fechaVencimiento]);

  // Calculate fecha proyección cobro based on acuerdo pago
  const fechaProyeccionCobro = useMemo(() => {
    if (!form.fechaComprobante || !selectedOp?.acuerdoPago) return '';
    const fechaFac = new Date(form.fechaComprobante);
    const diasAcuerdo = parseInt(selectedOp.acuerdoPago) || 0;
    if (diasAcuerdo <= 0) return '';
    fechaFac.setDate(fechaFac.getDate() + diasAcuerdo);
    return formatDate(fechaFac);
  }, [form.fechaComprobante, selectedOp?.acuerdoPago]);

  const handleGuardar = async () => {
    if (!comprobante) return;

    setSaving(true);
    try {
      const { data, error } = await comprobantesService.update({
        id: comprobante.id,
        entidadNombre: form.entidadNombre,
        entidadCuit: form.entidadCuit || undefined,
        empresa: form.empresa || undefined,
        tipoComprobante: form.tipoComprobante as TipoComprobante || undefined,
        puntoVenta: form.puntoVenta || undefined,
        numeroComprobante: form.numeroComprobante || undefined,
        fechaComprobante: form.fechaComprobante ? new Date(form.fechaComprobante) : undefined,
        fechaVencimiento: form.fechaVencimiento ? new Date(form.fechaVencimiento) : undefined,
        total: parseFloat(form.total) || 0,
        ivaAlicuota: parseFloat(form.ivaAlicuota) || 21,
        ivaMonto: parseFloat(form.ivaMonto) || 0,
        neto: parseFloat(form.neto) || 0,
        retencionIva: parseFloat(form.retencionIva) || 0,
        ingresosBrutos: parseFloat(form.ingresosBrutos) || 0,
        retencionGanancias: parseFloat(form.retencionGanancias) || 0,
        retencionSuss: parseFloat(form.retencionSuss) || 0,
        formaPago: form.formaPago as FormaPago || undefined,
        banco: form.banco || undefined,
        numeroOperacion: form.numeroOperacion || undefined,
        fechaIngresoCheque: form.fechaIngresoCheque ? new Date(form.fechaIngresoCheque) : undefined,
        fechaPago: form.fechaPago ? new Date(form.fechaPago) : undefined,
        certificacionEnviadaFecha: form.certificacionEnviadaFecha ? new Date(form.certificacionEnviadaFecha) : undefined,
        portal: form.portal || undefined,
        contacto: form.contacto || undefined,
        fechaEnvio: form.fechaEnvio ? new Date(form.fechaEnvio) : undefined,
        observaciones: form.observaciones || undefined,
        notaAdmin: form.notaAdmin || undefined,
        condicionIva: form.condicionIva as CondicionIva || undefined,
        ordenPublicidadIdIngreso: form.ordenPublicidadIdIngreso || undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (data) {
        toast.success('Ingreso actualizado');
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

  const isFinancialLocked = isComprobanteLocked(comprobante.estadoPago);
  const isAdminLocked = comprobante.estadoPago === 'rechazado' || comprobante.estadoPago === 'pagado';
  const canMarkCobrado = comprobante.estadoPago === 'aprobado';

  const { label: labelClass, input: inputClass } = dialogFormStyles(isDark);

  const financialInputClass = cn(inputClass, isFinancialLocked && "opacity-60 cursor-not-allowed");
  const adminInputClass = cn(inputClass, isAdminLocked && "opacity-60 cursor-not-allowed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[950px] max-h-[90vh]", isDark && "bg-[#1e1e1e] border-gray-800")}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            Admin - Ingreso (Cobro)
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
                    {comprobante.estadoPago === 'pagado' ? 'Cobrado' : ESTADO_PAGO_LABELS[comprobante.estadoPago]}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
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
                {canMarkCobrado && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCambiarEstado('pagado')}
                    disabled={saving}
                    className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    Marcar Cobrado
                  </Button>
                )}
              </div>
            </div>

            {/* Selector OP (opcional) */}
            <div className="space-y-2">
              <Label className={cn(labelClass, "text-blue-600 dark:text-blue-400")}>
                Vincular a Orden de Publicidad (opcional)
              </Label>
              <OrdenPublicidadSelector
                value={form.ordenPublicidadIdIngreso}
                onChange={handleOpSelect}
                disabled={isFinancialLocked}
              />
            </div>

            {/* Contexto OP (si vinculado) */}
            {selectedOp && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Datos de la OP
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-blue-600 dark:text-blue-400">OP:</span> {selectedOp.ordenPublicidad}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Mes:</span> {selectedOp.mesServicio}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Responsable:</span> {selectedOp.responsable}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Unidad Negocio:</span> {selectedOp.unidadNegocio}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Campaña:</span> {selectedOp.nombreCampana}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Marca:</span> {selectedOp.marca}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Razón Social:</span> {selectedOp.razonSocial}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Importe:</span> {selectedOp.totalVenta}</div>
                  <div><span className="text-blue-600 dark:text-blue-400">Condición Pago:</span> {selectedOp.acuerdoPago} días</div>
                </div>
              </div>
            )}

            {/* Datos Factura */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Datos de Factura
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Factura Emitida Por</Label>
                  <Input
                    value={form.entidadNombre}
                    onChange={(e) => handleChange('entidadNombre', e.target.value)}
                    disabled={isFinancialLocked}
                    className={financialInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Empresa</Label>
                  <Input
                    value={form.empresa}
                    onChange={(e) => handleChange('empresa', e.target.value)}
                    disabled={isFinancialLocked}
                    className={financialInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>CUIT</Label>
                  <Input
                    value={form.entidadCuit}
                    onChange={(e) => handleChange('entidadCuit', e.target.value.replace(/[^0-9-]/g, ''))}
                    disabled={isFinancialLocked}
                    maxLength={13}
                    className={financialInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Tipo Comprobante</Label>
                  <Select
                    value={form.tipoComprobante}
                    onValueChange={(v) => handleChange('tipoComprobante', v)}
                    disabled={isFinancialLocked}
                  >
                    <SelectTrigger className={financialInputClass}>
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
                  <Label className={labelClass}>Punto Venta</Label>
                  <Input
                    value={form.puntoVenta}
                    onChange={(e) => handleChange('puntoVenta', e.target.value)}
                    disabled={isFinancialLocked}
                    maxLength={5}
                    className={financialInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Nro Comprobante</Label>
                  <Input
                    value={form.numeroComprobante}
                    onChange={(e) => handleChange('numeroComprobante', e.target.value)}
                    disabled={isFinancialLocked}
                    className={financialInputClass}
                  />
                </div>
                <FormDatePicker
                  label="Fecha Factura"
                  value={form.fechaComprobante}
                  onChange={(v) => handleChange('fechaComprobante', v)}
                  disabled={isFinancialLocked}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <FormDatePicker
                  label="Fecha Vencimiento"
                  value={form.fechaVencimiento}
                  onChange={(v) => handleChange('fechaVencimiento', v)}
                  disabled={isFinancialLocked}
                />
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
              </div>
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
                    className={cn(financialInputClass, "font-semibold")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>IVA %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ivaAlicuota}
                    onChange={(e) => handleChange('ivaAlicuota', e.target.value)}
                    disabled={isFinancialLocked}
                    className={financialInputClass}
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
                    className={financialInputClass}
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
                    className={financialInputClass}
                  />
                </div>
              </div>

              {/* Retenciones */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Ret. IVA</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.retencionIva}
                    onChange={(e) => handleChange('retencionIva', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
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
                  <Label className={cn(labelClass, "text-purple-600 dark:text-purple-400")}>Ret. SUSS</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.retencionSuss}
                    onChange={(e) => handleChange('retencionSuss', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(labelClass, "font-bold text-green-600 dark:text-green-400")}>Total a Cobrar</Label>
                  <div className={cn(
                    "h-9 px-3 flex items-center rounded-md border font-bold",
                    isDark ? "bg-gray-900 border-gray-700 text-green-400" : "bg-green-50 border-green-200 text-green-700"
                  )}>
                    {formatCurrency(totalACobrar, comprobante.moneda)}
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas y Pago */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Datos de Cobro
              </h3>
              <div className="grid grid-cols-4 gap-4">
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
                <FormDatePicker
                  label="Fecha Ingreso Cheque"
                  value={form.fechaIngresoCheque}
                  onChange={(v) => handleChange('fechaIngresoCheque', v)}
                  disabled={isAdminLocked}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                {fechaProyeccionCobro && (
                  <div className="space-y-2">
                    <Label className={cn(labelClass, "text-blue-600 dark:text-blue-400")}>Fecha Proyección Cobro</Label>
                    <div className={cn(
                      "h-9 px-3 flex items-center rounded-md border text-sm",
                      isDark ? "bg-gray-900 border-gray-700 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"
                    )}>
                      {fechaProyeccionCobro}
                    </div>
                  </div>
                )}
                <FormDatePicker
                  label="Fecha Cobro Real"
                  value={form.fechaPago}
                  onChange={(v) => handleChange('fechaPago', v)}
                  disabled={isAdminLocked}
                />
                <div className="space-y-2">
                  <Label className={cn(labelClass, diasTranscurridos > 0 ? "text-red-600 dark:text-red-400" : "")}>
                    Días Transcurridos
                  </Label>
                  <div className={cn(
                    "h-9 px-3 flex items-center rounded-md border text-sm font-medium",
                    diasTranscurridos > 0
                      ? (isDark ? "bg-red-900/20 border-red-700 text-red-400" : "bg-red-50 border-red-200 text-red-700")
                      : (isDark ? "bg-gray-900 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-700")
                  )}>
                    {diasTranscurridos} días
                  </div>
                </div>
              </div>
            </div>

            {/* Certificación */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Certificación
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <FormDatePicker
                  label="Certificación Enviada"
                  value={form.certificacionEnviadaFecha}
                  onChange={(v) => handleChange('certificacionEnviadaFecha', v)}
                  disabled={isAdminLocked}
                />
                <div className="space-y-2">
                  <Label className={labelClass}>Portal</Label>
                  <Input
                    value={form.portal}
                    onChange={(e) => handleChange('portal', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Contacto</Label>
                  <Input
                    value={form.contacto}
                    onChange={(e) => handleChange('contacto', e.target.value)}
                    disabled={isAdminLocked}
                    className={adminInputClass}
                  />
                </div>
                <FormDatePicker
                  label="Fecha Envío"
                  value={form.fechaEnvio}
                  onChange={(v) => handleChange('fechaEnvio', v)}
                  disabled={isAdminLocked}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Observaciones</Label>
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
