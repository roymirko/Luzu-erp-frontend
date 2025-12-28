import { TrendingUp, Users, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useTheme } from '../contexts/ThemeContext';

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

const mockTasks: Task[] = [
  { id: '1', title: 'Propuesta comercial Tech Corp S.A.', status: 'pending', priority: 'high', area: 'Comercial', assignee: 'JL', dueDate: 'Hoy' },
  { id: '2', title: 'Contrato Streaming Q1 2024', status: 'in_progress', priority: 'medium', area: 'Implementación', assignee: 'AR', dueDate: 'Mañana' },
  { id: '3', title: 'Renovación patrocinio Media Plus', status: 'review', priority: 'low', area: 'Programación', assignee: 'MS', dueDate: 'En 3 días' },
];

const programSchedule: ProgramEvent[] = [
  { time: '15:00', title: 'Resumen de Noticias Tech', duration: '30 min', status: 'live' },
  { time: '16:00', title: 'Entrevista con fundadores', duration: '45 min', status: 'upcoming' },
  { time: '17:00', title: 'Análisis de mercado', duration: '60 min', status: 'upcoming' },
  { time: '18:30', title: 'Gaming Stream', duration: '90 min', status: 'upcoming' },
];

const metrics = {
  budget: [45, 52, 48, 65, 72, 78, 82],
  sales: [30, 35, 42, 48, 55, 60, 65],
  audience: [120, 135, 155, 170, 182, 195, 202],
};

export function Dashboard() {
  const { isDark } = useTheme();

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
    const range = max - min;
    
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

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Presupuesto Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$82.4K</div>
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
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$65.2K</div>
            <p className="text-xs text-[#fb2c36] flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +18.2% vs mes anterior
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
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>202K</div>
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
              <Badge className="bg-[#fb2c36] text-white">{mockTasks.length} pendientes</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {mockTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-3 border rounded-lg hover:border-opacity-70 transition-colors cursor-pointer ${
                    isDark 
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
                        <Badge variant="outline" className={`text-xs ${
                          isDark 
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
                          {task.assignee}
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
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Viernes, 26 de Diciembre</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {programSchedule.map((event, index) => (
                <div 
                  key={index} 
                  className={`p-2.5 border rounded-lg hover:border-opacity-70 transition-colors ${
                    isDark 
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
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-400">Contrato próximo a vencer</h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>El contrato con "Tech Sponsor Corp" vence en 5 días. Requiere renovación.</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-400">Aprobación urgente requerida</h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>2 propuestas comerciales requieren aprobación antes del cierre de mes.</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-400">Meta de ventas alcanzada</h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>El equipo comercial ha superado la meta mensual en un 15%.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}