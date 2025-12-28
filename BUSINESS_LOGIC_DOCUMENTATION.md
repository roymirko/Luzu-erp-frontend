# 📋 DOCUMENTACIÓN DEL SISTEMA DE GESTIÓN ERP - LUZU TV

## 🎯 Resumen Ejecutivo

Sistema ERP completo para la gestión de usuarios, roles y áreas con sistema de auditoría integrado. Implementa reglas de negocio robustas, validaciones exhaustivas y registro automático de todas las acciones críticas del sistema.

---

## 🏗️ Modelo Lógico de Datos

### 1. Entidades Principales

#### **Usuario (User)**
```typescript
{
  id: string;                    // Identificador único
  email: string;                 // Email único del usuario
  firstName: string;             // Nombre
  lastName: string;              // Apellido
  username: string;              // Username único (3-20 caracteres)
  avatar?: string;               // URL del avatar
  active: boolean;               // Estado activo/inactivo
  createdAt: Date;               // Fecha de creación
  updatedAt: Date;               // Última actualización
  lastLogin?: Date;              // Último inicio de sesión
  createdBy: string;             // ID del usuario creador
  metadata?: {
    phone?: string;              // Teléfono
    position?: string;           // Cargo en la empresa
  }
}
```

**Campos obligatorios:**
- Email (formato válido)
- Nombre y apellido
- Username (alfanumérico, 3-20 caracteres)
- Contraseña (al crear, mín. 8 caracteres con mayúscula, minúscula y número)

---

#### **Área (Area)**
```typescript
{
  id: string;                    // Identificador único
  name: string;                  // Nombre del área
  description: string;           // Descripción
  code: string;                  // Código único (2-10 caracteres en mayúsculas)
  manager?: string;              // ID del responsable
  active: boolean;               // Estado activo/inactivo
  createdAt: Date;               // Fecha de creación
  updatedAt: Date;               // Última actualización
  createdBy: string;             // ID del usuario creador
  metadata?: {
    color?: string;              // Color identificador
    icon?: string;               // Ícono representativo
  }
}
```

**Campos obligatorios:**
- Nombre (mínimo 2 caracteres)
- Descripción
- Código (2-10 caracteres alfanuméricos en mayúsculas, único)

---

#### **Rol (Role)**
```typescript
{
  id: string;                    // Identificador único
  name: RoleType;                // Tipo de rol (enum)
  permissions: Permission[];     // Permisos del rol
  description: string;           // Descripción del rol
  createdAt: Date;               // Fecha de creación
}
```

**Tipos de roles del sistema:**
- **Administrador**: Control total, puede crear/editar/eliminar usuarios y áreas
- **Editor**: Puede editar contenido y gestionar tareas, sin acceso a usuarios/áreas
- **Visualizador**: Solo lectura, sin permisos de edición

---

#### **Asignación Usuario-Área-Rol (UserAreaRole)**
```typescript
{
  id: string;                    // Identificador único
  userId: string;                // ID del usuario
  areaId: string;                // ID del área
  roleId: string;                // ID del rol
  assignedAt: Date;              // Fecha de asignación
  assignedBy: string;            // ID del usuario que asignó
}
```

**Características:**
- Un usuario puede tener múltiples asignaciones (diferentes roles en diferentes áreas)
- Un usuario puede tener un rol diferente por cada área
- Todo usuario debe tener al menos una asignación

---

#### **Log de Auditoría (AuditLog)**
```typescript
{
  id: string;                    // Identificador único
  timestamp: Date;               // Momento exacto de la acción
  userId: string;                // Usuario ejecutor
  userEmail: string;             // Email del usuario
  userRole: RoleType;            // Rol con el que ejecutó la acción
  action: LogAction;             // Tipo de acción
  entity: LogEntity;             // Entidad afectada
  entityId: string;              // ID de la entidad
  entityName: string;            // Nombre de la entidad
  details: string;               // Descripción detallada
  result: LogResult;             // Resultado: success | error | warning
  metadata?: Record<string, any>; // Datos adicionales
  ipAddress?: string;            // IP del usuario
  userAgent?: string;            // Navegador/dispositivo
}
```

