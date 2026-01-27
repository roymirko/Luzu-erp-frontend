import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { cn } from '@/app/components/ui/utils';
import {
  RUBROS_GASTO_EXPERIENCE_OPTIONS,
  SUBRUBROS_EXPERIENCE_OPTIONS,
  FIELD_MAX_LENGTHS,
} from '@/app/utils/implementacionConstants';

export interface ExperienceCargaDatosSectionErrors {
  subrubro?: string;
  nombreCampana?: string;
  detalleCampana?: string;
}

interface ExperienceCargaDatosSectionProps {
  isDark: boolean;
  rubroGasto: string;
  setRubroGasto: (v: string) => void;
  subrubro: string;
  setSubrubro: (v: string) => void;
  nombreCampana: string;
  setNombreCampana: (v: string) => void;
  detalleCampana: string;
  setDetalleCampana: (v: string) => void;
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
    detalleCampana,
    setDetalleCampana,
    errors = {},
  } = props;

  const labelClass = cn(
    'flex items-center gap-1',
    isDark ? 'text-gray-400' : 'text-gray-700'
  );

  const textareaClass = cn(
    'min-h-[100px] resize-none transition-colors',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]',
    errors.detalleCampana && 'border-red-500 focus:border-red-500'
  );

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

      <div className="space-y-2">
        <Label className={labelClass}>
          Detalle/campaña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Textarea
            value={detalleCampana}
            onChange={(e) => setDetalleCampana(e.target.value)}
            maxLength={FIELD_MAX_LENGTHS.conceptoGasto}
            placeholder="Descripción del gasto..."
            aria-invalid={!!errors.detalleCampana}
            className={textareaClass}
          />
          <span className="absolute bottom-2 right-2 text-xs text-gray-400">
            {detalleCampana.length}/{FIELD_MAX_LENGTHS.conceptoGasto}
          </span>
        </div>
        {errors.detalleCampana && (
          <p className="text-sm text-red-500">{errors.detalleCampana}</p>
        )}
      </div>
    </div>
  );
}
