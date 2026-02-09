import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Area,
  Role,
  UserAreaRole,
  RoleType,
  CreateUserForm,
  EditUserForm,
  CreateAreaForm,
  EditAreaForm,
  UserWithRelations,
  AreaWithUsers,
  SystemStats
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
import { supabase } from '../services/supabase';
import {
  mapUserFromDB,
  mapUserToDB,
  mapAreaFromDB,
  mapAreaToDB,
  mapRoleFromDB,
  mapUserAreaRoleFromDB,
  mapUserAreaRoleToDB
} from '../utils/supabaseMappers';
import { authApi, AuthUser } from '../services/api';

interface DataContextType {
  // Estado
  users: User[];
  areas: Area[];
  roles: Role[];
  userAreaRoles: UserAreaRole[];
  stats: SystemStats;
  currentUser: User | null;
  loading: boolean;

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

  // Autenticación
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  authToken: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { addLog } = useLog();
  const [loading, setLoading] = useState(true);


  const [users, setUsers] = useState<User[]>([{
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'gaby@luzutv.com.ar',
    firstName: 'Gabriela',
    lastName: 'Rivero',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    metadata: {
      position: 'CEO'
    }
  }]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userAreaRoles, setUserAreaRoles] = useState<UserAreaRole[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('erp_auth_token');
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          { data: usersData },
          { data: areasData },
          { data: rolesData },
          { data: uarData }
        ] = await Promise.all([
          supabase.from('usuarios').select('*'),
          supabase.from('areas').select('*'),
          supabase.from('roles').select('*'),
          supabase.from('usuario_area_roles').select('*')
        ]);

