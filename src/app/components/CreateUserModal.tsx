import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { CreateUserForm } from '../types/business';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { UserPlus, X, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateUserModal({ open, onOpenChange, onSuccess }: CreateUserModalProps) {
  const { isDark } = useTheme();
  const { createUser, areas, roles } = useData();

  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    firstName: '',
    lastName: '',
    position: '',
    areas: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = await createUser(formData);

    if (result.success) {
      toast.success('Usuario creado exitosamente', {
        description: `${formData.firstName} ${formData.lastName} ha sido creado. Se enviará un email de invitación a ${formData.email}`,
      });
      
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        position: '',
        areas: [],
      });
      
      onOpenChange(false);
      onSuccess?.();
    } else {
      // Mostrar errores
      const errorMap: Record<string, string> = {};
      result.errors?.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      
      toast.error('Error al crear usuario', {
        description: 'Por favor revisa los campos marcados en rojo.',
      });
    }

    setIsSubmitting(false);
  };

  const handleAddAreaRole = () => {
    const activeAreas = areas.filter(a => a.active);
    if (activeAreas.length === 0) {
      toast.error('No hay áreas disponibles');
      return;
    }

    setFormData({
      ...formData,
      areas: [
        ...formData.areas,
        {
          areaId: '',
          roleId: '',
        },
      ],
    });
  };

  const handleRemoveAreaRole = (index: number) => {
    setFormData({
      ...formData,
      areas: formData.areas.filter((_, i) => i !== index),
    });
  };

  const handleAreaRoleChange = (index: number, field: 'areaId' | 'roleId', value: string) => {
    const newAreas = [...formData.areas];
    newAreas[index] = {
      ...newAreas[index],
      [field]: value,
    };
    setFormData({ ...formData, areas: newAreas });
  };

  const activeAreas = areas.filter(a => a.active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl max-h-[90vh] ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <UserPlus className="h-5 w-5 text-[#fb2c36]" />
            Nuevo Usuario
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Crea un nuevo usuario con email @luzutv.com. Se enviará una invitación para autenticarse con Google.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 py-4 pr-4">
              {/* Información Personal */}
              <div>
                <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Información Personal
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Juan"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Apellido */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Apellido <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Pérez"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan.perez@luzutv.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Cargo */}
                  <div className="space-y-2">
                    <Label htmlFor="position" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Cargo
                    </Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Ej: Desarrollador, Editor, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Asignación de Áreas y Roles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Áreas y Roles <span className="text-red-500">*</span>
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Asigna al menos un rol en un área
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddAreaRole}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Área
                  </Button>
                </div>

                {formData.areas.length === 0 ? (
                  <div className={`border border-dashed rounded-lg p-6 text-center ${
                    isDark ? 'border-gray-700 bg-[#141414]' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                      No hay áreas asignadas. Haz clic en "Agregar Área" para comenzar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.areas.map((assignment, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          isDark ? 'border-gray-700 bg-[#141414]' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            {/* Área */}
                            <div className="space-y-2">
                              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Área
                              </Label>
                              <Select
                                value={assignment.areaId}
                                onValueChange={(value) => handleAreaRoleChange(index, 'areaId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar área" />
                                </SelectTrigger>
                                <SelectContent>
                                  {activeAreas.map((area) => (
                                    <SelectItem key={area.id} value={area.id}>
                                      {area.name} ({area.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Rol */}
                            <div className="space-y-2">
                              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Rol
                              </Label>
                              <Select
                                value={assignment.roleId}
                                onValueChange={(value) => handleAreaRoleChange(index, 'roleId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Botón eliminar */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAreaRole(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.areas && (
                  <p className="text-sm text-red-500 mt-2">{errors.areas}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#fb2c36] hover:bg-[#e02531] text-white"
              >
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}