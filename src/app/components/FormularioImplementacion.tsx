import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useImplementacion } from '../contexts/ImplementacionContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { cn } from './ui/utils';
import {
  CampaignInfoCard,
  CargaImportesSection,
  ResumenPresupuestario,
  type ImportesErrors,
  type BloqueImporte,
  type EstadoOP,
} from './implementacion';
import type { CreateGastoImplementacionInput, GastoImplementacion } from '../types/implementacion';
import { IMPLEMENTACION_DEFAULTS, FIELD_MAX_LENGTHS } from '@/app/utils/implementacionConstants';

interface FormularioImplementacionProps {
  gastoId?: string;
  formId?: string;
  itemId?: string;
  onClose: () => void;
}

interface FormErrors {
  cargaDatos: {
    conceptoGasto?: string;
  };
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
    neto: String(gasto.neto),
    documentoAdjunto: gasto.adjuntos?.[0],
    estadoPgm: gasto.estadoPago === 'pagado' ? 'pagado' : gasto.estadoPago === 'anulado' ? 'anulado' : 'pendiente',
  };
}

// Convert BloqueImporte (UI) to CreateGastoImplementacionInput (service)
function bloqueToCreateInput(
  bloque: BloqueImporte,
  shared: {
    conceptoGasto: string;
    observaciones: string;
    ordenPublicidadId?: string;
    defaultItemOrdenPublicidadId?: string;
    rubroGasto?: string;
    subRubro?: string;
  }
): CreateGastoImplementacionInput {
  return {
    proveedor: bloque.proveedor,
    razonSocial: bloque.razonSocial,
    fechaFactura: bloque.fechaComprobante,
    neto: parseFloat(bloque.neto) || 0,
    empresa: bloque.empresa,
    conceptoGasto: shared.conceptoGasto,
    observaciones: shared.observaciones,
    ordenPublicidadId: shared.ordenPublicidadId,
    // Use the bloque's itemId if set (from program selection), otherwise use the default
    itemOrdenPublicidadId: bloque.itemOrdenPublicidadId || shared.defaultItemOrdenPublicidadId,
    facturaEmitidaA: bloque.facturaEmitidaA,
    sector: bloque.empresaPgm,
    rubroGasto: shared.rubroGasto,
    subRubro: shared.subRubro,
    condicionPago: bloque.condicionPago,
  };
}