---

### 2. Relaciones Entre Entidades

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Usuario   │ ◄─────► │ UserAreaRole     │ ◄─────► │    Área     │
│             │         │ (N a N)          │         │             │
└─────────────┘         └──────────────────┘         └─────────────┘
      │                          │                          
      │                          ▼                          
      │                    ┌─────────────┐                 
      │                    │     Rol     │                 
      │                    │             │                 
      │                    └─────────────┘                 
      │                                                    
      ▼                                                    
┌─────────────┐                                           
│ AuditLog    │                                           
│             │                                           
└─────────────┘                                           
```

---

## 📜 Reglas de Negocio

### **RN-01: Gestión de Usuarios**

✅ **Creación de usuarios:**
- Email único en el sistema
- Username único (3-20 caracteres alfanuméricos)
- Contraseña segura (mín. 8 caracteres, mayúscula, minúscula y número)
- Debe asignarse al menos un rol en un área
- Se crea automáticamente con estado `active: true`

✅ **Edición de usuarios:**
- Se pueden modificar datos personales
- Se pueden cambiar asignaciones de áreas y roles
- El usuario debe mantener al menos un rol asignado

✅ **Eliminación de usuarios:**
- ❌ No se puede eliminar el último administrador del sistema
- Al eliminar un usuario, se eliminan todas sus asignaciones
- Se registra en el log de auditoría

✅ **Activación/Desactivación:**
- Los usuarios inactivos no pueden hacer login
- No se eliminan sus asignaciones, solo se marcan como inactivos

---

### **RN-02: Gestión de Áreas**

✅ **Creación de áreas:**
- Nombre único (mínimo 2 caracteres)
- Código único (2-10 caracteres alfanuméricos en MAYÚSCULAS)
- Descripción obligatoria
- Se puede asignar un responsable (manager)

✅ **Edición de áreas:**
- Se pueden modificar todos los campos
- El código debe mantenerse único

✅ **Eliminación de áreas:**
- Al eliminar un área, se eliminan todas las asignaciones de usuarios a esa área
- ⚠️ Los usuarios NO se eliminan, solo sus asignaciones
- Si un usuario queda sin asignaciones, debe ser manejado manualmente

✅ **Activación/Desactivación:**
- Las áreas inactivas no se muestran en formularios
- Desactivar un área puede afectar las asignaciones activas

---

### **RN-03: Gestión de Roles**

✅ **Roles predefinidos:**
- Los 3 roles básicos son fijos: Administrador, Editor, Visualizador
- No se pueden crear, editar o eliminar roles (sistema cerrado de roles)
- Cada rol tiene permisos específicos definidos en `Permission[]`

✅ **Asignaciones:**
- Un usuario DEBE tener al menos un rol
- Un usuario puede tener diferentes roles en diferentes áreas
- Ejemplo: Usuario X puede ser "Editor" en Producción y "Visualizador" en Marketing

---

### **RN-04: Permisos y Seguridad**

✅ **Control de acceso:**
- Solo los **Administradores** pueden:
  - Crear, editar y eliminar usuarios
  - Crear, editar y eliminar áreas
  - Ver logs de auditoría
  
- Los **Editores** pueden:
  - Editar formularios y contenido
  - Gestionar tareas
  - Ver usuarios y áreas (solo lectura)

- Los **Visualizadores** solo pueden:
  - Ver información
  - Sin permisos de edición

✅ **Validación de permisos:**
- Cada acción crítica valida el rol del usuario ejecutor
- Las acciones sin permisos se rechazan y se registran en logs

---

### **RN-05: Sistema de Auditoría (Logs)**

✅ **Acciones registradas:**
- Login y logout de usuarios
- Creación, edición y eliminación de usuarios
- Activación y desactivación de usuarios
- Creación, edición y eliminación de áreas
- Activación y desactivación de áreas
- Asignación de usuarios a áreas
- Cambios de roles
- Remoción de usuarios de áreas

✅ **Información de cada log:**
```
{
  ¿Cuándo?: timestamp
  ¿Quién?: userId, userEmail, userRole
  ¿Qué hizo?: action
  ¿Sobre qué?: entity, entityId, entityName
  ¿Cómo resultó?: result (success/error/warning)
  ¿Detalles?: details, metadata
}
```

✅ **Persistencia:**
- Los logs se almacenan en localStorage
- Se pueden filtrar por usuario, entidad, acción, fecha
- Se pueden buscar por texto
- Se pueden obtener estadísticas agregadas

---

## 🔐 Validaciones Implementadas

### **Validaciones de Usuario**

| Campo | Validación |
|-------|------------|
| Email | Formato válido (regex), único en el sistema |
| Username | 3-20 caracteres alfanuméricos, único |
| Contraseña | Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número |
| Confirmar contraseña | Debe coincidir con contraseña |
| Nombre y apellido | Obligatorios, no vacíos |
| Teléfono | Formato válido (7-20 dígitos con símbolos opcionales) |
| Áreas/Roles | Al menos una asignación |

### **Validaciones de Área**

| Campo | Validación |
|-------|------------|
| Nombre | Mínimo 2 caracteres, obligatorio |
| Código | 2-10 caracteres alfanuméricos en MAYÚSCULAS, único |
| Descripción | Obligatoria, no vacía |

### **Validaciones de Eliminación**

| Entidad | Validación |
|---------|------------|
| Usuario | No se puede eliminar el último administrador |
| Área | Se advierte sobre usuarios afectados |

---

## 📂 Estructura de Archivos del Sistema

```
/src/app/
├── types/
│   └── business.ts              # Definición de todos los tipos e interfaces
│
├── utils/
│   └── businessRules.ts         # Funciones de validación y reglas de negocio
│
├── contexts/
│   ├── DataContext.tsx          # Gestión de datos (usuarios, áreas, roles)
│   ├── LogContext.tsx           # Sistema de auditoría y logs
│   ├── ThemeContext.tsx         # Gestión de tema claro/oscuro
│   ├── FormulariosContext.tsx   # Gestión de formularios comerciales
│   └── FormFieldsContext.tsx    # Gestión de campos de formularios
│
└── components/
    ├── FormBuilder.tsx          # Interfaz de Backoffice
    ├── Dashboard.tsx            # Dashboard principal
    └── ...                      # Otros componentes
