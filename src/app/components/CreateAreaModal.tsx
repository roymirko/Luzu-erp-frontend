import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { CreateAreaForm } from '../types/business';
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
import { toast } from 'sonner';
import { 
  Building2, 
  Video, 
  TrendingUp, 
  Code, 
  Users,
  Mic,
  Plus,
  X
} from 'lucide-react';

interface CreateAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AREA_COLORS = [
  { value: '#fb2c36', label: 'Rojo Luzu' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Naranja' },
  { value: '#8b5cf6', label: 'Púrpura' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#06b6d4', label: 'Cian' },
];

const AREA_ICONS = [
  { value: 'Video', Icon: Video, label: 'Producción' },
  { value: 'Mic', Icon: Mic, label: 'Contenido' },
  { value: 'TrendingUp', Icon: TrendingUp, label: 'Marketing' },
  { value: 'Code', Icon: Code, label: 'Tecnología' },
  { value: 'Users', Icon: Users, label: 'Equipo' },
  { value: 'Building2', Icon: Building2, label: 'Administración' },
];

// Función para obtener un color aleatorio
const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * AREA_COLORS.length);
  return AREA_COLORS[randomIndex].value;
};

export function CreateAreaModal({ open, onOpenChange, onSuccess }: CreateAreaModalProps) {
  const { isDark } = useTheme();
  const { createArea, users, roles } = useData();

  const [formData, setFormData] = useState<CreateAreaForm>({
    name: '',
    managerId: undefined,
    color: getRandomColor(),
    icon: 'Building2',
    users: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = () => {
    setFormData({
      ...formData,
      users: [...(formData.users || []), { userId: '', roleId: '' }]
    });
  };

  const handleRemoveUser = (index: number) => {
    const newUsers = [...(formData.users || [])];
    newUsers.splice(index, 1);
    setFormData({ ...formData, users: newUsers });
  };

  const handleUserChange = (index: number, field: 'userId' | 'roleId', value: string) => {
    const newUsers = [...(formData.users || [])];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setFormData({ ...formData, users: newUsers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = await createArea(formData);

    if (result.success) {
      toast.success('Área creada exitosamente', {
        description: `${formData.name} ha sido creada.`,
      });
      
      // Reset form
      setFormData({
        name: '',
        managerId: undefined,
        color: getRandomColor(),
        icon: 'Building2',
        users: [],
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
      
      toast.error('Error al crear área', {
        description: 'Por favor revisa los campos marcados en rojo.',
      });
    }

    setIsSubmitting(false);
  };

  const activeUsers = users.filter(u => u.active);

  // Encontrar el ícono seleccionado
  const selectedIconData = AREA_ICONS.find(i => i.value === formData.icon);
  const SelectedIcon = selectedIconData?.Icon || Building2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Building2 className="h-5 w-5 text-[#fb2c36]" />
            Nueva Área
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Crea una nueva área o departamento para tu organización.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Nombre del Área <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Producción, Marketing, Tecnología"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="manager" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Responsable (Opcional)
              </Label>
              <Select
                value={formData.managerId || ''}
                onValueChange={(value) => setFormData({ ...formData, managerId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin responsable</SelectItem>
                  {activeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ícono */}
            <div className="space-y-2">
              <Label htmlFor="icon" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Ícono
              </Label>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2">
                {AREA_ICONS.map((iconData) => {
                  const IconComponent = iconData.Icon;
                  const isSelected = formData.icon === iconData.value;
                  return (
                    <button
                      key={iconData.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconData.value })}
                      title={iconData.label}
                      className={`
                        flex items-center justify-center p-2 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-[#fb2c36] bg-[#fb2c36]/10' 
                          : isDark 
                            ? 'border-gray-700 hover:border-gray-600 bg-[#141414]' 
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }
                      `}
                    >
                      <IconComponent 
                        className={`h-5 w-5 ${
                          isSelected 
                            ? 'text-[#fb2c36]' 
                            : isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Usuarios */}
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Usuarios (Opcional)
              </Label>
              <div className="space-y-2">
                {formData.users && formData.users.length > 0 && formData.users.map((user, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={user.userId || ''}
                      onValueChange={(value) => handleUserChange(index, 'userId', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={user.roleId || ''}
                      onValueChange={(value) => handleUserChange(index, 'roleId', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveUser(index)}
                      disabled={isSubmitting}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar usuario
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
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
              {isSubmitting ? 'Creando...' : 'Crear Área'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}