import { useState, useEffect, useCallback } from "react";
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
import { Lock, Search } from "lucide-react";
import { cn } from "../ui/utils";
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
  detalleCampana?: string;
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
  formaPago: string;
  neto: number;
  observaciones: string;
  estado: "pendiente-pago" | "pagado" | "anulado";
}

import {
  FACTURAS_OPTIONS,
  EMPRESAS_OPTIONS,
  ACUERDOS_PAGO_EXPERIENCE_OPTIONS,
  FORMAS_PAGO_EXPERIENCE_OPTIONS,
} from '../../utils/implementacionConstants';

const PROGRAMAS_LUZU = [
  "FM Luzu",
  "Antes Que Nadie",
  "Nadie Dice Nada",
  "Patria y Familia",
  "Se Fue Larga",
  "La Novela",
  "Algo Va A Picar",
  "Los No Talentos",
  "Algo de Música",
  "Xtream Master",
  "Edición Especial",
];
const MAX_OBSERVACIONES_LENGTH = 250;

// Convert string arrays to option format for GastoCard
const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));
const PROGRAMAS_LUZU_OPTIONS = toOptions(PROGRAMAS_LUZU);

// Use shared options from implementacionConstants
const ACUERDOS_PAGO_OPTIONS = ACUERDOS_PAGO_EXPERIENCE_OPTIONS;
const FORMAS_PAGO_OPTIONS = FORMAS_PAGO_EXPERIENCE_OPTIONS;
const FACTURA_EMITIDA_A_OPTIONS = FACTURAS_OPTIONS;

const SUB_RUBROS = ["Producción", "Diseño", "Edición", "Técnica"];
const CATEGORIAS_NEGOCIO = ["PE", "Media"];
const MAX_DETALLE_LENGTH = 250;

