import { useState } from 'react';
import { 
  Users, 
  Shield, 
  Building2, 
  FileText, 
  Database, 
  Bell,
  Palette,
  Globe,
  Lock,
  History,
  Settings as SettingsIcon,
  ChevronRight,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { useTheme } from '../contexts/ThemeContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const mockUsers: User[] = [
  { id: '1', name: 'Miguel Sánchez', email: 'miguel.sanchez@luzutv.com', role: 'Admin', department: 'Comercial', status: 'active', lastLogin: 'Hace 5 min' },
  { id: '2', name: 'Julia López', email: 'julia.lopez@luzutv.com', role: 'Manager', department: 'Implementación', status: 'active', lastLogin: 'Hace 15 min' },
  { id: '3', name: 'Ana Rodríguez', email: 'ana.rodriguez@luzutv.com', role: 'Editor', department: 'Programación', status: 'active', lastLogin: 'Hace 1 hora' },
  { id: '4', name: 'Luis Martínez', email: 'luis.martinez@luzutv.com', role: 'Editor', department: 'RRHH', status: 'inactive', lastLogin: 'Hace 2 días' },
];

const mockLogs: ActivityLog[] = [
  { id: '1', user: 'Miguel Sánchez', action: 'Creó un nuevo formulario', module: 'Formularios', timestamp: 'Hace 5 min', status: 'success' },
  { id: '2', user: 'Julia López', action: 'Modificó configuración de permisos', module: 'Usuarios', timestamp: 'Hace 15 min', status: 'success' },
  { id: '3', user: 'Ana Rodríguez', action: 'Intentó acceder a módulo restringido', module: 'Seguridad', timestamp: 'Hace 30 min', status: 'warning' },
  { id: '4', user: 'Sistema', action: 'Backup automático completado', module: 'Sistema', timestamp: 'Hace 1 hora', status: 'success' },
  { id: '5', user: 'Luis Martínez', action: 'Error al cargar datos', module: 'Base de Datos', timestamp: 'Hace 2 horas', status: 'error' },
];

