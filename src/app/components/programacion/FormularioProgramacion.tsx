import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgramacion } from '../../contexts/ProgramacionContext';
import { useFormFields } from '../../contexts/FormFieldsContext';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ProveedorSelector } from '../ProveedorSelector';
import { toast } from 'sonner';
import { Lock, Plus, Trash2, Calendar } from 'lucide-react';
import { cn } from '../ui/utils';
import type { GastoProgramacion, CreateGastoProgramacionInput } from '../../types/programacion';

interface FormularioProgramacionProps {
  gastoId?: string;
  onClose: () => void;
}

interface FormErrors {
  unidadNegocio?: string;
  subrubro?: string;
  nombreCampana?: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
}

interface GastoItem {
  id: string;
  proveedor: string;
  razonSocial: string;
  facturaEmitidaA: string;
  empresa: string;
  empresaPrograma: string;
  fechaComprobante: string;
  acuerdoPago: string;
  formaPago: string;
  neto: number;
  observaciones: string;
  estado: 'pendiente-pago' | 'pagado' | 'anulado';
}

const ACUERDOS_PAGO = ['15 días', '30 días', '45 días', '60 días', '90 días'];
const FORMAS_PAGO = ['Transferencia', 'Cheque', 'Efectivo', 'Tarjeta'];
const EMPRESAS = ['Luzu TV', 'Luzu Media', 'Luzu Experience'];
const FACTURA_EMITIDA_A = ['Cliente', 'Agencia', 'Proveedor'];

const SUB_RUBROS = [
  'Producción',
  'Marketing',
  'Tecnología',
  'Administración',
  'Ventas',
  'Recursos Humanos',
  'Talentos',
  'Técnica',
];

