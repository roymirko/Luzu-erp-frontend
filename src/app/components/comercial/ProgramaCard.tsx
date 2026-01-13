import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, ChevronDown, Search, Trash2 } from 'lucide-react';
import { formatPesos, formatPesosInput, formatPorcentaje, getNumericValue } from '@/app/utils/formatters';
import type { Dispatch, SetStateAction } from 'react';

export interface ImporteRow {
  id: string;
  programa: string;
  monto: string;
  ncPrograma: string;
  ncPorcentaje: string;
  proveedorFee: string;
  feePrograma: string;
  feePorcentaje: string;
  implementacion: string;
  talentos: string;
  tecnica: string;
}

interface ProgramaCardProps {
  row: ImporteRow;
  index: number;
  isDark: boolean;
  totalVenta: string;
  programasDisponibles: string[];
  siblingRows: ImporteRow[];
  setImporteRows: Dispatch<SetStateAction<ImporteRow[]>>;
  onRemove: (id: string) => void;
}

export function ProgramaCard({
  row,
  index,
  isDark,
  totalVenta,
  programasDisponibles,
  siblingRows,
  setImporteRows,
  onRemove,
}: ProgramaCardProps) {
  const validateMonto = (monto: string) => {
    const montoNum = parseFloat(monto.replace(/[^0-9.-]/g, '')) || 0;
    const totalVentaNum = parseFloat(totalVenta.replace(/[^0-9.-]/g, '')) || 0;
    return montoNum <= totalVentaNum;
  };

  const handleNcPorcentajeChange = (rowId: string, porcentaje: string) => {
    setImporteRows(rows => rows.map(r => {
      if (r.id === rowId) {
        const monto = parseFloat(r.monto.replace(/[^0-9.-]/g, '')) || 0;
        const pct = parseFloat(porcentaje) || 0;
        const ncPrograma = (monto * pct / 100).toString();
        return { ...r, ncPorcentaje: porcentaje, ncPrograma };
      }
      return r;
    }));
  };

  const handleNcProgramaChange = (rowId: string, ncPrograma: string) => {
    setImporteRows(rows => rows.map(r => {
      if (r.id === rowId) {
        const monto = parseFloat(r.monto.replace(/[^0-9.-]/g, '')) || 0;
        const nc = parseFloat(ncPrograma.replace(/[^0-9.-]/g, '')) || 0;
        const ncPorcentaje = monto > 0 ? ((nc / monto) * 100).toFixed(2) : '0';
        return { ...r, ncPrograma, ncPorcentaje };
      }
      return r;
    }));
  };

  const handleFeePorcentajeChange = (rowId: string, porcentaje: string) => {
    setImporteRows(rows => rows.map(r => {
      if (r.id === rowId) {
        const monto = parseFloat(r.monto.replace(/[^0-9.-]/g, '')) || 0;
        const pct = parseFloat(porcentaje) || 0;
        const feePrograma = (monto * pct / 100).toString();
        return { ...r, feePorcentaje: porcentaje, feePrograma };
      }
      return r;
    }));
  };

  const handleFeeProgramaChange = (rowId: string, feePrograma: string) => {
    setImporteRows(rows => rows.map(r => {
      if (r.id === rowId) {
        const monto = parseFloat(r.monto.replace(/[^0-9.-]/g, '')) || 0;
        const fee = parseFloat(feePrograma.replace(/[^0-9.-]/g, '')) || 0;
        const feePorcentaje = monto > 0 ? ((fee / monto) * 100).toFixed(2) : '0';
        return { ...r, feePrograma, feePorcentaje };
      }
      return r;
    }));
  };

  const monto = parseFloat(row.monto) || 0;
  const impl = parseFloat(row.implementacion) || 0;
  const tal = parseFloat(row.talentos) || 0;
  const tec = parseFloat(row.tecnica) || 0;
  const suma = impl + tal + tec;
  const isDuplicate = !!row.programa && siblingRows.some(r => r.id !== row.id && r.programa === row.programa);

  return (
    <div className={`border rounded-lg p-4 sm:p-6 ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#E6EBFF] border-[#ABBCFF]'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Programa {index + 1}
          </h4>
          <div className="flex flex-col gap-1">
            {monto > 0 && suma > monto && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  El desglose supera el monto asignado ({formatPesos((suma - monto).toString())})
                </span>
              </div>
            )}

            {isDuplicate && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  Este programa ya fue agregado
                </span>
              </div>
            )}
          </div>
        </div>
        {siblingRows.length > 1 && (
          <Button
            onClick={() => onRemove(row.id)}
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Programa</Label>
            <div className="relative">
              <select
                value={row.programa}
                onChange={(e) => setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, programa: e.target.value } : r))}
                className={`w-full h-9 pl-2 pr-8 rounded-md border text-sm appearance-none ${isDark
                  ? 'bg-[#1e1e1e] border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
              >
                <option value="">Seleccionar</option>
                {programasDisponibles.map((programa) => (
                  <option key={programa} value={programa}>{programa}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Monto</Label>
            <Input
              type="text"
              value={row.monto ? formatPesosInput(row.monto) : ''}
              onChange={(e) => {
                const value = getNumericValue(e.target.value);
                if (validateMonto(value)) {
                  setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, monto: value } : r));
                } else {
                  alert('El monto no puede superar el Total de Venta');
                }
              }}
              placeholder="$ 0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>NC Programa</Label>
            <Input
              type="text"
              value={row.ncPrograma ? formatPesosInput(row.ncPrograma) : ''}
              onChange={(e) => {
                const value = getNumericValue(e.target.value);
                handleNcProgramaChange(row.id, value);
              }}
              placeholder="$ 0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>%</Label>
            <Input
              type="text"
              value={row.ncPorcentaje}
              onChange={(e) => {
                const value = formatPorcentaje(e.target.value);
                handleNcPorcentajeChange(row.id, value);
              }}
              placeholder="0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Proveedor FEE</Label>
            <div className="relative">
              <Search className={`absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                value={row.proveedorFee}
                onChange={(e) => setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, proveedorFee: e.target.value } : r))}
                placeholder="Buscar proveedor"
                list={`proveedores-${row.id}`}
                className={`pl-8 h-9 text-sm ${isDark
                  ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
              />
              <datalist id={`proveedores-${row.id}`}>
                <option value="Proveedor 1" />
                <option value="Proveedor 2" />
                <option value="Proveedor 3" />
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>FEE Programa</Label>
            <Input
              type="text"
              value={row.feePrograma ? formatPesosInput(row.feePrograma) : ''}
              onChange={(e) => {
                const value = getNumericValue(e.target.value);
                handleFeeProgramaChange(row.id, value);
              }}
              placeholder="$ 0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>%</Label>
            <Input
              type="text"
              value={row.feePorcentaje}
              onChange={(e) => {
                const value = formatPorcentaje(e.target.value);
                handleFeePorcentajeChange(row.id, value);
              }}
              placeholder="0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Implementación</Label>
            <Input
              type="text"
              value={row.implementacion ? formatPesosInput(row.implementacion) : ''}
              onChange={(e) => {
                const value = getNumericValue(e.target.value);
                const totalVentaNum = parseFloat(totalVenta) || 0;
                const montoPrograma = parseFloat(row.monto) || 0;

                if (parseFloat(value) > totalVentaNum) {
                  alert('El monto de Implementación no puede superar el Total de Venta');
                  return;
                }
                if (montoPrograma > 0 && parseFloat(value) > montoPrograma) {
                  alert('El monto de Implementación no puede superar el monto asignado al programa');
                  return;
                }

                setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, implementacion: value } : r));
              }}
              placeholder="$ 0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Talentos</Label>
            <Input
              type="text"
              value={row.talentos ? formatPesosInput(row.talentos) : ''}
              onChange={(e) => {
                const value = getNumericValue(e.target.value);
                const totalVentaNum = parseFloat(totalVenta) || 0;
                const montoPrograma = parseFloat(row.monto) || 0;

                if (parseFloat(value) > totalVentaNum) {
                  alert('El monto de Talentos no puede superar el Total de Venta');
                  return;
                }
                if (montoPrograma > 0 && parseFloat(value) > montoPrograma) {
                  alert('El monto de Talentos no puede superar el monto asignado al programa');
                  return;
                }

                setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, talentos: value } : r));
              }}
              placeholder="$ 0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Técnica</Label>
            <Input
              type="text"
              value={row.tecnica ? formatPesosInput(row.tecnica) : ''}
              onChange={(e) => {
                const value = getNumericValue(e.target.value);
                const totalVentaNum = parseFloat(totalVenta) || 0;
                const montoPrograma = parseFloat(row.monto) || 0;

                if (parseFloat(value) > totalVentaNum) {
                  alert('El monto de Técnica no puede superar el Total de Venta');
                  return;
                }
                if (montoPrograma > 0 && parseFloat(value) > montoPrograma) {
                  alert('El monto de Técnica no puede superar el monto asignado al programa');
                  return;
                }

                setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, tecnica: value } : r));
              }}
              placeholder="$ 0"
              className={`h-9 text-sm ${isDark
                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
