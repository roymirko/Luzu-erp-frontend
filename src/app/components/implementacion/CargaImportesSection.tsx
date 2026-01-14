import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { FormInput } from '@/app/components/ui/form-input';
import { cn } from '@/app/components/ui/utils';
import { GastoImporteCard, type GastoImporteErrors } from './GastoImporteCard';
import type { BloqueImporte } from '@/app/contexts/ImplementacionContext';

export interface ImportesErrors {
  [importeId: string]: GastoImporteErrors;
}

interface CargaImportesSectionProps {
  isDark: boolean;
  isCerrado: boolean;
  ordenPublicidad: string;
  presupuesto: string;
  importes: BloqueImporte[];
  programasDisponibles: string[];
  formatCurrency: (val: number) => string;
  onUpdateImporte: (id: string, field: keyof BloqueImporte, value: string) => void;
  onAddImporte: () => void;
  onRemoveImporte: (id: string) => void;
  errors?: ImportesErrors;
}

export function CargaImportesSection(props: CargaImportesSectionProps) {
  const {
    isDark,
    isCerrado,
    ordenPublicidad,
    presupuesto,
    importes,
    programasDisponibles,
    formatCurrency,
    onUpdateImporte,
    onAddImporte,
    onRemoveImporte,
    errors = {},
  } = props;

  return (
    <div className="space-y-6 pt-6 border-t dark:border-gray-800">
      <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
        Carga de importes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Orden de publicidad"
          value={ordenPublicidad}
          disabled
          isDark={isDark}
        />
        <FormInput
          label="Presupuesto"
          value={formatCurrency(parseFloat(presupuesto))}
          disabled
          isDark={isDark}
        />
      </div>

      <div className="space-y-4">
        {importes.map((imp, idx) => (
          <GastoImporteCard
            key={imp.id}
            isDark={isDark}
            isCerrado={isCerrado}
            importe={imp}
            index={idx}
            programasDisponibles={programasDisponibles}
            canRemove={importes.length > 1}
            onUpdate={(field, value) => onUpdateImporte(imp.id, field, value)}
            onRemove={() => onRemoveImporte(imp.id)}
            errors={errors[imp.id]}
          />
        ))}

        {!isCerrado && (
          <div className="flex justify-end">
            <Button onClick={onAddImporte} className="bg-[#0070ff] hover:bg-[#0060dd] text-white">
              <Plus className="h-4 w-4 mr-2" /> Agregar importe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
