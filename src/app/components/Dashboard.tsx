import { TrendingUp, Users, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useLog } from '../contexts/LogContext';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'review';
  priority: 'high' | 'medium' | 'low';
  area: string;
  assignee: string;
  dueDate: string;
}

interface ProgramEvent {
  time: string;
  title: string;
  duration: string;
  status: 'live' | 'upcoming' | 'completed';
}

// Keeping this for now as there is no backend for it
const programSchedule: ProgramEvent[] = [
  { time: '15:00', title: 'Resumen de Noticias Tech', duration: '30 min', status: 'live' },
  { time: '16:00', title: 'Entrevista con fundadores', duration: '45 min', status: 'upcoming' },
  { time: '17:00', title: 'Análisis de mercado', duration: '60 min', status: 'upcoming' },
  { time: '18:30', title: 'Gaming Stream', duration: '90 min', status: 'upcoming' },
];

export function Dashboard() {
  const { isDark } = useTheme();
  const { formularios, notifications } = useFormularios();
  const { logs } = useLog();

  // Calcular métricas reales
  const metrics = useMemo(() => {
    // Ventas: Suma de totalVenta de todos los formularios
    // Nota: totalVenta es string en DB, asumir formato numerico o limpiar
    const totalSales = formularios.reduce((acc, form) => {
      const val = parseFloat(form.totalVenta.replace(/[^0-9.-]+/g, '')) || 0;
      return acc + val;
    }, 0);

    // Generar sparkline fake basado en el total para no dejar vacío
    // En el futuro, agrupar por mes
    const salesData = [totalSales * 0.8, totalSales * 0.85, totalSales * 0.9, totalSales * 0.95, totalSales, totalSales * 1.05, totalSales * 1.1];

    // Presupuesto: podría ser un target fijo o suma de montos
    // Usaremos un valor dummy proporcional
    const budgetData = salesData.map(s => s * 1.2);

    // Audiencia: No hay dato real, usar dummy
    const audienceData = [120, 135, 155, 170, 182, 195, 202];

    return {
      salesTotal: totalSales,
      budgetTotal: totalSales * 1.2, // Mock target
      audienceTotal: 202000,
      sales: salesData,
      budget: budgetData,
      audience: audienceData
    };
  }, [formularios]);

  // Convertir notificaciones a "Tareas"
  const tasks: Task[] = useMemo(() => {
    // Tomamos las ultimas 5 notificaciones o formularios recientes
    return notifications.slice(0, 5).map(notif => {
      // Encontrar form relacionado para más detalle si es necesario
      // Por ahora usamos datos de notif
      return {
        id: notif.id,
        title: `Orden Publicidad: ${notif.ordenPublicidad}`,
        status: 'pending', // Default
        priority: 'medium',
        area: 'Comercial',
        assignee: notif.responsable.split(' ')[0], // Nombre
        dueDate: format(notif.timestamp, 'dd MMM', { locale: es })
      };
    });
  }, [notifications]);

  // Si no hay tareas reales (al inicio), mostrar algunas vacías o mensaje, 
  // pero para mantener diseño original si está vacío, podemos dejar array vacío.
  // O mejor, si no hay notificaciones, mostramos los formularios más recientes como tareas
  const displayTasks: Task[] = tasks.length > 0 ? tasks : formularios.slice(0, 3).map(f => ({
    id: f.id,
    title: `${f.razonSocial || 'Sin Cliente'} - ${f.nombreCampana || 'Campaña'}`,
    status: 'in_progress',
    priority: 'high',
    area: 'Comercial',
    assignee: f.responsable ? f.responsable.split(' ')[0] : 'Sist',
    dueDate: f.fecha ? f.fecha : 'Hoy'
  }));


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'review': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProgramStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Avoid divide by zero

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  // Alertas del sistema basadas en logs recientes de error/warning
  const systemAlerts = useMemo(() => {
    return logs
      .filter(l => l.result === 'warning' || l.result === 'error')
      .slice(0, 3)
      .map(l => ({
        type: l.result,
        title: l.action.replace(/_/g, ' '),
        message: l.details
      }));
  }, [logs]);

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Presupuesto Mensual (Est.)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${(metrics.budgetTotal / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% vs mes anterior
            </p>
            <div className="mt-3">
              <Sparkline data={metrics.budget} color="#00c950" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ventas del Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#fb2c36]" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${(metrics.salesTotal / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-[#fb2c36] flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Calculado de formularios
            </p>
            <div className="mt-3">
              <Sparkline data={metrics.sales} color="#fb2c36" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Audiencia Promedio</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(metrics.audienceTotal / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +68% crecimiento
            </p>
            <div className="mt-3">
              <Sparkline data={metrics.audience} color="#3b82f6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bandeja de Entrada - Tareas Pendientes */}
        <Card className={`lg:col-span-2 ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <CheckCircle className="h-5 w-5 text-[#fb2c36]" />
                Bandeja de Entrada
              </CardTitle>
              <Badge className="bg-[#fb2c36] text-white">{displayTasks.length} pendientes</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {displayTasks.length === 0 ? (
                <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay tareas pendientes
                </div>
              ) : displayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 border rounded-lg hover:border-opacity-70 transition-colors cursor-pointer ${isDark
                    ? 'bg-[#141414] border-gray-800 hover:border-gray-700'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${isDark
                          ? 'bg-gray-800/50 text-gray-400 border-gray-700'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                          {task.area}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status === 'pending' ? 'Pendiente' : task.status === 'in_progress' ? 'En Progreso' : 'Revisión'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Vence</div>
                        <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{task.dueDate}</div>
                      </div>
                      <Avatar className="h-8 w-8 bg-[#fb2c36] text-white">
                        <AvatarFallback className="bg-[#fb2c36] text-white text-xs">
                          {task.assignee.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendario de Programación */}
        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="h-5 w-5 text-[#fb2c36]" />
              Programación de Hoy
            </CardTitle>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {programSchedule.map((event, index) => (
                <div
                  key={index}
                  className={`p-2.5 border rounded-lg hover:border-opacity-70 transition-colors ${isDark
                    ? 'bg-[#141414] border-gray-800 hover:border-gray-700'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <Clock className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${getProgramStatusColor(event.status)}`} />
                        <h4 className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{event.duration}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                        <span className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {event.status === 'live' ? 'En Vivo' : event.status === 'upcoming' ? 'Próximo' : 'Completado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Notificaciones */}
      <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {systemAlerts.length > 0 ? systemAlerts.map((alert, idx) => (
              <div key={idx} className={`p-3 border rounded-lg ${alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
                }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                  <div>
                    <h4 className={`text-sm font-medium ${alert.type === 'error' ? (isDark ? 'text-red-400' : 'text-red-700') : (isDark ? 'text-yellow-400' : 'text-yellow-700')
                      } capitalize`}>{alert.title}</h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{alert.message}</p>
                  </div>
                </div>
              </div>
            )) : (
              // Fallback / Example alerts if no real errors
              <>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>Sistema Operativo</h4>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Todos los sistemas funcionando correctamente.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}