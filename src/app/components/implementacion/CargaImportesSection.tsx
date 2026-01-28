import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { GastoCard, type GastoData, type GastoCardErrors } from '@/app/components/shared';
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
  onSave?: () => void;
  onCancel?: () => void;
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
    onSave,
    onCancel,
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

          return (
            <GastoCard
              key={imp.id}
              isDark={isDark}
              gasto={gastoData}
              index={idx}
              isNew={isImporteNew}
              isDisabled={isCerrado}
              estado={estadoOP}
              estadoPago={imp.estadoPgm}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleCollapse(imp.id)}
              onUpdate={(field, value) => {
                const mappedField = mapFieldName(field);
                onUpdateImporte(imp.id, mappedField, value);
              }}
              onRemove={importes.length > 1 && isImporteNew ? () => onRemoveImporte(imp.id) : undefined}
              onSave={onSave}
              onCancel={onCancel}
              errors={errors[imp.id]}
              showFormaPago
              programOptions={programasConPresupuesto}
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