```

---

## 🎨 Pantallas Principales Sugeridas

### **1. Dashboard de Inicio**
- **Bandeja de tareas pendientes**
- **Métricas en tiempo real:**
  - Total de usuarios (activos/inactivos)
  - Total de áreas (activas/inactivas)
  - Total de asignaciones
  - Logs recientes (últimas 24h)
- **Actividad reciente del sistema**

### **2. Gestión de Usuarios** (solo Administradores)
- **Lista de usuarios** con filtros y búsqueda
- **Formulario de creación:**
  - Datos personales (email, nombre, apellido, username)
  - Contraseña y confirmación
  - Asignación de áreas y roles
  - Datos adicionales (teléfono, cargo)
- **Formulario de edición:**
  - Modificar datos personales
  - Cambiar asignaciones de áreas/roles
  - Activar/desactivar usuario
- **Vista detallada:** Usuario con todas sus áreas y roles

### **3. Gestión de Áreas** (solo Administradores)
- **Lista de áreas** con filtros y búsqueda
- **Formulario de creación:**
  - Nombre, código, descripción
  - Asignar responsable (manager)
  - Configuración visual (color, ícono)
- **Formulario de edición:**
  - Modificar información del área
  - Cambiar responsable
  - Activar/desactivar área
- **Vista detallada:** Área con todos sus usuarios asignados

### **4. Logs de Auditoría** (solo Administradores)
- **Tabla de logs** con:
  - Filtros por fecha, usuario, acción, entidad, resultado
  - Búsqueda por texto
  - Ordenamiento
- **Estadísticas visuales:**
  - Total de acciones por tipo
  - Tasa de éxito vs errores
  - Actividad por usuario
  - Timeline de acciones críticas
- **Exportación de logs** (CSV, JSON)

### **5. Perfil de Usuario** (todos los roles)
- **Información personal**
- **Mis áreas y roles asignados**
- **Mi actividad reciente** (logs del usuario)
- **Configuración de cuenta**

---

## 🔄 Flujos de Trabajo Clave

### **Flujo 1: Crear Usuario**
```
1. Admin accede a "Gestión de Usuarios"
2. Click en "Nuevo Usuario"
3. Completa formulario:
   - Email, username, contraseña
   - Nombre y apellido
   - Asigna áreas y roles (mínimo 1)
   - Datos opcionales
