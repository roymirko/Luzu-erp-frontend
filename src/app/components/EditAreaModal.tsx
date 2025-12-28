import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { EditAreaForm, Area } from '../types/business';
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

interface EditAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: Area | null;
  onSuccess?: () => void;
}

const AREA_ICONS = [
  { value: 'Video', Icon: Video, label: 'Producción' },
  { value: 'Mic', Icon: Mic, label: 'Contenido' },
  { value: 'TrendingUp', Icon: TrendingUp, label: 'Marketing' },
  { value: 'Code', Icon: Code, label: 'Tecnología' },
  { value: 'Users', Icon: Users, label: 'Equipo' },
  { value: 'Building2', Icon: Building2, label: 'Administración' },
];

export function EditAreaModal({ open, onOpenChange, area, onSuccess }: EditAreaModalProps) {
  const { isDark } = useTheme();
  const { editArea, users, roles, userAreaRoles } = useData();

  const [formData, setFormData] = useState<EditAreaForm>({
    name: '',
    description: '',
    code: '',
    managerId: undefined,
    active: true,
    color: undefined,
    icon: 'Building2',
    users: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del área cuando cambie
  useEffect(() => {
    if (area) {
      // Obtener usuarios asignados a esta área
      const areaUsers = userAreaRoles
        .filter(uar => uar.areaId === area.id)
        .map(uar => ({
          userId: uar.userId,
          roleId: uar.roleId
        }));

      setFormData({
        name: area.name,
        description: area.description,
        code: area.code,
        managerId: area.manager,
        active: area.active,
        color: area.metadata?.color,
        icon: area.metadata?.icon || 'Building2',
        users: areaUsers,
      });
    }
  }, [area, userAreaRoles]);

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
    if (!area) return;

    setIsSubmitting(true);
    setErrors({});

    const result = await editArea(area.id, formData);

    if (result.success) {
      toast.success('Área actualizada exitosamente', {
        description: `${formData.name} ha sido actualizada.`,
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
      
      toast.error('Error al actualizar área', {
        description: 'Por favor revisa los campos marcados en rojo.',
      });
    }

    setIsSubmitting(false);
  };

  const activeUsers = users.filter(u => u.active);

  if (!area) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Building2 className="h-5 w-5 text-[#fb2c36]" />
            Editar Área
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Edita la información del área "{area.name}".
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

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="code" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: PROD, MKT, TEC"
                maxLength={5}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción del área"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
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

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="active" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Estado
              </Label>
              <Select
                value={formData.active ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, active: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activa</SelectItem>
                  <SelectItem value="false">Inactiva</SelectItem>
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
                Usuarios Asignados
              </Label>
              <div className="space-y-2">
                {formData.users.map((user, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={user.userId || ''}
                      onValueChange={(value) => handleUserChange(index, 'userId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={user.roleId || ''}
                      onValueChange={(value) => handleUserChange(index, 'roleId', value)}
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveUser(index)}
                      disabled={isSubmitting}
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}