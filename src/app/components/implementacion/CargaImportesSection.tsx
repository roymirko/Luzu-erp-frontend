import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { GastoCard, type GastoData, type GastoCardErrors } from '@/app/components/shared';
import { toast } from 'sonner';
import type { BloqueImporte, EstadoOP, EstadoPGM } from './index';

export interface ImportesErrors {
  [importeId: string]: GastoCardErrors;
}

export interface ProgramaConPresupuesto {
  value: string;
  label: string;
  limite: number;
  itemId: string;
}

interface CargaImportesSectionProps {
  isDark: boolean;
  isCerrado: boolean;
  importes: BloqueImporte[];
  programasConPresupuesto: ProgramaConPresupuesto[];
  onUpdateImporte: (id: string, field: keyof BloqueImporte, value: string) => void;
  onAddImporte: () => void;
  onRemoveImporte: (id: string) => void;
  onResetImporte: (id: string) => void;
  onSaveGasto: (importe: BloqueImporte, index: number) => Promise<boolean>;
  onDeleteSavedGasto?: (id: string) => Promise<boolean>;
  errors?: ImportesErrors;
  // Status props
  isNewGasto?: boolean;
  existingGastoIds?: Set<string>;
  estadoOP?: EstadoOP;
}

// Map BloqueImporte to GastoData format
function toGastoData(importe: BloqueImporte): GastoData {
  return {
    id: importe.id,
    facturaEmitidaA: importe.facturaEmitidaA,
    empresa: importe.empresa,
    empresaPrograma: importe.empresaPgm,
    fechaComprobante: importe.fechaComprobante,
    razonSocial: importe.razonSocial,
    proveedor: importe.proveedor,
    acuerdoPago: importe.condicionPago,
    numeroComprobante: importe.numeroComprobante,
    formaPago: importe.formaPago,
    neto: importe.neto,
    observaciones: importe.observaciones,
  };
}

// Map GastoData field to BloqueImporte field
function mapFieldName(field: keyof GastoData): keyof BloqueImporte {
  const fieldMap: Partial<Record<keyof GastoData, keyof BloqueImporte>> = {
    empresaPrograma: 'empresaPgm',
    acuerdoPago: 'condicionPago',
  };
  return fieldMap[field] || (field as keyof BloqueImporte);
}

export function CargaImportesSection(props: CargaImportesSectionProps) {
  const {
    isDark,
    isCerrado,
    importes,
    programasConPresupuesto,
    onUpdateImporte,
    onAddImporte,
    onRemoveImporte,
    onResetImporte,
    onSaveGasto,
    onDeleteSavedGasto,
    errors = {},
    // Status props with defaults
    isNewGasto = true,
    existingGastoIds = new Set(),
    estadoOP = 'pendiente',
  } = props;

  // Track collapsed state for each importe
  const [collapsedImportes, setCollapsedImportes] = useState<Set<string>>(() => {
    // Start with existing gastos collapsed
    return new Set(importes.filter(imp => existingGastoIds.has(imp.id)).map(imp => imp.id));
  });

  // Track saving state for each importe
  const [savingImportes, setSavingImportes] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsedImportes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Validate a single importe
  const validateImporte = (imp: BloqueImporte, index: number): string | null => {
    if (!imp.facturaEmitidaA) return `Gasto #${index + 1}: Debe seleccionar "Factura emitida a"`;
    if (!imp.empresa) return `Gasto #${index + 1}: Debe seleccionar una empresa`;
    if (!imp.empresaPgm) return `Gasto #${index + 1}: Debe seleccionar Empresa/Programa`;
    if (!imp.fechaComprobante) return `Gasto #${index + 1}: Fecha requerida`;
    if (!imp.proveedor || !imp.razonSocial) return `Gasto #${index + 1}: Debe seleccionar proveedor`;
    if (!imp.formaPago) return `Gasto #${index + 1}: Debe seleccionar forma de pago`;
    if (imp.formaPago === 'cheque' && !imp.condicionPago) return `Gasto #${index + 1}: Debe seleccionar acuerdo de pago`;
    if (!imp.neto) return `Gasto #${index + 1}: Debe ingresar un importe`;
    return null;
  };

  // Handle save for individual gasto - validate and save to DB
  const handleGastoSave = async (imp: BloqueImporte, index: number) => {
    console.log('[CargaImportesSection] handleGastoSave llamado para:', imp.id, index);

    const error = validateImporte(imp, index);
    if (error) {
      console.log('[CargaImportesSection] Validación fallida:', error);
      toast.error(error);
      return;
    }
    console.log('[CargaImportesSection] Validación pasó, llamando onSaveGasto');

    setSavingImportes(prev => new Set(prev).add(imp.id));
    try {
      const success = await onSaveGasto(imp, index);
      console.log('[CargaImportesSection] Resultado de onSaveGasto:', success);
      if (success) {
        toggleCollapse(imp.id);
      }
    } finally {
      setSavingImportes(prev => {
        const next = new Set(prev);
        next.delete(imp.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
        Carga de importes
      </h2>

      <div className="space-y-4">
        {importes.map((imp, idx) => {
          // Determine if this specific importe is new (not in existing gastos)
          const isImporteNew = !existingGastoIds.has(imp.id);
          const gastoData = toGastoData(imp);
          const isCollapsed = collapsedImportes.has(imp.id);
          const isSaving = savingImportes.has(imp.id);

          return (
            <GastoCard
              key={imp.id}
              isDark={isDark}
              gasto={gastoData}
              index={idx}
              isNew={isImporteNew}
              isDisabled={isCerrado || isSaving}
              estado={estadoOP}
              estadoPago={imp.estadoPgm}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleCollapse(imp.id)}
              onUpdate={(field, value) => {
                const mappedField = mapFieldName(field);
                onUpdateImporte(imp.id, mappedField, value);
              }}
              onRemove={importes.length > 1 && isImporteNew ? () => onRemoveImporte(imp.id) : undefined}
              onSave={async () => { await handleGastoSave(imp, idx); }}
              onCancel={() => {
                if (isImporteNew) {
                  if (importes.length > 1) {
                    onRemoveImporte(imp.id);
                  } else {
                    onResetImporte(imp.id);
                  }
                }
              }}
              onDeleteSaved={!isImporteNew && onDeleteSavedGasto ? async () => {
                const success = await onDeleteSavedGasto(imp.id);
                return success;
              } : undefined}
              errors={errors[imp.id]}
              showFormaPago
              programOptions={programasConPresupuesto}
              isSaving={isSaving}
              observacionesLabel="Detalle de gasto"
            />
          );
        })}

        {!isCerrado && (
          <div className="flex justify-end">
            <Button
              onClick={onAddImporte}
              className="bg-[#0070ff] hover:bg-[#0060dd] text-white h-9 px-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Agregar Importe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
