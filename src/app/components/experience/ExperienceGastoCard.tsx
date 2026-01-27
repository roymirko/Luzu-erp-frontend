import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import { cn } from '@/app/components/ui/utils';
import {
  FACTURAS_OPTIONS,
  EMPRESAS_OPTIONS,
  ACUERDOS_PAGO_OPTIONS,
  FORMAS_PAGO_OPTIONS,
  PAISES_OPTIONS,
  FIELD_MAX_LENGTHS,
} from '@/app/utils/implementacionConstants';

// Format number with thousand separators (Argentine format: 1.234.567)
function formatNumberWithSeparators(value: string): string {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (!cleanValue) return '';
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse formatted string back to raw number string
function parseFormattedNumber(value: string): string {
  return value.replace(/\./g, '');
}

export interface ExperienceGastoImporte {
  id: string;
  facturaEmitidaA: string;
  empresa: string;
  empresaPgm: string;
  fechaComprobante: string;
  razonSocial: string;
  proveedor: string;
  condicionPago: string;
  formaPago: string;
  pais: string;
  neto: string;
  observaciones: string;
}

export interface ExperienceGastoErrors {
  facturaEmitidaA?: string;
  empresa?: string;
  empresaPgm?: string;
  fechaComprobante?: string;
  proveedor?: string;
  condicionPago?: string;
  formaPago?: string;
  pais?: string;
  neto?: string;
}

interface ExperienceGastoCardProps {
  isDark: boolean;
  importe: ExperienceGastoImporte;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof ExperienceGastoImporte, value: string) => void;
  onRemove: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  errors?: ExperienceGastoErrors;
  isNew?: boolean;
}

export function ExperienceGastoCard(props: ExperienceGastoCardProps) {
  const {
    isDark,
    importe,
    index,
    canRemove,
    onUpdate,
    onRemove,
    onSave,
    onCancel,
    errors = {},
    isNew = true,
  } = props;

  const [isCollapsed, setIsCollapsed] = useState(!isNew);

  const labelClass = cn(
    'flex items-center gap-1 text-sm font-semibold',
    isDark ? 'text-gray-400' : 'text-[#374151]'
  );

  const textareaClass = cn(
    'min-h-[72px] resize-none transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]'
  );

  const handleHeaderClick = () => {
    if (!isNew) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Status badge for Experience gastos
  const StatusBadge = () => (
    <span
      className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        'bg-yellow-100 text-yellow-800'
      )}
    >
      Pendiente de pago
    </span>
  );

  return (
    <div
      className={cn(
        'rounded-[10px] border p-6',
        isCollapsed ? 'space-y-0' : 'space-y-5',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#f8f9fc] border-[#e6e7eb]'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex justify-between items-center',
          !isNew && 'cursor-pointer'
        )}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <h3 className={cn('text-lg font-bold', isDark ? 'text-blue-400' : 'text-[#165dfc]')}>
            Gasto #{index + 1}
          </h3>
          {!isNew && <StatusBadge />}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              className={cn(
                'p-1 rounded transition-colors',
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          )}
          {canRemove && isNew && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar bloque"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <>
          {/* Row 1: Factura emitida a / Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Factura emitida a"
              value={importe.facturaEmitidaA}
              onChange={(v) => onUpdate('facturaEmitidaA', v)}
              options={FACTURAS_OPTIONS}
              required
              error={errors.facturaEmitidaA}
              isDark={isDark}
            />
            <FormSelect
              label="Empresa"
              value={importe.empresa}
              onChange={(v) => onUpdate('empresa', v)}
              options={EMPRESAS_OPTIONS}
              required
              error={errors.empresa}
              isDark={isDark}
            />
          </div>

          {/* Row 2: Empresa/Programa / Fecha de comprobante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Empresa/Programa"
              value={importe.empresaPgm}
              onChange={(v) => onUpdate('empresaPgm', v)}
              required
              error={errors.empresaPgm}
              isDark={isDark}
            />
            <FormInput
              label="Fecha de comprobante"
              type="date"
              value={importe.fechaComprobante}
              onChange={(v) => onUpdate('fechaComprobante', v)}
              required
              error={errors.fechaComprobante}
              isDark={isDark}
            />
          </div>

          {/* Row 3: Razón Social / Proveedor */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Label className={labelClass}>
                Razón Social <span className="text-red-500">*</span>
              </Label>
              <Label className={labelClass}>Proveedor</Label>
            </div>
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
              allowCreate
            />
            {errors.proveedor && (
              <p className="text-sm text-red-500">{errors.proveedor}</p>
            )}
          </div>

          {/* Row 4: Acuerdo de pago / Forma de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Acuerdo de pago"
              value={importe.condicionPago}
              onChange={(v) => onUpdate('condicionPago', v)}
              options={ACUERDOS_PAGO_OPTIONS}
              required
              error={errors.condicionPago}
              isDark={isDark}
            />
            <FormSelect
              label="Forma de pago"
              value={importe.formaPago}
              onChange={(v) => onUpdate('formaPago', v)}
              options={FORMAS_PAGO_OPTIONS}
              required
              error={errors.formaPago}
              isDark={isDark}
            />
          </div>

          {/* Row 5: País / Neto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="País"
              value={importe.pais}
              onChange={(v) => onUpdate('pais', v)}
              options={PAISES_OPTIONS}
              required
              error={errors.pais}
              isDark={isDark}
            />
            <FormInput
              label="Neto"
              type="text"
              value={formatNumberWithSeparators(importe.neto)}
              onChange={(v) => onUpdate('neto', parseFormattedNumber(v))}
              required
              placeholder="$0"
              error={errors.neto}
              isDark={isDark}
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label className={labelClass}>Observaciones</Label>
            <Textarea
              value={importe.observaciones}
              onChange={(e) => onUpdate('observaciones', e.target.value)}
              maxLength={FIELD_MAX_LENGTHS.observaciones}
              placeholder="Observaciones adicionales..."
              className={textareaClass}
            />
          </div>

          {/* Card action buttons */}
          {isNew && (onSave || onCancel) && (
            <div className="flex justify-end gap-2 pt-2">
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-[#0070ff] hover:text-[#0060dd] text-xs"
                >
                  Cancelar
                </Button>
              )}
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className="border-[#0070ff] text-[#0070ff] hover:bg-[#0070ff]/10 text-xs"
                >
                  Guardar
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
