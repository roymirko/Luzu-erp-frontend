import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useTheme, ThemeProvider } from "./contexts/ThemeContext";
import { FormulariosProvider } from "./contexts/FormulariosContext";
import { FormFieldsProvider } from "./contexts/FormFieldsContext";
import { LogProvider } from "./contexts/LogContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { ImplementacionProvider } from "./contexts/ImplementacionContext";
import { TecnicaProvider } from "./contexts/TecnicaContext";
import { TalentosProvider } from "./contexts/TalentosContext";
import {
  Menu,
  Briefcase,
  Settings,
  TrendingUp,
  Key,
  Plus,
  Sparkles,
  DollarSign,
  Building,
  Wrench,
  Clapperboard,
  Star,
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
// Lazy-loaded heavy components
const OrdenesPublicidadForm = lazy(() => import("./components/OrdenesPublicidadForm").then(m => ({ default: m.OrdenesPublicidadForm })));
const FormBuilder = lazy(() => import("./components/FormBuilder").then(m => ({ default: m.FormBuilder })));
import { Configuraciones } from "./components/Configuraciones";
import { Login } from "./components/Login";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { UserMenu } from "./components/UserMenu";
import { ProfilePanel } from "./components/ProfilePanel";
import { TablaFormularios } from "./components/TablaFormularios";
import { Implementaciones } from "./components/Implementaciones";
import { FormularioImplementacion } from "./components/FormularioImplementacion";
import { Tecnica } from "./components/Tecnica";
import { FormularioTecnica } from "./components/FormularioTecnica";
import { Talentos } from "./components/Talentos";
import { FormularioTalentos } from "./components/FormularioTalentos";
import { Programacion } from "./components/Programacion";
import { FormularioProgramacion } from "./components/programacion/FormularioProgramacion";
import { ProgramacionProvider } from "./contexts/ProgramacionContext";
import { ExperienceProvider, useExperience } from "./contexts/ExperienceContext";
import { Experience } from "./components/Experience";
import { ExperienceForm } from "./components/experience/ExperienceForm";
import { ProductoraProvider, useProductora } from "./contexts/ProductoraContext";
import { Productora } from "./components/Productora";
import { ProductoraForm } from "./components/productora/ProductoraForm";
import { Finanzas } from "./components/finanzas/Finanzas";
import { Administracion } from "./components/administracion/Administracion";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { ActionCard } from "./components/ui/action-card";
import { cn } from "./components/ui/utils";
import { Toaster } from "sonner";
import imgLogoLuzu from "../assets/logo-luzu-2025 1.png";
import imgLogoLuzuSmall from "../assets/loguito.png";
import imgContainer from "../assets/Container.png";

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
  </div>
);

// Hoisted outside component to prevent recreation on every render
const menuItems = [
  {
    id: "comercial",
    path: "/comercial",
    label: "Comercial",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "implementacion",
    path: "/implementacion",
    label: "Implementación",
    icon: <Key className="h-5 w-5" />,
  },
  {
    id: "tecnica",
    path: "/tecnica",
    label: "Técnica",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    id: "talentos",
    path: "/talentos",
    label: "Talentos",
    icon: <Star className="h-5 w-5" />,
  },
  {
    id: "programacion",
    path: "/programacion",
    label: "Programación",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "experience",
    path: "/experience",
    label: "Experience",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "productora",
    path: "/productora",
    label: "Productora",
    icon: <Clapperboard className="h-5 w-5" />,
  },
  {
    id: "finanzas",
    path: "/finanzas",
    label: "Finanzas",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    id: "administracion",
    path: "/administracion",
    label: "Administración",
    icon: <Building className="h-5 w-5" />,
  },
];

