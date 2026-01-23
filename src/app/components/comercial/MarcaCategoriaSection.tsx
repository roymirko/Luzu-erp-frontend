import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Search } from 'lucide-react';
import React from 'react';

interface MarcaCategoriaSectionProps {
  isDark: boolean;
  categoria: string;
  setCategoria: (v: string) => void;
  categoriasMarca: string[];
  marca: string;
  setMarca: (v: string) => void;
  nombreCampana: string;
  setNombreCampana: (v: string) => void;
  maxCharsCampana: number;
}

export function MarcaCategoriaSection(props: MarcaCategoriaSectionProps) {
  const {
    isDark,
    categoria,
    setCategoria,
    categoriasMarca,
    marca,
    setMarca,
    nombreCampana,
    setNombreCampana,
    maxCharsCampana,
  } = props;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
            Categoría
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
            >
              <option value="">Seleccionar</option>
              {categoriasMarca.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
            Marca
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Buscar marca"
              list="marcas"
              className={`pl-10 ${isDark
                ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                }`}
            />
            <datalist id="marcas">
              <option value="Lysoform" />
              <option value="Dove" />
              <option value="Coca-Cola" />
            </datalist>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
          Nombre de Campaña
        </Label>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            value={nombreCampana}
            onChange={(e) => {
              if (e.target.value.length <= maxCharsCampana) {
                setNombreCampana(e.target.value);
              }
            }}
            placeholder="Buscar campaña"
            list="campanas"
            className={`pl-10 ${isDark
              ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
              }`}
          />
          <datalist id="campanas">
          </datalist>
        </div>
        <p className={`text-xs text-right ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          {nombreCampana.length}/{maxCharsCampana}
        </p>
      </div>
    </div>
  );
}
