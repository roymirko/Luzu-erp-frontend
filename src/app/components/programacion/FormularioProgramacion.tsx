import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useProgramacion } from "../../contexts/ProgramacionContext";
import { useData } from "../../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ProveedorSelector } from "../ProveedorSelector";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { cn } from "../ui/utils";
import type { FormSelectOption } from '../ui/form-select';
import { formatCurrency } from "@/app/utils/format";
import { formStyles } from "@/app/components/shared/formStyles";
import { FormHeader } from "@/app/components/shared/FormHeader";
import { FormFooter } from "@/app/components/shared/FormFooter";
import { GastoCard, type GastoData } from "../shared";
import { formatDateDDMMYYYY } from "../../utils/dateFormatters";
import type {
  GastoProgramacion,
  CreateGastoProgramacionInput,
} from "../../types/programacion";

interface FormularioProgramacionProps {
  gastoId?: string;
  onClose: () => void;
}

interface FormErrors {
  subrubro?: string;
  nombreCampana?: string;
  proveedor?: string;
  razonSocial?: string;
}

interface GastoItem {
  id: string;
  facturaEmitidaA: string;
  empresa: string;
  empresaPrograma: string;
  fechaComprobante: string;
  acuerdoPago: string;
  numeroComprobante: string;
  formaPago: string;
  neto: number;
  observaciones: string;
  estado: "pendiente-pago" | "pagado" | "anulado";
}

import {
  FACTURAS_OPTIONS,
  ACUERDOS_PAGO_EXPERIENCE_OPTIONS,
  FORMAS_PAGO_EXPERIENCE_OPTIONS,
  PROGRAMAS_LUZU_OPTIONS,
} from '../../utils/implementacionConstants';

const MAX_OBSERVACIONES_LENGTH = 250;

const EMPRESAS_PROGRAMACION_OPTIONS: FormSelectOption[] = [
  { value: 'Luzu TV', label: 'Luzu TV' },
  { value: 'Luzu SA', label: 'Luzu SA' },
];

// Use shared options from implementacionConstants
const ACUERDOS_PAGO_OPTIONS = ACUERDOS_PAGO_EXPERIENCE_OPTIONS;
const FORMAS_PAGO_OPTIONS = FORMAS_PAGO_EXPERIENCE_OPTIONS;
const FACTURA_EMITIDA_A_OPTIONS = FACTURAS_OPTIONS;

const SUB_RUBROS = ["Producción", "Diseño", "Edición", "Técnica"];
const CATEGORIAS_NEGOCIO = ["PE", "Media"];

