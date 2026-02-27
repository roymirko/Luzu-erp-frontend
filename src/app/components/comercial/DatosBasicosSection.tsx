import { ChevronDown } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import React, { useEffect } from 'react';

interface MesOption { value: string; label: string }

interface DatosBasicosSectionProps {
  isDark: boolean;
  isEditMode: boolean;
  ordenPublicidad: string;
  setOrdenPublicidad: (v: string) => void;
  totalVenta: string;
  setTotalVenta: (v: string) => void;
  mesServicioMes: string;
  setMesServicioMes: (v: string) => void;
  mesServicioAnio: string;
  setMesServicioAnio: (v: string) => void;
  aniosDisponibles: number[];
  meses: MesOption[];
  mesesDisponibles: MesOption[];
  formatPesosInput: (v: string) => string;
  getNumericValue: (v: string) => string;
  ordenPublicidadError?: boolean;
  onOrdenBlur?: () => void;
  monthBeforeAvailable?: boolean;
}

export function DatosBasicosSection(props: DatosBasicosSectionProps) {
  const {
    isDark,
    isEditMode,
    ordenPublicidad,
    setOrdenPublicidad,
    totalVenta,
    setTotalVenta,
    mesServicioMes,
    setMesServicioMes,
    mesServicioAnio,
    setMesServicioAnio,
    aniosDisponibles,
    mesesDisponibles,
    formatPesosInput,
    getNumericValue,
    ordenPublicidadError = false,
    onOrdenBlur,
    monthBeforeAvailable = true,
  } = props;

  // Calcular mes anterior del mes actual
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const previousMonthValue = previousMonth.toString().padStart(2, '0');

  // Determinar si una opción de mes debe estar deshabilitada
  const isMonthDisabled = (mes: MesOption): boolean => {
    // Si estamos en modo edición, nunca deshabilitar
    if (isEditMode) {
      return false;
    }

    // Si el mes anterior está disponible, no deshabilitar nada
    if (monthBeforeAvailable) {
      return false;
    }

    // Si el mes anterior NO está disponible, deshabilitar solo el mes anterior del año actual
    const selectedYear = mesServicioAnio || currentYear.toString();
    if (mes.value === previousMonthValue && selectedYear === currentYear.toString()) {
      return true;
    }

    return false;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
            Orden de Publicidad
            <span className="text-red-500">*</span>
          </Label>
          <Input
            value={ordenPublicidad}
            onChange={(e) => setOrdenPublicidad(e.target.value)}
            onBlur={onOrdenBlur}
            placeholder="Ej: 202509-0133 VER001"
            disabled={isEditMode}
            className={isDark
              ? `bg-[#141414] text-white placeholder:text-gray-600 focus:border-[#fb2c36] disabled:opacity-60 disabled:cursor-not-allowed border ${ordenPublicidadError ? 'border-red-500' : 'border-gray-800'}`
              : `bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36] disabled:opacity-60 disabled:cursor-not-allowed border ${ordenPublicidadError ? 'border-red-500' : 'border-gray-300'}`
            }
          />
          {ordenPublicidadError && (
            <p className="text-red-500 text-sm">La Orden de Publicidad ya existe en el sistema</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
            Total de Venta
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={totalVenta ? formatPesosInput(totalVenta) : ''}
            onChange={(e) => {
              const value = getNumericValue(e.target.value);
              setTotalVenta(value);
            }}
            placeholder="$ 0"
            className={isDark
              ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
            }
          />
        </div>

        <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
            Mes de Servicio
            <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={mesServicioAnio}
                onChange={(e) => setMesServicioAnio(e.target.value)}
                className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                  ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                  } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
              >
                <option value="">Año</option>
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio.toString()}>{anio}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <div className="relative flex-1">
              <select
                value={mesServicioMes}
                onChange={(e) => setMesServicioMes(e.target.value)}
                className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                  ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                  } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
              >
                <option value="">Mes</option>
                {mesesDisponibles.map((mes) => (
                  <option 
                    key={mes.value} 
                    value={mes.value}
                    disabled={isMonthDisabled(mes)}
                  >
                    {mes.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>
  );
}
