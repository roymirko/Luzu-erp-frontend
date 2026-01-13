import { Button } from '@/app/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import { ProgramaCard, ImporteRow } from './ProgramaCard';
import { formatPesos } from '@/app/utils/formatters';
import type { Dispatch, SetStateAction } from 'react';

interface ProgramasListProps {
  isDark: boolean;
  importeRows: ImporteRow[];
  setImporteRows: Dispatch<SetStateAction<ImporteRow[]>>;
  totalVenta: string;
  programasDisponibles: string[];
  excedeLimite: boolean;
  totalProgramas: number;
  presupuestoEstimado: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function ProgramasList({
  isDark,
  importeRows,
  setImporteRows,
  totalVenta,
  programasDisponibles,
  excedeLimite,
  totalProgramas,
  presupuestoEstimado,
  onAdd,
  onRemove,
}: ProgramasListProps) {
  return (
    <div className="space-y-4">
      {importeRows.map((row, index) => (
        <ProgramaCard
          key={row.id}
          row={row}
          index={index}
          isDark={isDark}
          totalVenta={totalVenta}
          programasDisponibles={programasDisponibles}
          siblingRows={importeRows}
          setImporteRows={setImporteRows}
          onRemove={onRemove}
        />
      ))}

      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-[#0070ff] hover:bg-[#0060dd] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Programa
        </Button>
      </div>

      {excedeLimite && (
        <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${isDark
          ? 'bg-red-950/50 border-red-800 text-red-200'
          : 'bg-red-50 border-red-300 text-red-800'
          }`}>
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold mb-1">
              El total de programas supera el presupuesto estimado
            </p>
            <p className="text-sm opacity-90">
              Total de programas: <span className="font-bold">{formatPesos(totalProgramas.toString())}</span>
              {' | '}
              Presupuesto: <span className="font-bold">{formatPesos(presupuestoEstimado.toString())}</span>
              {' | '}
              Excedente: <span className="font-bold">{formatPesos((totalProgramas - presupuestoEstimado).toString())}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
