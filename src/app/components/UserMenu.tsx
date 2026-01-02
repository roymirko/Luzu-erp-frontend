import { useState } from 'react';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import imgGabrielProfile from "../../assets/GabrielRivero.jpg";

interface UserMenuProps {
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

export function UserMenu({ onLogout, onOpenProfile }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const { currentUser } = useData();

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleOpenProfile = () => {
    setOpen(false);
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  // Nombre para mostrar
  const displayName = currentUser ? currentUser.firstName : 'Usuario';
  const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario Invitado';
  const email = currentUser ? currentUser.email : '';
  const role = currentUser?.metadata?.position || 'Usuario';
  const avatarSrc = currentUser?.avatar || imgGabrielProfile;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Hola, <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName}</span>
            </p>
          </div>
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-[#fb2c36]/20">
              <img src={avatarSrc} alt="Usuario" className="object-cover" />
              <AvatarFallback className="bg-[#fb2c36] text-white">
                {currentUser ? `${currentUser.firstName[0]}${currentUser.lastName[0]}` : 'US'}
              </AvatarFallback>
            </Avatar>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[280px] p-0 ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}
        align="end"
        sideOffset={8}
      >
        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <img src={avatarSrc} alt="Usuario" className="object-cover" />
                <AvatarFallback className="bg-[#fb2c36] text-white">
                  {currentUser ? `${currentUser.firstName[0]}${currentUser.lastName[0]}` : 'US'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{fullName}</p>
              <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{role}</p>
              <p className={`text-xs truncate ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>{email}</p>
            </div>
          </div>
        </div>

        <Separator className={isDark ? 'bg-gray-800' : 'bg-gray-200'} />

        {/* Menu Items */}
        <div className="p-2">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isDark
              ? 'text-gray-300 hover:text-white hover:bg-[#141414]'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            onClick={handleOpenProfile}
          >
            <User className="mr-3 h-4 w-4" />
            Mi Perfil
          </Button>
        </div>

        <Separator className={isDark ? 'bg-gray-800' : 'bg-gray-200'} />

        {/* Theme Selector */}
        <div className="p-2">
          <p className={`text-xs px-3 py-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Apariencia</p>
          <div className="grid grid-cols-2 gap-2 px-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${theme === 'light'
                ? 'bg-[#fb2c36]'
                : isDark
                  ? 'bg-[#141414] hover:bg-gray-800'
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-xs ${theme === 'light' ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-700'}`}>Claro</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-[#fb2c36]'
                : isDark
                  ? 'bg-[#141414] hover:bg-gray-800'
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-700'}`}>Oscuro</span>
            </button>
          </div>
        </div>

        <Separator className={isDark ? 'bg-gray-800' : 'bg-gray-200'} />

        {/* Logout */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}