export function Configuraciones() {
  const [activeTab, setActiveTab] = useState('general');
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Configuraciones del Sistema</h1>
        <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>Administra las configuraciones generales, usuarios y permisos del ERP</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'} border p-1`}>
          <TabsTrigger value="general" className="data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white">
            <Building2 className="h-4 w-4 mr-2" />
            Áreas
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[#fb2c36] data-[state=active]:text-white">
            <History className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1e1e1e] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Información de la Empresa</CardTitle>
                <CardDescription className="text-gray-500">Datos generales de Luzu TV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-gray-300">Nombre de la Empresa</Label>
                  <Input 
                    id="company-name" 
                    defaultValue="Luzu TV"
                    className="bg-[#141414] border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email" className="text-gray-300">Email Corporativo</Label>
                  <Input 
                    id="company-email" 
                    type="email"
                    defaultValue="contacto@luzutv.com"
                    className="bg-[#141414] border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone" className="text-gray-300">Teléfono</Label>
                  <Input 
                    id="company-phone" 
                    defaultValue="+54 11 1234-5678"
                    className="bg-[#141414] border-gray-700 text-white"
                  />
                </div>
                <Button className="w-full bg-[#fb2c36] text-white hover:bg-[#e02731]">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1e1e1e] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Preferencias del Sistema</CardTitle>
                <CardDescription className="text-gray-500">Configuraciones generales de funcionamiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Notificaciones por Email</p>
                    <p className="text-xs text-gray-500">Recibir alertas importantes por correo</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Aprobación en dos pasos</p>
                    <p className="text-xs text-gray-500">Requerir doble validación para montos altos</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Backup Automático</p>
                    <p className="text-xs text-gray-500">Realizar copias de seguridad diarias</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Modo Mantenimiento</p>
                    <p className="text-xs text-gray-500">Desactivar acceso temporal al sistema</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1e1e1e] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Módulos del Sistema</CardTitle>
              <CardDescription className="text-gray-500">Activa o desactiva funcionalidades del ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Formularios Comerciales', icon: FileText, active: true, color: 'text-blue-500' },
                  { name: 'Gestión de Usuarios', icon: Users, active: true, color: 'text-purple-500' },
                  { name: 'Reportes Avanzados', icon: Database, active: true, color: 'text-green-500' },
                  { name: 'Notificaciones Push', icon: Bell, active: false, color: 'text-yellow-500' },
                  { name: 'API External', icon: Globe, active: false, color: 'text-orange-500' },
                  { name: 'Autenticación 2FA', icon: Lock, active: true, color: 'text-red-500' },
                ].map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#141414] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <module.icon className={`h-5 w-5 ${module.color}`} />
                      <span className="text-sm text-white">{module.name}</span>
                    </div>
                    <Switch 
                      defaultChecked={module.active}
                      className="data-[state=checked]:bg-[#fb2c36]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Gestión de Usuarios</h3>
              <p className="text-sm text-gray-500">{mockUsers.length} usuarios registrados</p>
            </div>
            <Button className="bg-[#fb2c36] text-white hover:bg-[#e02731]">
              <User className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          <Card className="bg-[#1e1e1e] border-gray-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                {mockUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-[#141414] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                  >
                    <Avatar className="h-12 w-12 bg-[#fb2c36] text-white">
                      <AvatarFallback className="bg-[#fb2c36] text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white">{user.name}</p>
                        <Badge 
                          className={
                            user.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }
                        >
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {user.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {user.lastLogin}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Áreas y Departamentos</h3>
              <p className="text-sm text-gray-500">Organiza la estructura de tu empresa</p>
            </div>
            <Button className="bg-[#fb2c36] text-white hover:bg-[#e02731]">
              <Building2 className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Comercial', users: 5, color: 'bg-blue-500', icon: Building2 },
              { name: 'Implementación', users: 8, color: 'bg-purple-500', icon: Settings },
              { name: 'Dir. de Programación', users: 12, color: 'bg-green-500', icon: FileText },
              { name: 'Recursos Humanos', users: 3, color: 'bg-yellow-500', icon: Users },
              { name: 'Finanzas', users: 4, color: 'bg-orange-500', icon: Database },
              { name: 'Administración', users: 2, color: 'bg-red-500', icon: Shield },
            ].map((dept, index) => (
              <Card key={index} className="bg-[#1e1e1e] border-gray-800 hover:border-gray-700 transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${dept.color} p-3 rounded-lg`}>
                      <dept.icon className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#fb2c36] transition-colors" />
                  </div>
                  <h4 className="font-medium text-white mb-1">{dept.name}</h4>
                  <p className="text-sm text-gray-500">{dept.users} usuarios asignados</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-[#1e1e1e] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Configuración de Seguridad</CardTitle>
              <CardDescription className="text-gray-500">Protege tu sistema con medidas de seguridad avanzadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">Autenticación de Dos Factores</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Protección adicional para cuentas de administrador</p>
                  <Button variant="outline" size="sm" className="w-full bg-[#141414] border-gray-700 text-gray-300 hover:bg-gray-800">
                    Configurar 2FA
                  </Button>
                </div>

                <div className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">Políticas de Contraseña</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Configurado</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Mínimo 8 caracteres, mayúsculas y números</p>
                  <Button variant="outline" size="sm" className="w-full bg-[#141414] border-gray-700 text-gray-300 hover:bg-gray-800">
                    Editar Políticas
                  </Button>
                </div>

                <div className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">Bloqueo de IP</h4>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Parcial</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Restricción de acceso por ubicación</p>
                  <Button variant="outline" size="sm" className="w-full bg-[#141414] border-gray-700 text-gray-300 hover:bg-gray-800">
                    Gestionar IPs
                  </Button>
                </div>

                <div className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">Sesiones Concurrentes</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Limitado</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Máximo 2 sesiones por usuario</p>
                  <Button variant="outline" size="sm" className="w-full bg-[#141414] border-gray-700 text-gray-300 hover:bg-gray-800">
                    Configurar Límites
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-[#1e1e1e] border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Registro de Actividad del Sistema</CardTitle>
                  <CardDescription className="text-gray-500 mt-1">Últimas acciones realizadas en el ERP</CardDescription>
                </div>
                <Button variant="outline" className="bg-[#141414] border-gray-700 text-gray-300 hover:bg-gray-800">
                  Exportar Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-[#141414] border border-gray-800 rounded-lg"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      log.status === 'success' ? 'bg-green-500/20' :
                      log.status === 'warning' ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                    }`}>
                      {log.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {log.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                      {log.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white">{log.user}</p>
                        <Badge variant="outline" className="bg-gray-800 text-gray-400 text-xs">
                          {log.module}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{log.action}</p>
                      <p className="text-xs text-gray-600">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}