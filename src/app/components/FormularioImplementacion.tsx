import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useImplementacion } from '../contexts/ImplementacionContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { cn } from './ui/utils';
import { formatCurrency } from '@/app/utils/format';
import { FormHeader } from '@/app/components/shared/FormHeader';
import { FormFooter } from '@/app/components/shared/FormFooter';
import {
  CampaignInfoCard,
  CargaImportesSection,
  ResumenPresupuestario,
  type ImportesErrors,
  type BloqueImporte,
  type EstadoOP,
} from './implementacion';
import type { CreateGastoImplementacionInput, GastoImplementacion } from '../types/implementacion';
import { IMPLEMENTACION_DEFAULTS } from '@/app/utils/implementacionConstants';

interface FormularioImplementacionProps {
  gastoId?: string;
  formId?: string;
  itemId?: string;
  onClose: () => void;
}

interface FormErrors {
  cargaDatos: Record<string, never>;
  importes: ImportesErrors;
}

const EMPTY_ERRORS: FormErrors = {
  cargaDatos: {},
  importes: {},
};

// Convert GastoImplementacion (from service) to BloqueImporte (UI)
function gastoToBloqueImporte(gasto: GastoImplementacion): BloqueImporte {
  return {
    id: gasto.id,
    programa: '',
    empresaPgm: gasto.sector || '',
    itemOrdenPublicidadId: gasto.itemOrdenPublicidadId,
    facturaEmitidaA: gasto.facturaEmitidaA || '',
    empresa: gasto.empresa || '',
    fechaComprobante: gasto.fechaFactura || new Date().toISOString().split('T')[0],
    proveedor: gasto.proveedor,
    razonSocial: gasto.razonSocial,
    condicionPago: gasto.condicionPago || '30',
    numeroComprobante: gasto.numeroFactura || '',
    formaPago: gasto.formaPago || '',
    neto: String(gasto.neto),
    observaciones: gasto.observaciones || '',
    documentoAdjunto: gasto.adjuntos?.[0],
    estadoPgm: gasto.estadoPago === 'pagado' ? 'pagado' : gasto.estadoPago === 'anulado' ? 'anulado' : 'pendiente',
  };
}

// Convert BloqueImporte (UI) to CreateGastoImplementacionInput (service)
function bloqueToCreateInput(
  bloque: BloqueImporte,
  shared: {
    ordenPublicidadId?: string;
    defaultItemOrdenPublicidadId?: string;
    rubro?: string;
    subRubro?: string;
  }
): CreateGastoImplementacionInput {
  return {
    proveedor: bloque.proveedor,
    razonSocial: bloque.razonSocial,
    fechaFactura: bloque.fechaComprobante,
    neto: parseFloat(bloque.neto) || 0,
    empresa: bloque.empresa,
    conceptoGasto: bloque.observaciones || '', // Use observaciones as conceptoGasto
    observaciones: bloque.observaciones,
    ordenPublicidadId: shared.ordenPublicidadId,
    // Use the bloque's itemId if set (from program selection), otherwise use the default
    itemOrdenPublicidadId: bloque.itemOrdenPublicidadId || shared.defaultItemOrdenPublicidadId,
    facturaEmitidaA: bloque.facturaEmitidaA,
    sector: bloque.empresaPgm,
    rubro: shared.rubro,
    subRubro: shared.subRubro,
    condicionPago: bloque.condicionPago,
    formaPago: bloque.formaPago,
    numeroFactura: bloque.numeroComprobante || undefined,
  };
}

