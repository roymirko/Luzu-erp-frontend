import { useState, useEffect, useCallback, useMemo } from 'react';
import { useImplementacion, GastoImplementacion, BloqueImporte } from '../contexts/ImplementacionContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { cn } from './ui/utils';
import {
  CargaDatosSection,
  CargaImportesSection,
  ObservacionesSection,
  ResumenPresupuestario,
  type CargaDatosSectionErrors,
  type ImportesErrors,
} from './implementacion';
import { IMPLEMENTACION_DEFAULTS } from '@/app/utils/implementacionConstants';

interface FormularioImplementacionProps {
  gastoId?: string;
  formId?: string;
  itemId?: string;
  onClose: () => void;
}

interface FormErrors {
  cargaDatos: CargaDatosSectionErrors;
  importes: ImportesErrors;
}

const EMPTY_ERRORS: FormErrors = {
  cargaDatos: {},
  importes: {},
};

export function FormularioImplementacion({ gastoId, formId, itemId, onClose }: FormularioImplementacionProps) {
  const { isDark } = useTheme();
  const { addGasto, updateGasto, getGastoById, getGastoByFormItemId } = useImplementacion();
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
      presupuesto: presupuestoImpl.toString(),
      programasDisponibles: programasDisponibles.length > 0 ? programasDisponibles : ['Sin programas'],
      responsable: formulario.responsable || '',
    };
  }, [formId, itemId, formularios]);

  const [formData, setFormData] = useState<GastoImplementacion>({
    id: crypto.randomUUID(),
    estadoOP: 'pendiente',
    fechaRegistro: '',
    responsable: '',
    unidadNegocio: '',
    categoriaNegocio: '',
    ordenPublicidad: 'OP-2024-001',
    presupuesto: '5000000',
    cantidadProgramas: 0,
    programasDisponibles: ['Programa 1', 'Programa 2'],
    sector: IMPLEMENTACION_DEFAULTS.sector,
    rubroGasto: IMPLEMENTACION_DEFAULTS.rubroGasto,
    subRubro: IMPLEMENTACION_DEFAULTS.subRubro,
    nombreCampana: 'Campaña Mock',
    acuerdoPago: '30 días',
    facturaEmitidaA: '',
    empresa: '',
    conceptoGasto: '',
    observaciones: '',
    importes: [],
    idFormularioComercial: undefined,
    formItemId: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    let existingGasto: GastoImplementacion | undefined;

    if (gastoId) {
      existingGasto = getGastoById(gastoId);
    } else if (formId && itemId) {
      existingGasto = getGastoByFormItemId(formId, itemId);
    }

    if (existingGasto) {
      setFormData(existingGasto);
    } else {
      setFormData((prev) => ({
        ...prev,
        fechaRegistro: new Date().toISOString().split('T')[0],
        responsable: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : ordenPublicidadData?.responsable || 'Usuario Actual',
        idFormularioComercial: formId,
        formItemId: itemId,
        ordenPublicidad: ordenPublicidadData?.ordenPublicidad || prev.ordenPublicidad,
        unidadNegocio: ordenPublicidadData?.unidadNegocio || prev.unidadNegocio,
        categoriaNegocio: ordenPublicidadData?.categoriaNegocio || prev.categoriaNegocio,
        nombreCampana: ordenPublicidadData?.nombreCampana || prev.nombreCampana,
        acuerdoPago: ordenPublicidadData?.acuerdoPago || prev.acuerdoPago,
        presupuesto: ordenPublicidadData?.presupuesto || prev.presupuesto,
        programasDisponibles: ordenPublicidadData?.programasDisponibles || prev.programasDisponibles,
        importes: [
          {
            id: crypto.randomUUID(),
            programa: '',
            empresaPgm: '',
            fechaComprobante: new Date().toISOString().split('T')[0],
            proveedor: '',
            razonSocial: '',
            condicionPago: '30',
            neto: '',
            estadoPgm: 'pendiente-pago',
          },
        ],
      }));
    }
  }, [gastoId, formId, itemId, getGastoById, getGastoByFormItemId, currentUser, ordenPublicidadData]);

  const isCerrado = formData.estadoOP === 'cerrado' || formData.estadoOP === 'anulado';
  const isExistingGasto = gastoId || (formId && itemId && getGastoByFormItemId(formId, itemId));

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {
      cargaDatos: {},
      importes: {},
    };

    if (!formData.facturaEmitidaA) {
      newErrors.cargaDatos.facturaEmitidaA = 'Debe seleccionar a quién se emite la factura';
    }
    if (!formData.empresa) {
      newErrors.cargaDatos.empresa = 'Debe seleccionar una empresa';
    }
    if (!formData.unidadNegocio && !ordenPublicidadData?.unidadNegocio) {
      newErrors.cargaDatos.unidadNegocio = 'Debe seleccionar una unidad de negocio';
    }
    if (formData.unidadNegocio === 'Media' && !formData.categoriaNegocio && !ordenPublicidadData?.categoriaNegocio) {
      newErrors.cargaDatos.categoriaNegocio = 'Debe seleccionar una categoría de negocio para Media';
    }
    if (!formData.conceptoGasto.trim()) {
      newErrors.cargaDatos.conceptoGasto = 'Debe ingresar un concepto de gasto';
    }

    for (const imp of formData.importes) {
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
  }, [formData, ordenPublicidadData]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [formData, hasAttemptedSubmit, validateForm]);

  const handleInputChange = (field: keyof GastoImplementacion, value: string) => {
    setFormData((prev) => {
      const updates: Partial<GastoImplementacion> = { [field]: value };
      if (field === 'unidadNegocio' && value !== 'Media') {
        updates.categoriaNegocio = '';
      }
      return { ...prev, ...updates };
    });
  };

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
      estadoPgm: 'pendiente-pago',
    };
    setFormData((prev) => ({ ...prev, importes: [...prev.importes, newImporte] }));
  };

  const removeImporte = (id: string) => {
    if (formData.importes.length === 1) {
      toast.error('Debe haber al menos un bloque de importe');
      return;
    }
    setFormData((prev) => ({ ...prev, importes: prev.importes.filter((imp) => imp.id !== id) }));
  };

  const updateImporte = (id: string, field: keyof BloqueImporte, value: string) => {
    setFormData((prev) => ({
      ...prev,
      importes: prev.importes.map((imp) => (imp.id === id ? { ...imp, [field]: value } : imp)),
    }));
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
      let success: boolean;
      if (isExistingGasto) {
        success = await updateGasto(formData.id, formData);
        if (success) toast.success('Gasto actualizado correctamente');
        else toast.error('Error al actualizar el gasto');
      } else {
        success = await addGasto(formData);
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

  const ejecutado = formData.importes.reduce((sum, imp) => sum + (parseFloat(imp.neto) || 0), 0);
  const asignado = parseFloat(formData.presupuesto) || 0;
  const disponible = asignado - ejecutado;
  const excedido = ejecutado > asignado;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className={cn('text-xl sm:text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                  {gastoId ? 'Editar Gasto' : 'Nuevo Formulario'}
                </h1>
                <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-gray-600')}>
                  {gastoId ? 'Edite la información del gasto de implementación' : 'Carga de gasto de implementación'}
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
                <span className="text-sm">Este gasto está {formData.estadoOP} y no puede ser editado.</span>
              </div>
            )}
          </div>

          <CargaDatosSection
            isDark={isDark}
            isCerrado={isCerrado}
            facturaEmitidaA={formData.facturaEmitidaA}
            setFacturaEmitidaA={(v) => handleInputChange('facturaEmitidaA', v)}
            empresa={formData.empresa}
            setEmpresa={(v) => handleInputChange('empresa', v)}
            unidadNegocio={formData.unidadNegocio}
            setUnidadNegocio={(v) => handleInputChange('unidadNegocio', v)}
            categoriaNegocio={formData.categoriaNegocio || ''}
            setCategoriaNegocio={(v) => handleInputChange('categoriaNegocio', v)}
            sector={formData.sector}
            rubroGasto={formData.rubroGasto}
            subRubro={formData.subRubro}
            nombreCampana={formData.nombreCampana}
            conceptoGasto={formData.conceptoGasto}
            setConceptoGasto={(v) => handleInputChange('conceptoGasto', v)}
            errors={errors.cargaDatos}
            fromOrdenPublicidad={!!ordenPublicidadData}
          />

          <CargaImportesSection
            isDark={isDark}
            isCerrado={isCerrado}
            ordenPublicidad={formData.ordenPublicidad}
            presupuesto={formData.presupuesto}
            importes={formData.importes}
            programasDisponibles={formData.programasDisponibles}
            formatCurrency={formatCurrency}
            onUpdateImporte={updateImporte}
            onAddImporte={addImporte}
            onRemoveImporte={removeImporte}
            errors={errors.importes}
          />

          <ObservacionesSection
            isDark={isDark}
            isCerrado={isCerrado}
            observaciones={formData.observaciones}
            setObservaciones={(v) => handleInputChange('observaciones', v)}
          />

          <ResumenPresupuestario
            isDark={isDark}
            asignado={asignado}
            ejecutado={ejecutado}
            disponible={disponible}
            excedido={excedido}
            formatCurrency={formatCurrency}
          />

          <div className="flex justify-end gap-3 pt-8 pb-8">
            <Button variant="ghost" onClick={onClose} className="text-gray-500" disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} className="bg-[#0070ff] hover:bg-[#0060dd] text-white px-8" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
