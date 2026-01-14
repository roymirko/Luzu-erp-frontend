import { FormSelect } from '@/app/components/ui/form-select';
import { FormInput } from '@/app/components/ui/form-input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { cn } from '@/app/components/ui/utils';
import {
  FACTURAS_OPTIONS,
  EMPRESAS_OPTIONS,
  UNIDADES_NEGOCIO_OPTIONS,
  CATEGORIAS_NEGOCIO_OPTIONS,
  FIELD_MAX_LENGTHS,
} from '@/app/utils/implementacionConstants';

export interface CargaDatosSectionErrors {
  facturaEmitidaA?: string;
  empresa?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  conceptoGasto?: string;
}

interface CargaDatosSectionProps {
  isDark: boolean;
  isCerrado: boolean;
  facturaEmitidaA: string;
  setFacturaEmitidaA: (v: string) => void;
  empresa: string;
  setEmpresa: (v: string) => void;
  unidadNegocio: string;
  setUnidadNegocio: (v: string) => void;
  categoriaNegocio: string;
  setCategoriaNegocio: (v: string) => void;
  sector: string;
  rubroGasto: string;
  subRubro: string;
  nombreCampana: string;
  conceptoGasto: string;
  setConceptoGasto: (v: string) => void;
  errors?: CargaDatosSectionErrors;
  fromOrdenPublicidad?: boolean;
}

export function CargaDatosSection(props: CargaDatosSectionProps) {
  const {
    isDark,
    isCerrado,
    facturaEmitidaA,
    setFacturaEmitidaA,
    empresa,
    setEmpresa,
    unidadNegocio,
    setUnidadNegocio,
    categoriaNegocio,
    setCategoriaNegocio,
    sector,
    rubroGasto,
    subRubro,
    nombreCampana,
    conceptoGasto,
    setConceptoGasto,
    errors = {},
    fromOrdenPublicidad = false,
  } = props;

  const isUnidadNegocioReadOnly = fromOrdenPublicidad && !!unidadNegocio;
  const isCategoriaNegocioReadOnly = fromOrdenPublicidad && !!categoriaNegocio;
  const isCategoriaNegocioDisabled = isCerrado || isCategoriaNegocioReadOnly || unidadNegocio !== 'Media';

  const inputClass = cn(
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400',
    'disabled:opacity-60 disabled:cursor-not-allowed'
  );

  const labelClass = cn(
    'flex items-center gap-1',
    isDark ? 'text-gray-400' : 'text-gray-700'
  );

  const textareaClass = cn(
    'min-h-[100px] resize-none transition-colors',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    errors.conceptoGasto && 'border-red-500 focus:border-red-500'
  );

  return (
    <div className="space-y-6">
      <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
        Carga de datos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Factura emitida a"
          value={facturaEmitidaA}
          onChange={setFacturaEmitidaA}
          options={FACTURAS_OPTIONS}
          required
          disabled={isCerrado}
          error={errors.facturaEmitidaA}
          isDark={isDark}
        />

        <FormSelect
          label="Empresa"
          value={empresa}
          onChange={setEmpresa}
          options={EMPRESAS_OPTIONS}
          required
          disabled={isCerrado}
          error={errors.empresa}
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isUnidadNegocioReadOnly ? (
          <FormInput
            label="Unidad de negocio"
            value={unidadNegocio}
            required
            disabled
            isDark={isDark}
          />
        ) : (
          <FormSelect
            label="Unidad de negocio"
            value={unidadNegocio}
            onChange={setUnidadNegocio}
            options={UNIDADES_NEGOCIO_OPTIONS}
            required
            disabled={isCerrado}
            error={errors.unidadNegocio}
            isDark={isDark}
          />
        )}

        {isCategoriaNegocioReadOnly ? (
          <FormInput
            label="Categoría de negocio"
            value={categoriaNegocio}
            disabled
            isDark={isDark}
          />
        ) : (
          <FormSelect
            label="Categoría de negocio"
            value={categoriaNegocio}
            onChange={setCategoriaNegocio}
            options={CATEGORIAS_NEGOCIO_OPTIONS}
            disabled={isCategoriaNegocioDisabled}
            error={errors.categoriaNegocio}
            isDark={isDark}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Sector"
          value={sector}
          disabled
          isDark={isDark}
        />
        <FormInput
          label="Rubro de gasto"
          value={rubroGasto}
          disabled
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Sub rubro"
          value={subRubro}
          disabled
          isDark={isDark}
        />
        <FormInput
          label="Nombre de la campaña"
          value={nombreCampana}
          required
          disabled
          isDark={isDark}
        />
      </div>

      <div className="space-y-2">
        <Label className={labelClass}>
          Detalle/campaña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Textarea
            value={conceptoGasto}
            onChange={(e) => setConceptoGasto(e.target.value)}
            maxLength={FIELD_MAX_LENGTHS.conceptoGasto}
            disabled={isCerrado}
            placeholder="Mural + Corpóreos"
            aria-invalid={!!errors.conceptoGasto}
            className={textareaClass}
          />
          <span className="absolute bottom-2 right-2 text-xs text-gray-400">
            {conceptoGasto.length}/{FIELD_MAX_LENGTHS.conceptoGasto}
          </span>
        </div>
        {errors.conceptoGasto && (
          <p className="text-sm text-red-500">{errors.conceptoGasto}</p>
        )}
      </div>
    </div>
  );
}
