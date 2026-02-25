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

export const PROGRAMAS_LUZU: string[] = [
  'FM Luzu',
  'Antes Que Nadie',
  'Nadie Dice Nada',
  'Patria y Familia',
  'Se Fue Larga',
  'La Novela',
  'Algo Va A Picar',
  'Los No Talentos',
  'Algo de Música',
  'Xtream Master',
  'Edición Especial',
];

export const PROGRAMAS_LUZU_OPTIONS: FormSelectOption[] = PROGRAMAS_LUZU.map(
  (p) => ({ value: p, label: p })
);

export const IMPLEMENTACION_DEFAULTS = {
  sector: 'Implementación',
  rubro: 'Gasto de venta',
  subRubro: 'Producción',
  moneda: 'ARS',
  ivaDefault: 21,
} as const;

export const SUBRUBROS_TECNICA_OPTIONS: FormSelectOption[] = [
  { value: 'Implementacion', label: 'Implementación' },
  { value: 'Produccion', label: 'Producción' },
  { value: 'Diseno y Edicion', label: 'Diseño y Edición' },
  { value: 'Mejora Inmueble/Equipamiento', label: 'Mejora Inmueble/Equipamiento' },
];

export const TECNICA_DEFAULTS = {
  sector: 'Tecnica',
  rubro: 'Gasto de venta',
  subRubro: 'Tecnica',
  moneda: 'ARS',
  ivaDefault: 21,
} as const;

// ============================================
// Productora Module Constants
// ============================================

export const UNIDADES_NEGOCIO_PRODUCTORA_OPTIONS: FormSelectOption[] = [
  { value: 'Media', label: 'Media' },
  { value: 'Experience', label: 'Experience' },
  { value: 'Productora', label: 'Productora' },
  { value: 'Productora E-Commerce', label: 'Productora E-Commerce' },
  { value: 'Estructura', label: 'Estructura' },
];

export const CATEGORIAS_NEGOCIO_PRODUCTORA_OPTIONS: FormSelectOption[] = [
  { value: 'Media', label: 'Media' },
  { value: 'PEM - Proyectos especiales Marketing', label: 'PEM - Proyectos especiales Marketing' },
  { value: 'PEP - Proyectos Especiales Programación', label: 'PEP - Proyectos Especiales Programación' },
  { value: 'BC - Branded content', label: 'BC - Branded content' },
  { value: 'No aplica', label: 'No aplica' },
];

export const RUBROS_PRODUCTORA_OPTIONS: FormSelectOption[] = [
  { value: 'Gasto de Venta', label: 'Gasto de Venta' },
  { value: 'Gasto de Evento', label: 'Gasto de Evento' },
];

export const SUBRUBROS_PRODUCTORA_OPTIONS: FormSelectOption[] = [
  { value: 'Implementación', label: 'Implementación' },
  { value: 'Técnica', label: 'Técnica' },
  { value: 'Diseño y Edición', label: 'Diseño y Edición' },
];

export const PROGRAMAS_PRODUCTORA_OPTIONS: FormSelectOption[] = PROGRAMAS_EXPERIENCE_OPTIONS;

// ============================================
// Talentos Module Constants
// ============================================

export const TALENTOS_DEFAULTS = {
  sector: 'Talentos',
  rubro: 'Gasto de venta',
  subRubro: 'Talentos',
  moneda: 'ARS',
  ivaDefault: 21,
} as const;

export const FIELD_MAX_LENGTHS = {
  conceptoGasto: 250,
  observaciones: 500,
} as const;
