import { useState, useEffect, useRef } from 'react';
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
import { cn } from '@/app/components/ui/utils';
import { formatCurrency } from '@/app/utils/format';
import { formStyles } from '@/app/components/shared/formStyles';
import { FormHeader } from '@/app/components/shared/FormHeader';
import { FormFooter } from '@/app/components/shared/FormFooter';
import { GastoCard, type GastoData } from '@/app/components/shared';
import { toast } from 'sonner';
import {
  SUBRUBROS_EXPERIENCE_OPTIONS,
  ACUERDOS_PAGO_EXPERIENCE_OPTIONS,
  FORMAS_PAGO_EXPERIENCE_OPTIONS,
  PROGRAMAS_EXPERIENCE_OPTIONS,
} from '@/app/utils/implementacionConstants';

interface GastoItem {
  id: string;
  facturaEmitidaA: string;
  empresa: string;
  empresaPrograma: string;
  fechaComprobante: string;
  razonSocial: string;
  proveedor: string;
  acuerdoPago: string;
  numeroComprobante: string;
  formaPago: string;
  pais: string;
  neto: number;
  observaciones: string;
  estado: 'pendiente-pago' | 'pagado' | 'anulado';
}

interface FormErrors {
  subrubro?: string;
  nombreCampana?: string;
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

const MAX_OBSERVACIONES_LENGTH = 250;

export function ExperienceForm({ gastoId, existingFormulario, onCancel, onSave }: ExperienceFormProps) {
  const { isDark } = useTheme();
  const { currentUser, users } = useData();
  const { gastos: contextGastos, loading: contextLoading, addMultipleGastos, addGastoToFormulario, updateGasto, getGastosByFormularioId, getGastoById } = useExperience();

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

  // Section 2: Gastos (repeatable)
  const [gastos, setGastos] = useState<GastoItem[]>([
    {
      id: crypto.randomUUID(),
      facturaEmitidaA: '',
      empresa: '',
      empresaPrograma: '',
      fechaComprobante: new Date().toISOString().split('T')[0],
      razonSocial: '',
      proveedor: '',
      acuerdoPago: '',
      numeroComprobante: '',
      formaPago: '',
      pais: 'argentina',
      neto: 0,
      observaciones: '',
      estado: 'pendiente-pago',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [savingGastos, setSavingGastos] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [collapsedGastos, setCollapsedGastos] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(!!gastoId);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Track IDs of gastos loaded from DB (to distinguish from locally added)
  const loadedGastoIdsRef = useRef<Set<string>>(new Set());

  // Load existing data when editing - wait for context to finish loading
  useEffect(() => {
    // Skip if not editing or already loaded
    if (!gastoId || dataLoaded) return;

    // Wait for context to finish loading
    if (contextLoading) {
      setLoadingData(true);
      return;
    }

    // Context is loaded, try to find the gasto
    const existingGasto = contextGastos.find(g => g.id === gastoId);

    if (existingGasto) {
      console.log('[ExperienceForm] Loading existing gasto:', existingGasto);

      // Load formulario-level fields
      setSubrubro(existingGasto.subrubro || '');
      setNombreCampana(existingGasto.nombreCampana || '');

      // Get all gastos from same formulario and sort by createdAt (oldest first)
      const formularioGastos = contextGastos
        .filter(g => g.formularioId === existingGasto.formularioId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      console.log('[ExperienceForm] Formulario gastos:', formularioGastos.length);

      if (formularioGastos.length > 0) {
        // Map existing gastos to GastoItem format
        const mappedGastos: GastoItem[] = formularioGastos.map((g) => ({
          id: g.id,
          facturaEmitidaA: g.facturaEmitidaA || '',
          empresa: g.empresaContext || '',
          empresaPrograma: g.empresaPrograma || '',
          fechaComprobante: g.fechaComprobante || new Date().toISOString().split('T')[0],
          razonSocial: g.razonSocial || '',
          proveedor: g.proveedor || '',
          acuerdoPago: g.acuerdoPago || '',
          numeroComprobante: g.numeroFactura || '',
          formaPago: g.formaPago || '',
          pais: g.pais || 'argentina',
          neto: g.neto || 0,
          observaciones: g.observaciones || '',
          estado: g.estadoPago === 'pagado' ? 'pagado' : g.estadoPago === 'anulado' ? 'anulado' : 'pendiente-pago',
        }));
        console.log('[ExperienceForm] Mapped gastos:', mappedGastos);
        setGastos(mappedGastos);
        // Track loaded gasto IDs
        loadedGastoIdsRef.current = new Set(mappedGastos.map(g => g.id));
      }

      setDataLoaded(true);
    }

    setLoadingData(false);
  }, [gastoId, contextLoading, contextGastos, dataLoaded]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!subrubro?.trim()) {
      newErrors.subrubro = 'Requerido';
    }
    if (!nombreCampana?.trim()) {
      newErrors.nombreCampana = 'Requerido';
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
      return `Gasto #${index + 1}: Debe seleccionar Empresa/Programa`;
    }
    if (!g.razonSocial?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar una razón social`;
    }
    if (!g.formaPago?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar una forma de pago`;
    }
    // Acuerdo de pago solo requerido si forma de pago es cheque
    if (g.formaPago === 'cheque' && !g.acuerdoPago?.trim()) {
      return `Gasto #${index + 1}: Debe seleccionar un acuerdo de pago`;
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

  const handleGastoProveedorChange = (gastoId: string, data: { proveedor: string; razonSocial: string }) => {
    setGastos((prev) =>
      prev.map((g) =>
        g.id === gastoId
          ? { ...g, proveedor: data.proveedor, razonSocial: data.razonSocial }
          : g
      )
    );
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
        razonSocial: '',
        proveedor: '',
        acuerdoPago: '',
        numeroComprobante: '',
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

  // Get existing gasto info (for formularioId)
  const existingGasto = gastoId ? contextGastos.find(g => g.id === gastoId) : undefined;

  // Save a single gasto to the database
  const handleSaveGasto = async (gasto: GastoItem, index: number): Promise<boolean> => {
    const isExisting = loadedGastoIdsRef.current.has(gasto.id);
    console.log('[ExperienceForm] Guardando gasto individual:', gasto.id, 'isExisting:', isExisting);

    setSavingGastos(prev => new Set(prev).add(gasto.id));
    try {
      if (isExisting) {
        // Update existing gasto
        const success = await updateGasto({
          id: gasto.id,
          neto: gasto.neto,
          empresa: gasto.empresa,
          empresaPrograma: gasto.empresaPrograma,
          observaciones: gasto.observaciones,
          facturaEmitidaA: gasto.facturaEmitidaA,
          proveedor: gasto.proveedor,
          razonSocial: gasto.razonSocial,
          acuerdoPago: gasto.acuerdoPago,
          numeroFactura: gasto.numeroComprobante || undefined,
          formaPago: gasto.formaPago,
          pais: gasto.pais,
          fechaComprobante: gasto.fechaComprobante,
        });

        if (success) {
          toggleGastoCollapse(gasto.id);
          toast.success(`Gasto #${index + 1} actualizado`);
          return true;
        } else {
          toast.error(`Error al actualizar gasto #${index + 1}`);
          return false;
        }
      } else {
        // For new gastos, we need a formularioId
        if (!existingGasto?.formularioId) {
          toast.error('Debe guardar el formulario primero para agregar nuevos gastos');
          return false;
        }

        const result = await addGastoToFormulario(existingGasto.formularioId, {
          facturaEmitidaA: gasto.facturaEmitidaA,
          empresa: gasto.empresa,
          empresaPrograma: gasto.empresaPrograma,
          fechaComprobante: gasto.fechaComprobante,
          razonSocial: gasto.razonSocial,
          proveedor: gasto.proveedor,
          acuerdoPago: gasto.acuerdoPago,
          numeroFactura: gasto.numeroComprobante || undefined,
          formaPago: gasto.formaPago,
          pais: gasto.pais,
          neto: gasto.neto,
          observaciones: gasto.observaciones,
          createdBy: currentUser?.id,
        });

        if (result) {
          // Update the gasto ID in state with the real DB ID
          loadedGastoIdsRef.current.add(result.id);
          setGastos(prev => prev.map(g =>
            g.id === gasto.id ? { ...g, id: result.id } : g
          ));
          toggleGastoCollapse(result.id);
          toast.success(`Gasto #${index + 1} creado`);
          return true;
        } else {
          toast.error(`Error al crear gasto #${index + 1}`);
          return false;
        }
      }
    } catch (err) {
      console.error('[ExperienceForm] Error guardando gasto:', err);
      toast.error(`Error inesperado al guardar gasto #${index + 1}`);
      return false;
    } finally {
      setSavingGastos(prev => {
        const next = new Set(prev);
        next.delete(gasto.id);
        return next;
      });
    }
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
        // Get the formularioId from the first existing gasto
        const existingGasto = contextGastos.find(g => g.id === gastoId);
        const formularioId = existingGasto?.formularioId;

        // Separate gastos into existing (in DB) and new (not in DB)
        const existingGastoIds = new Set(contextGastos.map(g => g.id));
        const gastosToUpdate = gastos.filter(g => existingGastoIds.has(g.id));
        const gastosToCreate = gastos.filter(g => !existingGastoIds.has(g.id));

        let allSucceeded = true;
        let failedCount = 0;

        // Update existing gastos
        for (let i = 0; i < gastosToUpdate.length; i++) {
          const g = gastosToUpdate[i];
          const result = await updateGasto({
            id: g.id,
            // Only update formulario fields on the first gasto to avoid conflicts
            ...(i === 0 ? { nombreCampana, subrubro } : {}),
            proveedor: g.proveedor,
            razonSocial: g.razonSocial,
            neto: g.neto,
            observaciones: g.observaciones,
            facturaEmitidaA: g.facturaEmitidaA,
            empresaContext: g.empresa,
            empresaPrograma: g.empresaPrograma,
            fechaComprobante: g.fechaComprobante,
            acuerdoPago: g.acuerdoPago,
            numeroFactura: g.numeroComprobante || undefined,
            formaPago: g.formaPago,
            pais: g.pais,
          });

          if (!result) {
            allSucceeded = false;
            failedCount++;
            console.error(`Failed to update gasto ${i + 1} (id: ${g.id})`);
          }
        }

        // Create new gastos (added to existing formulario)
        if (formularioId && gastosToCreate.length > 0) {
          for (const g of gastosToCreate) {
            const result = await addGastoToFormulario(formularioId, {
              proveedor: g.proveedor,
              razonSocial: g.razonSocial,
              neto: g.neto,
              observaciones: g.observaciones,
              facturaEmitidaA: g.facturaEmitidaA,
              empresaContext: g.empresa,
              empresaPrograma: g.empresaPrograma,
              fechaComprobante: g.fechaComprobante,
              acuerdoPago: g.acuerdoPago,
              numeroFactura: g.numeroComprobante || undefined,
              formaPago: g.formaPago,
              pais: g.pais,
              createdBy: currentUser?.id,
            });

            if (!result) {
              allSucceeded = false;
              failedCount++;
              console.error(`Failed to create new gasto`);
            }
          }
        }

        success = allSucceeded;
        const totalCount = gastosToUpdate.length + gastosToCreate.length;
        if (success) {
          toast.success(`${totalCount} gasto(s) guardado(s) correctamente`);
        } else {
          toast.error(`Error al guardar ${failedCount} de ${totalCount} gastos`);
        }
      } else {
        // Create new gastos
        const gastosToCreate = gastos.map((g) => ({
          proveedor: g.proveedor,
          razonSocial: g.razonSocial,
          neto: g.neto,
          empresa: g.empresa,
          observaciones: g.observaciones,
          facturaEmitidaA: g.facturaEmitidaA,
          empresaContext: g.empresa,
          empresaPrograma: g.empresaPrograma,
          fechaComprobante: g.fechaComprobante,
          acuerdoPago: g.acuerdoPago,
          numeroFactura: g.numeroComprobante || undefined,
          formaPago: g.formaPago,
          pais: g.pais,
        }));

        const result = await addMultipleGastos({
          mesGestion: new Date().toISOString().slice(0, 7),
          nombreCampana,
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

  const { label: labelClass, input: inputClass, selectTrigger: selectTriggerClass, disabledSelect: disabledSelectClass, textarea: textareaClass } = formStyles(isDark);


  // Show loading state while fetching data (only for edit mode)
  if (isEditing && (loadingData || contextLoading)) {
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
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-6 sm:space-y-8">
          <FormHeader
            isDark={isDark}
            title={isEditing ? 'Editar Gasto' : 'Cargar Datos'}
            subtitle={isEditing
              ? 'Edite la información del formulario de Experience'
              : 'Complete la información del nuevo formulario de Experience'}
            isCerrado={isFormularioCerrado}
            estadoLabel={existingFormulario?.formularioEstado || 'cerrado'}
            badgeVariant="colored"
            warningVariant="yellow"
          />

          {/* Read-only fields for edit mode */}
          {isEditing && (
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>Responsable</Label>
                <Input
                  type="text"
                  value={existingFormulario?.responsable || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '')}
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
          </div>

          {/* Section 2: Carga de importes */}
          <div className="space-y-4">
            <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
              Carga de importes
            </h2>

            {/* Gastos Items */}
            {gastos.map((gasto, index) => {
              const isCollapsed = collapsedGastos.has(gasto.id);
              const isThisGastoLocked = isGastoLocked(gasto);
              const isDisabled = isFormularioCerrado || isThisGastoLocked;
              const selectedPrograms = getSelectedPrograms(gasto.id);

              // Convert GastoItem to GastoData format
              const gastoData: GastoData = {
                ...gasto,
                neto: String(gasto.neto || 0),
              };

              // Filter program options to exclude already selected
              const availableProgramOptions = PROGRAMAS_EXPERIENCE_OPTIONS.filter(
                (opt) => opt.value === gasto.empresaPrograma || !selectedPrograms.includes(opt.value)
              );

              return (
                <GastoCard
                  key={gasto.id}
                  isDark={isDark}
                  gasto={gastoData}
                  index={index}
                  isNew={false}
                  isDisabled={isDisabled}
                  estado={gasto.estado}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleGastoCollapse(gasto.id)}
                  onUpdate={(field, value) => {
                    if (field === 'neto') {
                      updateGastoItem(gasto.id, field, Number(value) || 0);
                    } else {
                      updateGastoItem(gasto.id, field as keyof GastoItem, value);
                    }
                  }}
                  onCancel={() => {
                    if (gastos.length > 1) {
                      removeGastoItem(gasto.id);
                    }
                  }}
                  onSave={async () => {
                    const error = validateSingleGasto(gasto, index);
                    if (error) {
                      toast.error(error);
                      return;
                    }
                    await handleSaveGasto(gasto, index);
                  }}
                  isSaving={savingGastos.has(gasto.id)}
                  showFormaPago
                  showPais
                  showCharacterCount
                  showButtonsBorder
                  maxObservacionesLength={MAX_OBSERVACIONES_LENGTH}
                  observacionesLabel="Detalle de gasto"
                  programOptions={availableProgramOptions}
                  acuerdoPagoOptions={ACUERDOS_PAGO_EXPERIENCE_OPTIONS}
                  formaPagoOptions={FORMAS_PAGO_EXPERIENCE_OPTIONS}
                />
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

          <FormFooter
            saving={saving}
            onCancel={onCancel}
            onSave={handleGuardar}
            isCerrado={isFormularioCerrado}
            hideSaveWhenCerrado
            cancelLabelCerrado="Volver"
            paddingTop="pt-4"
          />
        </div>
      </div>
    </div>
  );
}
