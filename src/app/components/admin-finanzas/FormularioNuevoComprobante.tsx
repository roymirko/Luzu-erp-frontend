import { useState, useEffect } from 'react';
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
import { Card, CardContent } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { formStyles } from '@/app/components/shared/formStyles';
import { FormHeader } from '@/app/components/shared/FormHeader';
import { FormFooter } from '@/app/components/shared/FormFooter';
import { useTheme } from '@/app/contexts/ThemeContext';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import * as comprobantesService from '@/app/services/comprobantesService';
import type { TipoMovimiento, TipoComprobante, Moneda, FormaPago } from '@/app/types/comprobantes';
import { TIPO_COMPROBANTE_LABELS, FORMA_PAGO_LABELS, calcularDesdeTotal } from '@/app/types/comprobantes';

interface FormularioNuevoComprobanteProps {
  onClose: () => void;
  defaultTipoMovimiento?: TipoMovimiento;
}

const TIPO_COMPROBANTE_OPTIONS: TipoComprobante[] = [
  'FA', 'FB', 'FC', 'FE', 'NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC', 'REC', 'TKT', 'OTR'
];

const FORMA_PAGO_OPTIONS: FormaPago[] = ['transferencia', 'cheque', 'efectivo', 'tarjeta', 'otro'];

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
  formaPago: FormaPago | '';
  cotizacion: string;
  banco: string;
  numeroOperacion: string;
  fechaPago: string;
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
  formaPago: '',
  cotizacion: '',
  banco: '',
  numeroOperacion: '',
  fechaPago: '',
};

