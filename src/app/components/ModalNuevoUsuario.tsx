import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { CreateUserForm } from '../types/business';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Save, UserPlus, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ModalNuevoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModalNuevoUsuario({ isOpen, onClose, onSuccess }: ModalNuevoUsuarioProps) {
  const { isDark } = useTheme();
  const { createUser, areas, roles } = useData();
  
  const [form, setForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    position: '',
    areas: [{ areaId: '', roleId: '' }]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateUserForm, value: string) => {
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

  const handleAddAreaRole = () => {
    const activeAreas = areas.filter(a => a.active);
    if (activeAreas.length === 0) {
      toast.error('No hay áreas disponibles', {
        description: 'Primero crea al menos un área activa.'
      });
      return;
    }
    
    setForm(prev => ({
      ...prev,
      areas: [...prev.areas, { areaId: activeAreas[0].id, roleId: roles[0].id }]
    }));
  };

  const handleRemoveAreaRole = (index: number) => {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAreaRole = (index: number, field: 'areaId' | 'roleId', value: string) => {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await createUser(form);
      
      if (result.success) {
        toast.success('Usuario creado exitosamente', {
          description: `El usuario "${form.email}" ha sido creado correctamente.`
        });
        onSuccess?.();
        onClose();
        // Resetear formulario
        setForm({
          email: '',
          firstName: '',
          lastName: '',
          position: '',
          areas: [{ areaId: '', roleId: '' }]
        });
      } else {
        // Mostrar errores de validación
        const errorMap: Record<string, string> = {};
        result.errors?.forEach(err => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
        toast.error('Error al crear usuario', {
          description: 'Por favor revisa los campos marcados en rojo.'
        });
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al crear el usuario.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAreas = areas.filter(a => a.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
          isDark ? 'bg-[#1e1e1e] border border-gray-800' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="bg-[#fb2c36]/20 p-2.5 rounded-lg">
              <UserPlus className="h-5 w-5 text-[#fb2c36]" />
            </div>
            <div>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Nuevo Usuario
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Crear un nuevo usuario del sistema con sus áreas y roles
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos Personales */}
          <div>
            <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Ej: Juan"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <div className="flex items-center gap-1.5 text-red-500 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Ej: Pérez"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <div className="flex items-center gap-1.5 text-red-500 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="usuario@luzutv.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <div className="flex items-center gap-1.5 text-red-500 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Cargo */}
              <div className="space-y-2">
                <Label htmlFor="position" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Cargo (Opcional)
                </Label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Ej: Desarrollador Senior"
                />
              </div>
            </div>
          </div>

          {/* Asignación de Áreas y Roles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Áreas y Roles <span className="text-red-500">*</span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  Asigna al menos un rol en un área
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddAreaRole}
                disabled={activeAreas.length === 0}
                className="bg-[#fb2c36] text-white hover:bg-[#e02731]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Área
              </Button>
            </div>

            {errors.areas && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs mb-3">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.areas}</span>
              </div>
            )}

            <div className="space-y-3">
              {form.areas.length === 0 ? (
                <div className={`text-center py-8 border rounded-lg ${
                  isDark ? 'border-gray-800 bg-[#0a0a0a]' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    No hay áreas asignadas. Haz clic en "Agregar Área" para comenzar.
                  </p>
                </div>
              ) : (
                form.areas.map((assignment, index) => {
                  const selectedArea = areas.find(a => a.id === assignment.areaId);
                  const selectedRole = roles.find(r => r.id === assignment.roleId);
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-4 border rounded-lg ${
                        isDark ? 'border-gray-800 bg-[#0a0a0a]' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        {/* Select Área */}
                        <div>
                          <Label className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Área
                          </Label>
                          <select
                            value={assignment.areaId}
                            onChange={(e) => handleUpdateAreaRole(index, 'areaId', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDark 
                                ? 'bg-[#1e1e1e] border-gray-800 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {activeAreas.map(area => (
                              <option key={area.id} value={area.id}>
                                {area.name} ({area.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Select Rol */}
                        <div>
                          <Label className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Rol
                          </Label>
                          <select
                            value={assignment.roleId}
                            onChange={(e) => handleUpdateAreaRole(index, 'roleId', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDark 
                                ? 'bg-[#1e1e1e] border-gray-800 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Botón Eliminar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAreaRole(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
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
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}