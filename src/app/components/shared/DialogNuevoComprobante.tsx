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
import { useTheme } from '@/app/contexts/ThemeContext';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import * as comprobantesService from '@/app/services/comprobantesService';
import type { Comprobante, TipoMovimiento, TipoComprobante, Moneda } from '@/app/types/comprobantes';
import { TIPO_COMPROBANTE_LABELS, calcularTotal } from '@/app/types/comprobantes';

interface DialogNuevoComprobanteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComprobanteCreado?: (comprobante: Comprobante) => void;
  defaultTipoMovimiento?: TipoMovimiento;
}

const TIPO_COMPROBANTE_OPTIONS: TipoComprobante[] = [
  'FA', 'FB', 'FC', 'FE', 'NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC', 'REC', 'TKT', 'OTR'
];

interface FormState {
  tipoMovimiento: TipoMovimiento;
  entidadId: string | null;
  entidadNombre: string;
  entidadCuit: string;
  tipoComprobante: TipoComprobante | '';
  puntoVenta: string;
  numeroComprobante: string;
  fechaComprobante: string;
  cae: string;
  fechaVencimientoCae: string;
  moneda: Moneda;
  neto: string;
  ivaAlicuota: string;
  ivaMonto: string;
  percepciones: string;
  total: string;
  empresa: string;
  concepto: string;
  observaciones: string;
}

const initialFormState: FormState = {
  tipoMovimiento: 'ingreso',
  entidadId: null,
  entidadNombre: '',
  entidadCuit: '',
  tipoComprobante: '',
  puntoVenta: '',
  numeroComprobante: '',
  fechaComprobante: '',
  cae: '',
  fechaVencimientoCae: '',
  moneda: 'ARS',
  neto: '',
  ivaAlicuota: '21',
  ivaMonto: '',
  percepciones: '0',
  total: '',
  empresa: '',
  concepto: '',
  observaciones: '',
};