export function FormularioNuevoComprobante({
  onClose,
  defaultTipoMovimiento = 'ingreso',
}: FormularioNuevoComprobanteProps) {
  const { isDark } = useTheme();
  const [form, setForm] = useState<FormState>({ ...initialFormState, tipoMovimiento: defaultTipoMovimiento });
  const [saving, setSaving] = useState(false);

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
    if (!form.entidadNombre.trim()) {
      toast.error('Debe seleccionar una entidad');
      return;
    }
    const total = parseFloat(form.total);
    if (isNaN(total) || total <= 0) {
      toast.error('Debe ingresar un importe total valido');
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
        total,
        ivaAlicuota: parseFloat(form.ivaAlicuota) || 21,
        ivaMonto: parseFloat(form.ivaMonto) || 0,
        percepciones: parseFloat(form.percepciones) || 0,
        neto: parseFloat(form.neto) || 0,
        empresa: form.empresa || undefined,
        concepto: form.concepto || undefined,
        observaciones: form.observaciones || undefined,
        formaPago: form.formaPago as FormaPago || undefined,
        cotizacion: form.cotizacion ? parseFloat(form.cotizacion) : undefined,
        banco: form.banco || undefined,
        numeroOperacion: form.numeroOperacion || undefined,
        fechaPago: form.fechaPago ? new Date(form.fechaPago) : undefined,
      });
      if (error) { toast.error(error); return; }
      if (data) { toast.success('Comprobante creado correctamente'); onClose(); }
    } finally { setSaving(false); }
  };

  const s = formStyles(isDark);

  return (
    <div>
      <FormHeader
        isDark={isDark}
        title={`Nuevo ${form.tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Egreso'}`}
        isCerrado={false}
      />

      {/* Tipo de Movimiento */}
      <Card className={cn("mb-6", isDark && "bg-[#141414] border-gray-800")}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={s.label}>Tipo de Movimiento *</Label>
              <Select value={form.tipoMovimiento} onValueChange={(v) => handleChange('tipoMovimiento', v)}>
                <SelectTrigger className={s.selectTrigger}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Moneda *</Label>
              <Select value={form.moneda} onValueChange={(v) => handleChange('moneda', v)}>
                <SelectTrigger className={s.selectTrigger}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS - Pesos</SelectItem>
                  <SelectItem value="USD">USD - Dolares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entidad */}
      <Card className={cn("mb-6", isDark && "bg-[#141414] border-gray-800")}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className={s.label}>Entidad *</Label>
            <ProveedorSelector
              value={{ proveedor: form.entidadNombre, razonSocial: form.entidadNombre }}
              onChange={handleProveedorChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label className={s.label}>CUIT</Label>
              <Input value={form.entidadCuit} onChange={(e) => handleChange('entidadCuit', e.target.value.replace(/[^0-9-]/g, ''))} placeholder="XX-XXXXXXXX-X" maxLength={13} className={s.input} />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Empresa</Label>
              <Input value={form.empresa} onChange={(e) => handleChange('empresa', e.target.value)} placeholder="Empresa" className={s.input} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprobante */}
      <Card className={cn("mb-6", isDark && "bg-[#141414] border-gray-800")}>
        <CardContent className="pt-6">
          <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>Datos del Comprobante</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className={s.label}>Tipo Comprobante</Label>
              <Select value={form.tipoComprobante} onValueChange={(v) => handleChange('tipoComprobante', v)}>
                <SelectTrigger className={s.selectTrigger}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{TIPO_COMPROBANTE_OPTIONS.map((tipo) => <SelectItem key={tipo} value={tipo}>{TIPO_COMPROBANTE_LABELS[tipo]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Punto de Venta</Label>
              <Input value={form.puntoVenta} onChange={(e) => handleChange('puntoVenta', e.target.value)} placeholder="0000" maxLength={5} className={s.input} />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Numero</Label>
              <Input value={form.numeroComprobante} onChange={(e) => handleChange('numeroComprobante', e.target.value)} placeholder="00000000" className={s.input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormDatePicker label="Fecha Comprobante" value={form.fechaComprobante} onChange={(v) => handleChange('fechaComprobante', v)} />
            <div className="space-y-2">
              <Label className={s.label}>CAE</Label>
              <Input value={form.cae} onChange={(e) => handleChange('cae', e.target.value)} placeholder="Codigo CAE" className={s.input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormDatePicker label="Vencimiento CAE" value={form.fechaVencimientoCae} onChange={(v) => handleChange('fechaVencimientoCae', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Montos */}
      <Card className={cn("mb-6", isDark && "bg-[#141414] border-gray-800")}>
        <CardContent className="pt-6">
          <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>Importes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={s.label}>Total *</Label>
              <Input type="number" step="0.01" value={form.total} onChange={(e) => handleChange('total', e.target.value)} placeholder="0.00" className={cn(s.input, "font-semibold")} />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>IVA Alicuota (%)</Label>
              <Input type="number" step="0.01" value={form.ivaAlicuota} onChange={(e) => handleChange('ivaAlicuota', e.target.value)} placeholder="21" className={s.input} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label className={s.label}>IVA Monto</Label>
              <Input type="number" step="0.01" value={form.ivaMonto} placeholder="0.00" className={cn(s.input, "bg-gray-100 dark:bg-gray-900")} readOnly />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Percepciones</Label>
              <Input type="number" step="0.01" value={form.percepciones} onChange={(e) => handleChange('percepciones', e.target.value)} placeholder="0.00" className={s.input} />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Neto</Label>
              <Input type="number" step="0.01" value={form.neto} placeholder="0.00" className={cn(s.input, "bg-gray-100 dark:bg-gray-900")} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pago/Cobro */}
      <Card className={cn("mb-6", isDark && "bg-[#141414] border-gray-800")}>
        <CardContent className="pt-6">
          <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
            Datos de {form.tipoMovimiento === 'ingreso' ? 'Cobro' : 'Pago'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={s.label}>Forma de Pago</Label>
              <Select value={form.formaPago} onValueChange={(v) => handleChange('formaPago', v)}>
                <SelectTrigger className={s.selectTrigger}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{FORMA_PAGO_OPTIONS.map((fp) => <SelectItem key={fp} value={fp}>{FORMA_PAGO_LABELS[fp]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <FormDatePicker label={`Fecha de ${form.tipoMovimiento === 'ingreso' ? 'Cobro' : 'Pago'}`} value={form.fechaPago} onChange={(v) => handleChange('fechaPago', v)} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label className={s.label}>Banco</Label>
              <Input value={form.banco} onChange={(e) => handleChange('banco', e.target.value)} placeholder="Nombre del banco" className={s.input} />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>Nro. Operacion</Label>
              <Input value={form.numeroOperacion} onChange={(e) => handleChange('numeroOperacion', e.target.value)} placeholder="Numero de operacion" className={s.input} />
            </div>
            {form.moneda === 'USD' && (
              <div className="space-y-2">
                <Label className={s.label}>Cotizacion</Label>
                <Input type="number" step="0.0001" value={form.cotizacion} onChange={(e) => handleChange('cotizacion', e.target.value)} placeholder="Tipo de cambio" className={s.input} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Concepto */}
      <Card className={cn("mb-6", isDark && "bg-[#141414] border-gray-800")}>
        <CardContent className="pt-6">
          <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-gray-300" : "text-gray-700")}>Descripcion</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={s.label}>Concepto</Label>
              <Input value={form.concepto} onChange={(e) => handleChange('concepto', e.target.value)} placeholder="Concepto del comprobante" className={s.input} />
            </div>
            <div className="space-y-2">
              <Label className={s.label}>{form.tipoMovimiento === 'egreso' ? 'Detalle de gasto' : 'Observaciones'}</Label>
              <Textarea value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} placeholder={form.tipoMovimiento === 'egreso' ? 'Detalle del gasto' : 'Observaciones adicionales'} rows={3} className={s.textarea} />
            </div>
          </div>
        </CardContent>
      </Card>

      <FormFooter saving={saving} onCancel={onClose} onSave={handleGuardar} />
    </div>
  );
}
