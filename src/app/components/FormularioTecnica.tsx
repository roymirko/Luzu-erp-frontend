import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTecnica } from '../contexts/TecnicaContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
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
import { FormSelect } from './ui/form-select';
import { FormInput } from './ui/form-input';
import type { CreateGastoTecnicaInput, GastoTecnica } from '../types/tecnica';
import {
  TECNICA_DEFAULTS,
  UNIDADES_NEGOCIO_OPTIONS,
  CATEGORIAS_NEGOCIO_OPTIONS,
  SUBRUBROS_TECNICA_OPTIONS,
} from '@/app/utils/implementacionConstants';

interface FormularioTecnicaProps {
  gastoId?: string;
  formId?: string;
  itemId?: string;
  onClose: () => void;
}

interface FormErrors {
  cargaDatos: Record<string, string>;
  importes: ImportesErrors;
}

const EMPTY_ERRORS: FormErrors = {
  cargaDatos: {},
  importes: {},
};

function gastoToBloqueImporte(gasto: GastoTecnica): BloqueImporte {
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
    unidadNegocio?: string;
    categoriaNegocio?: string;
    nombreCampana?: string;
  }
): CreateGastoTecnicaInput {
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
    unidadNegocio: shared.unidadNegocio,
    categoriaNegocio: shared.categoriaNegocio,
    nombreCampana: shared.nombreCampana,
  };
}