        if (usersData) {
          const mappedUsers = usersData.map(mapUserFromDB);

          // Ensure Gabriela Rivero exists (Mock injection if missing)
          const gabrielaExists = mappedUsers.some(u => u.email === 'gaby@luzutv.com.ar');
          if (!gabrielaExists) {
            mappedUsers.push({
              id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
              email: 'gaby@luzutv.com.ar',
              firstName: 'Gabriela',
              lastName: 'Rivero',
              active: true,
              createdBy: 'system',
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: {
                position: 'CEO'
              }
            });
          }

          setUsers(mappedUsers);
        }
        if (areasData) setAreas(areasData.map(mapAreaFromDB));
        if (rolesData) setRoles(rolesData.map(mapRoleFromDB));
        if (uarData) setUserAreaRoles(uarData.map(mapUserAreaRoleFromDB));

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event, session?.user?.email);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user?.email) {
          // User is signed in via Supabase
          const email = session.user.email;

          // 1. Try to find user in our DB (case-insensitive)
            const { data: userData, error: fetchError } = await supabase
            .from('usuarios')
            .select('*')
            .ilike('correo', email)
            .maybeSingle(); // Use maybeSingle to avoid error if not found

          if (userData) {
            console.log('User found in DB, logging in:', userData.email);
            const mappedUser = mapUserFromDB(userData);

            // Update local state
            setCurrentUser(prev => {
              if (prev?.id === mappedUser.id) return prev;
              return mappedUser;
            });

            // Update last_login
            await supabase
              .from('usuarios')
              .update({ ultimo_acceso: new Date().toISOString() })
              .eq('id', userData.id);

          } else {
            console.warn('User authenticated in Google but not found in `users` table. Creating user...');

            // 2. Auto-create user if not found
            const metadata = session.user.user_metadata || {};
            const fullName = metadata.full_name || metadata.name || email.split('@')[0];
            const [firstName, ...rest] = fullName.split(' ');
            const lastName = rest.join(' ') || '';
            const avatarUrl = metadata.avatar_url || metadata.picture;

            const newUserBase = {
              email: email.toLowerCase(),
              firstName: firstName || 'User',
              lastName: lastName || '',
              active: true, // Auto-activate
              createdBy: 'system',
              metadata: {
                avatar: avatarUrl,
                source: 'google_auth'
              }
            };

            const { data: insertedUser, error: createError } = await supabase
              .from('usuarios')
              .insert(mapUserToDB(newUserBase))
              .select()
              .single();

            if (insertedUser && !createError) {
              console.log('User auto-created successfully:', insertedUser);
              const mappedNewUser = mapUserFromDB(insertedUser);
              setCurrentUser(mappedNewUser);

              setUsers(prev => [...prev, mappedNewUser]);

              addLog({
                userId: mappedNewUser.id,
                userEmail: mappedNewUser.email,
                userRole: RoleType.VISUALIZADOR, // Default role
                action: 'auto_create_user',
                entity: 'user',
                entityId: mappedNewUser.id,
                entityName: `${mappedNewUser.firstName} ${mappedNewUser.lastName}`,
                details: `Usuario auto-creado vía Google Auth: ${mappedNewUser.email}`,
                result: 'exito'
              });

            } else {
              console.error('Failed to auto-create user:', createError);
              // Fallback: If creation fails (e.g. permission), we can't log them in efficiently to the "app logic"
              // typically we might show an error. 
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('erp_current_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Persist current user to local storage (session only)
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

    const newUserBase = {
      email: form.email.toLowerCase(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      active: true,
      createdBy: currentUser?.id || 'system',
      metadata: {
        position: form.position?.trim()
      }
    };

    // Hash password via pgcrypto
    const { data: hashResult, error: hashError } = await supabase.rpc('hash_password', { password: form.password });
    if (hashError || !hashResult) {
      console.error('Error hashing password:', hashError);
      return { success: false, errors: [{ field: 'password', message: 'Error al procesar contraseña' }] };
    }

    // Insert User
    const { data: insertedUser, error: userError } = await supabase
      .from('usuarios')
      .insert({ ...mapUserToDB(newUserBase), password_hash: hashResult })
      .select()
      .single();

    if (userError || !insertedUser) {
      console.error('Error creating user:', userError);
      return { success: false, errors: [{ field: 'general', message: 'Error creating user' }] };
    }

    const newUser = mapUserFromDB(insertedUser);

    // Create assignments
    const newAssignments = form.areas.map(assignment => ({
      userId: newUser.id,
      areaId: assignment.areaId,
      roleId: assignment.roleId,
      assignedBy: currentUser?.id || 'system'
    }));

    if (newAssignments.length > 0) {
      const { data: insertedAssignments, error: assignError } = await supabase
        .from('usuario_area_roles')
        .insert(newAssignments.map(mapUserAreaRoleToDB))
        .select();

      if (assignError) {
        console.error('Error creating assignments:', assignError);
        // Warning but proceed
      } else if (insertedAssignments) {
        setUserAreaRoles(prev => [...prev, ...insertedAssignments.map(mapUserAreaRoleFromDB)]);
      }
    }

    setUsers(prev => [...prev, newUser]);

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
      result: 'exito',
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

    const updates = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.toLowerCase(),
      active: form.active,
      metadata: {
        position: form.position?.trim()
      }
    };

    // Hash password if provided
    let passwordHash: string | undefined;
    if (form.password && form.password.length >= 6) {
      const { data: hashResult, error: hashError } = await supabase.rpc('hash_password', { password: form.password });
      if (hashError || !hashResult) {
        console.error('Error hashing password:', hashError);
        return { success: false, errors: [{ field: 'password', message: 'Error al procesar contraseña' }] };
      }
      passwordHash = hashResult;
    }

    const dbUpdates = {
      ...mapUserToDB(updates),
      ...(passwordHash ? { password_hash: passwordHash } : {})
    };

    const { error: userError } = await supabase
      .from('usuarios')
      .update(dbUpdates)
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user:', userError);
      return { success: false, errors: [{ field: 'general', message: 'Error updating user' }] };
    }

    // Update local state
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          ...updates,
          updatedAt: new Date(),
          metadata: { ...user.metadata, ...updates.metadata }
        };
      }
      return user;
    }));

    // Update Assignments
    // This is complex because we need to sync the list (add missing, remove extra)
    // Strategy: Delete all for user and re-insert, or diff.
    // Deleting all is easiest but loses history id.
    // Let's do a smart diff or just add/delete.
    // Since this is "editUser", typically it overwrites the list in the UI form.

    const currentAssignments = userAreaRoles.filter(uar => uar.userId === userId);

    // 1. Assignments to remove
    const toRemove = currentAssignments.filter(ca =>
      !form.areas.some(fa => fa.areaId === ca.areaId && fa.roleId === ca.roleId)
    );

    // 2. Assignments to add
    const toAdd = form.areas.filter(fa =>
      !currentAssignments.some(ca => ca.areaId === fa.areaId && ca.roleId === ca.roleId)
    );

    // Apply removals (batch delete)
    if (toRemove.length > 0) {
      const idsToRemove = toRemove.map(rem => rem.id);
      const { error: delErr } = await supabase
        .from('usuario_area_roles')
        .delete()
        .in('id', idsToRemove);
      if (delErr) {
        console.error('Error deleting assignments:', delErr);
        return { success: false };
      }
      setUserAreaRoles(prev => prev.filter(uar => !idsToRemove.includes(uar.id)));

      // Log removals
      const user = users.find(u => u.id === userId);
      const currentRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
      const role = currentRole ? roles.find(r => r.id === currentRole.roleId) : null;
      for (const rem of toRemove) {
        const area = areas.find(a => a.id === rem.areaId);
        addLog({
          userId: currentUser?.id || 'system',
          userEmail: currentUser?.email || 'system',
          userRole: role?.name || RoleType.ADMINISTRADOR,
          action: 'remove_user_from_area',
          entity: 'assignment',
          entityId: rem.id,
          entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
          details: `Usuario removido de área: ${user?.email} de ${area?.name}`,
          result: 'exito'
        });
      }
    }

    // Apply additions
    if (toAdd.length > 0) {
      const additions = toAdd.map(a => ({
        userId: userId,
        areaId: a.areaId,
        roleId: a.roleId,
        assignedBy: currentUser?.id || 'system'
      }));

      const { data: inserted, error: insErr } = await supabase
        .from('usuario_area_roles')
        .insert(additions.map(mapUserAreaRoleToDB))
        .select();
      if (insErr) {
        console.error('Error adding assignments:', insErr);
        return { success: false };
      }
      if (inserted) {
        const mapped = inserted.map(mapUserAreaRoleFromDB);
        setUserAreaRoles(prev => [...prev, ...mapped]);
        // Log additions
        for (const m of mapped) {
          const user = users.find(u => u.id === userId);
          const area = areas.find(a => a.id === m.areaId);
          const roleObj = roles.find(r => r.id === m.roleId);
          const currentRole = currentUser ? userAreaRoles.find(uar => uar.userId === currentUser.id) : null;
          const actorRole = currentRole ? roles.find(r => r.id === currentRole.roleId) : null;
          addLog({
            userId: currentUser?.id || 'system',
            userEmail: currentUser?.email || 'system',
            userRole: actorRole?.name || RoleType.ADMINISTRADOR,
            action: 'assign_user_to_area',
            entity: 'assignment',
            entityId: m.id,
            entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
            details: `Usuario asignado a área como ${roleObj?.name}`,
            result: 'exito'
          });
        }
      }
    }

    return { success: true };
  }

  const changeUserRoleInArea = async (userId: string, areaId: string, newRoleId: string) => {
    const assignment = userAreaRoles.find(
      uar => uar.userId === userId && uar.areaId === areaId
    );

    if (!assignment) return { success: false };

    const { error } = await supabase
      .from('usuario_area_roles')
      .update({ rol_id: newRoleId, asignado_por: currentUser?.id || 'system', asignado_el: new Date().toISOString() })
      .eq('id', assignment.id);

    if (error) return { success: false };

    setUserAreaRoles(prev => prev.map(uar => {
      if (uar.id === assignment.id) {
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
      entityId: assignment.id,
      entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
      details: `Rol cambiado: ${user?.email} es ahora ${newRole?.name} en ${area?.name}`,
      result: 'exito'
    });

    return { success: true };
  };

  // Minimal stubs for not-yet-implemented APIs to prevent runtime errors
  const deleteUser = async (userId: string): Promise<{ success: boolean; reason?: string }> => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, reason: 'Usuario no encontrado' };

    const rule = canDeleteUser(userId, users, userAreaRoles);
    if (!rule.allowed) {
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'delete_user',
        entity: 'user',
        entityId: userId,
        entityName: `${user.firstName} ${user.lastName}`,
        details: `Eliminación bloqueada: ${rule.reason || 'Reglas de negocio'}`,
        result: 'advertencia'
      });
      return { success: false, reason: rule.reason };
    }

    const userAssignments = userAreaRoles.filter(uar => uar.userId === userId);
    if (userAssignments.length > 0) {
      const { error: delAssignErr } = await supabase
        .from('usuario_area_roles')
        .delete()
        .in('id', userAssignments.map(a => a.id));
      if (delAssignErr) {
        console.error('Error deleting user assignments:', delAssignErr);
        return { success: false, reason: 'Error eliminando asignaciones' };
      }
    }

    const { error: delUserErr } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (delUserErr) {
      console.error('Error deleting user:', delUserErr);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'delete_user',
        entity: 'user',
        entityId: userId,
        entityName: `${user.firstName} ${user.lastName}`,
        details: `Error eliminando usuario: ${user.email}`,
        result: 'error'
      });
      return { success: false, reason: 'Error eliminando usuario' };
    }

    setUserAreaRoles(prev => prev.filter(uar => uar.userId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));

    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'delete_user',
      entity: 'user',
      entityId: userId,
      entityName: `${user.firstName} ${user.lastName}`,
      details: `Usuario eliminado: ${user.email}`,
      result: 'exito'
    });

    return { success: true };
  };

  const toggleUserStatus = async (userId: string): Promise<{ success: boolean }> => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false };

    const newStatus = !user.active;

    const { error } = await supabase
      .from('usuarios')
      .update({ activo: newStatus, actualizado_el: new Date().toISOString(), actualizado_por: currentUser?.id || 'system' })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling user status:', error);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'toggle_user_status',
        entity: 'user',
        entityId: userId,
        entityName: `${user.firstName} ${user.lastName}`,
        details: `Error cambiando estado de usuario: ${user.email}`,
        result: 'error'
      });
      return { success: false };
    }

    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, active: newStatus, updatedAt: new Date() } : u)));

    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'toggle_user_status',
      entity: 'user',
      entityId: userId,
      entityName: `${user.firstName} ${user.lastName}`,
      details: `Estado de usuario cambiado a ${newStatus ? 'activo' : 'inactivo'}: ${user.email}`,
      result: 'exito'
    });

    return { success: true };
  };

  const getUserWithRelations = (userId: string): UserWithRelations | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const assignments = userAreaRoles.filter(uar => uar.userId === userId);
    const userAreas = assignments.map(uar => {
      const area = areas.find(a => a.id === uar.areaId);
      const role = roles.find(r => r.id === uar.roleId);
      return {
        areaId: uar.areaId,
        areaName: area?.name || '',
        roleId: uar.roleId,
        roleName: role?.name || ''
      };
    });
    return { ...user, areas: userAreas };
  };

  const createArea = async (form: CreateAreaForm): Promise<{ success: boolean; areaId?: string; errors?: any[] }> => {
    const validation = validateCreateArea(form, areas);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const base = {
      name: form.name.trim(),
      description: form.description.trim(),
      code: form.code.trim().toUpperCase(),
      active: true,
      createdBy: currentUser?.id || 'system'
    };

    const { data: inserted, error } = await supabase
      .from('areas')
      .insert(mapAreaToDB(base))
      .select()
      .single();

    if (error || !inserted) {
      console.error('Error creating area:', error);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'create_area',
        entity: 'area',
        entityId: 'unknown',
        entityName: base.name,
        details: `Error creando área ${base.code}: ${base.name}`,
        result: 'error'
      });
      return { success: false, errors: [{ field: 'general', message: 'Error creando área' }] };
    }

    const newArea = mapAreaFromDB(inserted);
    setAreas(prev => [...prev, newArea]);

    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'create_area',
      entity: 'area',
      entityId: newArea.id,
      entityName: newArea.name,
      details: `Área creada (${newArea.code}): ${newArea.name}`,
      result: 'exito'
    });

    return { success: true, areaId: newArea.id };
  };

  const editArea = async (areaId: string, form: EditAreaForm): Promise<{ success: boolean; errors?: any[] }> => {
    const validation = validateEditArea(areaId, form, areas);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const updates = {
      name: form.name.trim(),
      description: form.description.trim(),
      code: form.code.trim().toUpperCase(),
      updatedBy: currentUser?.id || 'system'
    };

    const { error } = await supabase
      .from('areas')
      .update(mapAreaToDB(updates))
      .eq('id', areaId);

    if (error) {
      console.error('Error updating area:', error);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'edit_area',
        entity: 'area',
        entityId: areaId,
        entityName: updates.name,
        details: `Error editando área ${updates.code}: ${updates.name}`,
        result: 'error'
      });
      return { success: false, errors: [{ field: 'general', message: 'Error editando área' }] };
    }

    setAreas(prev => prev.map(a => (a.id === areaId ? { ...a, ...updates, updatedAt: new Date() } : a)));

    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'edit_area',
      entity: 'area',
      entityId: areaId,
      entityName: updates.name,
      details: `Área actualizada (${updates.code}): ${updates.name}`,
      result: 'exito'
    });

    return { success: true };
  };

  const deleteArea = async (areaId: string): Promise<{ success: boolean; reason?: string }> => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return { success: false, reason: 'Área no encontrada' };

    const rule = canDeleteArea(areaId, userAreaRoles);
    // If assignments exist, we will delete them but return a warning in log message
    const assignments = userAreaRoles.filter(uar => uar.areaId === areaId);
    if (assignments.length > 0) {
      const { error: delAssignErr } = await supabase
        .from('usuario_area_roles')
        .delete()
        .in('id', assignments.map(a => a.id));
      if (delAssignErr) {
        console.error('Error deleting area assignments:', delAssignErr);
        addLog({
          userId: currentUser?.id || 'system',
          userEmail: currentUser?.email || 'system',
          userRole: RoleType.ADMINISTRADOR,
          action: 'delete_area',
          entity: 'area',
          entityId: areaId,
          entityName: area.name,
          details: `Error eliminando asignaciones del área ${area.code}`,
          result: 'error'
        });
        return { success: false, reason: 'Error eliminando asignaciones' };
      }
    }

    const { error: delAreaErr } = await supabase
      .from('areas')
      .delete()
      .eq('id', areaId);

    if (delAreaErr) {
      console.error('Error deleting area:', delAreaErr);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'delete_area',
        entity: 'area',
        entityId: areaId,
        entityName: area.name,
        details: `Error eliminando área ${area.code}: ${area.name}`,
        result: 'error'
      });
      return { success: false, reason: 'Error eliminando área' };
    }

    setUserAreaRoles(prev => prev.filter(uar => uar.areaId !== areaId));
    setAreas(prev => prev.filter(a => a.id !== areaId));

    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'delete_area',
      entity: 'area',
      entityId: areaId,
      entityName: area.name,
      details: `Área eliminada (${area.code})${assignments.length > 0 ? `, ${assignments.length} asignaciones removidas` : ''}`,
      result: assignments.length > 0 ? 'advertencia' : 'exito'
    });

    return { success: true };
  };

  const toggleAreaStatus = async (areaId: string): Promise<{ success: boolean; warning?: string }> => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return { success: false };

    const newStatus = !area.active;
    const rule = canDeactivateArea(areaId, userAreaRoles);
    let warning: string | undefined = undefined;

    // If deactivating and assignments exist, remove them
    if (!newStatus) {
      const assignments = userAreaRoles.filter(uar => uar.areaId === areaId);
      if (assignments.length > 0) {
        warning = rule.reason;
        const { error: delAssignErr } = await supabase
          .from('usuario_area_roles')
          .delete()
          .in('id', assignments.map(a => a.id));
        if (delAssignErr) {
          console.error('Error removing assignments on deactivate:', delAssignErr);
          addLog({
            userId: currentUser?.id || 'system',
            userEmail: currentUser?.email || 'system',
            userRole: RoleType.ADMINISTRADOR,
            action: 'deactivate_area',
            entity: 'area',
            entityId: areaId,
            entityName: area.name,
            details: `Error removiendo asignaciones al desactivar ${area.code}`,
            result: 'error'
          });
          return { success: false };
        }
        setUserAreaRoles(prev => prev.filter(uar => uar.areaId !== areaId));
      }
    }

    const { error } = await supabase
      .from('areas')
      .update({ activo: newStatus, actualizado_el: new Date().toISOString(), actualizado_por: currentUser?.id || 'system' })
      .eq('id', areaId);

    if (error) {
      console.error('Error toggling area status:', error);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: newStatus ? 'activate_area' : 'deactivate_area',
        entity: 'area',
        entityId: areaId,
        entityName: area.name,
        details: `Error cambiando estado de área (${area.code})`,
        result: 'error'
      });
      return { success: false };
    }

    setAreas(prev => prev.map(a => (a.id === areaId ? { ...a, active: newStatus, updatedAt: new Date() } : a)));

    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: newStatus ? 'activate_area' : 'deactivate_area',
      entity: 'area',
      entityId: areaId,
      entityName: area.name,
      details: `Área ${newStatus ? 'activada' : 'desactivada'} (${area.code})${warning ? `. ${warning}` : ''}`,
      result: warning ? 'advertencia' : 'exito'
    });

    return { success: true, warning };
  };

  const getAreaWithUsers = (areaId: string): AreaWithUsers | null => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return null;
    const assignments = userAreaRoles.filter(uar => uar.areaId === areaId);
    const areaUsers = assignments.map(uar => {
      const user = users.find(u => u.id === uar.userId);
      const role = roles.find(r => r.id === uar.roleId);
      return { userId: uar.userId, userName: user ? `${user.firstName} ${user.lastName}` : '', roleId: uar.roleId, roleName: role?.name || '' };
    });
    return { ...area, users: areaUsers };
  };

  const assignUserToArea = async (userId: string, areaId: string, roleId: string): Promise<{ success: boolean }> => {
    const existing = userAreaRoles.find(uar => uar.userId === userId && uar.areaId === areaId && uar.roleId === roleId);
    if (existing) return { success: true }; // already assigned

    const payload = { userId, areaId, roleId, assignedBy: currentUser?.id || 'system' };
    const { data, error } = await supabase
      .from('usuario_area_roles')
      .insert(mapUserAreaRoleToDB(payload))
      .select()
      .single();

    if (error || !data) {
      console.error('Error assigning user to area:', error);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'assign_user_to_area',
        entity: 'assignment',
        entityId: 'unknown',
        entityName: `${userId} → ${areaId}`,
        details: `Error asignando usuario a área`,
        result: 'error'
      });
      return { success: false };
    }

    const mapped = mapUserAreaRoleFromDB(data);
    setUserAreaRoles(prev => [...prev, mapped]);

    const user = users.find(u => u.id === userId);
    const area = areas.find(a => a.id === areaId);
    const roleObj = roles.find(r => r.id === roleId);
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'assign_user_to_area',
      entity: 'assignment',
      entityId: mapped.id,
      entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
      details: `Usuario asignado como ${roleObj?.name}`,
      result: 'exito'
    });

    return { success: true };
  };

  const removeUserFromArea = async (userId: string, areaId: string): Promise<{ success: boolean }> => {
    const assignment = userAreaRoles.find(uar => uar.userId === userId && uar.areaId === areaId);
    if (!assignment) return { success: true };

    const { error } = await supabase
      .from('usuario_area_roles')
      .delete()
      .eq('id', assignment.id);

    if (error) {
      console.error('Error removing assignment:', error);
      addLog({
        userId: currentUser?.id || 'system',
        userEmail: currentUser?.email || 'system',
        userRole: RoleType.ADMINISTRADOR,
        action: 'remove_user_from_area',
        entity: 'assignment',
        entityId: assignment.id,
        entityName: `${userId} → ${areaId}`,
        details: `Error removiendo asignación`,
        result: 'error'
      });
      return { success: false };
    }

    setUserAreaRoles(prev => prev.filter(uar => uar.id !== assignment.id));

    const user = users.find(u => u.id === userId);
    const area = areas.find(a => a.id === areaId);
    addLog({
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system',
      userRole: RoleType.ADMINISTRADOR,
      action: 'remove_user_from_area',
      entity: 'assignment',
      entityId: assignment.id,
      entityName: `${user?.firstName} ${user?.lastName} → ${area?.name}`,
      details: `Usuario removido del área`,
      result: 'exito'
    });

    return { success: true };
  };


  // ============================================
  // AUTENTICACIÓN
  // ============================================

  const login = async (email: string, password: string) => {
    // Server-side JWT auth
    const { data, error } = await authApi.login(email, password);

    if (error || !data) {
      addLog({
        userId: 'unknown',
        userEmail: email,
        userRole: RoleType.VISUALIZADOR,
        action: 'login',
        entity: 'session',
        entityId: 'login-attempt',
        entityName: email,
        details: `Intento de login fallido: ${email} - ${error || 'Unknown error'}`,
        result: 'error'
      });
      return { success: false, error: error || 'Login failed' };
    }

    // Store token
    localStorage.setItem('erp_auth_token', data.token);
    setAuthToken(data.token);

    // Map API user to app User
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastLogin: new Date(),
      metadata: {
        ...data.user.metadata,
        userType: data.user.userType
      }
    };

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
      result: 'exito'
    });

    return { success: true, user };
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Google login error:', error);
      return { success: false, error };
    }

    return { success: true };
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
        result: 'exito'
      });
    }

    // Clear JWT token
    localStorage.removeItem('erp_auth_token');
    setAuthToken(null);

    setCurrentUser(null);
    supabase.auth.signOut(); // Also sign out from Supabase (for Google OAuth)
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
        loading,
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
        loginWithGoogle,
        logout,
        setCurrentUser,
        authToken
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