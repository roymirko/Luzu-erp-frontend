import { Lock } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface FormHeaderProps {
  isDark: boolean;
  title: string;
  subtitle?: string;
  isCerrado: boolean;
  /** Estado label for the warning text (e.g. "cerrado", "anulado"). Defaults to "cerrado". */
  estadoLabel?: string;
  /** Badge variant: "gray" (default) or "colored" (yellow/red based on estadoLabel) */
  badgeVariant?: 'gray' | 'colored';
  /** Warning variant: "red" (default) or "yellow" */
  warningVariant?: 'red' | 'yellow';
}

export function FormHeader({
  isDark,
  title,
  subtitle,
  isCerrado,
  estadoLabel = 'cerrado',
  badgeVariant = 'gray',
  warningVariant = 'red',
}: FormHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-[#101828]')}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-[#4a5565]')}>
              {subtitle}
            </p>
          )}
        </div>
        {isCerrado && (
          badgeVariant === 'colored' ? (
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded',
                estadoLabel === 'anulado'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700',
              )}
            >
              {estadoLabel === 'anulado' ? 'Anulado' : 'Cerrado'}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">
              Gasto Cerrado
            </span>
          )
        )}
      </div>
      {isCerrado && (
        warningVariant === 'yellow' ? (
          <div
            className={cn(
              'mt-4 flex items-center gap-3 p-4 rounded-lg border',
              isDark
                ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800',
            )}
          >
            <Lock className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Este gasto está {estadoLabel} y no puede ser editado.</p>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-700 dark:text-red-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Este gasto está {estadoLabel} y no puede ser editado.</span>
          </div>
        )
      )}
    </div>
  );
}
