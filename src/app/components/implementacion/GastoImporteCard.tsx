import { X } from 'lucide-react';
import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { Label } from '@/app/components/ui/label';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import { cn } from '@/app/components/ui/utils';
import { ACUERDOS_PAGO_OPTIONS } from '@/app/utils/implementacionConstants';
import type { BloqueImporte } from '@/app/contexts/ImplementacionContext';

export interface GastoImporteErrors {
  empresaPgm?: string;
  fechaComprobante?: string;
  proveedor?: string;
  condicionPago?: string;
  neto?: string;
}

interface GastoImporteCardProps {
  isDark: boolean;
  isCerrado: boolean;
  importe: BloqueImporte;
  index: number;
  programasDisponibles: string[];
  canRemove: boolean;
  onUpdate: (field: keyof BloqueImporte, value: string) => void;
  onRemove: () => void;
  errors?: GastoImporteErrors;
}

export function GastoImporteCard(props: GastoImporteCardProps) {
  const {
    isDark,
    isCerrado,
    importe,
    index,
    programasDisponibles,
    canRemove,
    onUpdate,
    onRemove,
    errors = {},
  } = props;

  const programOptions = programasDisponibles.map((p) => ({ value: p, label: p }));

  const labelClass = cn(
    'flex items-center gap-1',
    isDark ? 'text-gray-400' : 'text-gray-700'
  );

  return (
    <div
      className={cn(
        'rounded-lg border p-6 space-y-4',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#f8f9fc] border-gray-200'
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className={cn('font-medium', isDark ? 'text-blue-400' : 'text-blue-600')}>
          Gasto #{index + 1}
        </h3>
        {canRemove && !isCerrado && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500"
            title="Eliminar bloque"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Empresa/PGM"
          value={importe.empresaPgm}
          onChange={(v) => onUpdate('empresaPgm', v)}
          options={programOptions}
          required
          disabled={isCerrado}
          error={errors.empresaPgm}
          isDark={isDark}
        />

        <FormInput
          label="Fecha comprobante"
          type="date"
          value={importe.fechaComprobante}
          onChange={(v) => onUpdate('fechaComprobante', v)}
          required
          disabled={isCerrado}
          error={errors.fechaComprobante}
          isDark={isDark}
        />
      </div>

      <div className="space-y-2">
        <Label className={labelClass}>
          Proveedor y Razón Social <span className="text-red-500">*</span>
        </Label>
        <ProveedorSelector
          value={{
            proveedor: importe.proveedor,
            razonSocial: importe.razonSocial,
            proveedorId: null,
          }}
          onChange={(next) => {
            onUpdate('proveedor', next.proveedor);
            onUpdate('razonSocial', next.razonSocial);
          }}
          disabled={isCerrado}
          allowCreate={!isCerrado}
        />
        {errors.proveedor && (
          <p className="text-sm text-red-500">{errors.proveedor}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Acuerdo de pago"
          value={importe.condicionPago}
          onChange={(v) => onUpdate('condicionPago', v)}
          options={ACUERDOS_PAGO_OPTIONS}
          required
          disabled={isCerrado}
          error={errors.condicionPago}
          isDark={isDark}
        />

        <FormInput
          label="Neto"
          type="number"
          value={importe.neto}
          onChange={(v) => onUpdate('neto', v)}
          required
          disabled={isCerrado}
          placeholder="$0.00"
          error={errors.neto}
          isDark={isDark}
        />
      </div>

      {!isCerrado && (
        <div className="flex justify-start">
          <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Agregar adjuntos
          </button>
        </div>
      )}
    </div>
  );
}