export function FormularioImplementacion({ gastoId, formId, itemId, onClose }: FormularioImplementacionProps) {
  const { isDark } = useTheme();
  const {
    addGasto,
    addMultipleGastos,
    updateGasto,
    getGastoById,
    getGastosByItemOrdenId,
    getGastosByOrdenId,
  } = useImplementacion();
  const { formularios } = useFormularios();
  const { currentUser } = useData();

  const ordenPublicidadData = useMemo(() => {
    if (!formId) return null;
    const formulario = formularios.find((f) => f.id === formId);
    if (!formulario) return null;

    const item = itemId ? formulario.importeRows?.find((row) => row.id === itemId) : null;
    const presupuestoImpl = item
      ? parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''))
      : 0;

    // Calculate remaining budget per program
    // Solo mostrar programas que tengan presupuesto asignado (implementacion no es null/undefined/vacío)
    const programasConPresupuesto = formulario.importeRows
      ?.filter((row) => {
        // Debe tener nombre de programa
        if (!row.programa) return false;
        // Debe tener presupuesto asignado (puede ser 0 o negativo, pero debe estar definido)
        const impl = row.implementacion;
        if (impl === null || impl === undefined || impl === '') return false;
        return true;
      })
      .map((row) => {
        const presupuesto = parseFloat(String(row.implementacion || '0').replace(/[^0-9.-]/g, '')) || 0;
        // Get all existing gastos for this program item
        const gastosDelPrograma = getGastosByItemOrdenId(row.id);
        const totalGastado = gastosDelPrograma.reduce((sum, g) => sum + (g.neto || 0), 0);
        const limiteRestante = presupuesto - totalGastado;

        return {
          value: row.programa,
          label: `${row.programa} - Limite: ${formatCurrency(limiteRestante)}`,
          limite: limiteRestante,
          itemId: row.id,
        };
      }) || [];

    return {
      ordenPublicidad: formulario.ordenPublicidad || '',
      unidadNegocio: formulario.unidadNegocio || '',
      categoriaNegocio: formulario.categoriaNegocio || '',
      nombreCampana: formulario.nombreCampana || '',
      acuerdoPago: formulario.acuerdoPago || '',
      presupuesto: presupuestoImpl,
      programasConPresupuesto: programasConPresupuesto.length > 0
        ? programasConPresupuesto
        : [{ value: 'Sin programas', label: 'Sin programas', limite: 0, itemId: '' }],
      responsable: formulario.responsable || '',
      marca: formulario.marca || '',
      mesServicio: formulario.mesServicio || '',
    };
  }, [formId, itemId, formularios, getGastosByItemOrdenId]);

  // Form state
  const [facturaEmitidaA, setFacturaEmitidaA] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [importes, setImportes] = useState<BloqueImporte[]>([]);
  const [estadoOP, setEstadoOP] = useState<EstadoOP>('pendiente');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Track if data has been loaded to prevent resetting
  const dataLoadedRef = useRef(false);
  const lastLoadedItemIdRef = useRef<string | undefined>(undefined);
  // Track the IDs of gastos that were originally loaded (for update vs create logic)
  const loadedGastoIdsRef = useRef<Set<string>>(new Set());

  // Load existing gastos if editing
  useEffect(() => {
    console.log('[FormImplementacion] useEffect ejecutado - gastoId:', gastoId, 'formId:', formId, 'itemId:', itemId);
    console.log('[FormImplementacion] dataLoadedRef.current:', dataLoadedRef.current, 'lastLoadedItemIdRef.current:', lastLoadedItemIdRef.current);

    // Reset tracking when itemId changes (user navigated to different item)
    if (itemId !== lastLoadedItemIdRef.current) {
      console.log('[FormImplementacion] itemId cambió, reseteando refs');
      dataLoadedRef.current = false;
      lastLoadedItemIdRef.current = itemId;
      loadedGastoIdsRef.current = new Set();
    }

    // Skip if already loaded data for this item
    if (dataLoadedRef.current) {
      console.log('[FormImplementacion] Ya se cargaron datos, saltando');
      return;
    }

    // Helper to initialize empty form
    const initEmptyForm = () => {
      console.log('[FormImplementacion] Inicializando formulario vacío');
      setImportes([{
        id: crypto.randomUUID(),
        programa: '',
        empresaPgm: '',
        itemOrdenPublicidadId: itemId,
        facturaEmitidaA: '',
        empresa: '',
        fechaComprobante: new Date().toISOString().split('T')[0],
        proveedor: '',
        razonSocial: '',
        condicionPago: '30',
        numeroComprobante: '',
        formaPago: '',
        neto: '',
        observaciones: '',
        estadoPgm: 'pendiente',
      }]);
      dataLoadedRef.current = true;
    };

    // Helper to load gastos from array
    const loadGastos = (gastos: GastoImplementacion[]) => {
      console.log('[FormImplementacion] Cargando gastos existentes:', gastos.length);
      const sortedGastos = [...gastos].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const first = sortedGastos[0];
      setFacturaEmitidaA(first.facturaEmitidaA);
      setEmpresa(first.empresa);
      setEstadoOP(first.estado);
      setImportes(sortedGastos.map(gastoToBloqueImporte));
      loadedGastoIdsRef.current = new Set(sortedGastos.map(g => g.id));
      dataLoadedRef.current = true;
    };

    if (gastoId) {
      // Editing a specific gasto
      console.log('[FormImplementacion] Buscando gasto por ID:', gastoId);
      const existingGasto = getGastoById(gastoId);
      console.log('[FormImplementacion] Gasto encontrado:', existingGasto);
      if (existingGasto) {
        setFacturaEmitidaA(existingGasto.facturaEmitidaA);
        setEmpresa(existingGasto.empresa);
        setEstadoOP(existingGasto.estado);
        setImportes([gastoToBloqueImporte(existingGasto)]);
        loadedGastoIdsRef.current = new Set([existingGasto.id]);
        dataLoadedRef.current = true;
      }
    } else if (formId && itemId) {
      // Load gastos for specific item
      console.log('[FormImplementacion] Buscando gastos por itemId:', itemId);
      const existingGastos = getGastosByItemOrdenId(itemId);
      console.log('[FormImplementacion] Gastos encontrados por item:', existingGastos.length, existingGastos);
      if (existingGastos.length > 0) {
        loadGastos(existingGastos);
      } else {
        initEmptyForm();
      }
    } else if (formId) {
      // Load all gastos for the orden (no specific item)
      console.log('[FormImplementacion] Buscando gastos por ordenId:', formId);
      const existingGastos = getGastosByOrdenId(formId);
      console.log('[FormImplementacion] Gastos encontrados por orden:', existingGastos.length, existingGastos);
      if (existingGastos.length > 0) {
        loadGastos(existingGastos);
      } else {
        initEmptyForm();
      }
    } else {
      console.log('[FormImplementacion] No hay formId ni gastoId, no se hace nada');
    }
  }, [gastoId, formId, itemId, getGastoById, getGastosByItemOrdenId, getGastosByOrdenId]);

  const isCerrado = estadoOP === 'cerrado' || estadoOP === 'anulado';
  // Use loaded gasto IDs from ref for determining existing vs new (not re-queried by itemId)
  const existingGastoIds = loadedGastoIdsRef.current;
  const isExistingGasto = existingGastoIds.size > 0 || !!gastoId;
  const isNewGasto = !isExistingGasto;

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {
      cargaDatos: {},
      importes: {},
    };

    for (const imp of importes) {
      const importeErrors: Record<string, string> = {};

      // Per-gasto validation for facturaEmitidaA and empresa
      if (!imp.facturaEmitidaA) {
        importeErrors.facturaEmitidaA = 'Debe seleccionar a quién se emite la factura';
      }
      if (!imp.empresa) {
        importeErrors.empresa = 'Debe seleccionar una empresa';
      }
      if (!imp.empresaPgm) {
        importeErrors.empresaPgm = 'Requerido';
      }
      if (!imp.fechaComprobante) {
        importeErrors.fechaComprobante = 'Requerido';
      }
      if (!imp.proveedor || !imp.razonSocial) {
        importeErrors.proveedor = 'Debe seleccionar proveedor y razón social';
      }
      if (!imp.formaPago) {
        importeErrors.formaPago = 'Requerido';
      }
      // Acuerdo de pago solo requerido si forma de pago es cheque
      if (imp.formaPago === 'cheque' && !imp.condicionPago) {
        importeErrors.condicionPago = 'Requerido';
      }
      if (!imp.neto) {
        importeErrors.neto = 'Requerido';
      }

      if (Object.keys(importeErrors).length > 0) {
        newErrors.importes[imp.id] = importeErrors;
      }
    }

    return newErrors;
  }, [importes]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [importes, hasAttemptedSubmit, validateForm]);

  const addImporte = () => {
    // For new gastos, inherit facturaEmitidaA and empresa from global state (or last importe)
    const lastImporte = importes[importes.length - 1];
    const newImporte: BloqueImporte = {
      id: crypto.randomUUID(),
      programa: '',
      empresaPgm: '',
      itemOrdenPublicidadId: itemId,
      facturaEmitidaA: lastImporte?.facturaEmitidaA || facturaEmitidaA || '',
      empresa: lastImporte?.empresa || empresa || '',
      fechaComprobante: new Date().toISOString().split('T')[0],
      proveedor: '',
      razonSocial: '',
      condicionPago: '30',
      numeroComprobante: '',
      formaPago: '',
      neto: '',
      observaciones: '',
      estadoPgm: 'pendiente',
    };
    setImportes((prev) => [...prev, newImporte]);
  };

  const removeImporte = (id: string) => {
    if (importes.length === 1) {
      toast.error('Debe haber al menos un bloque de importe');
      return;
    }
    setImportes((prev) => prev.filter((imp) => imp.id !== id));
  };

  const updateImporte = (id: string, field: keyof BloqueImporte, value: string) => {
    setImportes((prev) =>
      prev.map((imp) => {
        if (imp.id !== id) return imp;

        // When empresaPgm (program) is updated, also update the associated itemOrdenPublicidadId
        if (field === 'empresaPgm' && ordenPublicidadData?.programasConPresupuesto) {
          const selectedProgram = ordenPublicidadData.programasConPresupuesto.find(
            (p) => p.value === value
          );
          return {
            ...imp,
            [field]: value,
            itemOrdenPublicidadId: selectedProgram?.itemId || imp.itemOrdenPublicidadId,
          };
        }

        return { ...imp, [field]: value };
      })
    );
  };

  // Save a single gasto to the database
  const handleSaveGasto = async (importe: BloqueImporte, index: number): Promise<boolean> => {
    const isExisting = loadedGastoIdsRef.current.has(importe.id);
    console.log('[FormImplementacion] Guardando gasto individual:', importe.id, 'isExisting:', isExisting);

    try {
      if (isExisting) {
        // Update existing gasto
        const success = await updateGasto({
          id: importe.id,
          proveedor: importe.proveedor,
          razonSocial: importe.razonSocial,
          fechaFactura: importe.fechaComprobante,
          neto: parseFloat(importe.neto) || 0,
          empresa: importe.empresa,
          conceptoGasto: importe.observaciones || '',
          observaciones: importe.observaciones,
          facturaEmitidaA: importe.facturaEmitidaA,
          sector: importe.empresaPgm,
          condicionPago: importe.condicionPago,
          formaPago: importe.formaPago,
          numeroFactura: importe.numeroComprobante || undefined,
          itemOrdenPublicidadId: importe.itemOrdenPublicidadId,
        });

        if (success) {
          toast.success(`Gasto #${index + 1} actualizado`);
          return true;
        } else {
          toast.error(`Error al actualizar gasto #${index + 1}`);
          return false;
        }
      } else {
        // Create new gasto
        const input: CreateGastoImplementacionInput = bloqueToCreateInput(importe, {
          ordenPublicidadId: formId,
          defaultItemOrdenPublicidadId: itemId,
          rubro: IMPLEMENTACION_DEFAULTS.rubro,
          subRubro: IMPLEMENTACION_DEFAULTS.subRubro,
        });

        const created = await addGasto(input);
        if (created) {
          // Update the importe ID in state with the real DB ID
          loadedGastoIdsRef.current.add(created.id);
          setImportes(prev => prev.map(imp =>
            imp.id === importe.id ? { ...imp, id: created.id } : imp
          ));
          toast.success(`Gasto #${index + 1} creado`);
          return true;
        } else {
          toast.error(`Error al crear gasto #${index + 1}. Revise la consola para más detalles.`);
          return false;
        }
      }
    } catch (err) {
      console.error('[FormImplementacion] Error guardando gasto:', err);
      toast.error(`Error inesperado al guardar gasto #${index + 1}`);
      return false;
    }
  };

  const hasErrors = (formErrors: FormErrors): boolean => {
    const hasCargaDatosErrors = Object.keys(formErrors.cargaDatos).length > 0;
    const hasImportesErrors = Object.keys(formErrors.importes).length > 0;
    return hasCargaDatosErrors || hasImportesErrors;
  };

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
      const sharedFields = {
        ordenPublicidadId: formId,
        defaultItemOrdenPublicidadId: itemId,
        rubro: IMPLEMENTACION_DEFAULTS.rubro,
        subRubro: IMPLEMENTACION_DEFAULTS.subRubro,
      };

      console.log('[Implementacion] Guardando con sharedFields:', sharedFields);
      console.log('[Implementacion] Importes actuales:', importes);

      // Use the loaded gasto IDs to distinguish between updates and creates
      // This ensures gastos are updated even if their itemOrdenPublicidadId changed
      const loadedIds = loadedGastoIdsRef.current;
      console.log('[Implementacion] IDs cargados previamente:', Array.from(loadedIds));

      // Separate importes into existing (to update) and new (to create)
      const importesToUpdate = importes.filter(imp => loadedIds.has(imp.id));
      const importesToCreate = importes.filter(imp => !loadedIds.has(imp.id));
      console.log('[Implementacion] Para actualizar:', importesToUpdate.length, 'Para crear:', importesToCreate.length);

      let updateCount = 0;
      let createCount = 0;
      let hasError = false;

      // Update existing gastos
      for (const importe of importesToUpdate) {
        const success = await updateGasto({
          id: importe.id,
          proveedor: importe.proveedor,
          razonSocial: importe.razonSocial,
          fechaFactura: importe.fechaComprobante,
          neto: parseFloat(importe.neto) || 0,
          empresa: importe.empresa,
          conceptoGasto: importe.observaciones || '',
          observaciones: importe.observaciones,
          facturaEmitidaA: importe.facturaEmitidaA,
          sector: importe.empresaPgm,
          condicionPago: importe.condicionPago,
          formaPago: importe.formaPago,
          numeroFactura: importe.numeroComprobante || undefined,
          itemOrdenPublicidadId: importe.itemOrdenPublicidadId,
        });
        if (success) {
          updateCount++;
        } else {
          hasError = true;
        }
      }

      // Create new gastos
      if (importesToCreate.length > 0) {
        const inputs: CreateGastoImplementacionInput[] = importesToCreate.map((imp) =>
          bloqueToCreateInput(imp, sharedFields)
        );
        const created = await addMultipleGastos(inputs);
        createCount = created.length;
        if (created.length < importesToCreate.length) {
          hasError = true;
        }

        // Update state with real DB IDs for successfully created gastos
        // This prevents re-creating them if form stays open due to partial failure
        if (created.length > 0) {
          // Map temp UUIDs to real DB IDs (by order, since inputs/created have same order)
          const tempIdToDbId = new Map<string, string>();
          for (let i = 0; i < Math.min(importesToCreate.length, created.length); i++) {
            tempIdToDbId.set(importesToCreate[i].id, created[i].id);
          }

          // Update loadedGastoIdsRef with new DB IDs
          for (const gasto of created) {
            loadedGastoIdsRef.current.add(gasto.id);
          }

          // Update importes state with real DB IDs
          setImportes(prev => prev.map(imp => {
            const dbId = tempIdToDbId.get(imp.id);
            return dbId ? { ...imp, id: dbId } : imp;
          }));
        }
      }

      // Show result message
      if (hasError) {
        toast.error('Algunos gastos no pudieron ser guardados. Revise la consola para más detalles.');
      } else if (updateCount === 0 && createCount === 0) {
        toast.warning('No hay cambios para guardar');
      } else {
        const messages = [];
        if (updateCount > 0) messages.push(`${updateCount} actualizado(s)`);
        if (createCount > 0) messages.push(`${createCount} creado(s)`);
        toast.success(`Gasto(s) ${messages.join(' y ')} correctamente`);
        onClose();
      }
    } catch (err) {
      console.error('Error saving gasto:', err);
      toast.error('Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total from all importes in the form (both existing and new)
  const totalEjecutado = importes.reduce((sum, imp) => sum + (parseFloat(imp.neto) || 0), 0);
  const asignado = ordenPublicidadData?.presupuesto || 0;
  const disponible = asignado - totalEjecutado;
  const excedido = totalEjecutado > asignado;

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-6 sm:space-y-8">
          <FormHeader
            isDark={isDark}
            title="Información de campaña"
            subtitle="Detalle de la orden y registro de importes operativos"
            isCerrado={isCerrado}
            estadoLabel={estadoOP}
          />

          {/* Campaign Info Card */}
          <CampaignInfoCard
            isDark={isDark}
            ordenPublicidad={ordenPublicidadData?.ordenPublicidad || ''}
            presupuesto={String(ordenPublicidadData?.presupuesto || 0)}
            mesServicio={ordenPublicidadData?.mesServicio}
            unidadNegocio={ordenPublicidadData?.unidadNegocio || ''}
            categoriaNegocio={ordenPublicidadData?.categoriaNegocio || ''}
            marca={ordenPublicidadData?.marca}
            nombreCampana={ordenPublicidadData?.nombreCampana || ''}
            rubro={IMPLEMENTACION_DEFAULTS.rubro}
            subRubro={IMPLEMENTACION_DEFAULTS.subRubro}
          />

          {/* Carga de Importes Section */}
          <CargaImportesSection
            isDark={isDark}
            isCerrado={isCerrado}
            importes={importes}
            programasConPresupuesto={ordenPublicidadData?.programasConPresupuesto || []}
            onUpdateImporte={updateImporte}
            onAddImporte={addImporte}
            onRemoveImporte={removeImporte}
            onSaveGasto={handleSaveGasto}
            errors={errors.importes}
            // Status props
            isNewGasto={isNewGasto}
            existingGastoIds={existingGastoIds}
            estadoOP={estadoOP}
          />

          {/* Resumen */}
          <ResumenPresupuestario
            isDark={isDark}
            asignado={asignado}
            ejecutado={totalEjecutado}
            disponible={disponible}
            excedido={excedido}
          />

          <FormFooter saving={saving} onCancel={onClose} onSave={handleGuardar} />
        </div>
      </div>
    </div>
  );
}
