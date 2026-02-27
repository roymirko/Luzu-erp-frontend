import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFormFields } from '../contexts/FormFieldsContext';
import { useData } from '../contexts/DataContext';
import { useLog } from '../contexts/LogContext';
import type { FormFieldConfig, FieldOption } from '../contexts/FormFieldsContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { CreateAreaModal } from './CreateAreaModal';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { toast } from 'sonner';
import {
  Users,
  Shield,
  Settings,
  Activity,
  Package,
  Search,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Database,
  Bell,
  Globe,
  Building2,
  FolderTree,
  Workflow,
  Eye,
  Lock,
  UserCheck,
  List,
  Tag,
  Save,
  X,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  EyeOff,
  Loader2,
  Wifi
} from 'lucide-react';
import * as settingsService from '../services/settingsService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

// FieldOption y FormFieldConfig ahora vienen de FormFieldsContext

interface Area {
  id: string;
  name: string;
  description: string;
  responsable: string;
  active: boolean;
}





// Tab de Gestión de Campos y Opciones
const FieldOptionsTab = () => {
  const { isDark } = useTheme();
  const { fieldsConfig, updateFieldsConfig } = useFormFields();
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedField, setSelectedField] = useState<FormFieldConfig | null>(null);
  const [newOptionValue, setNewOptionValue] = useState('');

  // Obtener áreas únicas
  const areas = Array.from(new Set(fieldsConfig.map(f => f.category)));

  // Filtrar campos por área seleccionada
  const filteredFields = selectedArea
    ? fieldsConfig.filter(f => f.category === selectedArea)
    : [];

  const handleAddOption = () => {
    if (!selectedField || !newOptionValue.trim()) return;

    const newOption: FieldOption = {
      id: `opt-${Date.now()}`,
      value: newOptionValue.trim(),
      active: true,
    };

    const updatedFields = fieldsConfig.map(field =>
      field.id === selectedField.id
        ? { ...field, options: [...field.options, newOption] }
        : field
    );

    updateFieldsConfig(updatedFields);
    setSelectedField({ ...selectedField, options: [...selectedField.options, newOption] });
    setNewOptionValue('');
    toast.success(`Opción "${newOption.value}" agregada`);
  };

  const handleToggleOption = (optionId: string) => {
    if (!selectedField) return;

    const updatedFields = fieldsConfig.map(field =>
      field.id === selectedField.id
        ? {
          ...field,
          options: field.options.map(opt =>
            opt.id === optionId ? { ...opt, active: !opt.active } : opt
          )
        }
        : field
    );

    updateFieldsConfig(updatedFields);
    const updatedSelectedField = updatedFields.find(f => f.id === selectedField.id);
    if (updatedSelectedField) setSelectedField(updatedSelectedField);
  };

  const handleDeleteOption = (optionId: string) => {
    if (!selectedField) return;

    const updatedFields = fieldsConfig.map(field =>
      field.id === selectedField.id
        ? { ...field, options: field.options.filter(opt => opt.id !== optionId) }
        : field
    );

    updateFieldsConfig(updatedFields);
    const updatedSelectedField = updatedFields.find(f => f.id === selectedField.id);
    if (updatedSelectedField) setSelectedField(updatedSelectedField);
    toast.success('Opción eliminada correctamente');
  };

  const handleSaveChanges = () => {
    // Simular guardado con delay
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Guardando cambios...',
        success: () => {
          return '✅ Cambios guardados exitosamente';
        },
        error: 'Error al guardar los cambios',
      }
    );
  };

  const handleCancel = () => {
    setSelectedField(null);
    toast.info('Edición cancelada');
  };

  return (
    <div className="space-y-6">
      {/* Selector de Área */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FolderTree className="h-5 w-5 text-[#fb2c36]" />
            Seleccionar Área
          </CardTitle>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Elige un área para ver y gestionar sus campos
          </p>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedField(null);
              }}
              className={`w-full h-11 px-4 rounded-lg border text-sm ${isDark
                  ? 'bg-[#141414] border-gray-700 text-white focus:border-[#fb2c36] focus:ring-1 focus:ring-[#fb2c36]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36] focus:ring-1 focus:ring-[#fb2c36]'
                }`}
            >
              <option value="">Seleccionar área...</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area} ({fieldsConfig.filter(f => f.category === area).length} campos)
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Campos y Edición */}
      {selectedArea && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Campos */}
          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <List className="h-5 w-5 text-[#fb2c36]" />
                Campos del Sistema
              </CardTitle>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {filteredFields.length} campos en {selectedArea}
              </p>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {filteredFields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => setSelectedField(field)}
                  className={`w-full p-2.5 min-h-[44px] flex items-center border rounded-lg text-left transition-all ${selectedField?.id === field.id
                      ? 'border-green-500 bg-green-500/10'
                      : isDark
                        ? 'border-gray-800 bg-[#141414] hover:border-gray-700'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {field.label}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Panel de Edición de Opciones */}
          <div className="lg:col-span-2">
            {selectedField ? (
              <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Tag className="h-5 w-5 text-[#fb2c36]" />
                        {selectedField.label}
                      </CardTitle>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        Gestiona las opciones disponibles en los formularios
                      </p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {selectedField.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Agregar Nueva Opción */}
                  <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Agregar Nueva Opción
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Nueva Unidad de Negocio"
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                        className={isDark
                          ? 'bg-[#0a0a0a] border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                      />
                      <Button
                        onClick={handleAddOption}
                        disabled={!newOptionValue.trim()}
                        className="bg-[#fb2c36] text-white hover:bg-[#e02731]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Opciones Existentes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Opciones Existentes ({selectedField.options.length})
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        {selectedField.options.filter(o => o.active).length} activas
                      </p>
                    </div>
                    <div className="space-y-2">
                      {selectedField.options.map((option) => (
                        <div
                          key={option.id}
                          className={`p-3 border rounded-lg flex items-center justify-between ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'
                            } ${!option.active ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`h-8 w-8 rounded flex items-center justify-center ${option.active
                                ? 'bg-[#fb2c36]/20'
                                : isDark ? 'bg-gray-800' : 'bg-gray-200'
                              }`}>
                              <Tag className={`h-4 w-4 ${option.active ? 'text-[#fb2c36]' : isDark ? 'text-gray-600' : 'text-gray-400'
                                }`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {option.value}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                                {option.active ? 'Visible en formularios' : 'Oculta en formularios'}
                              </p>
                            </div>
                            <Badge className={option.active
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }>
                              {option.active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleOption(option.id)}
                              className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                            >
                              {option.active ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOption(option.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className={`flex justify-end gap-2 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className={isDark
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      className="bg-[#fb2c36] text-white hover:bg-[#e02731]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
                <CardContent className="p-12">
                  <div className="text-center">
                    <List className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-400'}`} />
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Selecciona un Campo
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Elige un campo de la lista izquierda para gestionar sus opciones
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Tab de Gestión de Áreas
const AreasTab = () => {
  const { isDark } = useTheme();
  const { areas: dataAreas, toggleAreaStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleArea = async (id: string) => {
    const result = await toggleAreaStatus(id);
    if (result.success) {
      toast.success('Estado del área actualizado');
      if (result.warning) {
        toast.warning(result.warning);
      }
    }
  };

  const handleNewArea = () => {
    setShowCreateModal(true);
  };

  const handleModalSuccess = () => {
    toast.success('Área creada exitosamente');
  };

  // Convertir áreas del DataContext al formato esperado y filtrar
  const allAreas = dataAreas.map(area => ({
    id: area.id,
    name: area.name,
    description: area.description,
    responsable: area.manager || 'Sin asignar',
    active: area.active
  }));

  const areas = allAreas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Building2 className="h-5 w-5 text-[#fb2c36]" />
                Áreas y Departamentos
              </CardTitle>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Gestiona las áreas de la empresa
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Buscador */}
              <div className="relative w-64">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <Input
                  placeholder="Buscar áreas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isDark
                    ? 'pl-10 bg-[#141414] border-gray-700 text-white placeholder:text-gray-600'
                    : 'pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'
                  }
                />
              </div>
              <Button
                onClick={handleNewArea}
                className="bg-[#fb2c36] text-white hover:bg-[#e02731] whitespace-nowrap h-10 px-4 min-w-[160px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Área
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {allAreas.length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Áreas Totales</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {allAreas.filter(a => a.active).length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Áreas Activas</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Set(allAreas.map(a => a.responsable)).size}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Responsables</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areas.map((area) => (
              <div
                key={area.id}
                className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'
                  } ${!area.active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${area.active
                        ? 'bg-[#fb2c36]/20'
                        : isDark ? 'bg-gray-800' : 'bg-gray-200'
                      }`}>
                      <Building2 className={`h-5 w-5 ${area.active ? 'text-[#fb2c36]' : isDark ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {area.name}
                      </h4>
                      <Badge className={area.active
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs'
                      }>
                        {area.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={area.active}
                    onCheckedChange={() => toggleArea(area.id)}
                  />
                </div>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {area.description}
                </p>
                <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                  <span className="font-medium">Responsable:</span> {area.responsable}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nueva Área */}
      <CreateAreaModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

// Tab de Gestión de Usuarios
const UsersTab = () => {
  const { isDark } = useTheme();
  const { users: dataUsers, toggleUserStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof dataUsers[number] | null>(null);

  const handleNewUser = () => {
    setShowCreateModal(true);
  };

  const handleModalSuccess = () => {
    toast.success('Usuario creado exitosamente');
  };

  const toggleUser = async (id: string) => {
    const result = await toggleUserStatus(id);
    if (result.success) {
      toast.success('Estado del usuario actualizado');
    }
  };

  // Convertir usuarios del DataContext al formato esperado y filtrar
  const allUsers = dataUsers.map(user => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.metadata?.position || 'Sin cargo',
    status: user.active ? 'active' as const : 'inactive' as const,
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-AR') : 'Nunca'
  }));

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Users className="h-5 w-5 text-[#fb2c36]" />
                Gestión de Usuarios
              </CardTitle>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Administrar usuarios y permisos del sistema</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Buscador */}
              <div className="relative w-64">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isDark
                    ? 'pl-10 bg-[#141414] border-gray-700 text-white placeholder:text-gray-600'
                    : 'pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'
                  }
                />
              </div>
              <Button
                onClick={handleNewUser}
                className="bg-[#fb2c36] text-white hover:bg-[#e02731] whitespace-nowrap h-10 px-4 min-w-[160px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{allUsers.length}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Usuarios Totales</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filteredUsers.filter(u => u.status === 'active').length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Usuarios Activos</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>4</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Roles del Sistema</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 border rounded-lg hover:border-[#fb2c36]/50 transition-colors ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-[#fb2c36]/20 h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-[#fb2c36]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h4>
                        <Badge className={user.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.role}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {user.lastLogin}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={user.status === 'active'}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                      onClick={() => {
                        const fullUser = dataUsers.find(u => u.id === user.id);
                        if (fullUser) setEditingUser(fullUser);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nuevo Usuario */}
      <CreateUserModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de Editar Usuario */}
      <EditUserModal
        open={!!editingUser}
        onOpenChange={(open) => { if (!open) setEditingUser(null); }}
        user={editingUser}
        onSuccess={() => toast.success('Usuario actualizado')}
      />
    </div>
  );
};

// Tab de Roles y Permisos
const RolesTab = () => {
  const { isDark } = useTheme();
  const { roles, users, userAreaRoles, areas } = useData();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Obtener usuarios por rol
  const getUsersByRole = (roleId: string) => {
    const userIds = new Set(
      userAreaRoles
        .filter(uar => uar.roleId === roleId)
        .map(uar => uar.userId)
    );
    return users.filter(u => userIds.has(u.id));
  };

  // Obtener icono de rol
  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Administrador':
        return <Shield className="h-6 w-6" />;
      case 'Editor':
        return <Edit className="h-6 w-6" />;
      case 'Visualizador':
        return <Eye className="h-6 w-6" />;
      default:
        return <UserCheck className="h-6 w-6" />;
    }
  };

  // Obtener color de rol
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrador':
        return { bg: 'bg-[#fb2c36]/20', text: 'text-[#fb2c36]', border: 'border-[#fb2c36]/30' };
      case 'Editor':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'Visualizador':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  // Obtener recursos únicos
  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      users: 'Usuarios',
      areas: 'Áreas',
      roles: 'Roles',
      logs: 'Auditoría',
      forms: 'Formularios',
      tasks: 'Tareas'
    };
    return labels[resource] || resource;
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#fb2c36]/20 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-[#fb2c36]" />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {roles.length}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Roles del Sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userAreaRoles.length}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Asignaciones Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {roles.reduce((acc, role) => acc + role.permissions.length, 0)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Permisos Configurados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listado de Roles */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="h-5 w-5 text-[#fb2c36]" />
            Roles y Permisos del Sistema
          </CardTitle>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Gestión de roles, permisos y usuarios asignados
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role) => {
              const roleUsers = getUsersByRole(role.id);
              const roleColor = getRoleColor(role.name);
              const isExpanded = selectedRole === role.id;

              return (
                <div
                  key={role.id}
                  className={`border rounded-lg transition-all ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'
                    } ${isExpanded ? 'ring-1 ring-[#fb2c36]/30' : ''}`}
                >
                  {/* Header del Rol */}
                  <div
                    className="p-6 cursor-pointer hover:bg-opacity-80 transition-all"
                    onClick={() => setSelectedRole(isExpanded ? null : role.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${roleColor.bg}`}>
                          <div className={roleColor.text}>
                            {getRoleIcon(role.name)}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {role.name}
                            </h3>
                            <Badge className={`${roleColor.bg} ${roleColor.text} border ${roleColor.border}`}>
                              {roleUsers.length} {roleUsers.length === 1 ? 'usuario' : 'usuarios'}
                            </Badge>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-3`}>
                            {role.description}
                          </p>

                          {/* Mini resumen de permisos */}
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.slice(0, 3).map((perm, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}
                              >
                                {getResourceLabel(perm.resource)}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}
                              >
                                +{role.permissions.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}
                      >
                        {isExpanded ? 'Ocultar' : 'Ver detalles'}
                      </Button>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-6 space-y-6`}>
                      {/* Permisos detallados */}
                      <div>
                        <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Permisos del Rol
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {role.permissions.map((perm, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-white border-gray-200'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {getResourceLabel(perm.resource)}
                                </span>
                                <Lock className={`h-4 w-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {perm.actions.map((action, actionIdx) => (
                                  <Badge
                                    key={actionIdx}
                                    variant="outline"
                                    className={`text-xs ${action === 'delete'
                                        ? 'border-red-500/30 text-red-400 bg-red-500/10'
                                        : action === 'create' || action === 'update'
                                          ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                          : 'border-green-500/30 text-green-400 bg-green-500/10'
                                      }`}
                                  >
                                    {action === 'create' && '✏️ Crear'}
                                    {action === 'read' && '👁️ Leer'}
                                    {action === 'update' && '✏️ Editar'}
                                    {action === 'delete' && '🗑️ Eliminar'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Usuarios con este rol */}
                      <div>
                        <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Usuarios con rol {role.name}
                        </h4>
                        {roleUsers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {roleUsers.map((user) => {
                              const userAssignments = userAreaRoles.filter(
                                uar => uar.userId === user.id && uar.roleId === role.id
                              );
                              const userAreas = userAssignments.map(uar =>
                                areas.find(a => a.id === uar.areaId)
                              ).filter(Boolean);

                              return (
                                <div
                                  key={user.id}
                                  className={`p-4 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-white border-gray-200'
                                    }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${roleColor.bg}`}>
                                      <Users className={`h-4 w-4 ${roleColor.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {user.firstName} {user.lastName}
                                      </p>
                                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} truncate`}>
                                        {user.email}
                                      </p>
                                      {user.metadata?.position && (
                                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                                          {user.metadata.position}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {userAreas.map((area) => (
                                          <Badge
                                            key={area!.id}
                                            variant="outline"
                                            className={`text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}
                                          >
                                            {area!.code}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={user.active
                                        ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                        : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                                      }
                                    >
                                      {user.active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={`text-center py-8 border rounded-lg ${isDark ? 'border-gray-800 bg-[#0a0a0a]' : 'border-gray-200 bg-gray-50'
                            }`}>
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                              No hay usuarios asignados con este rol
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Tab de Auditoría y Logs
const AuditTab = () => {
  const { isDark } = useTheme();
  const { logs, getLogStats } = useLog();
  const { users } = useData();
  const stats = getLogStats();

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener valores únicos para filtros
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueEntities = Array.from(new Set(logs.map(l => l.entity)));
  const uniqueUsers = Array.from(new Set(logs.map(l => l.userEmail)));

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesEntity = filterEntity === 'all' || log.entity === filterEntity;
    const matchesResult = filterResult === 'all' || log.result === filterResult;
    const matchesUser = filterUser === 'all' || log.userEmail === filterUser;

    return matchesSearch && matchesAction && matchesEntity && matchesResult && matchesUser;
  });

  // Ordenar por fecha descendente
  const sortedLogs = [...filteredLogs].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Paginación
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = sortedLogs.slice(startIndex, startIndex + itemsPerPage);

  // Reset página al cambiar filtros
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // Función para obtener el nombre del usuario desde el email
  const getUserNameFromEmail = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      return user.firstName;
    }
    // Si no se encuentra el usuario, extraer el nombre del email
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'exito':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'advertencia':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };



  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create_user: 'Crear Usuario',
      edit_user: 'Editar Usuario',
      delete_user: 'Eliminar Usuario',
      activate_user: 'Activar Usuario',
      deactivate_user: 'Desactivar Usuario',
      create_area: 'Crear Área',
      edit_area: 'Editar Área',
      delete_area: 'Eliminar Área',
      activate_area: 'Activar Área',
      deactivate_area: 'Desactivar Área',
      assign_user_to_area: 'Asignar Usuario',
      remove_user_from_area: 'Remover Usuario',
      change_role: 'Cambiar Rol',
      login: 'Inicio de Sesión',
      logout: 'Cierre de Sesión'
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      user: 'Usuario',
      area: 'Área',
      assignment: 'Asignación',
      session: 'Sesión',
      role: 'Rol'
    };
    return labels[entity] || entity;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  };

  const handleExport = () => {
    const csvContent = [
      ['Fecha', 'Usuario', 'Rol', 'Acción', 'Detalle', 'Resultado'],
      ...sortedLogs.map(log => [
        formatDate(log.timestamp),
        getUserNameFromEmail(log.userEmail),
        log.userRole,
        getActionLabel(log.action),
        log.details,
        log.result === 'success' ? 'Exitoso' : log.result === 'error' ? 'Error' : 'Alerta'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
                    link.download = `registros_auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('📥 Logs exportados exitosamente');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('all');
    setFilterEntity('all');
    setFilterResult('all');
    setFilterUser('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterAction !== 'all' || filterEntity !== 'all' ||
    filterResult !== 'all' || filterUser !== 'all';

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.successCount}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Exitosos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.errorCount}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Errores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.warningCount}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Logs */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FileText className="h-5 w-5 text-[#fb2c36]" />
                  Registro de Auditoría
                </CardTitle>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  {filteredLogs.length} {filteredLogs.length === 1 ? 'registro' : 'registros'}
                  {hasActiveFilters && ' (filtrado)'}
                </p>
              </div>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className={isDark
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className={isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 ${isDark
                  ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
              />
            </div>

            {/* Filtros por etiquetas */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Filtrar por:
                </span>
              </div>

              <select
                value={filterAction}
                onChange={(e) => handleFilterChange(setFilterAction)(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded-md border ${isDark
                    ? 'bg-[#141414] border-gray-800 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">Todas las acciones</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{getActionLabel(action)}</option>
                ))}
              </select>

              <select
                value={filterEntity}
                onChange={(e) => handleFilterChange(setFilterEntity)(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded-md border ${isDark
                    ? 'bg-[#141414] border-gray-800 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">Todas las entidades</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{getEntityLabel(entity)}</option>
                ))}
              </select>

              <select
                value={filterResult}
                onChange={(e) => handleFilterChange(setFilterResult)(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded-md border ${isDark
                    ? 'bg-[#141414] border-gray-800 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">Todos los resultados</option>
                <option value="success">Exitoso</option>
                <option value="error">Error</option>
                <option value="warning">Advertencia</option>
              </select>

              <select
                value={filterUser}
                onChange={(e) => handleFilterChange(setFilterUser)(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded-md border ${isDark
                    ? 'bg-[#141414] border-gray-800 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">Todos los usuarios</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    FECHA
                  </th>
                  <th className={`text-left py-3 px-4 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    USUARIO
                  </th>
                  <th className={`text-left py-3 px-4 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    ACCIÓN
                  </th>
                  <th className={`text-left py-3 px-4 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    DETALLE
                  </th>
                  <th className={`text-left py-3 px-4 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    RESULTADO
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-b ${isDark ? 'border-gray-800 hover:bg-[#141414]' : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors`}
                    >
                      <td className={`py-4 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <p className="font-medium">{getUserNameFromEmail(log.userEmail)}</p>
                          <Badge variant="outline" className={`text-xs mt-1 ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-600'
                            }`}>
                            {log.userRole}
                          </Badge>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Badge variant="outline" className={`${isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p className="line-clamp-2" title={log.details}>
                          {log.details}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          {getResultIcon(log.result)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className={`h-12 w-12 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          No se encontraron registros
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between mt-6 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'
              }`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredLogs.length)} de {filteredLogs.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum
                          ? 'bg-[#fb2c36] text-white hover:bg-[#fb2c36]/90'
                          : isDark
                            ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Tab de Configuración del Sistema
const SystemConfigTab = () => {
  const { isDark } = useTheme();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getFinnegansCreds().then(({ data }) => {
      setClientId(data.clientId);
      setClientSecret(data.clientSecret);
      setLoading(false);
    });
  }, []);

  const handleSaveFinnegans = async () => {
    setSaving(true);
    const { error } = await settingsService.saveFinnegansCreds(clientId, clientSecret);
    setSaving(false);
    if (error) {
      toast.error(`Error al guardar: ${error}`);
    } else {
      toast.success('Credenciales de Finnegans guardadas');
    }
  };

  const handleTestConnection = async () => {
    if (!clientId || !clientSecret) {
      toast.error('Ingresá Client ID y Client Secret');
      return;
    }
    setTesting(true);
    const { success, error } = await settingsService.testFinnegansConnection(clientId, clientSecret);
    setTesting(false);
    if (success) {
      toast.success('Conexión exitosa con Finnegans');
    } else {
      toast.error(`Error de conexión: ${error}`);
    }
  };

  const inputCls = isDark
    ? 'bg-[#141414] border-gray-700 text-white'
    : 'bg-gray-50 border-gray-300 text-gray-900';

  return (
    <div className="space-y-6">
      {/* Configuración General (static) */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Settings className="h-5 w-5 text-[#fb2c36]" />
            Configuración General
          </CardTitle>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Parámetros globales del sistema</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nombre de la Empresa
            </label>
            <Input defaultValue="Luzu TV" className={inputCls} />
          </div>
          <div>
            <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email de Contacto
            </label>
            <Input defaultValue="admin@luzutv.com" type="email" className={inputCls} />
          </div>
          <div>
            <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Zona Horaria
            </label>
            <Input defaultValue="America/Argentina/Buenos_Aires (GMT-3)" className={inputCls} />
          </div>
        </CardContent>
      </Card>

      {/* Finnegans API Credentials */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Globe className="h-5 w-5 text-green-500" />
            Finnegans - Credenciales API
          </CardTitle>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            OAuth2 credentials para teamplace.finneg.com
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cargando...</span>
            </div>
          ) : (
            <>
              <div>
                <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Client ID
                </label>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Ingresá el Client ID"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Client Secret
                </label>
                <div className="relative">
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Ingresá el Client Secret"
                    className={`pr-10 ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className={isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }
                >
                  {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wifi className="h-4 w-4 mr-2" />}
                  Probar Conexión
                </Button>
                <Button
                  onClick={handleSaveFinnegans}
                  disabled={saving}
                  className="bg-[#fb2c36] text-white hover:bg-[#e02731]"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Base de Datos (static) */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Database className="h-5 w-5 text-blue-500" />
            Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tamaño Total</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>2.4 GB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Registros</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>45,892</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Último Backup</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Hoy 03:00</span>
          </div>
          <Button variant="outline" className="w-full mt-4">
            Crear Backup Manual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export function FormBuilder() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('fields');

  return (
    <div className="space-y-6">
      {/* Header del Backoffice */}
      <div>
        <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Backoffice - Administración del Sistema
        </h1>
        <p className={`${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          Panel de control administrativo del ERP Luzu TV
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`h-auto p-1 gap-1 ${isDark ? 'bg-[#1e1e1e] border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <TabsTrigger
            value="fields"
            className={`px-4 py-2.5 ${isDark ? 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-300' : 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'}`}
          >
            <List className="h-4 w-4 mr-2" />
            Campos y Opciones
          </TabsTrigger>
          <TabsTrigger
            value="areas"
            className={`px-4 py-2.5 ${isDark ? 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-300' : 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'}`}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Áreas
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className={`px-4 py-2.5 ${isDark ? 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-300' : 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'}`}
          >
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className={`px-4 py-2.5 ${isDark ? 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-300' : 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'}`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className={`px-4 py-2.5 ${isDark ? 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-300' : 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'}`}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auditoría
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className={`px-4 py-2.5 ${isDark ? 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-300' : 'data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'}`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {activeTab === 'fields' && (
          <TabsContent value="fields" className="mt-6">
            <FieldOptionsTab />
          </TabsContent>
        )}

        {activeTab === 'areas' && (
          <TabsContent value="areas" className="mt-6">
            <AreasTab />
          </TabsContent>
        )}

        {activeTab === 'users' && (
          <TabsContent value="users" className="mt-6">
            <UsersTab />
          </TabsContent>
        )}

        {activeTab === 'roles' && (
          <TabsContent value="roles" className="mt-6">
            <RolesTab />
          </TabsContent>
        )}

        {activeTab === 'audit' && (
          <TabsContent value="audit" className="mt-6">
            <AuditTab />
          </TabsContent>
        )}

        {activeTab === 'config' && (
          <TabsContent value="config" className="mt-6">
            <SystemConfigTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
