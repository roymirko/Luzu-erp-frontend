// ============================================
// TIPOS Y MODELO LÓGICO DE DATOS
// ============================================

/**
 * ROLES DEL SISTEMA
 * Define los tres roles básicos del ERP
 */
export enum RoleType {
  ADMINISTRADOR = 'Administrador',
  EDITOR = 'Editor',
  VISUALIZADOR = 'Visualizador'
}

/**
 * MODELO: ROL
 * Representa un rol en el sistema
 */
export interface Role {
  id: string;
  name: RoleType;
  permissions: Permission[];
  description: string;
  createdAt: Date;
}

/**
 * PERMISOS
 * Define qué puede hacer cada rol
 */
export interface Permission {
  resource: 'users' | 'areas' | 'roles' | 'logs' | 'forms' | 'tasks';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

/**
 * MODELO: ÁREA
 * Representa un departamento o área de la organización
 */
export interface Area {
  id: string;
  name: string;
  description: string;
  code: string; // Código único del área (ej: "MKT", "PROD", "TEC")
  manager?: string; // ID del usuario responsable
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // ID del usuario que la creó
  metadata?: {
    color?: string; // Color identificador del área
    icon?: string; // Ícono representativo
  };
}

/**
 * MODELO: USUARIO
 * Representa un usuario del sistema
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  createdBy: string; // ID del usuario que lo creó
  metadata?: {
    position?: string; // Cargo
    googleId?: string; // ID de Google OAuth
    avatar?: string;
    source?: string;
  };
}

/**
 * MODELO: ASIGNACIÓN USUARIO-ÁREA-ROL
 * Representa la relación entre usuario, área y rol
 * Un usuario puede tener diferentes roles en diferentes áreas
 */
export interface UserAreaRole {
  id: string;
  userId: string;
  areaId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string; // ID del usuario que hizo la asignación
}

/**
 * MODELO: LOG DE AUDITORÍA
 * Registra todas las acciones críticas del sistema
 */
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string; // Usuario que ejecutó la acción
  userEmail: string; // Email del usuario (para facilitar búsqueda)
  userRole: RoleType; // Rol con el que ejecutó la acción
  action: LogAction;
  entity: LogEntity;
  entityId: string; // ID de la entidad afectada
  entityName: string; // Nombre de la entidad (para facilitar búsqueda)
  details: string; // Descripción detallada de la acción
  result: LogResult;
  metadata?: Record<string, any>; // Datos adicionales según el tipo de acción
  ipAddress?: string;
  userAgent?: string;
}

/**
 * TIPOS DE ACCIONES AUDITABLES
 */
export type LogAction =
  | 'login'
  | 'logout'
  | 'create_user'
  | 'auto_create_user'
  | 'edit_user'
  | 'delete_user'
  | 'activate_user'
  | 'deactivate_user'
  | 'create_area'
  | 'edit_area'
  | 'delete_area'
  | 'activate_area'
  | 'deactivate_area'
  | 'assign_role'
  | 'change_role'
  | 'remove_role'
  | 'assign_user_to_area'
  | 'remove_user_from_area';

/**
 * ENTIDADES AUDITABLES
 */
export type LogEntity = 'user' | 'area' | 'role' | 'session' | 'assignment';

/**
 * RESULTADO DE LA ACCIÓN
 */
export type LogResult = 'success' | 'error' | 'warning';

/**
 * MODELO: DATOS COMPLETOS DE USUARIO
 * Vista completa de un usuario con sus áreas y roles
 */
export interface UserWithRelations extends User {
  areas: {
    area: Area;
    role: Role;
    assignedAt: Date;
  }[];
}

/**
 * MODELO: DATOS COMPLETOS DE ÁREA
 * Vista completa de un área con sus usuarios
 */
export interface AreaWithUsers extends Area {
  users: {
    user: User;
    role: Role;
    assignedAt: Date;
  }[];
}

/**
 * FORMULARIO: CREAR USUARIO
 */
export interface CreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  position?: string;
  areas: {
    areaId: string;
    roleId: string;
  }[];
}

/**
 * FORMULARIO: EDITAR USUARIO
 */
export interface EditUserForm {
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  active: boolean;
  areas: {
    areaId: string;
    roleId: string;
  }[];
}

/**
 * FORMULARIO: CREAR ÁREA
 */
export interface CreateAreaForm {
  name: string;
  description?: string; // Opcional
  code?: string; // Opcional - se genera automáticamente si no se provee
  managerId?: string;
  color?: string;
  icon?: string;
  users?: {
    userId: string;
    roleId: string;
  }[]; // Usuarios asignados al área con sus roles
}

/**
 * FORMULARIO: EDITAR ÁREA
 */
export interface EditAreaForm {
  name: string;
  description: string;
  code: string;
  managerId?: string;
  active: boolean;
  color?: string;
  icon?: string;
  users?: {
    userId: string;
    roleId: string;
  }[]; // Usuarios asignados al área con sus roles
}

/**
 * ERRORES DE VALIDACIÓN
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * RESULTADO DE VALIDACIÓN
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * ESTADÍSTICAS DEL SISTEMA
 */
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalAreas: number;
  activeAreas: number;
  inactiveAreas: number;
  totalRoleAssignments: number;
  recentLogs: number; // Logs de las últimas 24h
}

/**
 * MODELO: CLIENTE (Razón Social)
 */
export interface Client {
  id: string;
  businessName: string;
  cuit: string;
  address?: string;
  companyName?: string;
  active: boolean;
  createdAt: Date;
  createdBy?: string;
}

/**
 * FORMULARIO: CREAR CLIENTE
 */
export interface CreateClientForm {
  businessName: string;
  cuit: string;
  address?: string;
  companyName?: string;
}