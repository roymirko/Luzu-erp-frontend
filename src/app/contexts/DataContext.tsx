import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Area,
  Role,
  UserAreaRole,
  RoleType,
  Permission,
  CreateUserForm,
  EditUserForm,
  CreateAreaForm,
  EditAreaForm,
  UserWithRelations,
  AreaWithUsers,
  SystemStats,
  AuditLog
} from '../types/business';
import {
  validateCreateUser,
  validateEditUser,
  validateCreateArea,
  validateEditArea,
  canDeleteUser,
  canDeleteArea,
  canDeactivateArea
} from '../utils/businessRules';
import { useLog } from './LogContext';

interface DataContextType {
  // Estado
  users: User[];
  areas: Area[];
  roles: Role[];
  userAreaRoles: UserAreaRole[];
  stats: SystemStats;
  currentUser: User | null;
  
  // Usuarios
  createUser: (form: CreateUserForm) => Promise<{ success: boolean; userId?: string; errors?: any[] }>;
  editUser: (userId: string, form: EditUserForm) => Promise<{ success: boolean; errors?: any[] }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; reason?: string }>;
  toggleUserStatus: (userId: string) => Promise<{ success: boolean }>;
  getUserWithRelations: (userId: string) => UserWithRelations | null;
  
  // Áreas
  createArea: (form: CreateAreaForm) => Promise<{ success: boolean; areaId?: string; errors?: any[] }>;
  editArea: (areaId: string, form: EditAreaForm) => Promise<{ success: boolean; errors?: any[] }>;
  deleteArea: (areaId: string) => Promise<{ success: boolean; reason?: string }>;
  toggleAreaStatus: (areaId: string) => Promise<{ success: boolean; warning?: string }>;
  getAreaWithUsers: (areaId: string) => AreaWithUsers | null;
  
  // Asignaciones
  assignUserToArea: (userId: string, areaId: string, roleId: string) => Promise<{ success: boolean }>;
  removeUserFromArea: (userId: string, areaId: string) => Promise<{ success: boolean }>;
  changeUserRoleInArea: (userId: string, areaId: string, newRoleId: string) => Promise<{ success: boolean }>;
  
  // Autenticación simulada
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Datos iniciales
const INITIAL_ROLES: Role[] = [
  {
    id: 'role-1',
    name: RoleType.ADMINISTRADOR,
    description: 'Control total del sistema, puede crear, editar y eliminar usuarios y áreas',
    permissions: [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'areas', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'roles', actions: ['read'] },
      { resource: 'logs', actions: ['read'] },
      { resource: 'forms', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] }
    ],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'role-2',
    name: RoleType.EDITOR,
    description: 'Puede editar contenido y gestionar tareas, pero no usuarios ni áreas',
    permissions: [
      { resource: 'users', actions: ['read'] },
      { resource: 'areas', actions: ['read'] },
      { resource: 'forms', actions: ['create', 'read', 'update'] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] }
    ],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'role-3',
    name: RoleType.VISUALIZADOR,
    description: 'Solo puede ver información, sin permisos de edición',
    permissions: [
      { resource: 'users', actions: ['read'] },
      { resource: 'areas', actions: ['read'] },
      { resource: 'forms', actions: ['read'] },
      { resource: 'tasks', actions: ['read'] }
    ],
    createdAt: new Date('2024-01-01')
  }
];

const INITIAL_AREAS: Area[] = [
  {
    id: 'area-1',
    name: 'Comercial',
    code: 'COM',
    description: 'Gestión de propuestas y estrategias comerciales',
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    metadata: {
      color: '#fb2c36',
      icon: 'Briefcase'
    }
  },
  {
    id: 'area-2',
    name: 'Implementación',
    code: 'IMP',
    description: 'Implementación y gestión de proyectos técnicos',
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    metadata: {
      color: '#3b82f6',
      icon: 'Settings'
    }
  },
  {
    id: 'area-3',
    name: 'Dir. de Programación',
    code: 'PRG',
    description: 'Planificación y dirección de programación de contenidos',
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    metadata: {
      color: '#10b981',
      icon: 'TrendingUp'
    }
  },
  {
    id: 'area-4',
    name: 'Master',
    code: 'MST',
    description: 'Super administradores del sistema',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'system',
    metadata: {
      color: '#8b5cf6',
      icon: 'Users'
    }
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    email: 'gaby@luzutv.com.ar',
    firstName: 'Gabriela',
    lastName: 'Riero',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    createdBy: 'system',
    metadata: {
      position: 'CEO',
      googleId: undefined
    }
  },
  {
    id: 'user-2',
    email: 'gestion@luzutv.com.ar',
    firstName: 'Felicitas',
    lastName: 'Carelli',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-26'),
    createdBy: 'user-1',
    metadata: {
      position: 'Project Manager',
      googleId: undefined
    }
  }
];

