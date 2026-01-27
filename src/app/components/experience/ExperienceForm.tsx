import { useState, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useData } from '@/app/contexts/DataContext';
import { useExperience } from '@/app/contexts/ExperienceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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
import { CurrencyInput } from '@/app/components/ui/currency-input';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import { cn } from '@/app/components/ui/utils';
import { Trash2, ChevronDown, ChevronUp, Paperclip, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  SUBRUBROS_EXPERIENCE_OPTIONS,
  FACTURAS_OPTIONS,
  EMPRESAS_OPTIONS,
  ACUERDOS_PAGO_EXPERIENCE_OPTIONS,
  FORMAS_PAGO_EXPERIENCE_OPTIONS,
  PAISES_OPTIONS,
  PROGRAMAS_EXPERIENCE_OPTIONS,
} from '@/app/utils/implementacionConstants';

interface GastoItem {
  id: string;
  facturaEmitidaA: string;
  empresa: string;
  empresaPrograma: string;
  fechaComprobante: string;
  acuerdoPago: string;
  formaPago: string;
  pais: string;
  neto: number;
  observaciones: string;
  estado: 'pendiente-pago' | 'pagado' | 'anulado';
}

interface FormErrors {
  subrubro?: string;
  nombreCampana?: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
}

interface ExistingFormulario {
  responsable?: string;
  fechaRegistro?: string;
  formularioEstado?: 'abierto' | 'cerrado' | 'anulado';
}

interface ExperienceFormProps {
  gastoId?: string;
  existingFormulario?: ExistingFormulario;
  onCancel: () => void;
  onSave?: () => void;
}

const MAX_DETALLE_LENGTH = 250;
const MAX_OBSERVACIONES_LENGTH = 250;

