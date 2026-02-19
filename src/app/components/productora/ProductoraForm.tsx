import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useData } from '@/app/contexts/DataContext';
import { useProductora } from '@/app/contexts/ProductoraContext';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { FormHeader } from '@/app/components/shared/FormHeader';
import { FormFooter } from '@/app/components/shared/FormFooter';
import { GastoCard, type GastoData } from '@/app/components/shared';
import { ProductoraCargaDatosSection } from './ProductoraCargaDatosSection';
import type { ProductoraCargaDatosSectionErrors } from './ProductoraCargaDatosSection';
import { ProductoraResumen } from './ProductoraResumen';
import { toast } from 'sonner';
import {
  ACUERDOS_PAGO_EXPERIENCE_OPTIONS,
  FORMAS_PAGO_EXPERIENCE_OPTIONS,
  PROGRAMAS_PRODUCTORA_OPTIONS,
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

interface ExistingFormulario {
  formularioEstado?: 'abierto' | 'cerrado' | 'anulado';
}

interface ProductoraFormProps {
  gastoId?: string;
  existingFormulario?: ExistingFormulario;
  onCancel: () => void;
  onSave?: () => void;
}

const MAX_OBSERVACIONES_LENGTH = 250;

export function ProductoraForm({ gastoId, existingFormulario, onCancel, onSave }: ProductoraFormProps) {
  const { isDark } = useTheme();
  const { currentUser } = useData();
  const { gastos: contextGastos, loading: contextLoading, addMultipleGastos, addGastoToFormulario, updateGasto, deleteGasto } = useProductora();

  const isEditing = !!gastoId;
  const isFormularioCerrado =
    existingFormulario?.formularioEstado === 'cerrado' ||
    existingFormulario?.formularioEstado === 'anulado';

  const isGastoLocked = (gasto: GastoItem) => gasto.estado === 'pagado';

  const getSelectedPrograms = (excludeId: string) => {
    return gastos
      .filter((g) => g.id !== excludeId && g.empresaPrograma)
      .map((g) => g.empresaPrograma);
  };

  // Section 1: Header fields
  const [unidadNegocio, setUnidadNegocio] = useState('Productora');
  const [categoriaNegocio, setCategoriaNegocio] = useState('');
  const [rubro, setRubro] = useState('');
  const [subRubro, setSubRubro] = useState('');
  const [nombreCampana, setNombreCampana] = useState('');

  // Section 2: Gastos
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
  const [errors, setErrors] = useState<ProductoraCargaDatosSectionErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [collapsedGastos, setCollapsedGastos] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(!!gastoId);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadedGastoIdsRef = useRef<Set<string>>(new Set());

  // Load existing data when editing
  useEffect(() => {
    if (!gastoId || dataLoaded) return;
    if (contextLoading) {
      setLoadingData(true);
      return;
    }

    const existingGasto = contextGastos.find(g => g.id === gastoId);

    if (existingGasto) {
      setUnidadNegocio(existingGasto.unidadNegocio || 'Productora');
      setCategoriaNegocio(existingGasto.categoriaNegocio || '');
      setRubro(existingGasto.formularioRubro || '');
      setSubRubro(existingGasto.formularioSubRubro || '');
      setNombreCampana(existingGasto.nombreCampana || '');

      const formularioGastos = contextGastos
        .filter(g => g.formularioId === existingGasto.formularioId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (formularioGastos.length > 0) {
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
        setGastos(mappedGastos);
        loadedGastoIdsRef.current = new Set(mappedGastos.map(g => g.id));
      }

      setDataLoaded(true);
    }

    setLoadingData(false);
  }, [gastoId, contextLoading, contextGastos, dataLoaded]);

  const validateForm = (): ProductoraCargaDatosSectionErrors => {
    const newErrors: ProductoraCargaDatosSectionErrors = {};
    if (!unidadNegocio?.trim()) newErrors.unidadNegocio = 'Requerido';
    if (!rubro?.trim()) newErrors.rubro = 'Requerido';
    if (!nombreCampana?.trim()) newErrors.nombreCampana = 'Requerido';
    return newErrors;
  };

  const validateSingleGasto = (g: GastoItem, index: number): string | null => {
    if (!g.facturaEmitidaA?.trim()) return `Gasto #${index + 1}: Debe seleccionar "Factura emitida a"`;
    if (!g.empresa?.trim()) return `Gasto #${index + 1}: Debe seleccionar una empresa`;
    if (!g.empresaPrograma?.trim()) return `Gasto #${index + 1}: Debe seleccionar Empresa/Programa`;
    if (!g.razonSocial?.trim()) return `Gasto #${index + 1}: Debe seleccionar una razón social`;
    if (!g.formaPago?.trim()) return `Gasto #${index + 1}: Debe seleccionar una forma de pago`;
    if (g.formaPago === 'cheque' && !g.acuerdoPago?.trim()) return `Gasto #${index + 1}: Debe seleccionar un acuerdo de pago`;
    if (!g.neto || g.neto <= 0) return `Gasto #${index + 1}: Debe ingresar un importe neto válido`;
    return null;
  };

  const validateGastos = (): string | null => {
    for (let i = 0; i < gastos.length; i++) {
      const error = validateSingleGasto(gastos[i], i);
      if (error) return error;
    }
    return null;
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

  const resetGastoItem = (id: string) => {
    setGastos((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
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
            }
          : g
      )
    );
  };

  const handleDeleteSavedGasto = async (id: string): Promise<boolean> => {
    const success = await deleteGasto(id);
    if (success) {
      loadedGastoIdsRef.current.delete(id);
      if (gastos.length > 1) {
        setGastos((prev) => prev.filter((g) => g.id !== id));
      } else {
        const newId = crypto.randomUUID();
        setGastos([{
          id: newId,
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
        }]);
      }
      toast.success('Gasto eliminado');
      return true;
    }
    toast.error('Error al eliminar gasto');
    return false;
  };

  const updateGastoItem = (id: string, field: keyof GastoItem, value: string | number) => {
    setGastos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const toggleGastoCollapse = (id: string) => {
    setCollapsedGastos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const existingGasto = gastoId ? contextGastos.find(g => g.id === gastoId) : undefined;

  const handleSaveGasto = async (gasto: GastoItem, index: number): Promise<boolean> => {
    const isExisting = loadedGastoIdsRef.current.has(gasto.id);
    setSavingGastos(prev => new Set(prev).add(gasto.id));
    try {
      if (isExisting) {
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
        }
        toast.error(`Error al actualizar gasto #${index + 1}`);
        return false;
      } else {
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
          loadedGastoIdsRef.current.add(result.id);
          setGastos(prev => prev.map(g => g.id === gasto.id ? { ...g, id: result.id } : g));
          toggleGastoCollapse(result.id);
          toast.success(`Gasto #${index + 1} creado`);
          return true;
        }
        toast.error(`Error al crear gasto #${index + 1}`);
        return false;
      }
    } catch (err) {
      console.error('[ProductoraForm] Error guardando gasto:', err);
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

  const hasErrors = (formErrors: ProductoraCargaDatosSectionErrors): boolean => {
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
        const existingGasto = contextGastos.find(g => g.id === gastoId);
        const formularioId = existingGasto?.formularioId;

        const existingGastoIds = new Set(contextGastos.map(g => g.id));
        const gastosToUpdate = gastos.filter(g => existingGastoIds.has(g.id));
        const gastosToCreate = gastos.filter(g => !existingGastoIds.has(g.id));

        let allSucceeded = true;
        let failedCount = 0;

        for (let i = 0; i < gastosToUpdate.length; i++) {
          const g = gastosToUpdate[i];
          const result = await updateGasto({
            id: g.id,
            ...(i === 0 ? { nombreCampana, unidadNegocio, categoriaNegocio, rubro, subRubro } : {}),
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
          if (!result) { allSucceeded = false; failedCount++; }
        }

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
            if (!result) { allSucceeded = false; failedCount++; }
          }
        }

        success = allSucceeded;
        const totalCount = gastosToUpdate.length + gastosToCreate.length;
        if (success) toast.success(`${totalCount} gasto(s) guardado(s) correctamente`);
        else toast.error(`Error al guardar ${failedCount} de ${totalCount} gastos`);
      } else {
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
          unidadNegocio,
          categoriaNegocio,
          rubro,
          subRubro,
          nombreCampana,
          createdBy: currentUser?.id,
          gastos: gastosToCreate,
        });

        success = result.success;
        if (success) toast.success(`${gastos.length} gasto(s) creado(s) correctamente`);
        else toast.error(result.error || 'Error al crear los gastos');
      }

      if (success) onSave?.();
    } catch (err) {
      console.error('Error saving gasto:', err);
      toast.error('Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

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
              ? 'Edite la información del formulario de Productora'
              : 'Complete la información del nuevo formulario de Productora'}
            isCerrado={isFormularioCerrado}
            estadoLabel={existingFormulario?.formularioEstado || 'cerrado'}
            badgeVariant="colored"
            warningVariant="yellow"
          />

          <ProductoraCargaDatosSection
            isDark={isDark}
            unidadNegocio={unidadNegocio}
            setUnidadNegocio={setUnidadNegocio}
            categoriaNegocio={categoriaNegocio}
            setCategoriaNegocio={setCategoriaNegocio}
            rubro={rubro}
            setRubro={setRubro}
            subRubro={subRubro}
            setSubRubro={setSubRubro}
            nombreCampana={nombreCampana}
            setNombreCampana={setNombreCampana}
            errors={errors}
            disabled={isFormularioCerrado}
          />

          {/* Section 2: Carga de importes */}
          <div className="space-y-4">
            <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
              Carga de importes
            </h2>

            {gastos.map((gasto, index) => {
              const isCollapsed = collapsedGastos.has(gasto.id);
              const isThisGastoLocked = isGastoLocked(gasto);
              const isDisabled = isFormularioCerrado || isThisGastoLocked;
              const selectedPrograms = getSelectedPrograms(gasto.id);

              const gastoData: GastoData = {
                ...gasto,
                neto: String(gasto.neto || 0),
              };

              const availableProgramOptions = PROGRAMAS_PRODUCTORA_OPTIONS.filter(
                (opt) => opt.value === gasto.empresaPrograma || !selectedPrograms.includes(opt.value)
              );

              const isGastoNew = !loadedGastoIdsRef.current.has(gasto.id);

              return (
                <GastoCard
                  key={gasto.id}
                  isDark={isDark}
                  gasto={gastoData}
                  index={index}
                  isNew={isGastoNew}
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
                    if (isGastoNew) {
                      if (gastos.length > 1) {
                        removeGastoItem(gasto.id);
                      } else {
                        resetGastoItem(gasto.id);
                      }
                    }
                  }}
                  onDeleteSaved={!isGastoNew ? async () => handleDeleteSavedGasto(gasto.id) : undefined}
                  onSave={async () => {
                    const error = validateSingleGasto(gasto, index);
                    if (error) { toast.error(error); return; }
                    await handleSaveGasto(gasto, index);
                  }}
                  isSaving={savingGastos.has(gasto.id)}
                  showFormaPago
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

          <ProductoraResumen isDark={isDark} total={totalGasto} />

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
