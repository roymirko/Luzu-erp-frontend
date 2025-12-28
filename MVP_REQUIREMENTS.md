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
- **Persistencia:** LocalStorage (MVP).
- **Datos:** Timestamp, Actor, Acción, Entidad afectada, Resultado.

---

## 🏗️ Modelo Lógico de Datos

### Entidades Principales

#### **Usuario (User)**
```typescript
{
  id: string;
  email: string;        // Único
  firstName: string;
  lastName: string;
  active: boolean;
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
- **Persistencia:** LocalStorage (MVP)
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

---

## 🔮 Roadmap Post-MVP

1. **Backend Real:** Migración a Supabase/Firebase.
2. **Auth Robusta:** JWT + Refresh Tokens.
3. **Reportes:** Exportación a PDF/Excel.
4. **Notificaciones:** Sistema realtime (WebSockets).