export function FormularioProgramacion({
  gastoId,
  onClose,
}: FormularioProgramacionProps) {
  const { isDark } = useTheme();
  const {
    addMultipleGastos,
    addGastoToFormulario,
    updateGasto,
    deleteGasto,
    getGastoById,
    getGastosByFormularioId,
  } = useProgramacion();
  const { currentUser, users } = useData();

  // Section 1: Cargar Datos
  const [unidadNegocio] = useState("Media");
  const [categoriaNegocio, setCategoriaNegocio] = useState("");
  const [rubroGasto] = useState("Gasto de programación"); // readonly
  const [subrubro, setSubrubro] = useState("");
  const [nombreCampana, setNombreCampana] = useState("");

  // Section 2: Carga de importes - shared proveedor for all gastos
  const [razonSocial, setRazonSocial] = useState("");
  const [proveedor, setProveedor] = useState("");

  // Section 2: Gastos (repeatable)
  const [gastos, setGastos] = useState<GastoItem[]>([
    {
      id: crypto.randomUUID(),
      facturaEmitidaA: "",
      empresa: "",
      empresaPrograma: "",
      fechaComprobante: new Date().toISOString().split("T")[0],
      acuerdoPago: "",
      numeroComprobante: "",
      formaPago: "",
      neto: 0,
      observaciones: "",
      estado: "pendiente-pago",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [savingGastos, setSavingGastos] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [collapsedGastos, setCollapsedGastos] = useState<Set<string>>(
    new Set(),
  );

  // Track if initial data has been loaded to prevent re-running useEffect
  const dataLoadedRef = useRef(false);
  // Track IDs of gastos loaded from DB (to distinguish from locally added)
  const loadedGastoIdsRef = useRef<Set<string>>(new Set());

  const isEditing = !!gastoId;
  const existingGasto = gastoId ? getGastoById(gastoId) : undefined;
  // Get ALL gastos for this formulario (not just the clicked one)
  // Get gastos and sort by createdAt (oldest first) to maintain stable order
  const formularioGastos = existingGasto
    ? getGastosByFormularioId(existingGasto.formularioId).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];
  const isFormularioCerrado =
    existingGasto?.formularioEstado === "cerrado" ||
    existingGasto?.formularioEstado === "anulado";

  useEffect(() => {
    // Only load data once on initial mount
    if (dataLoadedRef.current) return;

    if (existingGasto && formularioGastos.length > 0) {
      dataLoadedRef.current = true;

      // Use data from the first gasto for shared fields
      const firstGasto = formularioGastos[0];
      setCategoriaNegocio(firstGasto.categoriaNegocio || "");
      setSubrubro(firstGasto.formularioSubRubro || firstGasto.subRubroEmpresa || firstGasto.ctxSubRubro || "");
      setNombreCampana(firstGasto.programa || "");
      setRazonSocial(firstGasto.razonSocial || "");
      setProveedor(firstGasto.proveedor || "");

      // Map ALL gastos from this formulario and track their IDs
      const loadedGastos = formularioGastos.map((g) => ({
        id: g.id,
        facturaEmitidaA: g.facturaEmitidaA || g.cliente || "",
        empresa: g.empresa || "",
        empresaPrograma: g.categoria || "",
        fechaComprobante: g.fechaFactura ? new Date(g.fechaFactura).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        acuerdoPago: g.acuerdoPago || "",
        numeroComprobante: g.numeroFactura || "",
        formaPago: g.formaPago || "",
        neto: g.neto || 0,
        observaciones: g.observaciones || "",
        estado: g.estadoPago === "pago" ? "pagado" : "pendiente-pago",
      }));

      setGastos(loadedGastos);
      loadedGastoIdsRef.current = new Set(loadedGastos.map(g => g.id));
    }
  }, [existingGasto, formularioGastos.length]);

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!subrubro?.trim()) {
      newErrors.subrubro = "Requerido";
    }
    if (!nombreCampana?.trim()) {
      newErrors.nombreCampana = "Requerido";
    }
    if (!razonSocial?.trim()) {
      newErrors.razonSocial = "Requerido";
    }
    if (!proveedor?.trim()) {
      newErrors.proveedor = "Requerido";
    }

    return newErrors;
  }, [
    subrubro,
    nombreCampana,
    razonSocial,
    proveedor,
  ]);

  const validateSingleGasto = useCallback(
    (g: GastoItem, index: number): string | null => {
      if (!g.facturaEmitidaA?.trim()) {
        return `Gasto #${index + 1}: Debe seleccionar "Factura emitida a"`;
      }
      if (!g.empresa?.trim()) {
        return `Gasto #${index + 1}: Debe seleccionar una empresa`;
      }
      if (!g.empresaPrograma?.trim()) {
        return `Gasto #${index + 1}: Debe seleccionar Empresa/Programa`;
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
    },
    [],
  );

  const validateGastos = useCallback((): string | null => {
    for (let i = 0; i < gastos.length; i++) {
      const error = validateSingleGasto(gastos[i], i);
      if (error) return error;
    }
    return null;
  }, [gastos, validateSingleGasto]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm());
    }
  }, [
    subrubro,
    nombreCampana,
    razonSocial,
    proveedor,
    hasAttemptedSubmit,
    validateForm,
  ]);

  const handleProveedorChange = (data: {
    proveedor: string;
    razonSocial: string;
  }) => {
    setProveedor(data.proveedor);
    setRazonSocial(data.razonSocial);
  };

  const addGastoItem = () => {
    setGastos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        facturaEmitidaA: "",
        empresa: "",
        empresaPrograma: "",
        fechaComprobante: new Date().toISOString().split("T")[0],
        acuerdoPago: "",
        numeroComprobante: "",
        formaPago: "",
        neto: 0,
        observaciones: "",
        estado: "pendiente-pago",
      },
    ]);
  };

  const removeGastoItem = (id: string) => {
    if (gastos.length === 1) {
      toast.error("Debe haber al menos un gasto");
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
              acuerdoPago: '',
              numeroComprobante: '',
              formaPago: '',
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
        // Last gasto: replace with empty
        const newId = crypto.randomUUID();
        setGastos([{
          id: newId,
          facturaEmitidaA: '',
          empresa: '',
          empresaPrograma: '',
          fechaComprobante: new Date().toISOString().split('T')[0],
          acuerdoPago: '',
          numeroComprobante: '',
          formaPago: '',
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

  const updateGastoItem = (
    id: string,
    field: keyof GastoItem,
    value: string | number,
  ) => {
    setGastos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
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

  // Save a single gasto to the database
  const handleSaveGasto = async (gasto: GastoItem, index: number): Promise<boolean> => {
    // Validate proveedor and razonSocial (shared fields)
    if (!proveedor || !razonSocial) {
      toast.error('Debe seleccionar un proveedor antes de guardar');
      return false;
    }

    const isExisting = loadedGastoIdsRef.current.has(gasto.id);
    console.log('[FormProgramacion] Guardando gasto individual:', gasto.id, 'isExisting:', isExisting);

    setSavingGastos(prev => new Set(prev).add(gasto.id));
    try {
      if (isExisting) {
        // Update existing gasto
        const success = await updateGasto({
          id: gasto.id,
          neto: gasto.neto,
          empresa: gasto.empresa,
          observaciones: gasto.observaciones,
          facturaEmitidaA: gasto.facturaEmitidaA,
          categoria: gasto.empresaPrograma,
          acuerdoPago: gasto.acuerdoPago,
          formaPago: gasto.formaPago,
          numeroFactura: gasto.numeroComprobante || undefined,
          fechaFactura: gasto.fechaComprobante ? new Date(gasto.fechaComprobante) : undefined,
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
          proveedor,
          razonSocial,
          neto: gasto.neto,
          empresa: gasto.empresa,
          observaciones: gasto.observaciones,
          facturaEmitidaA: gasto.facturaEmitidaA,
          categoria: gasto.empresaPrograma,
          acuerdoPago: gasto.acuerdoPago,
          formaPago: gasto.formaPago,
          numeroFactura: gasto.numeroComprobante || undefined,
          fechaFactura: gasto.fechaComprobante ? new Date(gasto.fechaComprobante) : undefined,
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
      console.error('[FormProgramacion] Error guardando gasto:', err);
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

  // Get already selected programs to prevent duplicates
  const getSelectedPrograms = (excludeId: string) => {
    return gastos
      .filter((g) => g.id !== excludeId && g.empresaPrograma)
      .map((g) => g.empresaPrograma);
  };

  const isGastoLocked = (gasto: GastoItem) => {
    return gasto.estado === "pagado";
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
      toast.error("Por favor, complete todos los campos requeridos");
      return;
    }

    // Validate gastos
    const gastosError = validateGastos();
    if (gastosError) {
      toast.error(gastosError);
      return;
    }

    setSaving(true);
    try {
      let success: boolean;

      if (isEditing && existingGasto) {
        // Get the formularioId from the existing gasto
        const formularioId = existingGasto.formularioId;

        // Use loaded IDs to distinguish existing vs new gastos
        const loadedIds = loadedGastoIdsRef.current;
        const gastosToUpdate = gastos.filter(g => loadedIds.has(g.id));
        const gastosToCreateNew = gastos.filter(g => !loadedIds.has(g.id));

        let allSucceeded = true;
        let failedCount = 0;

        // Update existing gastos
        for (let i = 0; i < gastosToUpdate.length; i++) {
          const g = gastosToUpdate[i];
          const result = await updateGasto({
            id: g.id,
            // Only update formulario fields on the first gasto to avoid conflicts
            ...(i === 0 ? {
              unidadNegocio,
              categoriaNegocio,
              subRubroEmpresa: subrubro,
              programa: nombreCampana,
            } : {}),
            proveedor,
            razonSocial,
            cliente: g.facturaEmitidaA,
            empresa: g.empresa,
            acuerdoPago: g.acuerdoPago,
            formaPago: g.formaPago,
            numeroFactura: g.numeroComprobante || undefined,
            neto: g.neto,
            observaciones: g.observaciones,
            facturaEmitidaA: g.facturaEmitidaA,
            categoria: g.empresaPrograma,
            fechaFactura: g.fechaComprobante ? new Date(g.fechaComprobante) : undefined,
          });

          if (!result) {
            allSucceeded = false;
            failedCount++;
            console.error(`Failed to update gasto ${i + 1} (id: ${g.id})`);
          }
        }

        // Create new gastos (added to existing formulario)
        if (formularioId && gastosToCreateNew.length > 0) {
          const tempIdToDbId = new Map<string, string>();

          for (const g of gastosToCreateNew) {
            const result = await addGastoToFormulario(formularioId, {
              proveedor,
              razonSocial,
              neto: g.neto,
              empresa: g.empresa,
              observaciones: g.observaciones,
              facturaEmitidaA: g.facturaEmitidaA,
              categoria: g.empresaPrograma,
              acuerdoPago: g.acuerdoPago,
              formaPago: g.formaPago,
              numeroFactura: g.numeroComprobante || undefined,
              fechaFactura: g.fechaComprobante ? new Date(g.fechaComprobante) : undefined,
              createdBy: currentUser?.id,
            });

            if (result) {
              // Map temp UUID to real DB ID and add to loaded refs
              tempIdToDbId.set(g.id, result.id);
              loadedGastoIdsRef.current.add(result.id);
            } else {
              allSucceeded = false;
              failedCount++;
              console.error(`Failed to create new gasto`);
            }
          }

          // Update local gastos state with real DB IDs
          if (tempIdToDbId.size > 0) {
            setGastos(prev => prev.map(g => {
              const dbId = tempIdToDbId.get(g.id);
              return dbId ? { ...g, id: dbId } : g;
            }));
          }
        }

        success = allSucceeded;
        const totalCount = gastosToUpdate.length + gastosToCreateNew.length;
        if (success) toast.success(`${totalCount} gasto(s) guardado(s) correctamente`);
        else toast.error(`Error al guardar ${failedCount} de ${totalCount} gastos`);
      } else {
        const gastosToCreate = gastos.map((g) => ({
          proveedor,
          razonSocial,
          neto: g.neto,
          empresa: g.empresa,
          observaciones: g.observaciones,
          facturaEmitidaA: g.facturaEmitidaA,
          acuerdoPago: g.acuerdoPago,
          formaPago: g.formaPago,
          numeroFactura: g.numeroComprobante || undefined,
          categoria: g.empresaPrograma,
          fechaFactura: g.fechaComprobante ? new Date(g.fechaComprobante) : undefined,
        }));

        const result = await addMultipleGastos({
          mesGestion: new Date().toISOString().slice(0, 7),
          unidadNegocio,
          categoriaNegocio,
          programa: nombreCampana,
          subRubroEmpresa: subrubro,
          ejecutivo: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : undefined,
          createdBy: currentUser?.id,
          gastos: gastosToCreate,
        });
        success = result.success;
        if (success) {
          toast.success(`${gastos.length} gasto(s) creado(s) correctamente`);
        } else {
          toast.error(result.error || "Error al crear los gastos");
        }
      }

      if (success) onClose();
    } catch (err) {
      console.error("Error saving gasto:", err);
      toast.error("Error inesperado al guardar");
    } finally {
      setSaving(false);
    }
  };



  // Get responsable name for edit mode
  const responsableName = existingGasto?.createdBy
    ? (() => {
        const user = users.find(u => u.id === existingGasto.createdBy);
        return user ? `${user.firstName} ${user.lastName}` : '-';
      })()
    : "";

  const fechaRegistro = existingGasto?.createdAt
    ? formatDateDDMMYYYY(existingGasto.createdAt)
    : "";

  const { label: labelClass, input: inputClass, selectTrigger: selectTriggerClass, disabledSelect: disabledSelectClass, textarea: textareaClass } = formStyles(isDark);


  return (
    <div
      className={cn(
        "min-h-screen py-4 sm:py-6",
        isDark ? "bg-transparent" : "bg-white",
      )}
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-6 sm:space-y-8">
          <FormHeader
            isDark={isDark}
            title="Cargar Datos"
            subtitle="Complete la información del nuevo formulario de Programación"
            isCerrado={isFormularioCerrado}
          />

          {/* Read-only fields - only visible when editing */}
          {isEditing && (
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>Responsable</Label>
                <Input
                  type="text"
                  value={responsableName}
                  disabled
                  className={cn(
                    inputClass,
                    "bg-[#f3f4f6] text-gray-600 cursor-not-allowed",
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>Fecha de Registro</Label>
                <Input
                  type="text"
                  value={fechaRegistro}
                  disabled
                  className={cn(
                    inputClass,
                    "bg-[#f3f4f6] text-gray-600 cursor-not-allowed",
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>Sector</Label>
                <Input
                  type="text"
                  value="Programación"
                  disabled
                  className={cn(
                    inputClass,
                    "bg-[#f3f4f6] text-gray-600 cursor-not-allowed",
                  )}
                />
              </div>
            </div>
          )}

          {/* Section 1: Cargar Datos */}
          <div className="space-y-4">
            {/* Row 1: Unidad de Negocio | Categoría de Negocio */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>Unidad de Negocio</Label>
                <Input
                  type="text"
                  value={unidadNegocio}
                  disabled
                  className={disabledSelectClass}
                />
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Categoría de Negocio</Label>
                <Select
                  value={categoriaNegocio}
                  onValueChange={setCategoriaNegocio}
                  disabled={isFormularioCerrado}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_NEGOCIO.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Rubro del gasto | Subrubro */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label className={labelClass}>Rubro del gasto</Label>
                <Select value={rubroGasto} disabled>
                  <SelectTrigger className={disabledSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasto de programación">
                      Gasto de programación
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>
                  Subrubro<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={subrubro}
                  onValueChange={setSubrubro}
                  disabled={isFormularioCerrado}
                >
                  <SelectTrigger
                    className={cn(
                      selectTriggerClass,
                      errors.subrubro && "border-red-500",
                    )}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUB_RUBROS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Nombre de Campaña (full width) */}
            <div className="space-y-1">
              <Label className={labelClass}>
                Nombre de Campaña<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                    isDark ? "text-gray-500" : "text-gray-400",
                  )}
                />
                <Input
                  type="text"
                  value={nombreCampana}
                  onChange={(e) => setNombreCampana(e.target.value)}
                  placeholder="Buscar campaña"
                  disabled={isFormularioCerrado}
                  className={cn(
                    inputClass,
                    "pl-10",
                    errors.nombreCampana && "border-red-500",
                  )}
                />
              </div>
            </div>

          </div>

          {/* Section 2: Carga de importes */}
          <div className="space-y-4">
            <h2
              className={cn(
                "text-xl font-bold",
                isDark ? "text-white" : "text-[#101828]",
              )}
            >
              Carga de importes
            </h2>

            <ProveedorSelector
              value={{ proveedor, razonSocial }}
              onChange={handleProveedorChange}
              disabled={isFormularioCerrado}
              allowCreate={!isFormularioCerrado}
              className={cn(
                errors.proveedor || errors.razonSocial
                  ? "[&_input]:border-red-500"
                  : "",
              )}
            />

            {/* Gastos Items */}
            {gastos.map((gasto, index) => {
              const isCollapsed = collapsedGastos.has(gasto.id);
              const isLocked = isGastoLocked(gasto);
              const isDisabled = isFormularioCerrado || isLocked;
              const selectedPrograms = getSelectedPrograms(gasto.id);

              // Convert GastoItem to GastoData format
              const gastoData: GastoData = {
                id: gasto.id,
                facturaEmitidaA: gasto.facturaEmitidaA,
                empresa: gasto.empresa,
                empresaPrograma: gasto.empresaPrograma,
                fechaComprobante: gasto.fechaComprobante,
                razonSocial: "",
                proveedor: "",
                acuerdoPago: gasto.acuerdoPago,
                numeroComprobante: gasto.numeroComprobante,
                formaPago: gasto.formaPago,
                neto: String(gasto.neto || 0),
                observaciones: gasto.observaciones,
              };

              // Filter program options to exclude already selected
              const availableProgramOptions = PROGRAMAS_LUZU_OPTIONS.filter(
                (opt) =>
                  opt.value === gasto.empresaPrograma ||
                  !selectedPrograms.includes(opt.value)
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
                    if (field === "neto") {
                      updateGastoItem(gasto.id, field, Number(value) || 0);
                    } else if (field !== "proveedor" && field !== "razonSocial") {
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
                    if (error) {
                      toast.error(error);
                      return;
                    }
                    await handleSaveGasto(gasto, index);
                  }}
                  isSaving={savingGastos.has(gasto.id)}
                  showProveedorSelector={false}
                  showFormaPago
                  showCharacterCount
                  showAttachments
                  showButtonsBorder
                  maxObservacionesLength={MAX_OBSERVACIONES_LENGTH}
                  observacionesLabel="Detalle de gasto"
                  programOptions={availableProgramOptions}
                  facturaOptions={FACTURA_EMITIDA_A_OPTIONS}
                  empresaOptions={EMPRESAS_PROGRAMACION_OPTIONS}
                  acuerdoPagoOptions={ACUERDOS_PAGO_OPTIONS}
                  formaPagoOptions={FORMAS_PAGO_OPTIONS}
                />
              );
            })}

            {/* Add Importe Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addGastoItem}
                className="bg-[#0070ff] hover:bg-[#0060dd] text-white"
                disabled={isFormularioCerrado}
              >
                + Agregar importe
              </Button>
            </div>
          </div>

          {/* Section 3: Resumen */}
          <Card
            className={
              isDark
                ? "bg-[#141414] border-gray-800"
                : "bg-white border-[#e5e7eb]"
            }
          >
            <CardHeader className="pb-4">
              <CardTitle
                className={cn(
                  "text-xl font-medium",
                  isDark ? "text-white" : "text-[#101828]",
                )}
              >
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "p-4 rounded-lg border w-[163px]",
                  isDark
                    ? "bg-[#1e1e1e] border-gray-800"
                    : "bg-[#f3f5ff] border-[#e5e7eb]",
                )}
              >
                <p
                  className={cn(
                    "text-xs text-center mb-1",
                    isDark ? "text-gray-400" : "text-[#4a5565]",
                  )}
                >
                  Total del gasto
                </p>
                <p
                  className={cn(
                    "text-lg font-bold text-center",
                    isDark ? "text-white" : "text-[#101828]",
                  )}
                >
                  {formatCurrency(totalGasto)}
                </p>
              </div>
            </CardContent>
          </Card>

          <FormFooter
            saving={saving}
            onCancel={onClose}
            onSave={handleGuardar}
            isCerrado={isFormularioCerrado}
            disableSaveWhenCerrado
            paddingTop="pt-4"
          />
        </div>
      </div>
    </div>
  );
}