export function FormularioTecnica({ gastoId, formId, itemId, onClose }: FormularioTecnicaProps) {
  const { isDark } = useTheme();
  const {
    addGasto,
    addMultipleGastos,
    updateGasto,
    getGastoById,
    getGastosByItemOrdenId,
    getGastosByOrdenId,
  } = useTecnica();
  const { formularios } = useFormularios();
  const { currentUser } = useData();

  const ordenPublicidadData = useMemo(() => {
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

    // Standalone mode: build program list from ALL formularios with tecnica budget
    if (!formId) {
      const allProgramas = formularios.flatMap((form) =>
        (form.importeRows || [])
          .filter((row) => {
            if (!row.programa) return false;
            const tec = row.tecnica;
            return tec !== null && tec !== undefined && tec !== '';
          })
          .map((row) => {
            const presupuesto = parseFloat(String(row.tecnica || '0').replace(/[^0-9.-]/g, '')) || 0;
            const gastosDelPrograma = getGastosByItemOrdenId(row.id);
            const totalGastado = gastosDelPrograma.reduce((sum, g) => sum + (g.neto || 0), 0);
            const limiteRestante = presupuesto - totalGastado;
            return {
              value: row.programa,
              label: `${row.programa} - Limite: ${formatCurrency(limiteRestante)}`,
              limite: limiteRestante,
              itemId: row.id,
            };
          })
      );
      return {
        ordenPublicidad: '',
        unidadNegocio: '',
        categoriaNegocio: '',
        nombreCampana: '',
        acuerdoPago: '',
        presupuesto: 0,
        programasConPresupuesto: allProgramas,
        responsable: '',
        marca: '',
        mesServicio: '',
      };
    }

    const formulario = formularios.find((f) => f.id === formId);
    if (!formulario) return null;

    const item = itemId ? formulario.importeRows?.find((row) => row.id === itemId) : null;
    const presupuestoTecnica = item
      ? parseFloat(String(item.tecnica || '0').replace(/[^0-9.-]/g, ''))
      : 0;

    const programasConPresupuesto = formulario.importeRows
      ?.filter((row) => {
        if (!row.programa) return false;
        const tec = row.tecnica;
        if (tec === null || tec === undefined || tec === '') return false;
        return true;
      })
      .map((row) => {
        const presupuesto = parseFloat(String(row.tecnica || '0').replace(/[^0-9.-]/g, '')) || 0;
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
      presupuesto: presupuestoTecnica,
      programasConPresupuesto: programasConPresupuesto.length > 0
        ? programasConPresupuesto
        : [{ value: 'Sin programas', label: 'Sin programas', limite: 0, itemId: '' }],
      responsable: formulario.responsable || '',
      marca: formulario.marca || '',
      mesServicio: formulario.mesServicio || '',
    };
  }, [formId, itemId, formularios, getGastosByItemOrdenId]);

  const isStandalone = !formId;

  const [facturaEmitidaA, setFacturaEmitidaA] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [importes, setImportes] = useState<BloqueImporte[]>([]);
  const [estadoOP, setEstadoOP] = useState<EstadoOP>('pendiente');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Standalone mode fields
  const [unidadNegocio, setUnidadNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('');
  const [subRubro, setSubRubro] = useState('');
  const [nombreCampana, setNombreCampana] = useState('');

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
        formaPago: '',
        neto: '',
        observaciones: '',
        estadoPgm: 'pendiente',
      }]);
      dataLoadedRef.current = true;
    };

    const loadGastos = (gastos: GastoTecnica[]) => {
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

    if (isStandalone && !gastoId) {
      initEmptyForm();
      return;
    }

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
      if (existingGastos.length > 0) {
        loadGastos(existingGastos);
      } else {
        initEmptyForm();
      }
    } else if (formId) {
      const existingGastos = getGastosByOrdenId(formId);
      if (existingGastos.length > 0) {
        loadGastos(existingGastos);
      } else {
        initEmptyForm();
      }
    }
  }, [gastoId, formId, itemId, isStandalone, getGastoById, getGastosByItemOrdenId, getGastosByOrdenId]);

  const isCerrado = estadoOP === 'cerrado' || estadoOP === 'anulado';
  const existingGastoIds = loadedGastoIdsRef.current;
  const isExistingGasto = existingGastoIds.size > 0 || !!gastoId;
  const isNewGasto = !isExistingGasto;

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {
      cargaDatos: {},
      importes: {},
    };

    if (isStandalone) {
      if (!subRubro) newErrors.cargaDatos.subRubro = 'Requerido';
      if (!nombreCampana) newErrors.cargaDatos.nombreCampana = 'Requerido';
    }

    for (const imp of importes) {
      const importeErrors: Record<string, string> = {};

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
  }, [importes, isStandalone, subRubro, nombreCampana]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [importes, subRubro, nombreCampana, hasAttemptedSubmit, validateForm]);

  const addImporte = () => {
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

  // In standalone mode, resolve ordenPublicidadId from the item's parent formulario
  const resolveOrdenId = useCallback((importeItemId?: string): string | undefined => {
    if (!isStandalone || !importeItemId) return formId;
    const ownerForm = formularios.find(f =>
      f.importeRows?.some(row => row.id === importeItemId)
    );
    return ownerForm?.id || formId;
  }, [isStandalone, formId, formularios]);

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
        const input: CreateGastoTecnicaInput = bloqueToCreateInput(importe, {
          ordenPublicidadId: resolveOrdenId(importe.itemOrdenPublicidadId),
          defaultItemOrdenPublicidadId: itemId,
          rubro: TECNICA_DEFAULTS.rubro,
          subRubro: isStandalone ? subRubro : TECNICA_DEFAULTS.subRubro,
          ...(isStandalone ? { unidadNegocio, categoriaNegocio, nombreCampana } : {}),
        });

        const created = await addGasto(input);
        if (created) {
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
      console.error('[FormTecnica] Error guardando gasto:', err);
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
        rubro: TECNICA_DEFAULTS.rubro,
        subRubro: isStandalone ? subRubro : TECNICA_DEFAULTS.subRubro,
        ...(isStandalone ? {
          unidadNegocio,
          categoriaNegocio,
          nombreCampana,
        } : {}),
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
          itemOrdenPublicidadId: importe.itemOrdenPublicidadId,
        });
        if (success) {
          updateCount++;
        } else {
          hasError = true;
        }
      }

      if (importesToCreate.length > 0) {
        const inputs: CreateGastoTecnicaInput[] = importesToCreate.map((imp) =>
          bloqueToCreateInput(imp, {
            ...sharedFields,
            ordenPublicidadId: resolveOrdenId(imp.itemOrdenPublicidadId),
          })
        );
        const created = await addMultipleGastos(inputs);
        createCount = created.length;
        if (created.length < importesToCreate.length) {
          hasError = true;
        }

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
      console.error('Error saving gasto tecnica:', err);
      toast.error('Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  const totalEjecutado = importes.reduce((sum, imp) => sum + (parseFloat(imp.neto) || 0), 0);
  const asignado = ordenPublicidadData?.presupuesto || 0;
  const disponible = asignado - totalEjecutado;
  const excedido = totalEjecutado > asignado;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  return (
    <div className={cn('min-h-screen py-4 sm:py-6', isDark ? 'bg-transparent' : 'bg-white')}>
      <div className="max-w-[620px] mx-auto px-6 sm:px-8 lg:px-0">
        <div className="space-y-6 sm:space-y-8">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-[#101828]')}>
                  Información de campaña
                </h1>
                <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-[#4a5565]')}>
                  Detalle de la orden y registro de importes de técnica
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
                <span className="text-sm">Este gasto está {estadoOP} y no puede ser editado.</span>
              </div>
            )}
          </div>

          {isStandalone ? (
            <div className={cn(
              'rounded-lg border p-6 space-y-4',
              isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'
            )}>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                Datos de la campaña
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Unidad de negocio"
                  value={unidadNegocio}
                  onChange={setUnidadNegocio}
                  options={UNIDADES_NEGOCIO_OPTIONS}
                  isDark={isDark}
                />
                <FormSelect
                  label="Categoría de negocio"
                  value={categoriaNegocio}
                  onChange={setCategoriaNegocio}
                  options={CATEGORIAS_NEGOCIO_OPTIONS}
                  isDark={isDark}
                />
                <FormInput
                  label="Rubro de gasto"
                  value={TECNICA_DEFAULTS.rubro}
                  disabled
                  isDark={isDark}
                />
                <FormSelect
                  label="Sub rubro"
                  value={subRubro}
                  onChange={setSubRubro}
                  options={SUBRUBROS_TECNICA_OPTIONS}
                  required
                  isDark={isDark}
                  error={hasAttemptedSubmit ? errors.cargaDatos.subRubro : undefined}
                />
                <div className="sm:col-span-2">
                  <FormInput
                    label="Nombre de campaña"
                    value={nombreCampana}
                    onChange={setNombreCampana}
                    required
                    isDark={isDark}
                    error={hasAttemptedSubmit ? errors.cargaDatos.nombreCampana : undefined}
                  />
                </div>
              </div>
            </div>
          ) : (
            <CampaignInfoCard
              isDark={isDark}
              ordenPublicidad={ordenPublicidadData?.ordenPublicidad || ''}
              presupuesto={String(ordenPublicidadData?.presupuesto || 0)}
              mesServicio={ordenPublicidadData?.mesServicio}
              unidadNegocio={ordenPublicidadData?.unidadNegocio || ''}
              categoriaNegocio={ordenPublicidadData?.categoriaNegocio || ''}
              marca={ordenPublicidadData?.marca}
              nombreCampana={ordenPublicidadData?.nombreCampana || ''}
              rubro={TECNICA_DEFAULTS.rubro}
              subRubro={TECNICA_DEFAULTS.subRubro}
              formatCurrency={formatCurrency}
            />
          )}

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
            isNewGasto={isNewGasto}
            existingGastoIds={existingGastoIds}
            estadoOP={estadoOP}
          />

          {!isStandalone && (
            <ResumenPresupuestario
              isDark={isDark}
              asignado={asignado}
              ejecutado={totalEjecutado}
              disponible={disponible}
              excedido={excedido}
              formatCurrency={formatCurrency}
            />
          )}

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
