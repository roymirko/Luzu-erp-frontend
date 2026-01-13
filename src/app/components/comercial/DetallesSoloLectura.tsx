import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import React from 'react';

interface DetallesSoloLecturaProps {
  isDark: boolean;
  isEditMode: boolean;
  responsable?: string;
  fecha?: string;
}

export function DetallesSoloLectura({ isDark, isEditMode, responsable = '', fecha = '' }: DetallesSoloLecturaProps) {
  if (!isEditMode) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
      <div className="space-y-2">
        <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
          Responsable
        </Label>
        <Input
          value={responsable}
          disabled
          className={isDark
            ? 'bg-[#0a0a0a] border-gray-800 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
          }
        />
      </div>
      <div className="space-y-2">
        <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
          Fecha de Creación
        </Label>
        <Input
          value={fecha}
          disabled
          className={isDark
            ? 'bg-[#0a0a0a] border-gray-800 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
          }
        />
      </div>
    </div>
  );
}