export function ExperienceForm({ gastoId, existingFormulario, onCancel, onSave }: ExperienceFormProps) {
  const { isDark } = useTheme();
  const { currentUser } = useData();
  const { addMultipleGastos, updateGasto, getGastosByFormularioId, getGastoById } = useExperience();

  // Form-level state
  const isEditing = !!gastoId;
  const isFormularioCerrado =
    existingFormulario?.formularioEstado === 'cerrado' ||
    existingFormulario?.formularioEstado === 'anulado';

  // Helper to check if individual gasto is locked
  const isGastoLocked = (gasto: GastoItem) => gasto.estado === 'pagado';

  // Get programs already selected (for deduplication)
  const getSelectedPrograms = (excludeId: string) => {
    return gastos
      .filter((g) => g.id !== excludeId && g.empresaPrograma)
      .map((g) => g.empresaPrograma);
  };

  // Format date for display
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Section 1: Cargar Datos
  const [unidadNegocio] = useState('Experience');
  const [rubroGasto] = useState('gastos-evento');
  const [subrubro, setSubrubro] = useState('');
  const [nombreCampana, setNombreCampana] = useState('');
  const [detalleCampana, setDetalleCampana] = useState('');

  // Section 2: Proveedor (shared for all gastos)
  const [razonSocial, setRazonSocial] = useState('');
  const [proveedor, setProveedor] = useState('');

  // Section 2: Gastos (repeatable)
  const [gastos, setGastos] = useState<GastoItem[]>([
    {
      id: crypto.randomUUID(),
      facturaEmitidaA: '',
      empresa: '',
      empresaPrograma: '',
      fechaComprobante: new Date().toISOString().split('T')[0],
      acuerdoPago: '',
      formaPago: '',
      pais: 'argentina',
      neto: 0,
      observaciones: '',
      estado: 'pendiente-pago',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [collapsedGastos, setCollapsedGastos] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(false);

  // Load existing data when editing
  useEffect(() => {
    if (!gastoId) return;

    setLoadingData(true);
    const existingGasto = getGastoById(gastoId);

    if (existingGasto) {
      // Load formulario-level fields
      setSubrubro(existingGasto.subrubro || '');
      setNombreCampana(existingGasto.nombreCampana || '');
      setDetalleCampana(existingGasto.detalleCampana || '');
      setProveedor(existingGasto.proveedor || '');
      setRazonSocial(existingGasto.razonSocial || '');

      // Get all gastos from same formulario
      const formularioGastos = getGastosByFormularioId(existingGasto.formularioId);

      if (formularioGastos.length > 0) {
        // Map existing gastos to GastoItem format
        const mappedGastos: GastoItem[] = formularioGastos.map((g) => ({
          id: g.id,
          facturaEmitidaA: g.facturaEmitidaA || '',
          empresa: g.empresaContext || '',
          empresaPrograma: g.empresaPrograma || '',
          fechaComprobante: g.fechaComprobante || new Date().toISOString().split('T')[0],
          acuerdoPago: g.acuerdoPago || '',
          formaPago: g.formaPago || '',
          pais: g.pais || 'argentina',
          neto: g.neto || 0,
          observaciones: g.observaciones || '',
          estado: g.estadoPago === 'pagado' ? 'pagado' : g.estadoPago === 'anulado' ? 'anulado' : 'pendiente-pago',
        }));
        setGastos(mappedGastos);
      }
    }
    setLoadingData(false);
  }, [gastoId, getGastoById, getGastosByFormularioId]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!subrubro?.trim()) {
      newErrors.subrubro = 'Requerido';
    }
    if (!nombreCampana?.trim()) {
      newErrors.nombreCampana = 'Requerido';
    }
    if (!detalleCampana?.trim()) {
      newErrors.detalleCampana = 'Requerido';
    }
    if (!razonSocial?.trim()) {
      newErrors.razonSocial = 'Requerido';
    }
    if (!proveedor?.trim()) {
      newErrors.proveedor = 'Requerido';
    }

    return newErrors;
  };

  const validateSingleGasto = (g: GastoItem, index: number): string | null => {
    if (!g.facturaEmitidaA?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar "Factura emitida a"`;
    }
    if (!g.empresa?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar una empresa`;
    }
    if (!g.empresaPrograma?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar un Empresa/PGM`;
    }
    if (!g.acuerdoPago?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar un acuerdo de pago`;
    }
    if (!g.formaPago?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar una forma de pago`;
    }
    if (!g.neto || g.neto <= 0) {
      return `Gasto #${index + 1}: Debe ingresar un importe neto válido`;
    }
    return null;
  };

  const validateGastos = (): string | null => {
    for (let i = 0; i < gastos.length; i++) {
      const error = validateSingleGasto(gastos[i], i);
      if (error) return error;
    }
    return null;
  };

  const handleProveedorChange = (data: { proveedor: string; razonSocial: string }) => {
    setProveedor(data.proveedor);
    setRazonSocial(data.razonSocial);
  };

  const addGastoItem = () => {
    setGastos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        facturaEmitidaA: '',
        empresa: '',
        empresaPrograma: '',
        fechaComprobante: new Date().toISOString().split('T')[0],
        acuerdoPago: '',
        formaPago: '',
        pais: 'argentina',
        neto: 0,
        observaciones: '',
        estado: 'pendiente-pago',
      },
    ]);
  };

  const removeGastoItem = (id: string) => {
    if (gastos.length === 1) {
      toast.error('Debe haber al menos un gasto');
      return;
    }
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGastoItem = (id: string, field: keyof GastoItem, value: string | number) => {
    setGastos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const toggleGastoCollapse = (id: string) => {
    setCollapsedGastos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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

    const gastosError = validateGastos();
    if (gastosError) {
      toast.error(gastosError);
      return;
    }

    setSaving(true);
    try {
      let success: boolean;

      if (isEditing && gastoId) {
        // Update existing gastos
        const updatePromises = gastos.map((g) =>
          updateGasto({
            id: g.id,
            nombreCampana,
            detalleCampana,
            subrubro,
            proveedor,
            razonSocial,
            neto: g.neto,
            observaciones: g.observaciones,
            facturaEmitidaA: g.facturaEmitidaA,
            empresaContext: g.empresa,
            empresaPrograma: g.empresaPrograma,
            fechaComprobante: g.fechaComprobante,
            acuerdoPago: g.acuerdoPago,
            formaPago: g.formaPago,
            pais: g.pais,
          })
        );
        const results = await Promise.all(updatePromises);
        success = results.every((r) => r);
        if (success) {
          toast.success(`${gastos.length} gasto(s) actualizado(s) correctamente`);
        } else {
          toast.error('Error al actualizar algunos gastos');
        }
      } else {
        // Create new gastos
        const gastosToCreate = gastos.map((g) => ({
          proveedor,
          razonSocial,
          neto: g.neto,
          empresa: g.empresa,
          observaciones: g.observaciones,
          facturaEmitidaA: g.facturaEmitidaA,
          empresaContext: g.empresa,
          empresaPrograma: g.empresaPrograma,
          fechaComprobante: g.fechaComprobante,
          acuerdoPago: g.acuerdoPago,
          formaPago: g.formaPago,
          pais: g.pais,
        }));

        const result = await addMultipleGastos({
          mesGestion: new Date().toISOString().slice(0, 7),
          nombreCampana,
          detalleCampana,
          subrubro,
          createdBy: currentUser?.id,
          gastos: gastosToCreate,
        });

        success = result.success;
        if (success) {
          toast.success(`${gastos.length} gasto(s) creado(s) correctamente`);
        } else {
          toast.error(result.error || 'Error al crear los gastos');
        }
      }

      if (success) {
        onSave?.();
      }
    } catch (err) {
      console.error('Error saving gasto:', err);
      toast.error('Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(val);

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
      case 'pendiente-pago':
        return 'bg-yellow-400';
      case 'pagado':
        return 'bg-green-400';
      case 'anulado':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente-pago':
        return 'Pendiente de pago';
      case 'pagado':
        return 'Pagado';
      case 'anulado':
        return 'Anulado';
      default:
        return estado;
    }
  };

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className={cn('min-h-screen py-4 sm:py-6 flex items-center justify-center', isDark ? 'bg-transparent' : 'bg-white')}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-[660px] mx-auto px-6 sm:px-8 lg:px-0">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
                {isEditing ? 'Editar Gasto' : 'Cargar Datos'}
              </h1>
              {isFormularioCerrado && (
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded',
                    existingFormulario?.formularioEstado === 'anulado'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {existingFormulario?.formularioEstado === 'anulado' ? 'Anulado' : 'Cerrado'}
                </span>
              )}
            </div>
            <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-[#4a5565]')}>
              {isEditing
                ? 'Edite la información del formulario de Experience'
                : 'Complete la información del nuevo formulario de Experience'}
            </p>
          </div>

          {/* Locked Form Alert */}
          {isFormularioCerrado && (
            <div
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border',
                isDark
                  ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              )}
            >
              <Lock className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Este gasto está {existingFormulario?.formularioEstado} y no puede ser editado.
              </p>
            </div>
          )}

          {/* Read-only fields for edit mode */}
          {isEditing && (
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>Responsable</Label>
                <Input
                  type="text"
                  value={existingFormulario?.responsable || currentUser?.nombre || ''}
                  disabled
                  className={disabledSelectClass}
                />
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>Fecha de Registro</Label>
                <Input
                  type="text"
                  value={formatDateDisplay(existingFormulario?.fechaRegistro)}
                  disabled
                  className={disabledSelectClass}
                />
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>Sector</Label>
                <Input type="text" value="Experience" disabled className={disabledSelectClass} />
              </div>
            </div>
          )}

          {/* Section 1: Cargar Datos */}
          <div className="space-y-4">
            {/* Row 1: Unidad de Negocio | Rubro del gasto */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>Unidad de Negocio</Label>
                <Input type="text" value={unidadNegocio} disabled className={disabledSelectClass} />
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Rubro del gasto</Label>
                <Input
                  type="text"
                  value="Gastos de Evento"
                  disabled
                  className={disabledSelectClass}
                />
              </div>
            </div>

            {/* Row 2: Subrubro | Nombre de Campaña */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>
                  Subrubro<span className="text-red-500">*</span>
                </Label>
                <Select value={subrubro} onValueChange={setSubrubro} disabled={isFormularioCerrado}>
                  <SelectTrigger
                    className={cn(
                      isFormularioCerrado ? disabledSelectClass : selectTriggerClass,
                      errors.subrubro && 'border-red-500'
                    )}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBRUBROS_EXPERIENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>
                  Nombre de Campaña<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={nombreCampana}
                  onChange={(e) => setNombreCampana(e.target.value)}
                  placeholder="Buscar campaña"
                  disabled={isFormularioCerrado}
                  className={cn(
                    isFormularioCerrado ? disabledSelectClass : inputClass,
                    errors.nombreCampana && 'border-red-500'
                  )}
                />
              </div>
            </div>

            {/* Row 3: Detalle/campaña */}
            <div className="space-y-1">
              <Label className={labelClass}>
                Detalle/campaña<span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={detalleCampana}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DETALLE_LENGTH) {
                    setDetalleCampana(e.target.value);
                  }
                }}
                placeholder="Concepto de gasto"
                maxLength={MAX_DETALLE_LENGTH}
                disabled={isFormularioCerrado}
                className={cn(
                  isFormularioCerrado
                    ? 'min-h-[72px] resize-none opacity-60 cursor-not-allowed'
                    : textareaClass,
                  errors.detalleCampana && 'border-red-500'
                )}
              />
              <div className={cn('text-xs text-right', isDark ? 'text-gray-500' : 'text-gray-400')}>
                {detalleCampana.length}/{MAX_DETALLE_LENGTH}
              </div>
            </div>
          </div>

          {/* Section 2: Carga de importes */}
          <div className="space-y-4">
            <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
              Carga de importes
            </h2>

            <ProveedorSelector
              value={{ proveedor, razonSocial }}
              onChange={handleProveedorChange}
              allowCreate
              disabled={isFormularioCerrado}
              className={cn(
                errors.proveedor || errors.razonSocial ? '[&_input]:border-red-500' : ''
              )}
            />

            {/* Gastos Items */}
            {gastos.map((gasto, index) => {
              const isCollapsed = collapsedGastos.has(gasto.id);
              const isThisGastoLocked = isGastoLocked(gasto);
              const isDisabled = isFormularioCerrado || isThisGastoLocked;
              const selectedPrograms = getSelectedPrograms(gasto.id);

              return (
                <div
                  key={gasto.id}
                  className={cn(
                    'rounded-lg border-2 p-4',
                    isCollapsed ? 'space-y-0' : 'space-y-4',
                    isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-[#f8f9fc] border-[#e6e7eb]',
                    isDisabled && 'opacity-75'
                  )}
                >
                  {/* Gasto Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleGastoCollapse(gasto.id)}
                  >
                    <div className="flex items-center gap-3">
                      <h3
                        className={cn(
                          'text-lg font-bold',
                          isDark ? 'text-blue-400' : 'text-[#165dfc]'
                        )}
                      >
                        Gasto #{index + 1}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${getEstadoColor(gasto.estado)}`} />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          )}
                        >
                          {getEstadoLabel(gasto.estado)}
                        </span>
                      </div>
                      {isThisGastoLocked && (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {gastos.length > 1 && !isDisabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGastoItem(gasto.id);
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <button
                        type="button"
                        className={cn(
                          'p-1 rounded transition-colors',
                          isDark
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGastoCollapse(gasto.id);
                        }}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible content */}
                  {!isCollapsed && (
                    <>
                      {/* Row 1: Factura emitida a | Empresa */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={labelClass}>
                            Factura emitida a <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={gasto.facturaEmitidaA}
                            onValueChange={(v) => updateGastoItem(gasto.id, 'facturaEmitidaA', v)}
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={isDisabled ? disabledSelectClass : selectTriggerClass}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {FACTURAS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
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
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={isDisabled ? disabledSelectClass : selectTriggerClass}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {EMPRESAS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Row 2: Empresa/PGM | Fecha de comprobante */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={labelClass}>
                            Empresa/PGM <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={gasto.empresaPrograma}
                            onValueChange={(v) => updateGastoItem(gasto.id, 'empresaPrograma', v)}
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={isDisabled ? disabledSelectClass : selectTriggerClass}
                            >
                              <SelectValue placeholder="Seleccionar programa" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROGRAMAS_EXPERIENCE_OPTIONS.filter(
                                (opt) => !selectedPrograms.includes(opt.value)
                              ).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className={labelClass}>
                            Fecha de comprobante <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={gasto.fechaComprobante}
                            onChange={(e) =>
                              updateGastoItem(gasto.id, 'fechaComprobante', e.target.value)
                            }
                            disabled={isDisabled}
                            className={isDisabled ? disabledSelectClass : inputClass}
                          />
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
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={isDisabled ? disabledSelectClass : selectTriggerClass}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACUERDOS_PAGO_EXPERIENCE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
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
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={isDisabled ? disabledSelectClass : selectTriggerClass}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {FORMAS_PAGO_EXPERIENCE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Row 4: País | Neto */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={labelClass}>
                            País <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={gasto.pais}
                            onValueChange={(v) => updateGastoItem(gasto.id, 'pais', v)}
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={isDisabled ? disabledSelectClass : selectTriggerClass}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAISES_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className={labelClass}>
                            Neto <span className="text-red-500">*</span>
                          </Label>
                          <CurrencyInput
                            value={gasto.neto}
                            onChange={(val) => updateGastoItem(gasto.id, 'neto', val)}
                            placeholder="$0"
                            disabled={isDisabled}
                            className={isDisabled ? disabledSelectClass : inputClass}
                          />
                        </div>
                      </div>

                      {/* Row 5: Observaciones */}
                      <div className="space-y-1">
                        <Label className={labelClass}>Observaciones</Label>
                        <Textarea
                          value={gasto.observaciones}
                          onChange={(e) => {
                            if (e.target.value.length <= MAX_OBSERVACIONES_LENGTH) {
                              updateGastoItem(gasto.id, 'observaciones', e.target.value);
                            }
                          }}
                          placeholder="Escribe aquí"
                          maxLength={MAX_OBSERVACIONES_LENGTH}
                          disabled={isDisabled}
                          className={cn(
                            isDisabled
                              ? 'min-h-[72px] resize-none opacity-60 cursor-not-allowed'
                              : textareaClass
                          )}
                        />
                        <div
                          className={cn(
                            'text-xs text-right',
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          )}
                        >
                          {gasto.observaciones.length}/{MAX_OBSERVACIONES_LENGTH}
                        </div>
                      </div>

                      {/* Adjuntar archivos link */}
                      {!isDisabled && (
                        <div>
                          <button
                            type="button"
                            className="flex items-center gap-2 text-sm text-[#0070ff] hover:text-[#0060dd] font-medium"
                          >
                            <Paperclip className="h-4 w-4" />
                            Adjuntar archivos
                          </button>
                        </div>
                      )}

                      {/* Card action buttons - hidden when locked */}
                      {!isDisabled && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (gastos.length > 1) {
                                removeGastoItem(gasto.id);
                              }
                            }}
                            className="text-[#0070ff] hover:text-[#0060dd] text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const error = validateSingleGasto(gasto, index);
                              if (error) {
                                toast.error(error);
                                return;
                              }
                              toggleGastoCollapse(gasto.id);
                              toast.success(`Gasto #${index + 1} guardado`);
                            }}
                            className="border-[#0070ff] text-[#0070ff] hover:bg-[#0070ff]/10 text-xs"
                          >
                            Guardar
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Add Importe Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addGastoItem}
                disabled={isFormularioCerrado}
                className="bg-[#0070ff] hover:bg-[#0060dd] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Agregar importe
              </Button>
            </div>
          </div>

          {/* Section 3: Resumen */}
          <Card
            className={isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-[#e5e7eb]'}
          >
            <CardHeader className="pb-4">
              <CardTitle
                className={cn('text-xl font-medium', isDark ? 'text-white' : 'text-[#101828]')}
              >
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'p-4 rounded-lg border w-[163px]',
                  isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-[#f3f5ff] border-[#e5e7eb]'
                )}
              >
                <p
                  className={cn(
                    'text-xs text-center mb-1',
                    isDark ? 'text-gray-400' : 'text-[#4a5565]'
                  )}
                >
                  Total del gasto
                </p>
                <p
                  className={cn(
                    'text-lg font-bold text-center',
                    isDark ? 'text-white' : 'text-[#101828]'
                  )}
                >
                  {formatCurrency(totalGasto)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 pb-8">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-[#0070ff] hover:text-[#0060dd]"
              disabled={saving}
            >
              {isFormularioCerrado ? 'Volver' : 'Cancelar'}
            </Button>
            {!isFormularioCerrado && (
              <Button
                onClick={handleGuardar}
                className="bg-[#0070ff] hover:bg-[#0060dd] text-white px-8"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
