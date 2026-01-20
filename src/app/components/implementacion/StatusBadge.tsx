import { cn } from '@/app/components/ui/utils';
import type { EstadoOP, EstadoPGM } from '@/app/contexts/ImplementacionContext';

interface StatusBadgeProps {
  estado: EstadoOP;
  estadoPago: EstadoPGM;
  className?: string;
}

interface StatusConfig {
  color: string;
  bgColor: string;
  text: string;
}

function getStatusConfig(estado: EstadoOP, estadoPago: EstadoPGM): StatusConfig {
  if (estado === 'anulado') {
    return {
      color: '#ef4444',
      bgColor: 'bg-red-500/10',
      text: 'Rechazado',
    };
  }

  if (estado === 'pendiente') {
    return {
      color: '#F7C317',
      bgColor: 'bg-yellow-500/10',
      text: 'Pendiente de aprobación',
    };
  }

  if (estado === 'activo') {
    if (estadoPago === 'pagado') {
      return {
        color: '#10b981',
        bgColor: 'bg-green-500/10',
        text: 'Pagado',
      };
    }
    return {
      color: '#0070ff',
      bgColor: 'bg-blue-500/10',
      text: 'Pendiente de pago',
    };
  }

  if (estado === 'cerrado') {
    return {
      color: '#6b7280',
      bgColor: 'bg-gray-500/10',
      text: 'Cerrado',
    };
  }

  return {
    color: '#6b7280',
    bgColor: 'bg-gray-500/10',
    text: estado,
  };
}

export function StatusBadge({ estado, estadoPago, className }: StatusBadgeProps) {
  const config = getStatusConfig(estado, estadoPago);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgColor,
        className
      )}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <span style={{ color: config.color }}>{config.text}</span>
    </div>
  );
}
