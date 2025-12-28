import { createContext, useContext, useState, ReactNode } from 'react';

export interface FieldOption {
  id: string;
  value: string;
  active: boolean;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'date';
  category: string;
  required: boolean;
  options: FieldOption[];
  active: boolean;
}

interface FormFieldsContextType {
  fieldsConfig: FormFieldConfig[];
  updateFieldsConfig: (fields: FormFieldConfig[]) => void;
  getFieldsByCategory: (category: string) => FormFieldConfig[];
}

const FormFieldsContext = createContext<FormFieldsContextType | undefined>(undefined);

const initialFieldsConfig: FormFieldConfig[] = [
  // Comercial
  { 
    id: 'field-1', 
    label: 'Unidad de Negocio', 
    type: 'select', 
    category: 'Comercial', 
    required: true, 
    options: [
      { id: 'opt-1', value: 'Media', active: true },
      { id: 'opt-2', value: 'Experience', active: true },
      { id: 'opt-3', value: 'Productora', active: true },
      { id: 'opt-4', value: 'E-commerce', active: true },
      { id: 'opt-5', value: 'Estructura', active: true },
    ],
    active: true 
  },
  { 
    id: 'field-2', 
    label: 'Categoría de Negocio', 
    type: 'select', 
    category: 'Comercial', 
    required: true, 
    options: [
      { id: 'opt-6', value: 'Media', active: true },
      { id: 'opt-7', value: 'PEM', active: true },
      { id: 'opt-8', value: 'PEP', active: true },
      { id: 'opt-9', value: 'BC', active: true },
    ],
    active: true 
  },
  { 
    id: 'field-3', 
    label: 'Proyecto', 
    type: 'select', 
    category: 'Comercial', 
    required: true, 
    options: [
      { id: 'opt-10', value: 'Proyecto 1', active: true },
      { id: 'opt-11', value: 'Proyecto 2', active: true },
      { id: 'opt-12', value: 'Proyecto 3', active: true },
    ],
    active: true 
  },
  { 
    id: 'field-4', 
    label: 'Razón Social', 
    type: 'text', 
    category: 'Comercial', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-5', 
    label: 'Categoría', 
    type: 'select', 
    category: 'Comercial', 
    required: true, 
    options: [
      { id: 'opt-13', value: 'Bebidas', active: true },
      { id: 'opt-14', value: 'Belleza e Higiene', active: true },
      { id: 'opt-15', value: 'Tecnología', active: true },
      { id: 'opt-16', value: 'Automotriz', active: true },
      { id: 'opt-17', value: 'Alimentación', active: true },
      { id: 'opt-18', value: 'Indumentaria', active: true },
      { id: 'opt-19', value: 'Entretenimiento', active: true },
      { id: 'opt-20', value: 'Servicios Financieros', active: true },
      { id: 'opt-21', value: 'Telecomunicaciones', active: true },
      { id: 'opt-22', value: 'Salud y Bienestar', active: true },
    ],
    active: true 
  },
  { 
    id: 'field-6', 
    label: 'Empresa/Agencia', 
    type: 'text', 
    category: 'Comercial', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-7', 
    label: 'Marca', 
    type: 'text', 
    category: 'Comercial', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-8', 
    label: 'Acuerdo de Pago', 
    type: 'select', 
    category: 'Comercial', 
    required: true, 
    options: [
      { id: 'opt-23', value: '5 días', active: true },
      { id: 'opt-24', value: '30 días', active: true },
      { id: 'opt-25', value: '45 días', active: true },
      { id: 'opt-26', value: '60 días', active: true },
      { id: 'opt-27', value: '90 días', active: true },
    ],
    active: true 
  },

  // Implementación
  { 
    id: 'field-9', 
    label: 'Nombre del Proyecto', 
    type: 'text', 
    category: 'Implementación', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-10', 
    label: 'Estado del Proyecto', 
    type: 'select', 
    category: 'Implementación', 
    required: true, 
    options: [
      { id: 'opt-28', value: 'Planificación', active: true },
      { id: 'opt-29', value: 'En Desarrollo', active: true },
      { id: 'opt-30', value: 'Testing', active: true },
      { id: 'opt-31', value: 'Completado', active: true },
    ],
    active: true 
  },
  { 
    id: 'field-11', 
    label: 'Responsable Técnico', 
    type: 'text', 
    category: 'Implementación', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-12', 
    label: 'Fecha de Entrega', 
    type: 'date', 
    category: 'Implementación', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-13', 
    label: 'Observaciones Técnicas', 
    type: 'textarea', 
    category: 'Implementación', 
    required: false, 
    options: [],
    active: true 
  },

  // Dirección de Programación
  { 
    id: 'field-14', 
    label: 'Título del Contenido', 
    type: 'text', 
    category: 'Dirección de Programación', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-15', 
    label: 'Tipo de Contenido', 
    type: 'select', 
    category: 'Dirección de Programación', 
    required: true, 
    options: [
      { id: 'opt-32', value: 'Episodio', active: true },
      { id: 'opt-33', value: 'Especial', active: true },
      { id: 'opt-34', value: 'Clip', active: true },
      { id: 'opt-35', value: 'Livestream', active: true },
    ],
    active: true 
  },
  { 
    id: 'field-16', 
    label: 'Duración (minutos)', 
    type: 'number', 
    category: 'Dirección de Programación', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-17', 
    label: 'Fecha de Publicación', 
    type: 'date', 
    category: 'Dirección de Programación', 
    required: true, 
    options: [],
    active: true 
  },
  { 
    id: 'field-18', 
    label: 'Sinopsis', 
    type: 'textarea', 
    category: 'Dirección de Programación', 
    required: false, 
    options: [],
    active: true 
  },
  { 
    id: 'field-19', 
    label: 'Categoría de Contenido', 
    type: 'select', 
    category: 'Dirección de Programación', 
    required: true, 
    options: [
      { id: 'opt-36', value: 'Entretenimiento', active: true },
      { id: 'opt-37', value: 'Gaming', active: true },
      { id: 'opt-38', value: 'Música', active: true },
      { id: 'opt-39', value: 'Deportes', active: true },
    ],
    active: true 
  },
];

export function FormFieldsProvider({ children }: { children: ReactNode }) {
  const [fieldsConfig, setFieldsConfig] = useState<FormFieldConfig[]>(() => {
    // Forzar inicialización con los campos actualizados
    return initialFieldsConfig;
  });

  const updateFieldsConfig = (fields: FormFieldConfig[]) => {
    setFieldsConfig(fields);
  };

  const getFieldsByCategory = (category: string) => {
    return fieldsConfig.filter(field => field.category === category && field.active);
  };

  return (
    <FormFieldsContext.Provider value={{ fieldsConfig, updateFieldsConfig, getFieldsByCategory }}>
      {children}
    </FormFieldsContext.Provider>
  );
}

export function useFormFields() {
  const context = useContext(FormFieldsContext);
  if (context === undefined) {
    throw new Error('useFormFields must be used within a FormFieldsProvider');
  }
  return context;
}