4. Sistema valida:
   - Email único
   - Username único
   - Contraseña segura
   - Al menos 1 asignación
5. Usuario creado → Log registrado
6. Notificación de éxito
```

### **Flujo 2: Eliminar Área**
```
1. Admin accede a "Gestión de Áreas"
2. Selecciona área a eliminar
3. Sistema verifica:
   - ¿Tiene usuarios asignados?
   - Muestra advertencia con cantidad de usuarios afectados
4. Admin confirma eliminación
5. Sistema elimina:
   - El área
   - Todas las asignaciones UserAreaRole relacionadas
6. Log registrado con detalles
7. Notificación de éxito
```

### **Flujo 3: Login y Auditoría**
```
1. Usuario ingresa email y contraseña
2. Sistema valida:
   - Usuario existe
   - Está activo
   - Contraseña correcta (simulado en frontend)
3. Si exitoso:
   - Se actualiza lastLogin
   - Se registra log de login con éxito
   - Usuario redirigido al dashboard
4. Si falla:
   - Se registra log de login con error
   - Mensaje de error al usuario
```

---

## 📊 Estadísticas del Sistema

El sistema calcula automáticamente:

```typescript
{
  totalUsers: number,           // Total de usuarios
  activeUsers: number,          // Usuarios activos
  inactiveUsers: number,        // Usuarios inactivos
  totalAreas: number,           // Total de áreas
  activeAreas: number,          // Áreas activas
  inactiveAreas: number,        // Áreas inactivas
  totalRoleAssignments: number, // Total de asignaciones
  recentLogs: number            // Logs de últimas 24h
}
```

---

## 🚀 Características Técnicas

### **Persistencia**
- Todos los datos se almacenan en `localStorage`
- Claves utilizadas:
  - `erp_users`
  - `erp_areas`
  - `erp_user_area_roles`
  - `erp_current_user`
  - `erp_audit_logs`
  - `theme` (modo claro/oscuro)

### **Contextos de React**
- **DataContext**: Gestión de usuarios, áreas y asignaciones
- **LogContext**: Sistema completo de auditoría
- **ThemeContext**: Modo claro/oscuro con persistencia

### **Validaciones en Tiempo Real**
- Validación de formularios antes de enviar
- Mensajes de error específicos por campo
- Verificación de unicidad (email, username, código de área)
- Validación de permisos antes de cada acción

---

## 🔮 Próximos Pasos Sugeridos

### **Funcionalidad**
1. Implementar backend real (Supabase, Firebase, etc.)
2. Agregar autenticación JWT con refresh tokens
3. Implementar recuperación de contraseña
4. Sistema de notificaciones en tiempo real
5. Exportación de reports (PDF, Excel)
6. Dashboard con gráficos interactivos (recharts)

### **Seguridad**
1. Hash de contraseñas (bcrypt)
2. Rate limiting en login
3. Registro de IP y user agent en logs
4. Sesiones con expiración automática
5. Auditoría de cambios sensibles con aprobación

### **UX/UI**
1. Tablas con paginación y ordenamiento
2. Filtros avanzados en todas las vistas
3. Drag & drop para asignar usuarios a áreas
4. Previsualización de cambios antes de aplicar
5. Modo oscuro completo en todas las pantallas

---

## 📝 Notas Finales

Este sistema proporciona una **base sólida y escalable** para la gestión de usuarios, roles y áreas en un ERP empresarial. Todas las acciones críticas están registradas, validadas y auditadas.

El código está completamente tipado con TypeScript, sigue principios SOLID y está preparado para crecer hacia un sistema de producción completo.

---

**Última actualización:** Diciembre 27, 2024  
**Versión del sistema:** 1.0.0  
**Desarrollado para:** Luzu TV ERP
