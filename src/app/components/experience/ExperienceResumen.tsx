import { cn } from '@/app/components/ui/utils';
import { formatCurrency } from '@/app/utils/format';

interface ExperienceResumenProps {
  isDark: boolean;
  total: number;
}

export function ExperienceResumen(props: ExperienceResumenProps) {
  const { isDark, total } = props;

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
        <div
          className={cn(
            'rounded-[10px] border px-8 py-4 flex flex-col items-center gap-1 min-w-[200px]',
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
            Total del gasto
          </span>
          <span
            className={cn(
              'text-2xl font-bold text-center',
              isDark ? 'text-white' : 'text-[#101828]'
            )}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
