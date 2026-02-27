import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTalentos } from '../contexts/TalentosContext';
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
import type { CreateGastoTalentosInput, GastoTalentos } from '../types/talentos';
import { TALENTOS_DEFAULTS } from '@/app/utils/implementacionConstants';

interface FormularioTalentosProps {
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

function gastoToBloqueImporte(gasto: GastoTalentos): BloqueImporte {
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

function bloqueToCreateInput(
  bloque: BloqueImporte,
  shared: {
    ordenPublicidadId?: string;
    defaultItemOrdenPublicidadId?: string;
    rubro?: string;
    subRubro?: string;
  }
): CreateGastoTalentosInput {
  return {
    proveedor: bloque.proveedor,
    razonSocial: bloque.razonSocial,
    fechaFactura: bloque.fechaComprobante,
    neto: parseFloat(bloque.neto) || 0,
    empresa: bloque.empresa,
    conceptoGasto: bloque.observaciones || '',
    observaciones: bloque.observaciones,
    ordenPublicidadId: shared.ordenPublicidadId,
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

export function FormularioTalentos({ gastoId, formId, itemId, onClose }: FormularioTalentosProps) {
  const { isDark } = useTheme();
  const {
    addGasto,
    addMultipleGastos,
    updateGasto,
    deleteGasto,
    getGastoById,
    getGastosByItemOrdenId,
    getGastosByOrdenId,
  } = useTalentos();
  const { formularios } = useFormularios();
  const { currentUser } = useData();

  const ordenPublicidadData = useMemo(() => {
    if (!formId) return null;
    const formulario = formularios.find((f) => f.id === formId);
    if (!formulario) return null;

    const item = itemId ? formulario.importeRows?.find((row) => row.id === itemId) : null;
    const presupuestoTalentos = item
      ? parseFloat(String(item.talentos || '0').replace(/[^0-9.-]/g, ''))
      : (formulario.importeRows || []).reduce((sum, row) => {
          const val = parseFloat(String(row.talentos || '0').replace(/[^0-9.-]/g, ''));
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

    const programasConPresupuesto = formulario.importeRows
      ?.filter((row) => {
        if (itemId && row.id !== itemId) return false;
        if (!row.programa) return false;
        const tal = row.talentos;
        if (tal === null || tal === undefined || tal === '') return false;
        return true;
      })
      .map((row) => {
        const presupuesto = parseFloat(String(row.talentos || '0').replace(/[^0-9.-]/g, '')) || 0;
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
      presupuesto: presupuestoTalentos,
      programasConPresupuesto: programasConPresupuesto.length > 0
        ? programasConPresupuesto
        : [{ value: 'Sin programas', label: 'Sin programas', limite: 0, itemId: '' }],
      responsable: formulario.responsable || '',
      marca: formulario.marca || '',
      mesServicio: formulario.mesServicio || '',
    };
  }, [formId, itemId, formularios, getGastosByItemOrdenId]);

  const [facturaEmitidaA, setFacturaEmitidaA] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [importes, setImportes] = useState<BloqueImporte[]>([]);
  const [estadoOP, setEstadoOP] = useState<EstadoOP>('pendiente');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const dataLoadedRef = useRef(false);
  const lastLoadedItemIdRef = useRef<string | undefined>(undefined);
  const loadedGastoIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (itemId !== lastLoadedItemIdRef.current) {
      dataLoadedRef.current = false;
      lastLoadedItemIdRef.current = itemId;
      loadedGastoIdsRef.current = new Set();
    }

    if (dataLoadedRef.current) return;

    const initEmptyForm = () => {
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

    const loadGastos = (gastos: GastoTalentos[]) => {
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
      const existingGasto = getGastoById(gastoId);
      if (existingGasto) {
        setFacturaEmitidaA(existingGasto.facturaEmitidaA);
        setEmpresa(existingGasto.empresa);
        setEstadoOP(existingGasto.estado);
        setImportes([gastoToBloqueImporte(existingGasto)]);
        loadedGastoIdsRef.current = new Set([existingGasto.id]);
        dataLoadedRef.current = true;
      }
    } else if (formId && itemId) {
      const existingGastos = getGastosByItemOrdenId(itemId);
      if (existingGastos.length > 0) loadGastos(existingGastos);
      else initEmptyForm();
    } else if (formId) {
      const existingGastos = getGastosByOrdenId(formId);
      if (existingGastos.length > 0) loadGastos(existingGastos);
      else initEmptyForm();
    }
  }, [gastoId, formId, itemId, getGastoById, getGastosByItemOrdenId, getGastosByOrdenId]);

  const isCerrado = estadoOP === 'cerrado' || estadoOP === 'anulado';
  const existingGastoIds = loadedGastoIdsRef.current;
  const isExistingGasto = existingGastoIds.size > 0 || !!gastoId;
  const isNewGasto = !isExistingGasto;

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = { cargaDatos: {}, importes: {} };

    for (const imp of importes) {
      const importeErrors: Record<string, string> = {};
      const isEfectivo = imp.formaPago === 'efectivo';
      const isTarjeta = imp.formaPago === 'tarjeta';

      if (!isEfectivo) {
        if (!imp.facturaEmitidaA) importeErrors.facturaEmitidaA = 'Debe seleccionar a quién se emite la factura';
        if (!imp.empresa) importeErrors.empresa = 'Debe seleccionar una empresa';
        if (!imp.fechaComprobante) importeErrors.fechaComprobante = 'Requerido';
      }
      if (!imp.empresaPgm) importeErrors.empresaPgm = 'Requerido';
      if (!isEfectivo && (!imp.proveedor || !imp.razonSocial)) importeErrors.proveedor = 'Debe seleccionar proveedor y razón social';
      if (!imp.formaPago) importeErrors.formaPago = 'Requerido';
      if (!isEfectivo && !isTarjeta && !imp.condicionPago) importeErrors.condicionPago = 'Requerido';
      if (!imp.neto) importeErrors.neto = 'Requerido';

      if (Object.keys(importeErrors).length > 0) {
        newErrors.importes[imp.id] = importeErrors;
      }
    }

    return newErrors;
  }, [importes]);

  useEffect(() => {
    if (hasAttemptedSubmit) setErrors(validateForm());
  }, [importes, hasAttemptedSubmit, validateForm]);

  const addImporte = () => {
    const lastImporte = importes[importes.length - 1];
    setImportes((prev) => [...prev, {
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
    }]);
  };

  const removeImporte = (id: string) => {
    if (importes.length === 1) {
      toast.error('Debe haber al menos un bloque de importe');
      return;
    }
    setImportes((prev) => prev.filter((imp) => imp.id !== id));
  };

  const resetImporte = (id: string) => {
    setImportes((prev) =>
      prev.map((imp) =>
        imp.id === id
          ? {
              ...imp,
              facturaEmitidaA: '',
              empresa: '',
              empresaPgm: '',
              fechaComprobante: new Date().toISOString().split('T')[0],
              proveedor: '',
              razonSocial: '',
              condicionPago: '30',
              numeroComprobante: '',
              formaPago: '',
              neto: '',
              observaciones: '',
            }
          : imp
      )
    );
  };

  const handleDeleteSavedGasto = async (id: string): Promise<boolean> => {
    const success = await deleteGasto(id);
    if (success) {
      loadedGastoIdsRef.current.delete(id);
      if (importes.length > 1) {
        setImportes((prev) => prev.filter((imp) => imp.id !== id));
      } else {
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
      }
      toast.success('Gasto eliminado');
      return true;
    }
    toast.error('Error al eliminar gasto');
    return false;
  };

  const updateImporte = (id: string, field: keyof BloqueImporte, value: string) => {
    setImportes((prev) =>
      prev.map((imp) => {
        if (imp.id !== id) return imp;

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

  const handleSaveGasto = async (importe: BloqueImporte, index: number): Promise<boolean> => {
    const isExisting = loadedGastoIdsRef.current.has(importe.id);

    try {
      if (isExisting) {
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
        }
        toast.error(`Error al actualizar gasto #${index + 1}`);
        return false;
      } else {
        const input = bloqueToCreateInput(importe, {
          ordenPublicidadId: formId,
          defaultItemOrdenPublicidadId: itemId,
          rubro: TALENTOS_DEFAULTS.rubro,
          subRubro: TALENTOS_DEFAULTS.subRubro,
        });

        const created = await addGasto(input);
        if (created) {
          loadedGastoIdsRef.current.add(created.id);
          setImportes(prev => prev.map(imp =>
            imp.id === importe.id ? { ...imp, id: created.id } : imp
          ));
          toast.success(`Gasto #${index + 1} creado`);
          return true;
        }
        toast.error(`Error al crear gasto #${index + 1}`);
        return false;
      }
    } catch (err) {
      console.error('[FormTalentos] Error guardando gasto:', err);
      toast.error(`Error inesperado al guardar gasto #${index + 1}`);
      return false;
    }
  };

  const hasErrors = (formErrors: FormErrors): boolean => {
    return Object.keys(formErrors.cargaDatos).length > 0 || Object.keys(formErrors.importes).length > 0;
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
        rubro: TALENTOS_DEFAULTS.rubro,
        subRubro: TALENTOS_DEFAULTS.subRubro,
      };

      const loadedIds = loadedGastoIdsRef.current;
      const importesToUpdate = importes.filter(imp => loadedIds.has(imp.id));
      const importesToCreate = importes.filter(imp => !loadedIds.has(imp.id));

      let updateCount = 0;
      let createCount = 0;
      let hasError = false;

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
        if (success) updateCount++;
        else hasError = true;
      }

      if (importesToCreate.length > 0) {
        const inputs: CreateGastoTalentosInput[] = importesToCreate.map((imp) =>
          bloqueToCreateInput(imp, sharedFields)
        );
        const created = await addMultipleGastos(inputs);
        createCount = created.length;
        if (created.length < importesToCreate.length) hasError = true;

        if (created.length > 0) {
          const tempIdToDbId = new Map<string, string>();
          for (let i = 0; i < Math.min(importesToCreate.length, created.length); i++) {
            tempIdToDbId.set(importesToCreate[i].id, created[i].id);
          }
          for (const gasto of created) {
            loadedGastoIdsRef.current.add(gasto.id);
          }
          setImportes(prev => prev.map(imp => {
            const dbId = tempIdToDbId.get(imp.id);
            return dbId ? { ...imp, id: dbId } : imp;
          }));
        }
      }

      if (hasError) {
        toast.error('Algunos gastos no pudieron ser guardados');
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
            title="Información de campaña - Talentos"
            subtitle="Detalle de la orden y registro de importes de talentos"
            isCerrado={isCerrado}
            estadoLabel={estadoOP}
          />

          <CampaignInfoCard
            isDark={isDark}
            ordenPublicidad={ordenPublicidadData?.ordenPublicidad || ''}
            presupuesto={String(ordenPublicidadData?.presupuesto || 0)}
            mesServicio={ordenPublicidadData?.mesServicio}
            unidadNegocio={ordenPublicidadData?.unidadNegocio || ''}
            categoriaNegocio={ordenPublicidadData?.categoriaNegocio || ''}
            marca={ordenPublicidadData?.marca}
            nombreCampana={ordenPublicidadData?.nombreCampana || ''}
            rubro={TALENTOS_DEFAULTS.rubro}
            subRubro={TALENTOS_DEFAULTS.subRubro}
          />

          <CargaImportesSection
            isDark={isDark}
            isCerrado={isCerrado}
            importes={importes}
            programasConPresupuesto={ordenPublicidadData?.programasConPresupuesto || []}
            onUpdateImporte={updateImporte}
            onAddImporte={addImporte}
            onRemoveImporte={removeImporte}
            onResetImporte={resetImporte}
            onSaveGasto={handleSaveGasto}
            onDeleteSavedGasto={handleDeleteSavedGasto}
            errors={errors.importes}
            isNewGasto={isNewGasto}
            existingGastoIds={existingGastoIds}
            estadoOP={estadoOP}
          />

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
