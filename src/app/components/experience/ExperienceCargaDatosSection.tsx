import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { cn } from '@/app/components/ui/utils';
import {
  RUBROS_GASTO_EXPERIENCE_OPTIONS,
  SUBRUBROS_EXPERIENCE_OPTIONS,
} from '@/app/utils/implementacionConstants';

export interface ExperienceCargaDatosSectionErrors {
  subrubro?: string;
  nombreCampana?: string;
}

interface ExperienceCargaDatosSectionProps {
  isDark: boolean;
  rubroGasto: string;
  setRubroGasto: (v: string) => void;
  subrubro: string;
  setSubrubro: (v: string) => void;
  nombreCampana: string;
  setNombreCampana: (v: string) => void;
  errors?: ExperienceCargaDatosSectionErrors;
}

export function ExperienceCargaDatosSection(props: ExperienceCargaDatosSectionProps) {
  const {
    isDark,
    rubroGasto,
    setRubroGasto,
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
          value="Experience"
          required
          disabled
          isDark={isDark}
        />

        <FormSelect
          label="Rubro del gasto"
          value={rubroGasto}
          onChange={setRubroGasto}
          options={RUBROS_GASTO_EXPERIENCE_OPTIONS}
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Subrubro"
          value={subrubro}
          onChange={setSubrubro}
          options={SUBRUBROS_EXPERIENCE_OPTIONS}
          required
          error={errors.subrubro}
          isDark={isDark}
        />

        <FormInput
          label="Nombre de Campaña"
          value={nombreCampana}
          onChange={setNombreCampana}
          required
          placeholder="Buscar campaña..."
          error={errors.nombreCampana}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
