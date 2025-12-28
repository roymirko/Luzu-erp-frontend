import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { CreateAreaForm } from '../types/business';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Save, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ModalNuevaAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModalNuevaArea({ isOpen, onClose, onSuccess }: ModalNuevaAreaProps) {
  const { isDark } = useTheme();
  const { createArea, users } = useData();
  
  const [form, setForm] = useState<CreateAreaForm>({
    name: '',
    code: '',
    description: '',
    managerId: undefined,
    color: '#fb2c36',
    icon: undefined
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateAreaForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al editarlo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await createArea(form);
      
      if (result.success) {
        toast.success('Área creada exitosamente', {
          description: `El área "${form.name}" ha sido creada correctamente.`
        });
        onSuccess?.();
        onClose();
        // Resetear formulario
        setForm({
          name: '',
          code: '',
          description: '',
          managerId: undefined,
          color: '#fb2c36',
          icon: undefined
        });
      } else {
        // Mostrar errores de validación
        const errorMap: Record<string, string> = {};
        result.errors?.forEach(err => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
        toast.error('Error al crear área', {
          description: 'Por favor revisa los campos marcados en rojo.'
        });
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al crear el área.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeUsers = users.filter(u => u.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
          isDark ? 'bg-[#1e1e1e] border border-gray-800' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="bg-[#fb2c36]/20 p-2.5 rounded-lg">
              <Building2 className="h-5 w-5 text-[#fb2c36]" />
            </div>
            <div>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Nueva Área
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Crear un nuevo departamento o área de la organización
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Nombre del Área <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Producción, Marketing, Tecnología"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Código <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="Ej: PROD, MKT, TEC (2-10 caracteres)"
              maxLength={10}
              className={errors.code ? 'border-red-500' : ''}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Código único de 2-10 caracteres alfanuméricos en MAYÚSCULAS
            </p>
            {errors.code && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.code}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Descripción <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe las responsabilidades y funciones de esta área..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                isDark 
                  ? 'bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-600' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
              } ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.description}</span>
              </div>
            )}
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label htmlFor="manager" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Responsable del Área (Opcional)
            </Label>
            <select
              id="manager"
              value={form.managerId || ''}
              onChange={(e) => handleChange('managerId', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                isDark 
                  ? 'bg-[#0a0a0a] border-gray-800 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Sin responsable asignado</option>
              {activeUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Color Identificador (Opcional)
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color"
                value={form.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <Input
                value={form.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="#fb2c36"
                className="flex-1"
              />
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Color para identificar visualmente esta área en el sistema
            </p>
          </div>

          {/* Ícono */}
          <div className="space-y-2">
            <Label htmlFor="icon" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Nombre del Ícono (Opcional)
            </Label>
            <Input
              id="icon"
              value={form.icon || ''}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ej: Video, TrendingUp, Code, Building"
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Nombre del ícono de Lucide React (sin "Icon")
            </p>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#fb2c36] text-white hover:bg-[#e02731]"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Área
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
