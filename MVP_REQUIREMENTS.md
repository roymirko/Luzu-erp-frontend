# 📋 LUZU TV ERP - REQUISITOS MVP Y DOCUMENTACIÓN TÉCNICA

> **Documento Unificado de Requisitos y Lógica de Negocio**
> Este documento consolida las reglas de negocio, el modelo de datos y los requisitos del MVP para el ERP de Luzu TV.

---

## 🎯 Resumen Ejecutivo

Sistema ERP completo para la gestión de usuarios, roles y áreas con sistema de auditoría integrado. Implementa reglas de negocio robustas, validaciones exhaustivas y registro automático de todas las acciones críticas del sistema, diseñado específicamente para las operaciones de Luzu TV.

---

## 🏗️ Requisitos del MVP

### 1. Dashboard de Operaciones (Luzu TV)
> [!NOTE]
> Actualmente utiliza datos simulados (mock data) para demostración.

- **Métricas Clave:**
  - Presupuesto Mensual (vs mes anterior)
  - Ventas del Período (vs mes anterior)
  - Audiencia Promedio (Crecimiento)
- **Bandeja de Entrada:** Gestión de tareas pendientes por área.
- **Programación Diaria:** Visualización de programas en vivo y próximos.
- **Alertas del Sistema:** Notificaciones críticas (contratos vencidos, metas alcanzadas).

### 2. Gestión de Usuarios (CRUD Completo)
- **Creación/Edición:** Nombre, email, rol y asignación de área.
- **Validaciones:** Unicidad de email.
- **Seguridad:** No eliminar al último administrador.

### 3. Gestión de Áreas (Departamentos)
- **Creación/Edición:** Nombre, código único, descripción, responsable.
- **Lógica:** Al eliminar área, se eliminan asignaciones pero NO usuarios.

### 4. Roles y Permisos (RBAC)
- **Roles Fijos:** Administrador (Full Access), Editor (Gestión), Visualizador (Solo lectura).
- **Asignación Flexible:** Un usuario puede tener distintos roles en distintas áreas.

### 5. Auditoría (Logs)
- Registro automático de todas las acciones críticas (Login, Altas, Bajas, Modificaciones).
- Visualización de logs con filtros y búsqueda.

---

## 📜 Reglas de Negocio Detalladas

### ✅ RN-01: Usuarios
- **Crear:** Email único. Al menos 1 rol en 1 área.
- **Editar:** Se puede modificar todo excepto datos históricos. Debe mantener al menos 1 asignación.
- **Eliminar:** ❌ No se puede eliminar el último administrador. Se borran todas sus asignaciones.
- **Toggle:** Inactivos no pueden hacer login.

### ✅ RN-02: Áreas
- **Crear:** Código único (2-10 mayúsculas). Descripción obligatoria.
- **Eliminar:** ⚠️ Se eliminan asignaciones vinculadas. Los usuarios permanecen pero sin esa asignación.
- **Toggle:** Áreas inactivas no aparecen en selectores.

### ✅ RN-03: Roles (Sistema Cerrado)
- **Administrador:** CRUD total usuarios, áreas, logs.
- **Editor:** Gestión de formularios y tareas. Read-only usuarios/áreas.
- **Visualizador:** Solo lectura general.

### ✅ RN-04: Auditoría
- **Persistencia:** Supabase.
- **Datos:** Timestamp, Actor, Acción, Entidad afectada, Resultado.

---

## 🏗️ Modelo Lógico de Datos

### Entidades Principales

#### **Usuario (User)**
```typescript
{
  id: string;           // UUID Supabase
  email: string;        // Único
  firstName: string;
  lastName: string;
  active: boolean;
  avatar?: string;
  createdAt: Date;
}
```

#### **Área (Area)**
```typescript
{
  id: string;
  name: string;
  code: string;         // Único (ej: "MKT", "PROD")
  description: string;
  manager?: string;     // ID Usuario responsable
  active: boolean;
  createdAt: Date;
}
```

#### **Asignación (UserAreaRole)**
> Relación N:N entre Usuario y Área con un Rol específico.
```typescript
{
  id: string;
  userId: string;
  areaId: string;
  roleId: string;
  assignedAt: Date;
}
```

