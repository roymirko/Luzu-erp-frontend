import { useState, useEffect } from 'react';
import { useTheme, ThemeProvider } from './contexts/ThemeContext';
import { FormulariosProvider } from './contexts/FormulariosContext';
import { FormFieldsProvider } from './contexts/FormFieldsContext';
import { LogProvider } from './contexts/LogContext';
import { DataProvider, useData } from './contexts/DataContext';
import { Menu, Home, Briefcase, Settings, TrendingUp, ChevronRight } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { FormularioInteligente } from './components/FormularioInteligente';
import { FormBuilder } from './components/FormBuilder';
import { Configuraciones } from './components/Configuraciones';
import { Login } from './components/Login';
import { NotificationsPanel } from './components/NotificationsPanel';
import { UserMenu } from './components/UserMenu';
import { ProfilePanel } from './components/ProfilePanel';
import { TablaFormularios } from './components/TablaFormularios';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Button } from './components/ui/button';
import { Toaster } from 'sonner';
import imgLogoLuzu from "../assets/logo-luzu-2025 1.png";
import imgLogoLuzuSmall from "../assets/loguito.png";
import imgContainer from "../assets/Container.png";

// Luzu ERP - Sistema de gestión empresarial
type View = 'dashboard' | 'formulario' | 'formbuilder' | 'comercial' | 'implementacion' | 'programacion' | 'configuraciones' | 'editar-formulario';

