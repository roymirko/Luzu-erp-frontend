import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { FormDatePicker } from '@/app/components/ui/form-date-picker';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import { cn } from '@/app/components/ui/utils';
import { formStyles } from '@/app/components/shared/formStyles';
import { StatusBadge, type EstadoPago, type EstadoOP, type EstadoPGM } from './StatusBadge';
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

// Base gasto data interface - all possible fields
export interface GastoData {
  id: string;
  facturaEmitidaA: string;
  empresa: string;
  empresaPrograma: string;
  fechaComprobante: string;
  razonSocial: string;
  proveedor: string;
  acuerdoPago: string;
  formaPago?: string;
  pais?: string;
  neto: string;
  observaciones?: string;
}

export interface GastoCardErrors {
  facturaEmitidaA?: string;
  empresa?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  proveedor?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
  neto?: string;
}

export interface ProgramOption {
  value: string;
  label: string;
}

// Re-export types for convenience
export type { EstadoPago, EstadoOP, EstadoPGM } from './StatusBadge';

interface GastoCardProps {
  isDark: boolean;
  gasto: GastoData;
  index: number;
  onUpdate: (field: keyof GastoData, value: string) => void;
  onRemove?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  errors?: GastoCardErrors;
  isNew?: boolean;
  isDisabled?: boolean;
  isSaving?: boolean;

  // Status - simple (just estado) or complex (estado + estadoPago)
  estado?: EstadoPago | EstadoOP;
  estadoPago?: EstadoPGM; // If provided, uses complex status logic

  // Field visibility configuration
  showProveedorSelector?: boolean;
  showFormaPago?: boolean;
  showPais?: boolean;
  showObservaciones?: boolean;
  showAttachments?: boolean;
  showCharacterCount?: boolean;

  // Program dropdown options (if not provided, uses text input)
  programOptions?: ProgramOption[];

  // Option overrides
  facturaOptions?: ProgramOption[];
  empresaOptions?: ProgramOption[];
  acuerdoPagoOptions?: ProgramOption[];
  formaPagoOptions?: ProgramOption[];
  paisOptions?: ProgramOption[];

  // Character limits
  maxObservacionesLength?: number;

  // Label overrides
  observacionesLabel?: string;

  // Collapse control - can be controlled or uncontrolled
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  defaultCollapsed?: boolean;

  // Show buttons border top separator
  showButtonsBorder?: boolean;
}

