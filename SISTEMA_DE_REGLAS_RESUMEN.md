# ⚡ SISTEMA DE REGLAS DE NEGOCIO - RESUMEN EJECUTIVO

## 🎯 Modelo Lógico de Datos

### Entidades Principales
```
Usuario (User)
├── Campos obligatorios: email, username, firstName, lastName, password
├── Campos únicos: email, username
└── Relación: N:N con Áreas a través de UserAreaRole

Área (Area)
├── Campos obligatorios: name, code, description
├── Campos únicos: code
└── Relación: N:N con Usuarios a través de UserAreaRole

Rol (Role)
├── Tipos fijos: Administrador, Editor, Visualizador
└── No se pueden crear/editar/eliminar roles

UserAreaRole (Asignación)
├── userId + areaId + roleId
└── Un usuario puede tener diferentes roles en diferentes áreas

AuditLog (Log de Auditoría)
├── Registra todas las acciones críticas
└── Incluye: timestamp, usuario, acción, entidad, resultado
```

---

## 📋 Reglas de Negocio (Síntesis)

### ✅ Usuarios
| Acción | Reglas |
|--------|--------|
| **Crear** | • Email y username únicos<br>• Contraseña: min 8 chars (mayúscula, minúscula, número)<br>• Al menos 1 rol en 1 área |
| **Editar** | • Mantener al menos 1 rol asignado<br>• Email único (excepto el propio) |
| **Eliminar** | • ❌ No eliminar último administrador<br>• Se eliminan todas las asignaciones |
| **Toggle** | • Inactivos no pueden hacer login<br>• Se mantienen asignaciones |

### ✅ Áreas
| Acción | Reglas |
|--------|--------|
| **Crear** | • Código único (2-10 MAYÚSCULAS)<br>• Descripción obligatoria |
| **Editar** | • Código debe seguir siendo único |
| **Eliminar** | • ⚠️ Se eliminan asignaciones<br>• Usuarios NO se eliminan |
| **Toggle** | • Áreas inactivas ocultas en formularios |

### ✅ Roles y Permisos
| Rol | Permisos |
|-----|----------|
| **Administrador** | CRUD usuarios, áreas, roles, logs, forms, tasks |
| **Editor** | Read usuarios/áreas, CRUD forms/tasks |
| **Visualizador** | Read everything |

### ✅ Sistema de Logs
**Acciones registradas:**
- login, logout
- create_user, edit_user, delete_user, activate_user, deactivate_user
- create_area, edit_area, delete_area, activate_area, deactivate_area
- assign_role, change_role, remove_role
- assign_user_to_area, remove_user_from_area

**Cada log incluye:**
```typescript
{
  timestamp, userId, userEmail, userRole,
  action, entity, entityId, entityName,
  details, result (success|error|warning),
  metadata
}
```

---

## 🔐 Validaciones

### Validaciones de Formato
```javascript
Email:      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
Username:   /^[a-zA-Z0-9_-]{3,20}$/
Password:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
AreaCode:   /^[A-Z0-9]{2,10}$/
Phone:      /^[\d\s+()-]{7,20}$/
```

### Validaciones de Negocio
```typescript
✅ Email único en sistema
✅ Username único en sistema
✅ Código de área único
✅ Usuario debe tener al menos 1 rol
✅ No eliminar último administrador
✅ Solo Admin puede CRUD usuarios/áreas
```

---

## 📂 Estructura de Código

```
/src/app/
├── types/business.ts           # ⭐ Todos los tipos TypeScript
├── utils/businessRules.ts      # ⭐ Validaciones y reglas
├── contexts/
│   ├── DataContext.tsx         # ⭐ Gestión de datos
│   └── LogContext.tsx          # ⭐ Sistema de auditoría
└── components/
    └── FormBuilder.tsx         # Backoffice UI
```

---

## 🔄 Flujos de Trabajo Principales

### 1️⃣ Crear Usuario (Solo Admin)
```
1. Click "Nuevo Usuario"
2. Completar formulario obligatorio
3. Asignar al menos 1 área + 1 rol
4. Sistema valida unicidad y formato
5. Usuario creado → Log registrado ✅
```

### 2️⃣ Eliminar Área (Solo Admin)
```
1. Seleccionar área
2. Sistema verifica usuarios asignados
3. Mostrar advertencia si hay usuarios
4. Confirmar eliminación
5. Área + asignaciones eliminadas → Log registrado ✅
```

### 3️⃣ Login con Auditoría
```
1. Usuario ingresa credenciales
2. Validar: existe + activo
3. Actualizar lastLogin
4. Registrar log (success o error) ✅
5. Redirigir a dashboard
```

---

## 💾 Persistencia (localStorage)

| Clave | Contenido |
|-------|-----------|
| `erp_users` | Array de usuarios |
| `erp_areas` | Array de áreas |
| `erp_user_area_roles` | Array de asignaciones |
| `erp_current_user` | Usuario logueado |
| `erp_audit_logs` | Logs de auditoría |
| `theme` | Modo claro/oscuro |

---

## 📊 Estadísticas Disponibles

```typescript
stats = {
  totalUsers, activeUsers, inactiveUsers,
  totalAreas, activeAreas, inactiveAreas,
  totalRoleAssignments,
  recentLogs  // Últimas 24h
}
```

---

## 🎨 Pantallas Implementadas

### Backoffice (FormBuilder.tsx)
- **Tab "Áreas":**
  - Lista con buscador y filtros
  - Métricas: Total áreas, Activas, Inactivas
  - Botón "Nueva Área" (160px × 40px)
  
- **Tab "Gestión de Usuarios":**
  - Lista con buscador y filtros
  - Métricas: Total usuarios, Activos, Inactivos
  - Botón "Nuevo Usuario" (160px × 40px)

---

## 🚀 Uso en Código

### Acceder a datos y funciones:
```typescript
import { useData } from './contexts/DataContext';
import { useLog } from './contexts/LogContext';

function Component() {
  const {
    users, areas, roles, userAreaRoles, stats,
    createUser, editUser, deleteUser,
    createArea, editArea, deleteArea,
    login, logout
  } = useData();

  const {
    logs, addLog, getRecentLogs, searchLogs, getLogStats
  } = useLog();

  // Usar funciones...
}
```

### Validar antes de acción:
```typescript
import { validateCreateUser, canDeleteUser } from './utils/businessRules';

// Validar formulario
const validation = validateCreateUser(form, users, areas);
if (!validation.valid) {
  console.error(validation.errors);
  return;
}

// Verificar regla de negocio
const check = canDeleteUser(userId, users, userAreaRoles, roles);
if (!check.canDelete) {
  alert(check.reason);
  return;
}
```

---

## ✨ Características Clave

✅ **Completamente tipado** con TypeScript  
✅ **Validación exhaustiva** de datos  
✅ **Sistema de auditoría automático**  
✅ **Persistencia en localStorage**  
✅ **Gestión de permisos por rol**  
✅ **Reglas de negocio centralizadas**  
✅ **UI profesional con temas claro/oscuro**  
✅ **Arquitectura escalable con Contexts**  

---

**🎯 Sistema listo para producción con todas las reglas de negocio implementadas.**

---

_Desarrollado para Luzu TV ERP • Diciembre 2024_