function AppContent() {
  const { isDark } = useTheme();
  const { currentUser, setCurrentUser, login, loginWithGoogle } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 768,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!currentUser);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/");
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      setIsAuthenticated(true);
    }
    return result;
  };

  const handleCloseProfile = useCallback(() => setProfilePanelOpen(false), []);

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;

    if (path === "/" || path === "/comercial") {
      return [
        { label: "Inicio", path: null },
        { label: "Comercial", path: null },
      ];
    }
    if (path === "/comercial/nuevo") {
      return [
        { label: "Inicio", path: null },
        { label: "Comercial", path: "/comercial" },
        { label: "Nuevo Formulario", path: null },
      ];
    }
    if (path.startsWith("/comercial/editar/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Comercial", path: "/comercial" },
        { label: "Editar Formulario", path: null },
      ];
    }
    if (path === "/implementacion") {
      return [
        { label: "Inicio", path: null },
        { label: "Implementación", path: null },
      ];
    }
    if (path.startsWith("/implementacion/gasto/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Implementación", path: "/implementacion" },
        { label: "Gasto", path: null },
      ];
    }
    if (path === "/tecnica") {
      return [
        { label: "Inicio", path: null },
        { label: "Técnica", path: null },
      ];
    }
    if (path === "/tecnica/nuevo") {
      return [
        { label: "Inicio", path: null },
        { label: "Técnica", path: "/tecnica" },
        { label: "Nuevo Formulario", path: null },
      ];
    }
    if (path.startsWith("/tecnica/editar/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Técnica", path: "/tecnica" },
        { label: "Editar Gasto", path: null },
      ];
    }
    if (path.startsWith("/tecnica/gasto/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Técnica", path: "/tecnica" },
        { label: "Gasto", path: null },
      ];
    }
    if (path === "/talentos") {
      return [
        { label: "Inicio", path: null },
        { label: "Talentos", path: null },
      ];
    }
    if (path.startsWith("/talentos/gasto/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Talentos", path: "/talentos" },
        { label: "Gasto", path: null },
      ];
    }
    if (path === "/programacion") {
      return [
        { label: "Inicio", path: null },
        { label: "Programación", path: null },
      ];
    }
    if (path === "/programacion/nuevo") {
      return [
        { label: "Inicio", path: null },
        { label: "Programación", path: "/programacion" },
        { label: "Nuevo Gasto", path: null },
      ];
    }
    if (path.startsWith("/programacion/editar/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Programación", path: "/programacion" },
        { label: "Editar Gasto", path: null },
      ];
    }
    if (path === "/experience") {
      return [
        { label: "Inicio", path: null },
        { label: "Experience", path: null },
      ];
    }
    if (path === "/experience/nuevo") {
      return [
        { label: "Inicio", path: null },
        { label: "Experience", path: "/experience" },
        { label: "Nuevo formulario", path: null },
      ];
    }
    if (path.startsWith("/experience/editar/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Experience", path: "/experience" },
        { label: "Editar formulario", path: null },
      ];
    }
    if (path === "/productora") {
      return [
        { label: "Inicio", path: null },
        { label: "Productora", path: null },
      ];
    }
    if (path === "/productora/nuevo") {
      return [
        { label: "Inicio", path: null },
        { label: "Productora", path: "/productora" },
        { label: "Nuevo formulario", path: null },
      ];
    }
    if (path.startsWith("/productora/editar/")) {
      return [
        { label: "Inicio", path: null },
        { label: "Productora", path: "/productora" },
        { label: "Editar formulario", path: null },
      ];
    }
    if (path === "/backoffice") {
      return [
        { label: "Inicio", path: null },
        { label: "Backoffice", path: null },
      ];
    }
    if (path === "/finanzas") {
      return [
        { label: "Inicio", path: null },
        { label: "Finanzas", path: null },
      ];
    }
    if (path === "/administracion") {
      return [
        { label: "Inicio", path: null },
        { label: "Administración", path: null },
      ];
    }
    return [{ label: "Inicio", path: null }];
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onGoogleLogin={loginWithGoogle} />;
  }

  const isMenuActive = (menuPath: string) => {
    return location.pathname === menuPath || location.pathname.startsWith(menuPath + "/");
  };

  return (
    <div
      className={cn("flex h-screen overflow-hidden", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}
    >
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r transition-all duration-300 flex-col h-full",
          isDark ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200",
          sidebarOpen ? "w-64 flex fixed md:relative z-50 md:z-auto" : "w-0 md:w-[56px] hidden md:flex"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "border-b px-5 py-3 transition-all duration-300 flex items-center justify-between",
            isDark ? "border-gray-800" : "border-gray-200"
          )}
        >
          <div
            className="flex items-center justify-center cursor-pointer h-10"
            onClick={() => navigate("/comercial")}
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
              className={cn(
                "md:hidden",
                isDark ? "text-gray-400 hover:text-white hover:bg-[#1e1e1e]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = isMenuActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200",
                  sidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-2.5",
                  isActive && "bg-[#fb2c36] text-white",
                  !isActive && isDark && "text-gray-400 hover:bg-[#1e1e1e] hover:text-white",
                  !isActive && !isDark && "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div className="shrink-0">{item.icon}</div>
                {sidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Backoffice */}
        <div
          className={`p-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <button
            onClick={() => navigate("/backoffice")}
            className={cn(
              "w-full flex items-center rounded-lg transition-all duration-200",
              sidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-2.5",
              location.pathname === "/backoffice" && "bg-[#fb2c36] text-white",
              location.pathname !== "/backoffice" && isDark && "text-gray-400 hover:bg-[#1e1e1e] hover:text-white",
              location.pathname !== "/backoffice" && !isDark && "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
            title={!sidebarOpen ? "Backoffice" : undefined}
          >
            <div className="shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <span className="font-medium truncate">Backoffice</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header
          className={cn(
            "border-b px-5 py-3",
            isDark ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={cn(
                  isDark ? "text-gray-400 hover:text-white hover:bg-[#1e1e1e]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
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
        </header>

        {/* Breadcrumbs */}
        <div
          className={cn(
            "border-b px-5 py-2.5",
            isDark ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <span className={isDark ? "text-gray-700" : "text-gray-400"}>
                    /
                  </span>
                )}
                <span
                  className={cn(
                    index === breadcrumbs.length - 1 && "font-medium",
                    index === breadcrumbs.length - 1 && isDark && "text-white",
                    index === breadcrumbs.length - 1 && !isDark && "text-gray-900",
                    index !== breadcrumbs.length - 1 && crumb.path && "cursor-pointer",
                    index !== breadcrumbs.length - 1 && crumb.path && isDark && "text-gray-500 hover:text-gray-400",
                    index !== breadcrumbs.length - 1 && crumb.path && !isDark && "text-gray-600 hover:text-gray-700",
                    index !== breadcrumbs.length - 1 && !crumb.path && isDark && "text-gray-500",
                    index !== breadcrumbs.length - 1 && !crumb.path && !isDark && "text-gray-600"
                  )}
                  onClick={() => crumb.path && navigate(crumb.path)}
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <main
          className={cn("flex-1 overflow-y-auto p-5", isDark ? "bg-[#0a0a0a]" : "bg-white")}
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="max-w-[1440px] mx-auto">
            <Routes>
              <Route path="/" element={<ComercialPage />} />
              <Route path="/comercial" element={<ComercialPage />} />
              <Route path="/comercial/nuevo" element={<NuevoFormularioPage />} />
              <Route path="/comercial/editar/:id" element={<EditarFormularioPage />} />
              <Route path="/implementacion" element={<ImplementacionPage />} />
              <Route path="/implementacion/gasto/:formId" element={<GastoImplementacionPage />} />
              <Route path="/implementacion/gasto/:formId/:itemId" element={<GastoImplementacionPage />} />
              <Route path="/talentos" element={<TalentosPage />} />
              <Route path="/talentos/gasto/:formId" element={<GastoTalentosPage />} />
              <Route path="/talentos/gasto/:formId/:itemId" element={<GastoTalentosPage />} />
              <Route path="/tecnica" element={<TecnicaPage />} />
              <Route path="/tecnica/nuevo" element={<NuevoGastoTecnicaPage />} />
              <Route path="/tecnica/editar/:gastoId" element={<EditarGastoTecnicaPage />} />
              <Route path="/tecnica/gasto/:formId" element={<GastoTecnicaPage />} />
              <Route path="/tecnica/gasto/:formId/:itemId" element={<GastoTecnicaPage />} />
              <Route path="/programacion" element={<ProgramacionPage />} />
              <Route path="/programacion/nuevo" element={<NuevoGastoProgramacionPage />} />
              <Route path="/programacion/editar/:id" element={<EditarGastoProgramacionPage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/experience/nuevo" element={<ExperienceNuevoPage />} />
              <Route path="/experience/editar/:id" element={<ExperienceEditarPage />} />
              <Route path="/productora" element={<ProductoraPage />} />
              <Route path="/productora/nuevo" element={<ProductoraNuevoPage />} />
              <Route path="/productora/editar/:id" element={<ProductoraEditarPage />} />
              <Route path="/finanzas" element={<FinanzasPage />} />
              <Route path="/administracion" element={<AdministracionPage />} />
              <Route path="/backoffice" element={<Suspense fallback={<LoadingFallback />}><FormBuilder /></Suspense>} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Profile Panel */}
      {profilePanelOpen && (
        <ProfilePanel onClose={handleCloseProfile} />
      )}
    </div>
  );
}

function ComercialPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <ActionCard
        title="Nuevo Formulario"
        description="Crear propuesta comercial"
        icon={Briefcase}
        onClick={() => navigate("/comercial/nuevo")}
      />

      <TablaFormularios
        onEditFormulario={(id) => navigate(`/comercial/editar/${id}`)}
      />
    </div>
  );
}

function NuevoFormularioPage() {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrdenesPublicidadForm
        onFormularioGuardado={() => navigate("/comercial")}
        onCancel={() => navigate("/comercial")}
      />
    </Suspense>
  );
}

function EditarFormularioPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrdenesPublicidadForm
        formularioId={id}
        onFormularioGuardado={() => navigate("/comercial")}
        onCancel={() => navigate("/comercial")}
      />
    </Suspense>
  );
}

function ImplementacionPage() {
  const navigate = useNavigate();
  return (
    <Implementaciones
      onOpen={(formId, itemId) => {
        if (itemId) {
          navigate(`/implementacion/gasto/${formId}/${itemId}`);
        } else {
          navigate(`/implementacion/gasto/${formId}`);
        }
      }}
    />
  );
}

function GastoImplementacionPage() {
  const navigate = useNavigate();
  const { formId, itemId } = useParams();
  return (
    <FormularioImplementacion
      formId={formId}
      itemId={itemId}
      onClose={() => navigate("/implementacion")}
    />
  );
}

function TalentosPage() {
  const navigate = useNavigate();
  return (
    <Talentos
      onOpen={(formId, itemId) => {
        if (itemId) {
          navigate(`/talentos/gasto/${formId}/${itemId}`);
        } else {
          navigate(`/talentos/gasto/${formId}`);
        }
      }}
    />
  );
}

function GastoTalentosPage() {
  const navigate = useNavigate();
  const { formId, itemId } = useParams();
  return (
    <FormularioTalentos
      formId={formId}
      itemId={itemId}
      onClose={() => navigate("/talentos")}
    />
  );
}

function TecnicaPage() {
  const navigate = useNavigate();
  return (
    <Tecnica
      onOpen={(formId, itemId) => {
        if (itemId) {
          navigate(`/tecnica/gasto/${formId}/${itemId}`);
        } else {
          navigate(`/tecnica/gasto/${formId}`);
        }
      }}
      onOpenStandalone={(gastoId) => navigate(`/tecnica/editar/${gastoId}`)}
      onNew={() => navigate("/tecnica/nuevo")}
    />
  );
}

function NuevoGastoTecnicaPage() {
  const navigate = useNavigate();
  return (
    <FormularioTecnica onClose={() => navigate("/tecnica")} />
  );
}

function GastoTecnicaPage() {
  const navigate = useNavigate();
  const { formId, itemId } = useParams();
  return (
    <FormularioTecnica
      formId={formId}
      itemId={itemId}
      onClose={() => navigate("/tecnica")}
    />
  );
}

function EditarGastoTecnicaPage() {
  const navigate = useNavigate();
  const { gastoId } = useParams();
  return (
    <FormularioTecnica
      gastoId={gastoId}
      onClose={() => navigate("/tecnica")}
    />
  );
}

function ProgramacionPage() {
  const navigate = useNavigate();
  return (
    <Programacion
      onOpen={(gastoId) => navigate(`/programacion/editar/${gastoId}`)}
      onNew={() => navigate("/programacion/nuevo")}
    />
  );
}

function NuevoGastoProgramacionPage() {
  const navigate = useNavigate();
  return (
    <FormularioProgramacion onClose={() => navigate("/programacion")} />
  );
}

function EditarGastoProgramacionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <FormularioProgramacion
      gastoId={id}
      onClose={() => navigate("/programacion")}
    />
  );
}

function ExperiencePage() {
  const navigate = useNavigate();
  return (
    <Experience
      onNew={() => navigate("/experience/nuevo")}
      onOpen={(id) => navigate(`/experience/editar/${id}`)}
    />
  );
}

function ExperienceNuevoPage() {
  const navigate = useNavigate();
  return (
    <ExperienceForm
      onCancel={() => navigate("/experience")}
      onSave={() => navigate("/experience")}
    />
  );
}

function ExperienceEditarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getGastoById } = useExperience();
  const { users } = useData();

  const existingGasto = id ? getGastoById(id) : undefined;

  // Look up user name from createdBy UUID
  const getResponsableName = (createdById: string | undefined) => {
    if (!createdById) return '-';
    const user = users.find(u => u.id === createdById);
    return user ? `${user.firstName} ${user.lastName}` : '-';
  };

  const existingFormulario = existingGasto
    ? {
        responsable: getResponsableName(existingGasto.formularioCreatedBy || existingGasto.createdBy),
        fechaRegistro: existingGasto.formularioCreatedAt?.toISOString() || existingGasto.createdAt?.toISOString(),
        formularioEstado: existingGasto.formularioEstado as 'abierto' | 'cerrado' | 'anulado' | undefined,
      }
    : undefined;

  return (
    <ExperienceForm
      gastoId={id}
      existingFormulario={existingFormulario}
      onCancel={() => navigate("/experience")}
      onSave={() => navigate("/experience")}
    />
  );
}

function ProductoraPage() {
  const navigate = useNavigate();
  return (
    <Productora
      onNew={() => navigate("/productora/nuevo")}
      onOpen={(id) => navigate(`/productora/editar/${id}`)}
    />
  );
}

function ProductoraNuevoPage() {
  const navigate = useNavigate();
  return (
    <ProductoraForm
      onCancel={() => navigate("/productora")}
      onSave={() => navigate("/productora")}
    />
  );
}

function ProductoraEditarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getGastoById } = useProductora();

  const existingGasto = id ? getGastoById(id) : undefined;

  const existingFormulario = existingGasto
    ? {
        formularioEstado: existingGasto.formularioEstado as 'abierto' | 'cerrado' | 'anulado' | undefined,
      }
    : undefined;

  return (
    <ProductoraForm
      gastoId={id}
      existingFormulario={existingFormulario}
      onCancel={() => navigate("/productora")}
      onSave={() => navigate("/productora")}
    />
  );
}

function FinanzasPage() {
  return <Finanzas />;
}

function AdministracionPage() {
  return <Administracion />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LogProvider>
          <DataProvider>
            <FormulariosProvider>
              <FormFieldsProvider>
                <ImplementacionProvider>
                  <TalentosProvider>
                  <TecnicaProvider>
                    <ProgramacionProvider>
                      <ExperienceProvider>
                        <ProductoraProvider>
                          <AppContent />
                          <Toaster richColors position="top-right" />
                        </ProductoraProvider>
                      </ExperienceProvider>
                    </ProgramacionProvider>
                  </TecnicaProvider>
                  </TalentosProvider>
                </ImplementacionProvider>
              </FormFieldsProvider>
            </FormulariosProvider>
          </DataProvider>
        </LogProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