export function FormularioProgramacion({ gastoId, onClose }: FormularioProgramacionProps) {
  const { isDark } = useTheme();
  const { addGasto, updateGasto, getGastoById } = useProgramacion();
  const { fieldsConfig } = useFormFields();
  const { currentUser } = useData();

  const getFieldOptions = (fieldLabel: string, category: string) => {
    const field = fieldsConfig.find(f => f.label === fieldLabel && f.category === category);
    return field?.options.filter(opt => opt.active).map(opt => opt.value) || [];
  };

  const UNIDADES_NEGOCIO = getFieldOptions('Unidad de Negocio', 'Comercial');

  // Section 1: Cargar Datos
  const [unidadNegocio, setUnidadNegocio] = useState('');
  const [rubroGasto] = useState('Gastos de Programación'); // readonly
  const [subrubro, setSubrubro] = useState('');
  const [nombreCampana, setNombreCampana] = useState('');
  const [detalleCampana, setDetalleCampana] = useState('');

  // Section 2: Gastos (repeatable) - each gasto has its own proveedor
  const [gastos, setGastos] = useState<GastoItem[]>([
    {
      id: crypto.randomUUID(),
      proveedor: '',
      razonSocial: '',
      facturaEmitidaA: '',
      empresa: '',
      empresaPrograma: '',
      fechaComprobante: new Date().toISOString().split('T')[0],
      acuerdoPago: '',
      formaPago: '',
      neto: 0,
      observaciones: '',
      estado: 'pendiente-pago',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isEditing = !!gastoId;
  const existingGasto = gastoId ? getGastoById(gastoId) : undefined;
  const isCerrado = existingGasto?.estado === 'cerrado' || existingGasto?.estado === 'anulado';

  useEffect(() => {
    if (existingGasto) {
      setUnidadNegocio(existingGasto.unidadNegocio || '');
      setSubrubro(existingGasto.subRubroEmpresa || '');
      setNombreCampana(existingGasto.programa || '');
      setDetalleCampana(existingGasto.conceptoGasto || '');
      // Map existing data to gastos items - proveedor is now per-gasto
      setGastos([{
        id: existingGasto.id,
        proveedor: existingGasto.proveedor || '',
        razonSocial: existingGasto.razonSocial || '',
        facturaEmitidaA: existingGasto.cliente || '',
        empresa: existingGasto.empresa || '',
        empresaPrograma: existingGasto.programa || '',
        fechaComprobante: existingGasto.createdAt.toISOString().split('T')[0],
        acuerdoPago: existingGasto.acuerdoPago || '',
        formaPago: '',
        neto: existingGasto.neto || 0,
        observaciones: existingGasto.observaciones || '',
        estado: 'pendiente-pago',
      }]);
    }
  }, [existingGasto]);

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!unidadNegocio?.trim()) {
      newErrors.unidadNegocio = 'Requerido';
    }
    if (!subrubro?.trim()) {
      newErrors.subrubro = 'Requerido';
    }
    if (!nombreCampana?.trim()) {
      newErrors.nombreCampana = 'Requerido';
    }
    if (!detalleCampana?.trim()) {
      newErrors.detalleCampana = 'Requerido';
    }
    // Check if at least the first gasto has proveedor (for backward compatibility)
    const firstGasto = gastos[0];
    if (!firstGasto?.proveedor?.trim()) {
      newErrors.proveedor = 'Requerido';
    }
    if (!firstGasto?.razonSocial?.trim()) {
      newErrors.razonSocial = 'Requerido';
    }

    return newErrors;
  }, [unidadNegocio, subrubro, nombreCampana, detalleCampana, gastos]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [unidadNegocio, subrubro, nombreCampana, detalleCampana, gastos, hasAttemptedSubmit, validateForm]);

  const handleProveedorChange = (gastoId: string, data: { proveedor: string; razonSocial: string }) => {
    setGastos(prev => prev.map(g =>
      g.id === gastoId
        ? { ...g, proveedor: data.proveedor, razonSocial: data.razonSocial }
        : g
    ));
  };

  const addGastoItem = () => {
    setGastos(prev => [...prev, {
      id: crypto.randomUUID(),
      proveedor: '',
      razonSocial: '',
      facturaEmitidaA: '',
      empresa: '',
      empresaPrograma: '',
      fechaComprobante: new Date().toISOString().split('T')[0],
      acuerdoPago: '',
      formaPago: '',
      neto: 0,
      observaciones: '',
      estado: 'pendiente-pago',
    }]);
  };

  const removeGastoItem = (id: string) => {
    if (gastos.length === 1) {
      toast.error('Debe haber al menos un gasto');
      return;
    }
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  const updateGastoItem = (id: string, field: keyof GastoItem, value: string | number) => {
    setGastos(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const hasErrors = (formErrors: FormErrors): boolean => {
    return Object.keys(formErrors).length > 0;
  };

  const totalGasto = gastos.reduce((sum, g) => sum + (g.neto || 0), 0);

  const handleGuardar = async () => {
    setHasAttemptedSubmit(true);
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      let success: boolean;
      const mainGasto = gastos[0];

      if (isEditing && existingGasto) {
        success = await updateGasto({
          id: existingGasto.id,
          unidadNegocio,
          subRubroEmpresa: subrubro,
          programa: nombreCampana,
          conceptoGasto: detalleCampana,
          proveedor: mainGasto.proveedor,
          razonSocial: mainGasto.razonSocial,
          cliente: mainGasto.facturaEmitidaA,
          empresa: mainGasto.empresa,
          acuerdoPago: mainGasto.acuerdoPago,
          neto: mainGasto.neto,
          observaciones: mainGasto.observaciones,
        });
        if (success) toast.success('Gasto actualizado correctamente');
        else toast.error('Error al actualizar el gasto');
      } else {
        const input: CreateGastoProgramacionInput = {
          mesGestion: new Date().toISOString().slice(0, 7),
          unidadNegocio,
          programa: nombreCampana,
          proveedor: mainGasto.proveedor,
          razonSocial: mainGasto.razonSocial,
          subRubroEmpresa: subrubro,
          conceptoGasto: detalleCampana,
          cliente: mainGasto.facturaEmitidaA,
          empresa: mainGasto.empresa,
          acuerdoPago: mainGasto.acuerdoPago,
          neto: mainGasto.neto,
          observaciones: mainGasto.observaciones,
          createdBy: currentUser?.id,
        };
        success = await addGasto(input);
        if (success) toast.success('Gasto creado correctamente');
        else toast.error('Error al crear el gasto');
      }

      if (success) onClose();
    } catch (err) {
      console.error('Error saving gasto:', err);
      toast.error('Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  const labelClass = cn(
    'flex items-center gap-1 text-sm font-semibold',
    isDark ? 'text-gray-400' : 'text-[#374151]'
  );

  const inputClass = cn(
    'h-[32px] transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    'disabled:opacity-60 disabled:cursor-not-allowed'
  );

  const selectTriggerClass = cn(
    'h-[32px] w-full transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white'
      : 'bg-white border-[#d1d5db] text-gray-900',
    'disabled:opacity-60 disabled:cursor-not-allowed'
  );

  const disabledSelectClass = cn(
    'h-[32px] w-full transition-colors text-sm',
    isDark
      ? 'bg-[#1e1e1e] border-gray-800 text-gray-400'
      : 'bg-[#f3f4f6] border-[#d1d5db] text-gray-600',
    'cursor-not-allowed'
  );

  const textareaClass = cn(
    'min-h-[72px] resize-none transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    'disabled:opacity-60 disabled:cursor-not-allowed'
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente-pago': return 'bg-yellow-400';
      case 'pagado': return 'bg-green-400';
      case 'anulado': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente-pago': return 'Pendiente de pago';
      case 'pagado': return 'Pagado';
      case 'anulado': return 'Anulado';
      default: return estado;
    }
  };

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-[660px] mx-auto px-6 sm:px-8 lg:px-0">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-[#101828]')}>
                  Cargar Datos
                </h1>
                <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-[#4a5565]')}>
                  Complete la información del nuevo formulario de Programación
                </p>
              </div>
              {isCerrado && (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">
                  Gasto Cerrado
                </span>
              )}
            </div>
            {isCerrado && (
              <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-700 dark:text-red-400">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Este gasto está cerrado y no puede ser editado.</span>
              </div>
            )}
          </div>

          {/* Section 1: Cargar Datos */}
          <div className="space-y-4">
            {/* Row 1: Unidad de Negocio | Rubro del gasto */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>
                  Unidad de Negocio<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={unidadNegocio}
                  onValueChange={setUnidadNegocio}
                  disabled={isCerrado}
                >
                  <SelectTrigger className={cn(selectTriggerClass, errors.unidadNegocio && 'border-red-500')}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_NEGOCIO.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Rubro del gasto</Label>
                <Select value={rubroGasto} disabled>
                  <SelectTrigger className={disabledSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gastos de Programación">Gastos de Programación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Subrubro | Nombre de Campaña */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>
                  Subrubro<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={subrubro}
                  onValueChange={setSubrubro}
                  disabled={isCerrado}
                >
                  <SelectTrigger className={cn(selectTriggerClass, errors.subrubro && 'border-red-500')}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUB_RUBROS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>
                  Nombre de Campaña<span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={nombreCampana}
                    onChange={(e) => setNombreCampana(e.target.value)}
                    placeholder="Buscar"
                    disabled={isCerrado}
                    className={cn(inputClass, 'flex-1', errors.nombreCampana && 'border-red-500')}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-[32px] w-[32px] bg-[#0070ff] hover:bg-[#0060dd] text-white shrink-0"
                    disabled={isCerrado}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Row 3: Detalle/campaña */}
            <div className="space-y-1">
              <Label className={labelClass}>
                Detalle/campaña<span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={detalleCampana}
                onChange={(e) => setDetalleCampana(e.target.value)}
                placeholder="Concepto del gasto"
                disabled={isCerrado}
                className={cn(textareaClass, errors.detalleCampana && 'border-red-500')}
              />
            </div>
          </div>

          {/* Section 2: Carga de importes */}
          <div className="space-y-4">
            <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
              Carga de importes
            </h2>

            {/* Gastos Items */}
            {gastos.map((gasto, index) => (
              <div
                key={gasto.id}
                className={cn(
                  'rounded-lg border-2 p-4 space-y-4',
                  isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-[#f8f9fc] border-[#e6e7eb]'
                )}
              >
                {/* Gasto Header */}
                <div className="flex items-center justify-between">
                  <h3 className={cn('text-base font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
                    Gasto #{index + 1}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`h-4 w-4 rounded-full ${getEstadoColor(gasto.estado)}`} />
                    <span className={cn('text-sm font-medium', isDark ? 'text-gray-300' : 'text-black')}>
                      {getEstadoLabel(gasto.estado)}
                    </span>
                    {gastos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGastoItem(gasto.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        disabled={isCerrado}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Gasto #1 title (blue) */}
                <h4 className="text-lg font-bold text-[#165dfc]">Gasto #{index + 1}</h4>

                {/* Razón social | Proveedor - per gasto */}
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-5">
                    <Label className={labelClass}>
                      Razón social<span className="text-red-500">*</span>
                    </Label>
                    <Label className={labelClass}>
                      Proveedor<span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <ProveedorSelector
                    value={{ proveedor: gasto.proveedor, razonSocial: gasto.razonSocial }}
                    onChange={(data) => handleProveedorChange(gasto.id, data)}
                    disabled={isCerrado}
                    className={cn(
                      index === 0 && (errors.proveedor || errors.razonSocial) ? '[&_input]:border-red-500' : ''
                    )}
                  />
                </div>

                {/* Row 1: Factura emitida a | Empresa */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Factura emitida a <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gasto.facturaEmitidaA}
                      onValueChange={(v) => updateGastoItem(gasto.id, 'facturaEmitidaA', v)}
                      disabled={isCerrado}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACTURA_EMITIDA_A.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Empresa <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gasto.empresa}
                      onValueChange={(v) => updateGastoItem(gasto.id, 'empresa', v)}
                      disabled={isCerrado}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPRESAS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Empresa/Programa | Fecha de comprobante */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Empresa/Programa <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gasto.empresaPrograma}
                      onValueChange={(v) => updateGastoItem(gasto.id, 'empresaPrograma', v)}
                      disabled={isCerrado}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPRESAS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Fecha de comprobante <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={gasto.fechaComprobante}
                        onChange={(e) => updateGastoItem(gasto.id, 'fechaComprobante', e.target.value)}
                        disabled={isCerrado}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Acuerdo de pago | Forma de pago */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Acuerdo de pago <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gasto.acuerdoPago}
                      onValueChange={(v) => updateGastoItem(gasto.id, 'acuerdoPago', v)}
                      disabled={isCerrado}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACUERDOS_PAGO.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Forma de pago <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gasto.formaPago}
                      onValueChange={(v) => updateGastoItem(gasto.id, 'formaPago', v)}
                      disabled={isCerrado}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAS_PAGO.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Neto */}
                <div className="w-1/2 pr-2">
                  <div className="space-y-1">
                    <Label className={labelClass}>
                      Neto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={gasto.neto || ''}
                      onChange={(e) => updateGastoItem(gasto.id, 'neto', parseFloat(e.target.value) || 0)}
                      placeholder="$0"
                      disabled={isCerrado}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 5: Observaciones */}
                <div className="space-y-1">
                  <Label className={labelClass}>Observaciones</Label>
                  <Textarea
                    value={gasto.observaciones}
                    onChange={(e) => updateGastoItem(gasto.id, 'observaciones', e.target.value)}
                    placeholder="Escribe aquí"
                    disabled={isCerrado}
                    className={textareaClass}
                  />
                </div>
              </div>
            ))}

            {/* Add Importe Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addGastoItem}
                className="bg-[#0070ff] hover:bg-[#0060dd] text-white"
                disabled={isCerrado}
              >
                + Agregar importe
              </Button>
            </div>
          </div>

          {/* Section 3: Resumen */}
          <Card className={isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-[#e5e7eb]'}>
            <CardHeader className="pb-4">
              <CardTitle className={cn('text-xl font-medium', isDark ? 'text-white' : 'text-[#101828]')}>
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                'p-4 rounded-lg border w-[163px]',
                isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-[#f3f5ff] border-[#e5e7eb]'
              )}>
                <p className={cn('text-xs text-center mb-1', isDark ? 'text-gray-400' : 'text-[#4a5565]')}>
                  Total del gasto
                </p>
                <p className={cn('text-lg font-bold text-center', isDark ? 'text-white' : 'text-[#101828]')}>
                  {formatCurrency(totalGasto)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 pb-8">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[#0070ff] hover:text-[#0060dd]"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              className="bg-[#0070ff] hover:bg-[#0060dd] text-white px-8"
              disabled={saving || isCerrado}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