export function GastoCard(props: GastoCardProps) {
  const {
    isDark,
    gasto,
    index,
    onUpdate,
    onRemove,
    onSave,
    onCancel,
    errors = {},
    isNew = true,
    isDisabled = false,
    isSaving = false,
    // Status
    estado = 'pendiente-pago',
    estadoPago,
    // Field configuration
    showProveedorSelector = true,
    showFormaPago = false,
    showPais = false,
    showObservaciones = true,
    showAttachments = false,
    showCharacterCount = false,
    // Options
    programOptions,
    facturaOptions = FACTURAS_OPTIONS,
    empresaOptions = EMPRESAS_OPTIONS,
    acuerdoPagoOptions = ACUERDOS_PAGO_OPTIONS,
    formaPagoOptions = FORMAS_PAGO_OPTIONS,
    paisOptions = PAISES_OPTIONS,
    // Limits
    maxObservacionesLength = FIELD_MAX_LENGTHS.observaciones,
    // Labels
    observacionesLabel = 'Observaciones',
    // Collapse control
    isCollapsed: controlledIsCollapsed,
    onToggleCollapse,
    defaultCollapsed,
    // UI options
    showButtonsBorder = false,
  } = props;

  // Internal collapse state for uncontrolled mode
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(
    defaultCollapsed ?? !isNew
  );

  // Use controlled or uncontrolled collapse
  const isCollapsed = controlledIsCollapsed ?? internalIsCollapsed;
  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  const { label: labelClass, textarea: textareaClass } = formStyles(isDark);

  const showButtons = !isDisabled && (onSave || onCancel);

  return (
    <div
      className={cn(
        'rounded-[10px] border px-4 py-[14px]',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#f8f9fc] border-[#e6e7eb]',
        isDisabled && 'opacity-75'
      )}
    >
      {/* Header - Always visible */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={handleToggleCollapse}
      >
        <h3 className={cn('text-lg font-bold', isDark ? 'text-blue-400' : 'text-[#165dfc]')}>
          Gasto #{index + 1}
        </h3>
        {!isNew && <StatusBadge estado={estado} estadoPago={estadoPago} />}
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="mt-5 space-y-5">
          {/* Row 1: Factura emitida a / Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Factura emitida a"
              value={gasto.facturaEmitidaA}
              onChange={(v) => onUpdate('facturaEmitidaA', v)}
              options={facturaOptions}
              required
              disabled={isDisabled}
              error={errors.facturaEmitidaA}
              isDark={isDark}
            />
            <FormSelect
              label="Empresa"
              value={gasto.empresa}
              onChange={(v) => onUpdate('empresa', v)}
              options={empresaOptions}
              required
              disabled={isDisabled}
              error={errors.empresa}
              isDark={isDark}
            />
          </div>

          {/* Row 2: Empresa/Programa / Fecha de comprobante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programOptions ? (
              <FormSelect
                label="Empresa/Programa"
                value={gasto.empresaPrograma}
                onChange={(v) => onUpdate('empresaPrograma', v)}
                options={programOptions}
                required
                disabled={isDisabled}
                error={errors.empresaPrograma}
                isDark={isDark}
              />
            ) : (
              <FormInput
                label="Empresa/Programa"
                value={gasto.empresaPrograma}
                onChange={(v) => onUpdate('empresaPrograma', v)}
                required
                disabled={isDisabled}
                error={errors.empresaPrograma}
                isDark={isDark}
              />
            )}
            <FormDatePicker
              label="Fecha de comprobante"
              value={gasto.fechaComprobante}
              onChange={(v) => onUpdate('fechaComprobante', v)}
              required
              disabled={isDisabled}
              error={errors.fechaComprobante}
              isDark={isDark}
            />
          </div>

          {/* Row 3: Razón Social / Proveedor */}
          {showProveedorSelector && (
            <div className="space-y-2">
              <ProveedorSelector
                value={{
                  proveedor: gasto.proveedor,
                  razonSocial: gasto.razonSocial,
                  proveedorId: null,
                }}
                onChange={(next) => {
                  onUpdate('proveedor', next.proveedor);
                  onUpdate('razonSocial', next.razonSocial);
                }}
                disabled={isDisabled}
                allowCreate={!isDisabled}
              />
              {errors.proveedor && (
                <p className="text-sm text-red-500">{errors.proveedor}</p>
              )}
            </div>
          )}

          {/* Row 4: Forma de pago / Acuerdo de pago (or Neto if no formaPago) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showFormaPago ? (
              <>
                <FormSelect
                  label="Forma de pago"
                  value={gasto.formaPago || ''}
                  onChange={(v) => {
                    onUpdate('formaPago', v);
                    // Clear acuerdoPago if not cheque
                    if (v !== 'cheque') {
                      onUpdate('acuerdoPago', '');
                    }
                  }}
                  options={formaPagoOptions}
                  required
                  disabled={isDisabled}
                  error={errors.formaPago}
                  isDark={isDark}
                />
                <FormSelect
                  label="Acuerdo de pago"
                  value={gasto.formaPago === 'cheque' ? gasto.acuerdoPago : ''}
                  onChange={(v) => onUpdate('acuerdoPago', v)}
                  options={acuerdoPagoOptions}
                  required={gasto.formaPago === 'cheque'}
                  disabled={isDisabled || gasto.formaPago !== 'cheque'}
                  error={errors.acuerdoPago}
                  isDark={isDark}
                />
              </>
            ) : (
              <>
                <FormSelect
                  label="Acuerdo de pago"
                  value={gasto.acuerdoPago}
                  onChange={(v) => onUpdate('acuerdoPago', v)}
                  options={acuerdoPagoOptions}
                  required
                  disabled={isDisabled}
                  error={errors.acuerdoPago}
                  isDark={isDark}
                />
                <FormInput
                  label="Neto"
                  type="text"
                  value={formatNumberWithSeparators(gasto.neto)}
                  onChange={(v) => onUpdate('neto', parseFormattedNumber(v))}
                  required
                  disabled={isDisabled}
                  placeholder="$0"
                  error={errors.neto}
                  isDark={isDark}
                />
              </>
            )}
          </div>

          {/* Row 5: País / Neto (when showFormaPago is true) */}
          {showFormaPago && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showPais ? (
                <FormSelect
                  label="País"
                  value={gasto.pais || ''}
                  onChange={(v) => onUpdate('pais', v)}
                  options={paisOptions}
                  required
                  disabled={isDisabled}
                  error={errors.pais}
                  isDark={isDark}
                />
              ) : (
                <div /> // Empty for grid alignment
              )}
              <FormInput
                label="Neto"
                type="text"
                value={formatNumberWithSeparators(gasto.neto)}
                onChange={(v) => onUpdate('neto', parseFormattedNumber(v))}
                required
                disabled={isDisabled}
                placeholder="$0"
                error={errors.neto}
                isDark={isDark}
              />
            </div>
          )}

          {/* Observaciones / Detalle de gasto */}
          {showObservaciones && (
            <div className="space-y-1">
              <Label className={labelClass}>{observacionesLabel}</Label>
              <Textarea
                value={gasto.observaciones || ''}
                onChange={(e) => {
                  if (e.target.value.length <= maxObservacionesLength) {
                    onUpdate('observaciones', e.target.value);
                  }
                }}
                maxLength={maxObservacionesLength}
                placeholder="Escribe aquí"
                disabled={isDisabled}
                className={textareaClass}
              />
              {showCharacterCount && (
                <div className={cn('text-xs text-right', isDark ? 'text-gray-500' : 'text-gray-400')}>
                  {(gasto.observaciones || '').length}/{maxObservacionesLength}
                </div>
              )}
            </div>
          )}

          {/* Attachments link */}
          {showAttachments && !isDisabled && (
            <div>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-[#0070ff] hover:text-[#0060dd] font-medium"
              >
                <Paperclip className="h-4 w-4" />
                Adjuntar archivos
              </button>
            </div>
          )}

          {/* Card action buttons */}
          {showButtons && (
            <div className={cn(
              'flex justify-end gap-2 pt-2',
              showButtonsBorder && 'border-t border-gray-200 dark:border-gray-700'
            )}>
              {onCancel && (
                <Button
                  type="button"
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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="border-[#0070ff] text-[#0070ff] hover:bg-[#0070ff]/10 text-xs"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