function AppContent() {
  const { isDark } = useTheme();
  const { users, currentUser, setCurrentUser, login } = useData();
  const [activeView, setActiveView] = useState<View>('comercial');
  // Inicializar estado del sidebar basado en el dispositivo
  // Web (Desktop): Expandido por defecto (true)
  // Mobile: Colapsado por defecto (false)
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Si hay un currentUser en localStorage, está autenticado
    return !!currentUser;
  });
  const [editingFormularioId, setEditingFormularioId] = useState<string | null>(null);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  // Control de tema basado en isDark
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleLogin = async (email?: string) => {
    // Si se proporciona un email específico, usarlo
    if (email) {
      const result = await login(email);
      if (result.success) {
        setIsAuthenticated(true);
        return;
      }
    }

    // Intentar login con usuario seed (Gabriela)
    let result = await login('gabriela.rivero@gmail.com');

    if (result.success) {
      setIsAuthenticated(true);
      return;
    }

    // Si falla, intentamos con fallback legacy o mock
    result = await login('miguel@luzu.tv');
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      console.warn('Login fallido. Verifica que los datos estén en Supabase o que el .env esté configurado.');

      // Fallback para no bloquear la UI si la DB no responde
      setIsAuthenticated(true);
      const mockUser = users.find(u => u.email === 'gabriela.rivero@gmail.com');
      if (mockUser) setCurrentUser(mockUser);
    }
  };

  // Mostrar pantalla de login si no está autenticado
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'comercial' as View, label: 'Comercial', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'implementacion' as View, label: 'Implementación', icon: <Settings className="h-5 w-5" /> },
    { id: 'programacion' as View, label: 'Dir. de Programación', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const getBreadcrumbs = () => {
    switch (activeView) {
      case 'dashboard':
        return ['Inicio', 'Dashboard'];
      case 'formulario':
        return ['Inicio', 'Comercial', 'Nuevo Formulario'];
      case 'editar-formulario':
        return ['Inicio', 'Comercial', 'Editar Formulario'];
      case 'formbuilder':
        return ['Inicio', 'Backoffice'];
      case 'comercial':
        return ['Inicio', 'Comercial'];
      case 'implementacion':
        return ['Inicio', 'Implementación'];
      case 'programacion':
        return ['Inicio', 'Dir. de Programación'];
      case 'configuraciones':
        return ['Inicio', 'Configuraciones'];
      default:
        return ['Inicio'];
    }
  };

  const getBreadcrumbViews = (): (View | null)[] => {
    switch (activeView) {
      case 'formulario':
        return [null, 'comercial', null];
      case 'editar-formulario':
        return [null, 'comercial', null];
      case 'formbuilder':
        return [null, null, null];
      case 'comercial':
        return [null, null];
      case 'implementacion':
        return [null, null];
      case 'programacion':
        return [null, null];
      case 'configuraciones':
        return [null, null];
      default:
        return [null];
    }
  };

  const handleBreadcrumbClick = (view: View | null) => {
    if (view) {
      setActiveView(view);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'formulario':
        return <FormularioInteligente onFormularioGuardado={() => setActiveView('comercial')} />;
      case 'editar-formulario':
        return <FormularioInteligente onFormularioGuardado={() => setActiveView('comercial')} formularioId={editingFormularioId} />;
      case 'formbuilder':
        return <FormBuilder />;
      case 'comercial':
        return (
          <div className="space-y-6">
            <div
              onClick={() => setActiveView('formulario')}
              className={`p-4 border rounded-lg hover:border-[#fb2c36] transition-all cursor-pointer group inline-flex items-center gap-3 ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
                }`}
            >
              <div className="bg-[#fb2c36]/20 p-2.5 rounded-lg group-hover:bg-[#fb2c36]/30 transition-colors">
                <Briefcase className="h-5 w-5 text-[#fb2c36]" />
              </div>
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Nuevo Formulario</h3>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Crear propuesta comercial</p>
              </div>
              <ChevronRight className={`h-4 w-4 ml-2 group-hover:text-[#fb2c36] transition-colors ${isDark ? 'text-gray-600' : 'text-gray-400'
                }`} />
            </div>

            <TablaFormularios
              onEditFormulario={(id) => {
                setEditingFormularioId(id);
                setActiveView('editar-formulario');
              }}
            />
          </div>
        );
      case 'implementacion':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Settings className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Área de Implementación</h3>
              <p className="text-gray-500">Módulo en desarrollo</p>
            </div>
          </div>
        );
      case 'programacion':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Dirección de Programación</h3>
              <p className="text-gray-500">Módulo en desarrollo</p>
            </div>
          </div>
        );
      case 'configuraciones':
        return <Configuraciones />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside
        className={`border-r transition-all duration-300 flex-col ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'
          } ${sidebarOpen ? 'w-64' : 'w-0 md:w-[56px]'
          } ${sidebarOpen ? 'flex fixed md:relative z-50 md:z-auto' : 'hidden md:flex'
          } h-full`}
      >
        {/* Logo */}
        <div className={`border-b px-5 py-3 transition-all duration-300 flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
          <div
            className="flex items-center justify-center cursor-pointer h-10"
            onClick={() => setActiveView('comercial')}
            title="Ir al inicio"
          >
            <img
              src={sidebarOpen ? imgLogoLuzu : imgLogoLuzuSmall}
              alt="Luzu TV"
              className="h-10 w-auto object-contain transition-all duration-300"
            />
          </div>
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className={isDark
                ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e] md:hidden'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden'
              }
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            // Determinar si el item está activo
            const isActive = activeView === item.id ||
              (item.id === 'comercial' && (activeView === 'formulario' || activeView === 'editar-formulario'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center rounded-lg transition-all duration-200 ${sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-2.5'
                  } ${isActive
                    ? 'bg-[#fb2c36] text-white'
                    : isDark
                      ? 'text-gray-400 hover:bg-[#1e1e1e] hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div className="shrink-0">
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Backoffice */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveView('formbuilder')}
            className={`w-full flex items-center rounded-lg transition-all duration-200 ${sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-2.5'
              } ${activeView === 'formbuilder'
                ? 'bg-[#fb2c36] text-white'
                : isDark
                  ? 'text-gray-400 hover:bg-[#1e1e1e] hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            title={!sidebarOpen ? 'Backoffice' : undefined}
          >
            <div className="shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <span className="font-medium truncate">Backoffice</span>
            )}
          </button>
        </div>
      </aside >

      {/* Main Content */}
      < div className="flex-1 flex flex-col overflow-hidden" >
        {/* Navbar */}
        < header className={`border-b px-5 py-3 ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'
          }`
        }>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={isDark
                  ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              >
                <Menu className="h-5 w-5" />
              </Button>

            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationsPanel />

              {/* User */}
              <UserMenu
                onLogout={handleLogout}
                onOpenProfile={() => setProfilePanelOpen(true)}
              />
            </div>
          </div>
        </header >

        {/* Breadcrumbs */}
        < div className={`border-b px-5 py-2.5 ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className={isDark ? 'text-gray-700' : 'text-gray-400'}>/</span>}
                <span
                  className={
                    index === getBreadcrumbs().length - 1
                      ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                      : isDark ? 'text-gray-500 hover:text-gray-400 cursor-pointer' : 'text-gray-600 hover:text-gray-700 cursor-pointer'
                  }
                  onClick={() => handleBreadcrumbClick(getBreadcrumbViews()[index])}
                >
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div >

        {/* Content Area */}
        < main className={`flex-1 overflow-y-auto p-5 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'
          }`}>
          <div className="max-w-[1440px] mx-auto">
            {renderContent()}
          </div>
        </main >
      </div >

      {/* Profile Panel */}
      {
        profilePanelOpen && (
          <ProfilePanel
            onClose={() => setProfilePanelOpen(false)}
          />
        )
      }
    </div >
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LogProvider>
        <DataProvider>
          <FormulariosProvider>
            <FormFieldsProvider>
              <AppContent />
              <Toaster richColors position="top-right" />
            </FormFieldsProvider>
          </FormulariosProvider>
        </DataProvider>
      </LogProvider>
    </ThemeProvider>
  );
}