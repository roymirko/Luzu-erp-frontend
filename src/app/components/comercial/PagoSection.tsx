import { ChevronDown } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { FormDatePicker } from '@/app/components/ui/form-date-picker';
import React from 'react';

interface PagoSectionProps {
  isDark: boolean;
  formaPago: string;
  setFormaPago: (v: string) => void;
  numeroComprobante: string;
  setNumeroComprobante: (v: string) => void;
  fechaComprobante: string;
  setFechaComprobante: (v: string) => void;
  facturaEmitidaA: string;
  setFacturaEmitidaA: (v: string) => void;
  empresa: string;
  setEmpresa: (v: string) => void;
  formasPagoOptions: { value: string; label: string }[];
  acuerdoPago?: string;
  setAcuerdoPago?: (v: string) => void;
  acuerdoPagoOptions?: string[];
  facturasOptions?: { value: string; label: string }[];
  empresasOptions?: { value: string; label: string }[];
}

export function PagoSection(props: PagoSectionProps) {
  const {
    isDark,
    formaPago,
    setFormaPago,
    numeroComprobante,
    setNumeroComprobante,
    fechaComprobante,
    setFechaComprobante,
    facturaEmitidaA,
    setFacturaEmitidaA,
    empresa,
    setEmpresa,
    formasPagoOptions,
    acuerdoPago = '',
    setAcuerdoPago = () => {},
    acuerdoPagoOptions = [],
    facturasOptions = [
      { value: 'Luzu TV', label: 'Luzu TV' },
      { value: 'Luzu TV SA', label: 'Luzu TV SA' },
    ],
    empresasOptions = [
      { value: 'Luzu TV', label: 'Luzu TV' },
      { value: 'Luzu TV SA', label: 'Luzu TV SA' },
    ],
  } = props;

  const isEfectivo = formaPago === 'Efectivo (Contado)';
  const hasFormaPago = formaPago && formaPago !== '';
  const selectBaseClass = isDark
    ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
    : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
            Forma de Pago
          </Label>
          <div className="relative">
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${selectBaseClass} focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
            >
              <option value="">Seleccionar</option>
              {formasPagoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            Acuerdo de Pago
          </Label>
          <div className="relative">
            <select
              value={acuerdoPago}
              onChange={(e) => setAcuerdoPago(e.target.value)}
              className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${selectBaseClass} focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
            >
              <option value="">Seleccionar</option>
              {acuerdoPagoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      {hasFormaPago && !isEfectivo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Nro. Comprobante
            </Label>
            <Input
              type="text"
              value={numeroComprobante}
              onChange={(e) => setNumeroComprobante(e.target.value)}
              placeholder="Ej: 001-00001234"
              className={isDark
                ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
              }
            />
          </div>

          <div className="space-y-2">
            <FormDatePicker
              label="Fecha de comprobante"
              value={fechaComprobante}
              onChange={setFechaComprobante}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {hasFormaPago && !isEfectivo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Factura emitida a
            </Label>
            <div className="relative">
              <select
                value={facturaEmitidaA}
                onChange={(e) => setFacturaEmitidaA(e.target.value)}
                className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${selectBaseClass} focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
              >
                <option value="">Seleccionar</option>
                {facturasOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Empresa
            </Label>
            <div className="relative">
              <select
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${selectBaseClass} focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
              >
                <option value="">Seleccionar</option>
                {empresasOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
