import { cn } from '@/app/components/ui/utils';

// Simple estado for programacion/experience gastos
export type EstadoPago = 'pendiente' | 'pendiente-pago' | 'pagado' | 'pago' | 'anulado';

// Complex estado for implementacion
export type EstadoOP = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPGM = 'pendiente' | 'pendiente-pago' | 'pagado' | 'anulado';

// Formulario estado (for tables)
export type EstadoFormulario = 'pendiente' | 'pendiente-carga' | 'activo' | 'abierto' | 'cerrado' | 'anulado';

interface StatusBadgeProps {
  estado: EstadoPago | EstadoOP | EstadoFormulario;
  estadoPago?: EstadoPGM;
  /** Use 'formulario' variant for table displays matching Figma design */
  variant?: 'default' | 'formulario';
  className?: string;
}

interface StatusConfig {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
}

// Figma-based formulario status config (Estados de Formulario)
const FORMULARIO_STATUS_CONFIG: Record<string, StatusConfig> = {
  'pendiente': {
    bg: 'bg-[#E5E7EB]',
    border: 'border-[#E5E7EB]',
    text: 'text-[#6B7280]',
    dot: 'bg-[#6B7280]',
    label: 'Pendiente de carga',
  },
  'pendiente-carga': {
    bg: 'bg-[#E5E7EB]',
    border: 'border-[#E5E7EB]',
    text: 'text-[#6B7280]',
    dot: 'bg-[#6B7280]',
    label: 'Pendiente de carga',
  },
  'activo': {
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#22C55E]',
    text: 'text-[#15803D]',
    dot: 'bg-[#22C55E]',
    label: 'Activo',
  },
  'abierto': {
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#22C55E]',
    text: 'text-[#15803D]',
    dot: 'bg-[#22C55E]',
    label: 'Activo',
  },
  'cerrado': {
    bg: 'bg-[#E5E7EB]',
    border: 'border-[#9CA3AF]',
    text: 'text-[#6B7280]',
    dot: 'bg-[#6B7280]',
    label: 'Cerrado',
  },
  'anulado': {
    bg: 'bg-[#FEE2E2]',
    border: 'border-[#EF4444]',
    text: 'text-[#DC2626]',
    dot: 'bg-[#EF4444]',
    label: 'Anulado',
  },
};

// Original status config for gasto-level badges
const SIMPLE_STATUS_CONFIG: Record<string, StatusConfig> = {
  'pendiente': {
    bg: 'bg-[#fffae8]',
    border: 'border-[#8f6e00]',
    text: 'text-[#8f6e00]',
    dot: 'bg-[#8f6e00]',
    label: 'Pendiente de pago',
  },
  'pendiente-pago': {
    bg: 'bg-[#fffae8]',
    border: 'border-[#8f6e00]',
    text: 'text-[#8f6e00]',
    dot: 'bg-[#8f6e00]',
    label: 'Pendiente de pago',
  },
  'pagado': {
    bg: 'bg-[#ecffe9]',
    border: 'border-[#118f00]',
    text: 'text-[#118f00]',
    dot: 'bg-[#118f00]',
    label: 'Pago',
  },
  'pago': {
    bg: 'bg-[#ecffe9]',
    border: 'border-[#118f00]',
    text: 'text-[#118f00]',
    dot: 'bg-[#118f00]',
    label: 'Pago',
  },
  'anulado': {
    bg: 'bg-[#ffebef]',
    border: 'border-[#ea173e]',
    text: 'text-[#ea173e]',
    dot: 'bg-[#ea173e]',
    label: 'Anulado',
  },
};

function getComplexStatusConfig(estado: EstadoOP, estadoPago?: EstadoPGM): StatusConfig {
  if (estado === 'anulado') {
    return {
      bg: 'bg-[#ffebef]',
      border: 'border-[#ea173e]',
      text: 'text-[#ea173e]',
      dot: 'bg-[#ea173e]',
      label: 'Anulado',
    };
  }

  if (estado === 'pendiente') {
    return {
      bg: 'bg-[#fffae8]',
      border: 'border-[#8f6e00]',
      text: 'text-[#8f6e00]',
      dot: 'bg-[#8f6e00]',
      label: 'Pendiente de aprobacion',
    };
  }

  if (estado === 'activo') {
    if (estadoPago === 'pagado') {
      return {
        bg: 'bg-[#ecffe9]',
        border: 'border-[#118f00]',
        text: 'text-[#118f00]',
        dot: 'bg-[#118f00]',
        label: 'Pago',
      };
    }
    if (estadoPago === 'anulado') {
      return {
        bg: 'bg-[#ffebef]',
        border: 'border-[#ea173e]',
        text: 'text-[#ea173e]',
        dot: 'bg-[#ea173e]',
        label: 'Anulado',
      };
    }
    // pendiente, pendiente-pago
    return {
      bg: 'bg-[#fffae8]',
      border: 'border-[#8f6e00]',
      text: 'text-[#8f6e00]',
      dot: 'bg-[#8f6e00]',
      label: 'Pendiente de pago',
    };
  }

  if (estado === 'cerrado') {
    return {
      bg: 'bg-gray-100',
      border: 'border-gray-500',
      text: 'text-gray-600',
      dot: 'bg-gray-600',
      label: 'Cerrado',
    };
  }

  return {
    bg: 'bg-gray-100',
    border: 'border-gray-500',
    text: 'text-gray-600',
    dot: 'bg-gray-600',
    label: String(estado),
  };
}

export function StatusBadge({ estado, estadoPago, variant = 'default', className }: StatusBadgeProps) {
  let config: StatusConfig;

  if (variant === 'formulario') {
    // Use Figma-based formulario design
    config = FORMULARIO_STATUS_CONFIG[estado] || FORMULARIO_STATUS_CONFIG['pendiente'];
  } else if (estadoPago !== undefined) {
    // Complex logic for implementacion
    config = getComplexStatusConfig(estado as EstadoOP, estadoPago);
  } else {
    // Simple lookup for programacion/experience gastos
    config = SIMPLE_STATUS_CONFIG[estado] || SIMPLE_STATUS_CONFIG['pendiente-pago'];
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap',
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}

/**
 * Standalone formulario status badge matching Figma design exactly
 * Use this in tables for formulario estado display
 */
export function FormularioStatusBadge({
  estado,
  className
}: {
  estado: EstadoFormulario;
  className?: string;
}) {
  const config = FORMULARIO_STATUS_CONFIG[estado] || FORMULARIO_STATUS_CONFIG['pendiente'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap',
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}
