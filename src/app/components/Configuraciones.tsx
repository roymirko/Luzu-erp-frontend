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
  User as UserIcon,
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
import { useData } from '../contexts/DataContext';
import { useLog } from '../contexts/LogContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Configuraciones() {
  const [activeTab, setActiveTab] = useState('general');
  const { isDark } = useTheme();
  const { users, areas, getUserWithRelations } = useData();
  const { logs } = useLog();

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
            <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Información de la Empresa</CardTitle>
                <CardDescription className="text-gray-500">Datos generales de Luzu TV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Nombre de la Empresa</Label>
                  <Input
                    id="company-name"
                    defaultValue="Luzu TV"
                    className={isDark ? "bg-[#141414] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Email Corporativo</Label>
                  <Input
                    id="company-email"
                    type="email"
                    defaultValue="contacto@luzutv.com"
                    className={isDark ? "bg-[#141414] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Teléfono</Label>
                  <Input
                    id="company-phone"
                    defaultValue="+54 11 1234-5678"
                    className={isDark ? "bg-[#141414] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <Button className="w-full bg-[#fb2c36] text-white hover:bg-[#e02731]">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Preferencias del Sistema</CardTitle>
                <CardDescription className="text-gray-500">Configuraciones generales de funcionamiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#141414]' : 'bg-gray-50 border border-gray-200'}`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Notificaciones por Email</p>
                    <p className="text-xs text-gray-500">Recibir alertas importantes por correo</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#141414]' : 'bg-gray-50 border border-gray-200'}`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Aprobación en dos pasos</p>
                    <p className="text-xs text-gray-500">Requerir doble validación para montos altos</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#141414]' : 'bg-gray-50 border border-gray-200'}`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Backup Automático</p>
                    <p className="text-xs text-gray-500">Realizar copias de seguridad diarias</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#141414]' : 'bg-gray-50 border border-gray-200'}`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Modo Mantenimiento</p>
                    <p className="text-xs text-gray-500">Desactivar acceso temporal al sistema</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-[#fb2c36]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Módulos del Sistema</CardTitle>
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
                  <div key={index} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${isDark ? 'bg-[#141414] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <module.icon className={`h-5 w-5 ${module.color}`} />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{module.name}</span>
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
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gestión de Usuarios</h3>
              <p className="text-sm text-gray-500">{users.length} usuarios registrados</p>
            </div>
            <Button className="bg-[#fb2c36] text-white hover:bg-[#e02731]">
              <UserIcon className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="space-y-3">
                {users.map((user) => {
                  const userRel = getUserWithRelations(user.id);
                  const mainRole = userRel?.areas[0]?.role?.name || 'Vistas';
                  const department = userRel?.areas[0]?.area?.name || 'General';

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${isDark ? 'bg-[#141414] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                      <Avatar className="h-12 w-12 bg-[#fb2c36] text-white">
                        <AvatarFallback className="bg-[#fb2c36] text-white">
                          {user.firstName ? user.firstName[0] : user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</p>
                          <Badge
                            className={
                              user.active
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }
                          >
                            {user.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {mainRole}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {user.lastLogin ? format(user.lastLogin, 'dd/MM HH:mm') : 'Nunca'}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
                        Editar
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Áreas y Departamentos</h3>
              <p className="text-sm text-gray-500">Organiza la estructura de tu empresa</p>
            </div>
            <Button className="bg-[#fb2c36] text-white hover:bg-[#e02731]">
              <Building2 className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area, index) => (
              <Card key={area.id} className={`border transition-colors cursor-pointer group ${isDark ? 'bg-[#1e1e1e] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${'bg-blue-500'} p-3 rounded-lg`}>
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#fb2c36] transition-colors" />
                  </div>
                  <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{area.name}</h4>
                  <p className="text-sm text-gray-500">Gestión de {area.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Configuración de Seguridad</CardTitle>
              <CardDescription className="text-gray-500">Protege tu sistema con medidas de seguridad avanzadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Autenticación de Dos Factores</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Protección adicional para cuentas de administrador</p>
                  <Button variant="outline" size="sm" className={`w-full border-gray-700 ${isDark ? 'bg-[#141414] text-gray-300 hover:bg-gray-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    Configurar 2FA
                  </Button>
                </div>

                <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Políticas de Contraseña</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Configurado</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Mínimo 8 caracteres, mayúsculas y números</p>
                  <Button variant="outline" size="sm" className={`w-full border-gray-700 ${isDark ? 'bg-[#141414] text-gray-300 hover:bg-gray-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    Editar Políticas
                  </Button>
                </div>

                <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Bloqueo de IP</h4>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Parcial</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Restricción de acceso por ubicación</p>
                  <Button variant="outline" size="sm" className={`w-full border-gray-700 ${isDark ? 'bg-[#141414] text-gray-300 hover:bg-gray-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    Gestionar IPs
                  </Button>
                </div>

                <div className={`p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Sesiones Concurrentes</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Limitado</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Máximo 2 sesiones por usuario</p>
                  <Button variant="outline" size="sm" className={`w-full border-gray-700 ${isDark ? 'bg-[#141414] text-gray-300 hover:bg-gray-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    Configurar Límites
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Registro de Actividad del Sistema</CardTitle>
                  <CardDescription className="text-gray-500 mt-1">Últimas acciones realizadas en el ERP</CardDescription>
                </div>
                <Button variant="outline" className={isDark ? 'bg-[#141414] border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}>
                  Exportar Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${log.result === 'success' ? 'bg-green-500/20' :
                      log.result === 'warning' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }`}>
                      {log.result === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {log.result === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                      {log.result === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.userEmail}</p>
                        <Badge variant="outline" className="bg-gray-800 text-gray-400 text-xs">
                          {log.entity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{log.details || log.action}</p>
                      <p className="text-xs text-gray-600">{format(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}</p>
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