export function FormularioImplementacion({ gastoId, formId, itemId, onClose }: FormularioImplementacionProps) {
  const { isDark } = useTheme();
  const {
    addMultipleGastos,
    updateGasto,
    getGastoById,
    getGastosByItemOrdenId,
  } = useImplementacion();
  const { formularios } = useFormularios();
  const { currentUser } = useData();

  const ordenPublicidadData = useMemo(() => {
    // Helper to format currency
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
    if (!formId) return null;
    const formulario = formularios.find((f) => f.id === formId);
    if (!formulario) return null;

    const item = itemId ? formulario.importeRows?.find((row) => row.id === itemId) : null;
    const presupuestoImpl = item
      ? parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''))
      : 0;

    // Calculate remaining budget per program
    const programasConPresupuesto = formulario.importeRows
      ?.filter((row) => row.programa)
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
  const [conceptoGasto, setConceptoGasto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [importes, setImportes] = useState<BloqueImporte[]>([]);
  const [estadoOP, setEstadoOP] = useState<EstadoOP>('pendiente');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Track if data has been loaded to prevent resetting
  const dataLoadedRef = useRef(false);
  const lastLoadedItemIdRef = useRef<string | undefined>(undefined);

  // Load existing gastos if editing
  useEffect(() => {
    // Reset tracking when itemId changes (user navigated to different item)
    if (itemId !== lastLoadedItemIdRef.current) {
      dataLoadedRef.current = false;
      lastLoadedItemIdRef.current = itemId;
    }

    if (gastoId) {
      // Editing a specific gasto
      const existingGasto = getGastoById(gastoId);
      if (existingGasto) {
        setFacturaEmitidaA(existingGasto.facturaEmitidaA);
        setEmpresa(existingGasto.empresa);
        setConceptoGasto(existingGasto.conceptoGasto);
        setObservaciones(existingGasto.observaciones);
        setEstadoOP(existingGasto.estado);
        setImportes([gastoToBloqueImporte(existingGasto)]);
        dataLoadedRef.current = true;
      }
    } else if (formId && itemId) {
      // Check for existing gastos for this item
      const existingGastos = getGastosByItemOrdenId(itemId);
      if (existingGastos.length > 0) {
        // Load first gasto's shared fields
        const first = existingGastos[0];
        setFacturaEmitidaA(first.facturaEmitidaA);
        setEmpresa(first.empresa);
        setConceptoGasto(first.conceptoGasto);
        setObservaciones(first.observaciones);
        setEstadoOP(first.estado);
        setImportes(existingGastos.map(gastoToBloqueImporte));
        dataLoadedRef.current = true;
      } else if (!dataLoadedRef.current) {
        // Only initialize with defaults if we haven't loaded data yet
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
          neto: '',
          estadoPgm: 'pendiente',
        }]);
      }
    }
  }, [gastoId, formId, itemId, getGastoById, getGastosByItemOrdenId]);

  const isCerrado = estadoOP === 'cerrado' || estadoOP === 'anulado';
  const existingGastos = itemId ? getGastosByItemOrdenId(itemId) : [];
  const existingGastoIds = useMemo(() => new Set(existingGastos.map(g => g.id)), [existingGastos]);
  const isExistingGasto = existingGastos.length > 0 || !!gastoId;
  const isNewGasto = !isExistingGasto;

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {
      cargaDatos: {},
      importes: {},
    };

    // Concepto de gasto is still global
    if (!conceptoGasto.trim()) {
      newErrors.cargaDatos.conceptoGasto = 'Debe ingresar un concepto de gasto';
    }

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
      if (!imp.condicionPago) {
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
  }, [conceptoGasto, importes]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [conceptoGasto, importes, hasAttemptedSubmit, validateForm]);

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
      neto: '',
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
        conceptoGasto,
        observaciones,
        ordenPublicidadId: formId,
        defaultItemOrdenPublicidadId: itemId,
        rubroGasto: IMPLEMENTACION_DEFAULTS.rubroGasto,
        subRubro: IMPLEMENTACION_DEFAULTS.subRubro,
      };

      // Get existing gasto IDs to distinguish between updates and creates
      const existingGastoIds = new Set(existingGastos.map(g => g.id));

      // Separate importes into existing (to update) and new (to create)
      const importesToUpdate = importes.filter(imp => existingGastoIds.has(imp.id));
      const importesToCreate = importes.filter(imp => !existingGastoIds.has(imp.id));

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
          conceptoGasto,
          observaciones,
          facturaEmitidaA: importe.facturaEmitidaA,
          sector: importe.empresaPgm,
          condicionPago: importe.condicionPago,
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
      }

      // Show result message
      if (hasError) {
        toast.error('Algunos gastos no pudieron ser guardados');
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  const labelClass = cn(
    'flex items-center gap-1 text-sm font-semibold',
    isDark ? 'text-gray-400' : 'text-[#374151]'
  );

  const textareaClass = cn(
    'min-h-[72px] resize-none transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    errors.cargaDatos.conceptoGasto && 'border-red-500'
  );

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-[620px] mx-auto px-6 sm:px-8 lg:px-0">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-[#101828]')}>
                  Informaci\u00f3n de campa\u00f1a
                </h1>
                <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-[#4a5565]')}>
                  Detalle de la orden y registro de importes operativos
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
                <span className="text-sm">Este gasto est\u00e1 {estadoOP} y no puede ser editado.</span>
              </div>
            )}
          </div>

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
            rubroGasto={IMPLEMENTACION_DEFAULTS.rubroGasto}
            subRubro={IMPLEMENTACION_DEFAULTS.subRubro}
            formatCurrency={formatCurrency}
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
            onSave={handleGuardar}
            onCancel={onClose}
            errors={errors.importes}
            conceptoGasto={conceptoGasto}
            setConceptoGasto={setConceptoGasto}
            conceptoGastoError={errors.cargaDatos.conceptoGasto}
            // Status props
            isNewGasto={isNewGasto}
            existingGastoIds={existingGastoIds}
            estadoOP={estadoOP}
          />

          {/* Observaciones */}
          <div className="space-y-2">
            <Label className={labelClass}>Observaciones</Label>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={FIELD_MAX_LENGTHS.observaciones}
              disabled={isCerrado}
              placeholder="Escribe aqu\u00ed"
              className={textareaClass}
            />
          </div>

          {/* Resumen */}
          <ResumenPresupuestario
            isDark={isDark}
            asignado={asignado}
            ejecutado={totalEjecutado}
            disponible={disponible}
            excedido={excedido}
            formatCurrency={formatCurrency}
          />

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-8 pb-8">
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
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
