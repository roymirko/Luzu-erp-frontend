import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { GastoImporteCard, type GastoImporteErrors } from './GastoImporteCard';
import type { BloqueImporte, EstadoOP, EstadoPGM } from './index';

export interface ImportesErrors {
  [importeId: string]: GastoImporteErrors;
}

interface CargaImportesSectionProps {
  isDark: boolean;
  isCerrado: boolean;
  importes: BloqueImporte[];
  programasDisponibles: string[];
  onUpdateImporte: (id: string, field: keyof BloqueImporte, value: string) => void;
  onAddImporte: () => void;
  onRemoveImporte: (id: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  errors?: ImportesErrors;
  // Global fields
  facturaEmitidaA: string;
  setFacturaEmitidaA: (v: string) => void;
  empresa: string;
  setEmpresa: (v: string) => void;
  conceptoGasto: string;
  setConceptoGasto: (v: string) => void;
  globalFieldsErrors?: {
    facturaEmitidaA?: string;
    empresa?: string;
    conceptoGasto?: string;
  };
  // Approval workflow props
  isNewGasto?: boolean;
  gastoId?: string;
  estadoOP?: EstadoOP;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkPaid?: () => void;
  approvalLoading?: boolean;
}

export function CargaImportesSection(props: CargaImportesSectionProps) {
  const {
    isDark,
    isCerrado,
    importes,
    programasDisponibles,
    onUpdateImporte,
    onAddImporte,
    onRemoveImporte,
    onSave,
    onCancel,
    errors = {},
    facturaEmitidaA,
    setFacturaEmitidaA,
    empresa,
    setEmpresa,
    conceptoGasto,
    setConceptoGasto,
    globalFieldsErrors = {},
    // Approval workflow props with defaults
    isNewGasto = true,
    gastoId,
    estadoOP = 'pendiente',
    onApprove,
    onReject,
    onMarkPaid,
    approvalLoading = false,
  } = props;

  return (
    <div className="space-y-6">
      <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-[#101828]')}>
        Carga de importes
      </h2>

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
            onSave={isNewGasto ? onSave : undefined}
            onCancel={isNewGasto ? onCancel : undefined}
            errors={errors[imp.id]}
            facturaEmitidaA={facturaEmitidaA}
            setFacturaEmitidaA={setFacturaEmitidaA}
            empresa={empresa}
            setEmpresa={setEmpresa}
            conceptoGasto={conceptoGasto}
            setConceptoGasto={setConceptoGasto}
            showGlobalFields={idx === 0}
            globalFieldsErrors={globalFieldsErrors}
            // Approval workflow props
            isNew={isNewGasto}
            gastoId={gastoId}
            estadoOP={estadoOP}
            estadoPGM={imp.estadoPgm}
            onApprove={onApprove}
            onReject={onReject}
            onMarkPaid={onMarkPaid}
            approvalLoading={approvalLoading}
          />
        ))}

        {!isCerrado && isNewGasto && (
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
