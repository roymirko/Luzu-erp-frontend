import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { ProveedorSelector } from '@/app/components/ProveedorSelector';
import { cn } from '@/app/components/ui/utils';
import { StatusBadge } from './StatusBadge';
import {
  FACTURAS_OPTIONS,
  EMPRESAS_OPTIONS,
  ACUERDOS_PAGO_OPTIONS,
  FIELD_MAX_LENGTHS,
} from '@/app/utils/implementacionConstants';
import type { BloqueImporte, EstadoOP, EstadoPGM } from './index';
import type { ProgramaConPresupuesto } from './CargaImportesSection';

// Format number with thousand separators (Argentine format: 1.234.567)
function formatNumberWithSeparators(value: string): string {
  // Remove any non-digit characters except decimal separator
  const cleanValue = value.replace(/[^\d]/g, '');
  if (!cleanValue) return '';

  // Add thousand separators
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse formatted string back to raw number string
function parseFormattedNumber(value: string): string {
  // Remove thousand separators (dots)
  return value.replace(/\./g, '');
}

export interface GastoImporteErrors {
  facturaEmitidaA?: string;
  empresa?: string;
  empresaPgm?: string;
  fechaComprobante?: string;
  proveedor?: string;
  condicionPago?: string;
  neto?: string;
  conceptoGasto?: string;
}

interface GastoImporteCardProps {
  isDark: boolean;
  isCerrado: boolean;
  importe: BloqueImporte;
  index: number;
  programasConPresupuesto: ProgramaConPresupuesto[];
  canRemove: boolean;
  onUpdate: (field: keyof BloqueImporte, value: string) => void;
  onRemove: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  errors?: GastoImporteErrors;
  // Concepto de gasto is still a shared/global field
  conceptoGasto: string;
  setConceptoGasto: (v: string) => void;
  showConceptoGasto?: boolean;
  conceptoGastoError?: string;
  // Status props
  isNew?: boolean;
  estadoOP?: EstadoOP;
  estadoPGM?: EstadoPGM;
}

export function GastoImporteCard(props: GastoImporteCardProps) {
  const {
    isDark,
    isCerrado,
    importe,
    index,
    programasConPresupuesto,
    canRemove,
    onUpdate,
    onRemove,
    onSave,
    onCancel,
    errors = {},
    conceptoGasto,
    setConceptoGasto,
    showConceptoGasto = true,
    conceptoGastoError,
    // Status props with defaults
    isNew = true,
    estadoOP = 'pendiente',
    estadoPGM = 'pendiente-pago',
  } = props;

  // Card is collapsed by default when it's a saved gasto (not new)
  const [isCollapsed, setIsCollapsed] = useState(!isNew);

  // Program options already come with value/label format (label includes budget info)
  const programOptions = programasConPresupuesto;

  const labelClass = cn(
    'flex items-center gap-1 text-sm font-semibold',
    isDark ? 'text-gray-400' : 'text-[#374151]'
  );

  const textareaClass = cn(
    'min-h-[72px] resize-none transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    'disabled:opacity-60 disabled:cursor-not-allowed'
  );

  // Fields are only readonly when the gasto is closed/anulado
  const isReadOnly = isCerrado;

  // Handle header click for collapse toggle (only for saved gastos)
  const handleHeaderClick = () => {
    if (!isNew) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={cn(
        'rounded-[10px] border p-6',
        isCollapsed ? 'space-y-0' : 'space-y-5',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#f8f9fc] border-[#e6e7eb]',
        isDark ? '' : 'opacity-100'
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
          {!isNew && (
            <StatusBadge estado={estadoOP} estadoPago={estadoPGM} />
          )}
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
          {canRemove && !isCerrado && isNew && (
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
          {/* Row 1: Factura emitida a / Empresa - always shown, uses per-gasto values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Factura emitida a"
              value={importe.facturaEmitidaA}
              onChange={(v) => onUpdate('facturaEmitidaA', v)}
              options={FACTURAS_OPTIONS}
              required
              disabled={isCerrado || isReadOnly}
              error={errors.facturaEmitidaA}
              isDark={isDark}
            />
            <FormSelect
              label="Empresa"
              value={importe.empresa}
              onChange={(v) => onUpdate('empresa', v)}
              options={EMPRESAS_OPTIONS}
              required
              disabled={isCerrado || isReadOnly}
              error={errors.empresa}
              isDark={isDark}
            />
          </div>

          {/* Row 2: Empresa/Programa / Fecha de comprobante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Empresa/Programa"
              value={importe.empresaPgm}
              onChange={(v) => onUpdate('empresaPgm', v)}
              options={programOptions}
              required
              disabled={isCerrado || isReadOnly}
              error={errors.empresaPgm}
              isDark={isDark}
            />
            <FormInput
              label="Fecha de comprobante"
              type="date"
              value={importe.fechaComprobante}
              onChange={(v) => onUpdate('fechaComprobante', v)}
              required
              disabled={isCerrado || isReadOnly}
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
              disabled={isCerrado || isReadOnly}
              allowCreate={!isCerrado && !isReadOnly}
            />
            {errors.proveedor && (
              <p className="text-sm text-red-500">{errors.proveedor}</p>
            )}
          </div>

          {/* Row 4: Acuerdo de pago / Neto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Acuerdo de pago"
              value={importe.condicionPago}
              onChange={(v) => onUpdate('condicionPago', v)}
              options={ACUERDOS_PAGO_OPTIONS}
              required
              disabled={isCerrado || isReadOnly}
              error={errors.condicionPago}
              isDark={isDark}
            />
            <FormInput
              label="Neto"
              type="text"
              value={formatNumberWithSeparators(importe.neto)}
              onChange={(v) => onUpdate('neto', parseFormattedNumber(v))}
              required
              disabled={isCerrado || isReadOnly}
              placeholder="$0"
              error={errors.neto}
              isDark={isDark}
            />
          </div>

          {/* Concepto de Gasto - only shown on first card */}
          {showConceptoGasto && (
            <div className="space-y-2">
              <Label className={labelClass}>
                Agrega un concepto de gasto <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={conceptoGasto}
                onChange={(e) => setConceptoGasto(e.target.value)}
                maxLength={FIELD_MAX_LENGTHS.conceptoGasto}
                disabled={isCerrado || isReadOnly}
                placeholder="Escribe aquí"
                className={cn(textareaClass, conceptoGastoError && 'border-red-500')}
              />
              {conceptoGastoError && (
                <p className="text-sm text-red-500">{conceptoGastoError}</p>
              )}
            </div>
          )}

          {/* Agregar adjuntos link */}
          {!isCerrado && isNew && (
            <div>
              <button className="text-sm text-[#0070ff] hover:text-[#0060dd] font-medium underline">
                Agregar adjuntos
              </button>
            </div>
          )}

          {/* Card action buttons - for new gastos (Save/Cancel) */}
          {isNew && !isCerrado && (onSave || onCancel) && (
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