#### **Log (AuditLog)**
```typescript
{
  id: string;
  timestamp: Date;
  userId: string;
  action: LogAction;    // 'create_user', 'login', etc.
  entity: LogEntity;    // 'user', 'area', etc.
  result: 'success' | 'error';
  details: string;
}
```

---

## 📂 Arquitectura Técnica

### Estructura de Archivos
```
/src/app/
├── types/business.ts           # Definiciones TypeScript
├── utils/businessRules.ts      # Lógica de validación pura
├── contexts/
│   ├── DataContext.tsx         # Estado global (Usuarios/Áreas)
│   ├── LogContext.tsx          # Estado de Auditoría
│   └── ThemeContext.tsx        # UI Theme
└── components/
    ├── FormBuilder.tsx         # UI Principal de Gestión (Backoffice)
    └── Dashboard.tsx           # Vista principal
```

### Tecnologías Clave
- **Frontend:** React + TypeScript + Tailwind CSS
- **Estado:** React Context API
- **Persistencia:** Supabase
- **Iconos:** Lucide React

---

## 🚀 Validaciones Implementadas

### Formato
| Campo | Regla |
|-------|-------|
| Email | Regex estándar email |
| Area Code| 2-10 Letras Mayúsculas |

### Lógica
- **Integridad Referencial:** No se pueden crear asignaciones a usuarios/áreas inexistentes.
- **Seguridad:** Validaciones de permisos antes de cualquier acción crítica.
- **Consistencia:** Un usuario siempre debe tener al menos un rol asignado.
- **Atribución:** Los formularios y acciones se atribuyen automáticamente al usuario logueado.

### UI/UX
- **Sidebar:** 
  - Colapsado por defecto en inicio.
  - Comportamiento responsivo (Hamburger menu en móvil).
- **Dashboard:**
  - Alertas inteligentes basadas en surplus/deficit presupuestario.

### ✅ RN-05: Lógica de Formularios (Smart Forms)
- **Fechas:** 
  - Al crear, solo permite seleccionar año actual o futuro.
  - Si es año actual, solo permite meses actuales o futuros.
  - En edición, se permite histórico completo (desde 2020).
- **Dependencias de Campos:**
  - `Proyecto` depende de `Unidad de Negocio`.
  - Reglas específicas para 'Media', 'Experience' y 'Productora'.
  - Limpieza automática de campos dependientes al cambiar el padre.
  - **Validación Condicional:** Si un campo está bloqueado/deshabilitado por reglas de negocio, NO es obligatorio.
  - **Proveedor FEE:** Debe comportarse como campo de búsqueda y escritura libre (ComboBox), no limitado a opciones predefinidas.
- **Cálculos Automáticos:**
  - `NC Programa` = Monto * (NC % / 100)
  - `Fee Programa` = Monto * (Fee % / 100)
  - `Utilidad` = Total Venta - (Notas Crédito + Fee + Gastos Venta)
- **Validaciones Financieras:**
  - Alerta visual si la suma de programas supera el Total de Venta.
  - Bloqueo de importes que superan el presupuesto individualmente.
  - **Validación de Totales (Guardar):** La suma de los montos de todos los programas debe ser EXACTAMENTE igual al Total de Venta.
  - **Validación de Topes por Programa:** La suma de `Implementación` + `Talentos` + `Técnica` NO puede superar el `Monto` asignado a ese programa.
  - **Alerta Visual Inline:** Se debe mostrar una etiqueta de advertencia claramente visible ("El desglose supera el monto asignado") junto al título del programa si el desglose excede el monto asignado, sin necesidad de guardar el formulario.
  - **Programas Duplicados:** No se permite asignar el mismo programa más de una vez en la misma orden. Se debe mostrar una alerta visual ("Este programa ya fue agregado") y bloquear el guardado.

---

## 🔮 Roadmap Post-MVP

1. **Auth Robusta:** Implementación completa de RLS en Supabase.
2. **Reportes:** Exportación a PDF/Excel.
3. **Notificaciones:** Sistema realtime (WebSockets).

