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

export const FORMAS_PAGO_OPTIONS: FormSelectOption[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export const PAISES_OPTIONS: FormSelectOption[] = [
  { value: 'argentina', label: 'Argentina' },
  { value: 'uruguay', label: 'Uruguay' },
  { value: 'chile', label: 'Chile' },
  { value: 'brasil', label: 'Brasil' },
];

export const RUBROS_GASTO_EXPERIENCE_OPTIONS: FormSelectOption[] = [
  { value: 'gastos-evento', label: 'Gastos de Evento' },
];

export const SUBRUBROS_EXPERIENCE_OPTIONS: FormSelectOption[] = [
  { value: 'produccion', label: 'Producción' },
  { value: 'diseno', label: 'Diseño' },
  { value: 'edicion', label: 'Edición' },
  { value: 'tecnica', label: 'Técnica' },
];

export const ACUERDOS_PAGO_EXPERIENCE_OPTIONS: FormSelectOption[] = [
  { value: '5', label: '5 días' },
  { value: '30', label: '30 días' },
  { value: '45', label: '45 días' },
  { value: '60', label: '60 días' },
  { value: '90', label: '90 días' },
];

export const FORMAS_PAGO_EXPERIENCE_OPTIONS: FormSelectOption[] = [
  { value: 'cheque', label: 'Cheque' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
];

export const PROGRAMAS_EXPERIENCE_OPTIONS: FormSelectOption[] = [
  { value: 'fm-luzu', label: 'FM Luzu' },
  { value: 'antes-que-nadie', label: 'Antes Que Nadie' },
  { value: 'nadie-dice-nada', label: 'Nadie Dice Nada' },
  { value: 'vuelta-y-media', label: 'Vuelta y Media' },
  { value: 'seria-increible', label: 'Seria Increíble' },
  { value: 'patria-y-familia', label: 'Patria y Familia' },
  { value: 'podremos-hablar', label: 'Podremos Hablar' },
  { value: 'optimo', label: 'Óptimo' },
  { value: 'carajo', label: 'Carajo' },
  { value: 'grande-pa', label: 'Grande Pa' },
  { value: 'tenemos-que-hablar', label: 'Tenemos que Hablar' },
  { value: 'rumbo-por-la-noche', label: 'Rumbo por la Noche' },
  { value: 'buenos-dias-buenos-aires', label: 'Buenos Días Buenos Aires' },
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
