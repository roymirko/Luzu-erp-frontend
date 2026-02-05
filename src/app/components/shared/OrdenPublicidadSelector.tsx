import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { useTheme } from '@/app/contexts/ThemeContext';
import * as ordenesService from '@/app/services/ordenesPublicidadService';
import type { OrdenPublicidad } from '@/app/types/comercial';

interface OrdenPublicidadSelectorProps {
  value?: string;
  onChange: (op: OrdenPublicidad | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function OrdenPublicidadSelector({
  value,
  onChange,
  disabled,
  placeholder = 'Seleccionar OP...',
}: OrdenPublicidadSelectorProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenPublicidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdenes = async () => {
      setLoading(true);
      const { data } = await ordenesService.getAll();
      setOrdenes(data);
      setLoading(false);
    };
    fetchOrdenes();
  }, []);

  const selectedOrden = ordenes.find((op) => op.id === value);

  const handleSelect = (opId: string) => {
    const op = ordenes.find((o) => o.id === opId);
    onChange(op || null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const formatOpLabel = (op: OrdenPublicidad) => {
    return `${op.ordenPublicidad} - ${op.nombreCampana || op.razonSocial}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            isDark
              ? 'bg-[#141414] border-gray-800 text-white hover:bg-[#1a1a1a]'
              : 'bg-white border-[#d1d5db] text-gray-900 hover:bg-gray-50',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {selectedOrden ? (
            <span className="truncate">{formatOpLabel(selectedOrden)}</span>
          ) : (
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              {placeholder}
            </span>
          )}
          <div className="flex items-center gap-1 ml-2">
            {selectedOrden && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[400px] p-0',
          isDark && 'bg-[#1e1e1e] border-gray-800'
        )}
        align="start"
      >
        <Command className={isDark ? 'bg-[#1e1e1e]' : ''}>
          <CommandInput
            placeholder="Buscar por OP, campaña, cliente..."
            className={isDark ? 'text-white' : ''}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Cargando...' : 'No se encontraron órdenes.'}
            </CommandEmpty>
            <CommandGroup>
              {ordenes.map((op) => (
                <CommandItem
                  key={op.id}
                  value={`${op.ordenPublicidad} ${op.nombreCampana} ${op.razonSocial} ${op.marca}`}
                  onSelect={() => handleSelect(op.id)}
                  className={cn(
                    'cursor-pointer',
                    isDark && 'text-white hover:bg-gray-800'
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === op.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{op.ordenPublicidad}</span>
                      <span className="text-xs text-gray-500">
                        {op.mesServicio}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {op.nombreCampana} - {op.razonSocial}
                    </div>
                    <div className="text-xs text-gray-400">
                      {op.marca} | {op.unidadNegocio}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