const INITIAL_USER_AREA_ROLES: UserAreaRole[] = [
  // Gabriela Riero (CEO) - Administradora en todas las áreas incluyendo Master
  { id: 'uar-1', userId: 'user-1', areaId: 'area-1', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'system' },
  { id: 'uar-2', userId: 'user-1', areaId: 'area-2', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'system' },
  { id: 'uar-3', userId: 'user-1', areaId: 'area-3', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'system' },
  { id: 'uar-4', userId: 'user-1', areaId: 'area-4', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'system' },
  
  // Felicitas Carelli (PM) - Administradora en todas las áreas (no Master)
  { id: 'uar-5', userId: 'user-2', areaId: 'area-1', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'user-1' },
  { id: 'uar-6', userId: 'user-2', areaId: 'area-2', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'user-1' },
  { id: 'uar-7', userId: 'user-2', areaId: 'area-3', roleId: 'role-1', assignedAt: new Date('2024-01-01'), assignedBy: 'user-1' }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { addLog } = useLog();
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('erp_users_v4');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [areas, setAreas] = useState<Area[]>(() => {
    const saved = localStorage.getItem('erp_areas_v4');
    return saved ? JSON.parse(saved) : INITIAL_AREAS;
  });
  
  const [roles] = useState<Role[]>(INITIAL_ROLES);
  
  const [userAreaRoles, setUserAreaRoles] = useState<UserAreaRole[]>(() => {
    const saved = localStorage.getItem('erp_user_area_roles_v4');
    return saved ? JSON.parse(saved) : INITIAL_USER_AREA_ROLES;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistencia
  useEffect(() => {
    localStorage.setItem('erp_users_v4', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('erp_areas_v4', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('erp_user_area_roles_v4', JSON.stringify(userAreaRoles));
  }, [userAreaRoles]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('erp_current_user');
    }
  }, [currentUser]);

  // Calcular estadísticas
  const stats: SystemStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.active).length,
    inactiveUsers: users.filter(u => !u.active).length,
    totalAreas: areas.length,
    activeAreas: areas.filter(a => a.active).length,
    inactiveAreas: areas.filter(a => !a.active).length,
    totalRoleAssignments: userAreaRoles.length,
    recentLogs: 0 // Se calculará desde LogContext
  };

  // ============================================
  // FUNCIONES DE USUARIOS
  // ============================================

  const createUser = async (form: CreateUserForm) => {
    const validation = validateCreateUser(form, users, areas);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: form.email.toLowerCase(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser?.id || 'system',
      metadata: {
        position: form.position?.trim()
      }
    };

    // Crear asignaciones de área-rol
    const newAssignments: UserAreaRole[] = form.areas.map(assignment => ({
      id: `uar-${Date.now()}-${Math.random()}`,
      userId: newUser.id,
      areaId: assignment.areaId,
      roleId: assignment.roleId,
      assignedAt: new Date(),
      assignedBy: currentUser?.id || 'system'
    }));

    setUsers(prev => [...prev, newUser]);
    setUserAreaRoles(prev => [...prev, ...newAssignments]);

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'create_user',
      entity: 'user',
      entityId: newUser.id,
      entityName: `${newUser.firstName} ${newUser.lastName}`,
      details: `Usuario creado: ${newUser.email} con ${form.areas.length} asignación(es) de área`,
      result: 'success',
      metadata: {
        areas: form.areas.map(a => {
          const area = areas.find(ar => ar.id === a.areaId);
          const roleObj = roles.find(r => r.id === a.roleId);
          return { areaName: area?.name, roleName: roleObj?.name };
        })
      }
    });

    return { success: true, userId: newUser.id };
  };

  const editUser = async (userId: string, form: EditUserForm) => {
    const validation = validateEditUser(userId, form, users);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.toLowerCase(),
          active: form.active,
          updatedAt: new Date(),
          metadata: {
            ...user.metadata,
            position: form.position?.trim()
          }
        };
      }
      return user;
    }));

    // Actualizar asignaciones
    const currentAssignments = userAreaRoles.filter(uar => uar.userId === userId);
    const newAssignments: UserAreaRole[] = form.areas.map(assignment => {
      const existing = currentAssignments.find(
        ca => ca.areaId === assignment.areaId && ca.roleId === assignment.roleId
      );
      if (existing) return existing;
      
      return {
        id: `uar-${Date.now()}-${Math.random()}`,
        userId,
        areaId: assignment.areaId,
        roleId: assignment.roleId,
        assignedAt: new Date(),
        assignedBy: currentUser?.id || 'system'
      };
    });

    setUserAreaRoles(prev => [
      ...prev.filter(uar => uar.userId !== userId),
      ...newAssignments
    ]);

    // Log
    const user = users.find(u => u.id === userId);
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'edit_user',
      entity: 'user',
      entityId: userId,
      entityName: `${form.firstName} ${form.lastName}`,
      details: `Usuario actualizado: ${form.email}`,
      result: 'success'
    });

    return { success: true };
  };

  const deleteUser = async (userId: string) => {
    const deleteCheck = canDeleteUser(userId, users, userAreaRoles, roles);
    if (!deleteCheck.canDelete) {
      return { success: false, reason: deleteCheck.reason };
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, reason: 'Usuario no encontrado' };
    }

    // Eliminar usuario y sus asignaciones
    setUsers(prev => prev.filter(u => u.id !== userId));
    setUserAreaRoles(prev => prev.filter(uar => uar.userId !== userId));

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'delete_user',
      entity: 'user',
      entityId: userId,
      entityName: `${user.firstName} ${user.lastName}`,
      details: `Usuario eliminado: ${user.email}`,
      result: 'success'
    });

    return { success: true };
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false };

    const newStatus = !user.active;
    
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, active: newStatus, updatedAt: new Date() } : u
    ));

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: newStatus ? 'activate_user' : 'deactivate_user',
      entity: 'user',
      entityId: userId,
      entityName: `${user.firstName} ${user.lastName}`,
      details: `Usuario ${newStatus ? 'activado' : 'desactivado'}: ${user.email}`,
      result: 'success'
    });

    return { success: true };
  };

  const getUserWithRelations = (userId: string): UserWithRelations | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const userAssignments = userAreaRoles.filter(uar => uar.userId === userId);
    const userAreas = userAssignments.map(assignment => {
      const area = areas.find(a => a.id === assignment.areaId)!;
      const role = roles.find(r => r.id === assignment.roleId)!;
      return {
        area,
        role,
        assignedAt: assignment.assignedAt
      };
    });

    return { ...user, areas: userAreas };
  };

  // ============================================
  // FUNCIONES DE ÁREAS
  // ============================================

  const createArea = async (form: CreateAreaForm) => {
    // Generar código automáticamente si no se proporciona
    const generatedCode = form.code || form.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    
    // Generar descripción automática si no se proporciona
    const generatedDescription = form.description || `Área de ${form.name}`;
    
    // Crear formulario con valores generados
    const completeForm = {
      ...form,
      code: generatedCode,
      description: generatedDescription
    };
    
    const validation = validateCreateArea(completeForm, areas);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const newArea: Area = {
      id: `area-${Date.now()}`,
      name: completeForm.name.trim(),
      code: completeForm.code.toUpperCase(),
      description: completeForm.description.trim(),
      manager: completeForm.managerId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser?.id || 'system',
      metadata: {
        color: completeForm.color,
        icon: completeForm.icon
      }
    };

    setAreas(prev => [...prev, newArea]);

    // Crear asignaciones de usuario-área-rol si se proporcionaron usuarios
    if (form.users && form.users.length > 0) {
      const newAssignments: UserAreaRole[] = form.users
        .filter(u => u.userId && u.roleId) // Solo usuarios válidos
        .map(assignment => ({
          id: `uar-${Date.now()}-${Math.random()}`,
          userId: assignment.userId,
          areaId: newArea.id,
          roleId: assignment.roleId,
          assignedAt: new Date(),
          assignedBy: currentUser?.id || 'system'
        }));

      if (newAssignments.length > 0) {
        setUserAreaRoles(prev => [...prev, ...newAssignments]);
      }
    }

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'create_area',
      entity: 'area',
      entityId: newArea.id,
      entityName: newArea.name,
      details: `Área creada: ${newArea.name} (${newArea.code})${form.users && form.users.length > 0 ? ` con ${form.users.length} usuario(s) asignado(s)` : ''}`,
      result: 'success',
      metadata: form.users && form.users.length > 0 ? { userCount: form.users.length } : undefined
    });

    return { success: true, areaId: newArea.id };
  };

  const editArea = async (areaId: string, form: EditAreaForm) => {
    const validation = validateEditArea(areaId, form, areas);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setAreas(prev => prev.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          name: form.name.trim(),
          code: form.code.toUpperCase(),
          description: form.description.trim(),
          manager: form.managerId,
          active: form.active,
          updatedAt: new Date(),
          metadata: {
            ...area.metadata,
            color: form.color,
            icon: form.icon
          }
        };
      }
      return area;
    }));

    // Actualizar asignaciones de usuarios si se proporcionaron
    if (form.users) {
      const currentAssignments = userAreaRoles.filter(uar => uar.areaId === areaId);
      const newAssignments: UserAreaRole[] = form.users
        .filter(u => u.userId && u.roleId) // Solo usuarios válidos
        .map(assignment => {
          const existing = currentAssignments.find(
            ca => ca.userId === assignment.userId && ca.roleId === assignment.roleId
          );
          if (existing) return existing;
          
          return {
            id: `uar-${Date.now()}-${Math.random()}`,
            userId: assignment.userId,
            areaId,
            roleId: assignment.roleId,
            assignedAt: new Date(),
            assignedBy: currentUser?.id || 'system'
          };
        });

      setUserAreaRoles(prev => [
        ...prev.filter(uar => uar.areaId !== areaId),
        ...newAssignments
      ]);
    }

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'edit_area',
      entity: 'area',
      entityId: areaId,
      entityName: form.name,
      details: `Área actualizada: ${form.name} (${form.code})`,
      result: 'success'
    });

    return { success: true };
  };

  const deleteArea = async (areaId: string) => {
    const deleteCheck = canDeleteArea(areaId, userAreaRoles);
    
    const area = areas.find(a => a.id === areaId);
    if (!area) {
      return { success: false, reason: 'Área no encontrada' };
    }

    // Eliminar área y sus asignaciones
    setAreas(prev => prev.filter(a => a.id !== areaId));
    setUserAreaRoles(prev => prev.filter(uar => uar.areaId !== areaId));

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'delete_area',
      entity: 'area',
      entityId: areaId,
      entityName: area.name,
      details: `Área eliminada: ${area.name} (${area.code})${deleteCheck.affectedUsers ? ` - ${deleteCheck.affectedUsers} usuario(s) afectado(s)` : ''}`,
      result: 'success',
      metadata: { affectedUsers: deleteCheck.affectedUsers }
    });

    return { success: true };
  };

  const toggleAreaStatus = async (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return { success: false };

    const newStatus = !area.active;
    const deactivateCheck = canDeactivateArea(areaId, userAreaRoles);
    
    setAreas(prev => prev.map(a => 
      a.id === areaId ? { ...a, active: newStatus, updatedAt: new Date() } : a
    ));

    // Log
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: newStatus ? 'activate_area' : 'deactivate_area',
      entity: 'area',
      entityId: areaId,
      entityName: area.name,
      details: `Área ${newStatus ? 'activada' : 'desactivada'}: ${area.name}`,
      result: 'success'
    });

    return { 
      success: true, 
      warning: !newStatus && deactivateCheck.reason ? deactivateCheck.reason : undefined 
    };
  };

  const getAreaWithUsers = (areaId: string): AreaWithUsers | null => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return null;

    const areaAssignments = userAreaRoles.filter(uar => uar.areaId === areaId);
    const areaUsers = areaAssignments.map(assignment => {
      const user = users.find(u => u.id === assignment.userId)!;
      const role = roles.find(r => r.id === assignment.roleId)!;
      return {
        user,
        role,
        assignedAt: assignment.assignedAt
      };
    });

    return { ...area, users: areaUsers };
  };

  // ============================================
  // FUNCIONES DE ASIGNACIONES
  // ============================================

  const assignUserToArea = async (userId: string, areaId: string, roleId: string) => {
    const newAssignment: UserAreaRole = {
      id: `uar-${Date.now()}`,
      userId,
      areaId,
      roleId,
      assignedAt: new Date(),
      assignedBy: currentUser?.id || 'system'
    };

    setUserAreaRoles(prev => [...prev, newAssignment]);

    // Log
    const user = users.find(u => u.id === userId);
    const area = areas.find(a => a.id === areaId);
    const role = roles.find(r => r.id === roleId);
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const currentRole = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: currentRole?.name || RoleType.ADMINISTRADOR,
      action: 'assign_user_to_area',
      entity: 'assignment',
      entityId: newAssignment.id,
      entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
      details: `Usuario asignado a área: ${user?.email} como ${role?.name} en ${area?.name}`,
      result: 'success'
    });

    return { success: true };
  };

  const removeUserFromArea = async (userId: string, areaId: string) => {
    const assignment = userAreaRoles.find(
      uar => uar.userId === userId && uar.areaId === areaId
    );

    if (!assignment) return { success: false };

    setUserAreaRoles(prev => prev.filter(
      uar => !(uar.userId === userId && uar.areaId === areaId)
    ));

    // Log
    const user = users.find(u => u.id === userId);
    const area = areas.find(a => a.id === areaId);
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'remove_user_from_area',
      entity: 'assignment',
      entityId: assignment.id,
      entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
      details: `Usuario removido de área: ${user?.email} de ${area?.name}`,
      result: 'success'
    });

    return { success: true };
  };

  const changeUserRoleInArea = async (userId: string, areaId: string, newRoleId: string) => {
    setUserAreaRoles(prev => prev.map(uar => {
      if (uar.userId === userId && uar.areaId === areaId) {
        return {
          ...uar,
          roleId: newRoleId,
          assignedAt: new Date(),
          assignedBy: currentUser?.id || 'system'
        };
      }
      return uar;
    }));

    // Log
    const user = users.find(u => u.id === userId);
    const area = areas.find(a => a.id === areaId);
    const newRole = roles.find(r => r.id === newRoleId);
    const userRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: role?.name || RoleType.ADMINISTRADOR,
      action: 'change_role',
      entity: 'assignment',
      entityId: `${userId}-${areaId}`,
      entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
      details: `Rol cambiado: ${user?.email} es ahora ${newRole?.name} en ${area?.name}`,
      result: 'success'
    });

    return { success: true };
  };

  // ============================================
  // AUTENTICACIÓN
  // ============================================

  const login = async (email: string, password: string) => {
    // Simulación de login - en producción validar con backend
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.active);
    
    if (!user) {
      addLog({
        userId: 'unknown',
        userEmail: email,
        userRole: RoleType.VISUALIZADOR,
        action: 'login',
        entity: 'session',
        entityId: 'login-attempt',
        entityName: email,
        details: `Intento de login fallido: ${email}`,
        result: 'error'
      });
      return { success: false };
    }

    // Actualizar último login
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, lastLogin: new Date() } : u
    ));

    setCurrentUser(user);

    // Log
    const userRole = userAreaRoles.find(uar => uar.userId === user.id);
    const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
    
    addLog({
      userId: user.id,
      userEmail: user.email,
      userRole: role?.name || RoleType.VISUALIZADOR,
      action: 'login',
      entity: 'session',
      entityId: user.id,
      entityName: `${user.firstName} ${user.lastName}`,
      details: `Inicio de sesión exitoso: ${user.email}`,
      result: 'success'
    });

    return { success: true, user };
  };

  const logout = () => {
    if (currentUser) {
      const userRole = userAreaRoles.find(uar => uar.userId === currentUser.id);
      const role = userRole ? roles.find(r => r.id === userRole.roleId) : null;
      
      addLog({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: role?.name || RoleType.VISUALIZADOR,
        action: 'logout',
        entity: 'session',
        entityId: currentUser.id,
        entityName: `${currentUser.firstName} ${currentUser.lastName}`,
        details: `Cierre de sesión: ${currentUser.email}`,
        result: 'success'
      });
    }

    setCurrentUser(null);
  };

  return (
    <DataContext.Provider
      value={{
        users,
        areas,
        roles,
        userAreaRoles,
        stats,
        currentUser,
        createUser,
        editUser,
        deleteUser,
        toggleUserStatus,
        getUserWithRelations,
        createArea,
        editArea,
        deleteArea,
        toggleAreaStatus,
        getAreaWithUsers,
        assignUserToArea,
        removeUserFromArea,
        changeUserRoleInArea,
        login,
        logout,
        setCurrentUser
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}