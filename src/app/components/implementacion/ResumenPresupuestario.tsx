import { cn } from '@/app/components/ui/utils';
import { formatCurrency } from '@/app/utils/format';

interface ResumenPresupuestarioProps {
  isDark: boolean;
  asignado: number;
  ejecutado: number;
  disponible: number;
  excedido: boolean;
}

export function ResumenPresupuestario(props: ResumenPresupuestarioProps) {
  const { isDark, asignado, ejecutado, disponible, excedido } = props;

  const calcPercentage = (value: number) => {
    return asignado > 0 ? `${Math.round((value / asignado) * 100)}%` : '0%';
  };

  const cards = [
    {
      label: 'Asignado',
      value: formatCurrency(asignado),
      percentage: '100%',
      percentageColor: 'text-[#00c950]',
    },
    {
      label: 'Ejecutado',
      value: formatCurrency(ejecutado),
      percentage: calcPercentage(ejecutado),
      percentageColor: excedido ? 'text-red-500' : 'text-[#f0b100]',
    },
    {
      label: 'Disponible',
      value: formatCurrency(Math.abs(disponible)),
      percentage: calcPercentage(disponible),
      percentageColor: excedido ? 'text-red-500' : 'text-[#2b7fff]',
    },
  ];

  return (
    <div
      className={cn(
        'p-6 rounded-[14px] border',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-[#e5e7eb]'
      )}
    >
      <h2
        className={cn(
          'text-xl font-medium mb-6',
          isDark ? 'text-white' : 'text-[#101828]'
        )}
      >
        Resumen
      </h2>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2.5 max-w-[508px]">
          {cards.map((card, index) => (
            <div
              key={index}
              className={cn(
                'rounded-[10px] border px-4 py-4 flex flex-col items-center gap-1 min-w-[162px]',
                isDark
                  ? 'bg-[#1e1e1e] border-gray-800'
                  : 'bg-[#f3f5ff] border-[#e5e7eb]'
              )}
            >
              <span
                className={cn(
                  'text-xs font-normal text-center',
                  isDark ? 'text-gray-400' : 'text-[#4a5565]'
                )}
              >
                {card.label}
              </span>
              <span
                className={cn(
                  'text-lg font-bold text-center',
                  isDark ? 'text-white' : 'text-[#101828]'
                )}
              >
                {card.value}
              </span>
              <span className={cn('text-xs font-normal text-center', card.percentageColor)}>
                {card.percentage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
