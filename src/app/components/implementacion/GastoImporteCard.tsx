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
import { ApprovalControls } from './ApprovalControls';
import {
  FACTURAS_OPTIONS,
  EMPRESAS_OPTIONS,
  ACUERDOS_PAGO_OPTIONS,
  FIELD_MAX_LENGTHS,
} from '@/app/utils/implementacionConstants';
import type { BloqueImporte, EstadoOP, EstadoPGM } from './index';

export interface GastoImporteErrors {
  facturaEmitidaA?: string;
  empresa?: string;
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
  onSave?: () => void;
  onCancel?: () => void;
  errors?: GastoImporteErrors;
  // Global fields (shown in each card but controlled at parent level)
  facturaEmitidaA: string;
  setFacturaEmitidaA: (v: string) => void;
  empresa: string;
  setEmpresa: (v: string) => void;
  conceptoGasto: string;
  setConceptoGasto: (v: string) => void;
  showGlobalFields?: boolean;
  globalFieldsErrors?: {
    facturaEmitidaA?: string;
    empresa?: string;
    conceptoGasto?: string;
  };
  // New props for approval workflow
  isNew?: boolean;
  gastoId?: string;
  estadoOP?: EstadoOP;
  estadoPGM?: EstadoPGM;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkPaid?: () => void;
  approvalLoading?: boolean;
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
    onSave,
    onCancel,
    errors = {},
    facturaEmitidaA,
    setFacturaEmitidaA,
    empresa,
    setEmpresa,
    conceptoGasto,
    setConceptoGasto,
    showGlobalFields = true,
    globalFieldsErrors = {},
    // New props with defaults
    isNew = true,
    gastoId,
    estadoOP = 'pendiente',
    estadoPGM = 'pendiente-pago',
    onApprove,
    onReject,
    onMarkPaid,
    approvalLoading = false,
  } = props;

  // Card is collapsed by default when it's a saved gasto (not new)
  const [isCollapsed, setIsCollapsed] = useState(!isNew);

  const programOptions = programasDisponibles.map((p) => ({ value: p, label: p }));

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

  // Determine if fields should be readonly (saved gasto, not in edit mode)
  const isReadOnly = !isNew && !isCerrado;

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
          {/* Row 1: Factura emitida a / Empresa */}
          {showGlobalFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Factura emitida a"
                value={facturaEmitidaA}
                onChange={setFacturaEmitidaA}
                options={FACTURAS_OPTIONS}
                required
                disabled={isCerrado || isReadOnly}
                error={globalFieldsErrors.facturaEmitidaA}
                isDark={isDark}
              />
              <FormSelect
                label="Empresa"
                value={empresa}
                onChange={setEmpresa}
                options={EMPRESAS_OPTIONS}
                required
                disabled={isCerrado || isReadOnly}
                error={globalFieldsErrors.empresa}
                isDark={isDark}
              />
            </div>
          )}

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
              type="number"
              value={importe.neto}
              onChange={(v) => onUpdate('neto', v)}
              required
              disabled={isCerrado || isReadOnly}
              placeholder="$0"
              error={errors.neto}
              isDark={isDark}
            />
          </div>

          {/* Concepto de Gasto */}
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
              className={cn(textareaClass, globalFieldsErrors.conceptoGasto && 'border-red-500')}
            />
            {globalFieldsErrors.conceptoGasto && (
              <p className="text-sm text-red-500">{globalFieldsErrors.conceptoGasto}</p>
            )}
          </div>

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

          {/* Approval controls - for saved gastos */}
          {!isNew && onApprove && onReject && onMarkPaid && (
            <ApprovalControls
              estado={estadoOP}
              estadoPago={estadoPGM}
              onApprove={onApprove}
              onReject={onReject}
              onMarkPaid={onMarkPaid}
              loading={approvalLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
