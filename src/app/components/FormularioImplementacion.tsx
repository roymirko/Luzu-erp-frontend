import { useState, useEffect, useCallback, useMemo } from 'react';
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
    facturaEmitidaA?: string;
    empresa?: string;
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
    facturaEmitidaA: string;
    empresa: string;
    conceptoGasto: string;
    observaciones: string;
    ordenPublicidadId?: string;
    itemOrdenPublicidadId?: string;
    rubroGasto?: string;
    subRubro?: string;
  }
): CreateGastoImplementacionInput {
  return {
    proveedor: bloque.proveedor,
    razonSocial: bloque.razonSocial,
    fechaFactura: bloque.fechaComprobante,
    neto: parseFloat(bloque.neto) || 0,
    empresa: shared.empresa,
    conceptoGasto: shared.conceptoGasto,
    observaciones: shared.observaciones,
    ordenPublicidadId: shared.ordenPublicidadId,
    itemOrdenPublicidadId: shared.itemOrdenPublicidadId,
    facturaEmitidaA: shared.facturaEmitidaA,
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
    approveGasto,
    rejectGasto,
    markGastoAsPaid,
    getTotalEjecutadoByItem,
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

    const programasDisponibles = formulario.importeRows
      ?.filter((row) => row.programa)
      .map((row) => row.programa) || [];

    return {
      ordenPublicidad: formulario.ordenPublicidad || '',
      unidadNegocio: formulario.unidadNegocio || '',
      categoriaNegocio: formulario.categoriaNegocio || '',
      nombreCampana: formulario.nombreCampana || '',
      acuerdoPago: formulario.acuerdoPago || '',
      presupuesto: presupuestoImpl,
      programasDisponibles: programasDisponibles.length > 0 ? programasDisponibles : ['Sin programas'],
      responsable: formulario.responsable || '',
      marca: formulario.marca || '',
      mesServicio: formulario.mesServicio || '',
    };
  }, [formId, itemId, formularios]);

  // Form state
  const [facturaEmitidaA, setFacturaEmitidaA] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [conceptoGasto, setConceptoGasto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [importes, setImportes] = useState<BloqueImporte[]>([]);
  const [estadoOP, setEstadoOP] = useState<EstadoOP>('pendiente');
  const [selectedGastoId, setSelectedGastoId] = useState<string | undefined>(gastoId);

  const [saving, setSaving] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Load existing gastos if editing
  useEffect(() => {
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
        setSelectedGastoId(gastoId);
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
        setSelectedGastoId(first.id);
      } else {
        // New gasto - initialize with defaults
        setImportes([{
          id: crypto.randomUUID(),
          programa: '',
          empresaPgm: '',
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
  const isExistingGasto = existingGastos.length > 0 || !!gastoId;
  const isNewGasto = !isExistingGasto;

  const handleApprove = useCallback(async () => {
    if (!selectedGastoId) return;
    setApprovalLoading(true);
    try {
      const success = await approveGasto(selectedGastoId);
      if (success) {
        toast.success('Gasto aprobado correctamente');
        setEstadoOP('activo');
      } else {
        toast.error('Error al aprobar el gasto');
      }
    } catch (err) {
      console.error('Error approving gasto:', err);
      toast.error('Error inesperado al aprobar');
    } finally {
      setApprovalLoading(false);
    }
  }, [selectedGastoId, approveGasto]);

  const handleReject = useCallback(async () => {
    if (!selectedGastoId) return;
    setApprovalLoading(true);
    try {
      const success = await rejectGasto(selectedGastoId);
      if (success) {
        toast.success('Gasto rechazado');
        setEstadoOP('anulado');
      } else {
        toast.error('Error al rechazar el gasto');
      }
    } catch (err) {
      console.error('Error rejecting gasto:', err);
      toast.error('Error inesperado al rechazar');
    } finally {
      setApprovalLoading(false);
    }
  }, [selectedGastoId, rejectGasto]);

  const handleMarkPaid = useCallback(async () => {
    if (!selectedGastoId) return;
    setApprovalLoading(true);
    try {
      const success = await markGastoAsPaid(selectedGastoId);
      if (success) {
        toast.success('Gasto marcado como pagado');
        setImportes((prev) =>
          prev.map((imp) => ({ ...imp, estadoPgm: 'pagado' as const }))
        );
      } else {
        toast.error('Error al marcar como pagado');
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
      toast.error('Error inesperado');
    } finally {
      setApprovalLoading(false);
    }
  }, [selectedGastoId, markGastoAsPaid]);

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {
      cargaDatos: {},
      importes: {},
    };

    if (!facturaEmitidaA) {
      newErrors.cargaDatos.facturaEmitidaA = 'Debe seleccionar a quién se emite la factura';
    }
    if (!empresa) {
      newErrors.cargaDatos.empresa = 'Debe seleccionar una empresa';
    }
    if (!conceptoGasto.trim()) {
      newErrors.cargaDatos.conceptoGasto = 'Debe ingresar un concepto de gasto';
    }

    for (const imp of importes) {
      const importeErrors: Record<string, string> = {};

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
  }, [facturaEmitidaA, empresa, conceptoGasto, importes]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [facturaEmitidaA, empresa, conceptoGasto, importes, hasAttemptedSubmit, validateForm]);

  const addImporte = () => {
    const newImporte: BloqueImporte = {
      id: crypto.randomUUID(),
      programa: '',
      empresaPgm: '',
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
      prev.map((imp) => (imp.id === id ? { ...imp, [field]: value } : imp))
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
        facturaEmitidaA,
        empresa,
        conceptoGasto,
        observaciones,
        ordenPublicidadId: formId,
        itemOrdenPublicidadId: itemId,
        rubroGasto: IMPLEMENTACION_DEFAULTS.rubroGasto,
        subRubro: IMPLEMENTACION_DEFAULTS.subRubro,
      };

      if (isExistingGasto) {
        // Update existing gasto (only first one for now)
        const firstImporte = importes[0];
        if (firstImporte && selectedGastoId) {
          const success = await updateGasto({
            id: selectedGastoId,
            proveedor: firstImporte.proveedor,
            razonSocial: firstImporte.razonSocial,
            fechaFactura: firstImporte.fechaComprobante,
            neto: parseFloat(firstImporte.neto) || 0,
            empresa,
            conceptoGasto,
            observaciones,
            facturaEmitidaA,
            sector: firstImporte.empresaPgm,
            condicionPago: firstImporte.condicionPago,
          });
          if (success) {
            toast.success('Gasto actualizado correctamente');
            onClose();
          } else {
            toast.error('Error al actualizar el gasto');
          }
        }
      } else {
        // Create new gastos (one per importe)
        const inputs: CreateGastoImplementacionInput[] = importes.map((imp) =>
          bloqueToCreateInput(imp, sharedFields)
        );

        const created = await addMultipleGastos(inputs);
        if (created.length > 0) {
          toast.success(`${created.length} gasto(s) creado(s) correctamente`);
          onClose();
        } else {
          toast.error('Error al crear los gastos');
        }
      }
    } catch (err) {
      console.error('Error saving gasto:', err);
      toast.error('Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  const ejecutado = itemId ? getTotalEjecutadoByItem(itemId) : 0;
  const nuevoEjecutado = importes.reduce((sum, imp) => sum + (parseFloat(imp.neto) || 0), 0);
  const totalEjecutado = isNewGasto ? nuevoEjecutado : ejecutado;
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
            programasDisponibles={ordenPublicidadData?.programasDisponibles || []}
            onUpdateImporte={updateImporte}
            onAddImporte={addImporte}
            onRemoveImporte={removeImporte}
            onSave={handleGuardar}
            onCancel={onClose}
            errors={errors.importes}
            facturaEmitidaA={facturaEmitidaA}
            setFacturaEmitidaA={setFacturaEmitidaA}
            empresa={empresa}
            setEmpresa={setEmpresa}
            conceptoGasto={conceptoGasto}
            setConceptoGasto={setConceptoGasto}
            globalFieldsErrors={errors.cargaDatos}
            // Approval workflow props
            isNewGasto={isNewGasto}
            gastoId={selectedGastoId}
            estadoOP={estadoOP}
            onApprove={handleApprove}
            onReject={handleReject}
            onMarkPaid={handleMarkPaid}
            approvalLoading={approvalLoading}
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
