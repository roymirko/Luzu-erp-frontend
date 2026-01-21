import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { GastoImporteCard, type GastoImporteErrors } from './GastoImporteCard';
import type { BloqueImporte, EstadoOP, EstadoPGM } from './index';

export interface ImportesErrors {
  [importeId: string]: GastoImporteErrors;
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
  // Concepto de gasto is still a shared field (shown only on first card)
  conceptoGasto: string;
  setConceptoGasto: (v: string) => void;
  conceptoGastoError?: string;
  // Status props
  isNewGasto?: boolean;
  existingGastoIds?: Set<string>;
  estadoOP?: EstadoOP;
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
    conceptoGasto,
    setConceptoGasto,
    conceptoGastoError,
    // Status props with defaults
    isNewGasto = true,
    existingGastoIds = new Set(),
    estadoOP = 'pendiente',
  } = props;

  return (
    <div className="space-y-6">
      <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
        Carga de importes
      </h2>

      <div className="space-y-4">
        {importes.map((imp, idx) => {
          // Determine if this specific importe is new (not in existing gastos)
          const isImporteNew = !existingGastoIds.has(imp.id);
          return (
            <GastoImporteCard
              key={imp.id}
              isDark={isDark}
              isCerrado={isCerrado}
              importe={imp}
              index={idx}
              programasConPresupuesto={programasConPresupuesto}
              canRemove={importes.length > 1 && isImporteNew}
              onUpdate={(field, value) => onUpdateImporte(imp.id, field, value)}
              onRemove={() => onRemoveImporte(imp.id)}
              onSave={onSave}
              onCancel={onCancel}
              errors={errors[imp.id]}
              conceptoGasto={conceptoGasto}
              setConceptoGasto={setConceptoGasto}
              showConceptoGasto={idx === 0}
              conceptoGastoError={conceptoGastoError}
              // Status props
              isNew={isImporteNew}
              estadoOP={estadoOP}
              estadoPGM={imp.estadoPgm}
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
