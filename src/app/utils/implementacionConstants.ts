import type { FormSelectOption } from '@/app/components/ui/form-select';

export const FACTURAS_OPTIONS: FormSelectOption[] = [
  { value: 'Luzu TV', label: 'Luzu TV' },
  { value: 'Luzu TV SA', label: 'Luzu TV SA' },
];

export const EMPRESAS_OPTIONS: FormSelectOption[] = [
  { value: 'Luzu TV', label: 'Luzu TV' },
  { value: 'Luzu TV SA', label: 'Luzu TV SA' },
];

export const UNIDADES_NEGOCIO_OPTIONS: FormSelectOption[] = [
  { value: 'Media', label: 'Media' },
  { value: 'Experience', label: 'Experience' },
  { value: 'Productora', label: 'Productora' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Estructura', label: 'Estructura' },
];

export const CATEGORIAS_NEGOCIO_OPTIONS: FormSelectOption[] = [
  { value: 'Media', label: 'Media' },
  { value: 'PEM - Proyectos especiales Marketing', label: 'PEM - Proyectos especiales Marketing' },
  { value: 'PEP - Proyectos Especiales Programación', label: 'PEP - Proyectos Especiales Programación' },
  { value: 'BC - Branded content', label: 'BC - Branded content' },
];

export const ACUERDOS_PAGO_OPTIONS: FormSelectOption[] = [
  { value: '30', label: '30 días' },
  { value: '45', label: '45 días' },
  { value: '60', label: '60 días' },
];

export const IMPLEMENTACION_DEFAULTS = {
  sector: 'Implementación',
  rubroGasto: 'Gasto de venta',
  subRubro: 'Producción',
  moneda: 'ARS',
  ivaDefault: 21,
} as const;

export const FIELD_MAX_LENGTHS = {
  conceptoGasto: 250,
  observaciones: 500,
} as const;
