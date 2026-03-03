import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { cn } from '@/app/components/ui/utils';
import {
  SUBRUBROS_MARKETING_OPTIONS,
} from '@/app/utils/implementacionConstants';

export interface MarketingCargaDatosSectionErrors {
  subrubro?: string;
  nombreCampana?: string;
}

interface MarketingCargaDatosSectionProps {
  isDark: boolean;
  subrubro: string;
  setSubrubro: (v: string) => void;
  nombreCampana: string;
  setNombreCampana: (v: string) => void;
  errors?: MarketingCargaDatosSectionErrors;
}

export function MarketingCargaDatosSection(props: MarketingCargaDatosSectionProps) {
  const {
    isDark,
    subrubro,
    setSubrubro,
    nombreCampana,
    setNombreCampana,
    errors = {},
  } = props;

  return (
    <div className="space-y-6">
      <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
        Cargar Datos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Unidad de Negocio"
          value="Media"
          required
          disabled
          isDark={isDark}
        />

        <FormInput
          label="Categoría de negocio"
          value="Proyectos especiales Marketing"
          required
          disabled
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput
          label="Rubro del gasto"
          value="Gastos de Marketing"
          disabled
          isDark={isDark}
        />

        <FormSelect
          label="Subrubro"
          value={subrubro}
          onChange={setSubrubro}
          options={SUBRUBROS_MARKETING_OPTIONS}
          required
          error={errors.subrubro}
          isDark={isDark}
        />

        <FormInput
          label="Evento"
          value={nombreCampana}
          onChange={setNombreCampana}
          required
          placeholder="Buscar evento..."
          error={errors.nombreCampana}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
