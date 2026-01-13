import { ChevronDown } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import React from 'react';

interface AcuerdoPagoSelectProps {
  isDark: boolean;
  acuerdosPago: string[];
  value: string;
  onChange: (next: string) => void;
}

export function AcuerdoPagoSelect({ isDark, acuerdosPago, value, onChange }: AcuerdoPagoSelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
          Acuerdo de Pago
        </Label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
              ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
              : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
              } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
          >
            <option value="">Seleccionar</option>
            {acuerdosPago.map((acuerdo) => (
              <option key={acuerdo} value={acuerdo}>{acuerdo}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>
    </div>
  );
}
