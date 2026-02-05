import { ChevronDown } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import React from 'react';

// Categorías disponibles según unidad de negocio
const CATEGORIAS_POR_UNIDAD: Record<string, string[]> = {
  'Media': ['Media', 'PEM', 'PEP', 'BC'],
  // Experience, Productora, E-commerce, Estructura → bloqueado
};

interface ConfiguracionSectionProps {
  isDark: boolean;
  unidadNegocio: string;
  setUnidadNegocio: (v: string) => void;
  unidadesNegocioOptions: string[];
  categoriaNegocio: string;
  setCategoriaNegocio: (v: string) => void;
  proyecto: string;
  setProyecto: (v: string) => void;
  isProyectoDisabled: () => boolean;
  ProveedorSelector: React.ComponentType<any>;
  proveedorValue: { proveedor: string; razonSocial: string; proveedorId: string | null };
  onProveedorChange: (next: { proveedor: string; razonSocial: string; proveedorId: string | null }) => void;
}

export function ConfiguracionSection(props: ConfiguracionSectionProps) {
  const {
    isDark,
    unidadNegocio,
    setUnidadNegocio,
    unidadesNegocioOptions,
    categoriaNegocio,
    setCategoriaNegocio,
    proyecto,
    setProyecto,
    isProyectoDisabled,
    ProveedorSelector,
    proveedorValue,
    onProveedorChange,
  } = props;

  // Categoría de negocio solo habilitada para Media
  const isCategoriaDisabled = !unidadNegocio || unidadNegocio !== 'Media';
  const categoriasDisponibles = CATEGORIAS_POR_UNIDAD[unidadNegocio] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
          Unidad de Negocio
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <select
            value={unidadNegocio}
            onChange={(e) => {
              setUnidadNegocio(e.target.value);
              // Limpiar categoría si cambia a una unidad sin categorías
              if (e.target.value !== 'Media') {
                setCategoriaNegocio('');
              }
            }}
            className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
              ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
              : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
              } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
          >
            <option value="">Seleccionar</option>
            {unidadesNegocioOptions.map((unidad) => (
              <option key={unidad} value={unidad}>{unidad}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
          Categoría de Negocio
          {!isCategoriaDisabled && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
          <select
            value={categoriaNegocio}
            onChange={(e) => setCategoriaNegocio(e.target.value)}
            disabled={isCategoriaDisabled}
            className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
              ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
              : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
              } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">{isCategoriaDisabled ? 'No aplica' : 'Seleccionar'}</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
          Proyecto
          {!isProyectoDisabled() && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
          <select
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            disabled={isProyectoDisabled()}
            className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
              ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
              : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
              } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Seleccionar</option>
            <option value="proyecto1">Proyecto 1</option>
            <option value="proyecto2">Proyecto 2</option>
            <option value="proyecto3">Proyecto 3</option>
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="md:col-span-2">
        <ProveedorSelector
          value={proveedorValue}
          onChange={onProveedorChange}
        />
      </div>
    </div>
  );
}
