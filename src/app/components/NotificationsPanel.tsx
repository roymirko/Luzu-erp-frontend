import { useState } from 'react';
import { Bell, CheckCheck, FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, removeNotification } = useFormularios();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) !== 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) !== 1 ? 's' : ''}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative inline-flex items-center justify-center h-10 w-10 rounded-md transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#fb2c36] rounded-full animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={`w-[400px] p-0 ${
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        }`}
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge className="bg-[#fb2c36] text-white">
                {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsRead}
              className={`h-7 text-xs -ml-2 ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className={`h-12 w-12 mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>No tienes notificaciones</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {notifications.map((notification) => {
                // Obtener las iniciales del responsable
                const initials = notification.responsable
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors cursor-pointer group relative ${
                      isDark 
                        ? `hover:bg-[#141414] ${!notification.read ? 'bg-[#141414]/50' : ''}`
                        : `hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''}`
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 shrink-0 bg-[#fb2c36] text-white">
                        <AvatarFallback className="bg-[#fb2c36] text-white text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium mb-0.5 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              Nuevo Formulario Comercial
                            </p>
                            <p className={`text-xs line-clamp-2 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {notification.responsable} cargó el formulario "{notification.ordenPublicidad}"
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className={`h-3.5 w-3.5 ${
                              isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                            }`} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#fb2c36]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <Button
              variant="ghost"
              className={`w-full ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
              size="sm"
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}