export function FormularioProgramacion({
  gastoId,
  onClose,
}: FormularioProgramacionProps) {
  const { isDark } = useTheme();
  const {
    addGasto,
    addMultipleGastos,
    updateGasto,
    getGastoById,
    getGastosByFormularioId,
  } = useProgramacion();
  const { currentUser } = useData();

  // Section 1: Cargar Datos
  const [unidadNegocio] = useState("Media");
  const [categoriaNegocio, setCategoriaNegocio] = useState("");
  const [rubroGasto] = useState("Gasto de programación"); // readonly
  const [subrubro, setSubrubro] = useState("");
  const [nombreCampana, setNombreCampana] = useState("");
  const [detalleCampana, setDetalleCampana] = useState("");

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
      formaPago: "",
      neto: 0,
      observaciones: "",
      estado: "pendiente-pago",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [collapsedGastos, setCollapsedGastos] = useState<Set<string>>(
    new Set(),
  );

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
    if (existingGasto && formularioGastos.length > 0) {
      // Use data from the first gasto for shared fields
      const firstGasto = formularioGastos[0];
      setCategoriaNegocio(firstGasto.categoriaNegocio || "");
      setSubrubro(firstGasto.subRubroEmpresa || "");
      setNombreCampana(firstGasto.programa || "");
      setDetalleCampana(
        firstGasto.detalleCampana || firstGasto.conceptoGasto || "",
      );
      setRazonSocial(firstGasto.razonSocial || "");
      setProveedor(firstGasto.proveedor || "");

      // Map ALL gastos from this formulario
      setGastos(
        formularioGastos.map((g) => ({
          id: g.id,
          facturaEmitidaA: g.facturaEmitidaA || g.cliente || "",
          empresa: g.empresa || "",
          empresaPrograma: g.categoria || "",
          fechaComprobante: g.fechaFactura ? new Date(g.fechaFactura).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          acuerdoPago: g.acuerdoPago || "",
          formaPago: g.formaPago || "",
          neto: g.neto || 0,
          observaciones: g.observaciones || "",
          estado: g.estadoPago === "pago" ? "pagado" : "pendiente-pago",
        })),
      );
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
    if (!detalleCampana?.trim()) {
      newErrors.detalleCampana = "Requerido";
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
    detalleCampana,
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
    detalleCampana,
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
        const updatePromises = gastos.map((g) =>
          updateGasto({
            id: g.id,
            unidadNegocio,
            categoriaNegocio,
            subRubroEmpresa: subrubro,
            programa: nombreCampana,
            conceptoGasto: detalleCampana,
            proveedor,
            razonSocial,
            cliente: g.facturaEmitidaA,
            empresa: g.empresa,
            acuerdoPago: g.acuerdoPago,
            formaPago: g.formaPago,
            neto: g.neto,
            observaciones: g.observaciones,
            facturaEmitidaA: g.facturaEmitidaA,
            categoria: g.empresaPrograma,
            fechaFactura: g.fechaComprobante ? new Date(g.fechaComprobante) : undefined,
          })
        );
        const results = await Promise.all(updatePromises);
        success = results.every((r) => r);
        if (success) toast.success(`${gastos.length} gasto(s) actualizado(s) correctamente`);
        else toast.error("Error al actualizar algunos gastos");
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
          categoria: g.empresaPrograma,
          fechaFactura: g.fechaComprobante ? new Date(g.fechaComprobante) : undefined,
        }));

        const result = await addMultipleGastos({
          mesGestion: new Date().toISOString().slice(0, 7),
          unidadNegocio,
          categoriaNegocio,
          programa: nombreCampana,
          subRubroEmpresa: subrubro,
          detalleCampana,
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(val);



  // Get responsable name for edit mode
  const responsableName = existingGasto?.createdBy
    ? currentUser?.id === existingGasto.createdBy
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : existingGasto.createdBy
    : "";

  const fechaRegistro = existingGasto?.createdAt
    ? formatDateDDMMYYYY(existingGasto.createdAt)
    : "";

  const labelClass = cn(
    "flex items-center gap-1 text-sm font-semibold",
    isDark ? "text-gray-400" : "text-[#374151]",
  );

  const inputClass = cn(
    "h-[32px] transition-colors text-sm",
    isDark
      ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
      : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  );

  const selectTriggerClass = cn(
    "h-[32px] w-full transition-colors text-sm",
    isDark
      ? "bg-[#141414] border-gray-800 text-white"
      : "bg-white border-[#d1d5db] text-gray-900",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  );

  const disabledSelectClass = cn(
    "h-[32px] w-full transition-colors text-sm",
    isDark
      ? "bg-[#1e1e1e] border-gray-800 text-gray-400"
      : "bg-[#f3f4f6] border-[#d1d5db] text-gray-600",
    "cursor-not-allowed",
  );

  const textareaClass = cn(
    "min-h-[72px] resize-none transition-colors text-sm",
    isDark
      ? "bg-[#141414] border-gray-800 text-white placeholder:text-gray-600"
      : "bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  );


  return (
    <div
      className={cn(
        "min-h-screen py-4 sm:py-6",
        isDark ? "bg-transparent" : "bg-white",
      )}
    >
      <div className="max-w-[660px] mx-auto px-6 sm:px-8 lg:px-0">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1
                  className={cn(
                    "text-2xl font-bold mb-2",
                    isDark ? "text-white" : "text-[#101828]",
                  )}
                >
                  Cargar Datos
                </h1>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-gray-500" : "text-[#4a5565]",
                  )}
                >
                  Complete la información del nuevo formulario de Programación
                </p>
              </div>
              {isFormularioCerrado && (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">
                  Gasto Cerrado
                </span>
              )}
            </div>
            {isFormularioCerrado && (
              <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-700 dark:text-red-400">
                <Lock className="w-4 h-4" />
                <span className="text-sm">
                  Este gasto está cerrado y no puede ser editado.
                </span>
              </div>
            )}
          </div>

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

            {/* Row 4: Detalle/campaña */}
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
                disabled={isFormularioCerrado}
                maxLength={MAX_DETALLE_LENGTH}
                className={cn(
                  textareaClass,
                  errors.detalleCampana && "border-red-500",
                )}
              />
              <div
                className={cn(
                  "text-xs text-right",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              >
                {detalleCampana.length}/{MAX_DETALLE_LENGTH}
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
                    if (field === "neto") {
                      updateGastoItem(gasto.id, field, Number(value) || 0);
                    } else if (field !== "proveedor" && field !== "razonSocial") {
                      updateGastoItem(gasto.id, field as keyof GastoItem, value);
                    }
                  }}
                  onCancel={() => {
                    if (gastos.length > 1) {
                      removeGastoItem(gasto.id);
                    }
                  }}
                  onSave={() => {
                    const error = validateSingleGasto(gasto, index);
                    if (error) {
                      toast.error(error);
                      return;
                    }
                    toggleGastoCollapse(gasto.id);
                    toast.success(`Gasto #${index + 1} guardado`);
                  }}
                  showProveedorSelector={false}
                  showFormaPago
                  showCharacterCount
                  showAttachments
                  showButtonsBorder
                  maxObservacionesLength={MAX_OBSERVACIONES_LENGTH}
                  programOptions={availableProgramOptions}
                  facturaOptions={FACTURA_EMITIDA_A_OPTIONS}
                  empresaOptions={EMPRESAS_OPTIONS}
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

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 pb-8">
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
              disabled={saving || isFormularioCerrado}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
