import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { cn } from '@/app/components/ui/utils';
import {
  UNIDADES_NEGOCIO_PRODUCTORA_OPTIONS,
  CATEGORIAS_NEGOCIO_PRODUCTORA_OPTIONS,
  RUBROS_PRODUCTORA_OPTIONS,
  SUBRUBROS_PRODUCTORA_OPTIONS,
} from '@/app/utils/implementacionConstants';

export interface ProductoraCargaDatosSectionErrors {
  unidadNegocio?: string;
  categoriaNegocio?: string;
  rubro?: string;
  subRubro?: string;
  nombreCampana?: string;
}

interface ProductoraCargaDatosSectionProps {
  isDark: boolean;
  unidadNegocio: string;
  setUnidadNegocio: (v: string) => void;
  categoriaNegocio: string;
  setCategoriaNegocio: (v: string) => void;
  rubro: string;
  setRubro: (v: string) => void;
  subRubro: string;
  setSubRubro: (v: string) => void;
  nombreCampana: string;
  setNombreCampana: (v: string) => void;
  errors?: ProductoraCargaDatosSectionErrors;
  disabled?: boolean;
}

export function ProductoraCargaDatosSection(props: ProductoraCargaDatosSectionProps) {
  const {
    isDark,
    unidadNegocio,
    setUnidadNegocio,
    categoriaNegocio,
    setCategoriaNegocio,
    rubro,
    setRubro,
    subRubro,
    setSubRubro,
    nombreCampana,
    setNombreCampana,
    errors = {},
    disabled = false,
  } = props;

  return (
    <div className="space-y-6">
      <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
        Cargar Datos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Unidad de Negocio"
          value={unidadNegocio}
          onChange={setUnidadNegocio}
          options={UNIDADES_NEGOCIO_PRODUCTORA_OPTIONS}
          required
          error={errors.unidadNegocio}
          isDark={isDark}
          disabled={disabled}
        />

        <FormSelect
          label="Categoría de Negocio"
          value={categoriaNegocio}
          onChange={setCategoriaNegocio}
          options={CATEGORIAS_NEGOCIO_PRODUCTORA_OPTIONS}
          error={errors.categoriaNegocio}
          isDark={isDark}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Rubro"
          value={rubro}
          onChange={setRubro}
          options={RUBROS_PRODUCTORA_OPTIONS}
          required
          error={errors.rubro}
          isDark={isDark}
          disabled={disabled}
        />

        <FormSelect
          label="Subrubro"
          value={subRubro}
          onChange={setSubRubro}
          options={SUBRUBROS_PRODUCTORA_OPTIONS}
          error={errors.subRubro}
          isDark={isDark}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormInput
          label="Evento"
          value={nombreCampana}
          onChange={setNombreCampana}
          required
          placeholder="Buscar evento..."
          error={errors.nombreCampana}
          isDark={isDark}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