export function DialogNuevoComprobante({
  open,
  onOpenChange,
  onComprobanteCreado,
  defaultTipoMovimiento = 'ingreso',
}: DialogNuevoComprobanteProps) {
  const { isDark } = useTheme();
  const [form, setForm] = useState<FormState>({ ...initialFormState, tipoMovimiento: defaultTipoMovimiento });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...initialFormState, tipoMovimiento: defaultTipoMovimiento });
    }
  }, [open, defaultTipoMovimiento]);

  // Auto-calculate IVA and Total
  useEffect(() => {
    const neto = parseFloat(form.neto) || 0;
    const ivaAlicuota = parseFloat(form.ivaAlicuota) || 0;
    const percepciones = parseFloat(form.percepciones) || 0;

    const { ivaMonto, total } = calcularTotal(neto, ivaAlicuota, percepciones);

    setForm(prev => ({
      ...prev,
      ivaMonto: ivaMonto.toFixed(2),
      total: total.toFixed(2),
    }));
  }, [form.neto, form.ivaAlicuota, form.percepciones]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProveedorChange = (data: { proveedor: string; razonSocial: string; proveedorId: string | null }) => {
    setForm(prev => ({
      ...prev,
      entidadNombre: data.razonSocial || data.proveedor,
      entidadId: data.proveedorId,
    }));
  };

  const handleGuardar = async () => {
    // Validation
    if (!form.entidadNombre.trim()) {
      toast.error('Debe seleccionar una entidad');
      return;
    }

    const neto = parseFloat(form.neto);
    if (isNaN(neto) || neto <= 0) {
      toast.error('Debe ingresar un importe neto válido');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await comprobantesService.create({
        tipoMovimiento: form.tipoMovimiento,
        entidadId: form.entidadId || undefined,
        entidadNombre: form.entidadNombre,
        entidadCuit: form.entidadCuit || undefined,
        tipoComprobante: form.tipoComprobante as TipoComprobante || undefined,
        puntoVenta: form.puntoVenta || undefined,
        numeroComprobante: form.numeroComprobante || undefined,
        fechaComprobante: form.fechaComprobante ? new Date(form.fechaComprobante) : undefined,
        cae: form.cae || undefined,
        fechaVencimientoCae: form.fechaVencimientoCae ? new Date(form.fechaVencimientoCae) : undefined,
        moneda: form.moneda,
        neto: neto,
        ivaAlicuota: parseFloat(form.ivaAlicuota) || 21,
        ivaMonto: parseFloat(form.ivaMonto) || 0,
        percepciones: parseFloat(form.percepciones) || 0,
        total: parseFloat(form.total) || neto,
        empresa: form.empresa || undefined,
        concepto: form.concepto || undefined,
        observaciones: form.observaciones || undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (data) {
        toast.success('Comprobante creado correctamente');
        onComprobanteCreado?.(data);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const labelClass = cn(
    "text-sm font-semibold",
    isDark ? "text-gray-400" : "text-[#374151]"
  );

  const inputClass = cn(
    "h-9",
    isDark
      ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
      : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[700px] max-h-[90vh]", isDark && "bg-[#1e1e1e] border-gray-800")}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            Nuevo {form.tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Tipo de Movimiento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Tipo de Movimiento *</Label>
                <Select
                  value={form.tipoMovimiento}
                  onValueChange={(v) => handleChange('tipoMovimiento', v)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="egreso">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Moneda *</Label>
                <Select
                  value={form.moneda}
                  onValueChange={(v) => handleChange('moneda', v)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS - Pesos</SelectItem>
                    <SelectItem value="USD">USD - Dólares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entidad */}
            <div className="space-y-2">
              <Label className={labelClass}>Entidad *</Label>
              <ProveedorSelector
                value={{ proveedor: form.entidadNombre, razonSocial: form.entidadNombre }}
                onChange={handleProveedorChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>CUIT</Label>
                <Input
                  value={form.entidadCuit}
                  onChange={(e) => handleChange('entidadCuit', e.target.value.replace(/[^0-9-]/g, ''))}
                  placeholder="XX-XXXXXXXX-X"
                  maxLength={13}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Empresa</Label>
                <Input
                  value={form.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  placeholder="Empresa"
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
                    placeholder="0000"
                    maxLength={5}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Número</Label>
                  <Input
                    value={form.numeroComprobante}
                    onChange={(e) => handleChange('numeroComprobante', e.target.value)}
                    placeholder="00000000"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormDatePicker
                  label="Fecha Comprobante"
                  value={form.fechaComprobante}
                  onChange={(v) => handleChange('fechaComprobante', v)}
                />
                <div className="space-y-2">
                  <Label className={labelClass}>CAE</Label>
                  <Input
                    value={form.cae}
                    onChange={(e) => handleChange('cae', e.target.value)}
                    placeholder="Código CAE"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormDatePicker
                  label="Vencimiento CAE"
                  value={form.fechaVencimientoCae}
                  onChange={(v) => handleChange('fechaVencimientoCae', v)}
                />
              </div>
            </div>

            {/* Montos */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Importes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Neto *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.neto}
                    onChange={(e) => handleChange('neto', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>IVA Alícuota (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ivaAlicuota}
                    onChange={(e) => handleChange('ivaAlicuota', e.target.value)}
                    placeholder="21"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className={labelClass}>IVA Monto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.ivaMonto}
                    onChange={(e) => handleChange('ivaMonto', e.target.value)}
                    placeholder="0.00"
                    className={cn(inputClass, "bg-gray-100 dark:bg-gray-900")}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Percepciones</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.percepciones}
                    onChange={(e) => handleChange('percepciones', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.total}
                    onChange={(e) => handleChange('total', e.target.value)}
                    placeholder="0.00"
                    className={cn(inputClass, "bg-gray-100 dark:bg-gray-900 font-semibold")}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Concepto */}
            <div className="border-t pt-4 mt-4">
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Descripción
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Concepto</Label>
                  <Input
                    value={form.concepto}
                    onChange={(e) => handleChange('concepto', e.target.value)}
                    placeholder="Concepto del comprobante"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Observaciones</Label>
                  <Textarea
                    value={form.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                    placeholder="Observaciones adicionales"
                    rows={3}
                    className={cn(
                      isDark
                        ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
                        : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={saving}
            className="bg-[#fb2c36] hover:bg-[#fb2c36]/90 text-white"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
