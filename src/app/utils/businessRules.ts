// ============================================
// REGLAS DE NEGOCIO Y VALIDACIONES
// ============================================

import {
  User,
  Area,
  UserAreaRole,
  CreateUserForm,
  EditUserForm,
  CreateAreaForm,
  EditAreaForm,
  ValidationResult,
  ValidationError,
  RoleType
} from '../types/business';

/**
 * REGLA 1: Validación de Email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * REGLA 2: Validación de Username
 * Debe tener al menos 3 caracteres, solo alfanuméricos y guiones
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * REGLA 3: Validación de Password
 * Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
 */
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * REGLA 4: Validación de Código de Área
 * 2-10 caracteres alfanuméricos en mayúsculas
 */
export const validateAreaCode = (code: string): boolean => {
  const codeRegex = /^[A-Z0-9]{2,10}$/;
  return codeRegex.test(code);
};

/**
 * REGLA 5: Validar que un usuario tenga al menos un rol
 */
export const userMustHaveAtLeastOneRole = (
  userAreaRoles: UserAreaRole[]
): boolean => {
  return userAreaRoles.length > 0;
};

/**
 * REGLA 6: Validar unicidad de email
 */
export const isEmailUnique = (
  email: string,
  users: User[],
  excludeUserId?: string
): boolean => {
  return !users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeUserId
  );
};

/**
 * REGLA 7: Validar unicidad de username
 */
export const isUsernameUnique = (
  username: string,
  users: User[],
  excludeUserId?: string
): boolean => {
  return !users.some(
    (user) => user.username.toLowerCase() === username.toLowerCase() && user.id !== excludeUserId
  );
};

/**
 * REGLA 8: Validar unicidad de código de área
 */
export const isAreaCodeUnique = (
  code: string,
  areas: Area[],
  excludeAreaId?: string
): boolean => {
  return !areas.some(
    (area) => area.code.toUpperCase() === code.toUpperCase() && area.id !== excludeAreaId
  );
};

/**
 * REGLA 9: Solo administradores pueden realizar acciones críticas
 */
export const canPerformAction = (
  userRole: RoleType,
  action: 'create' | 'edit' | 'delete'
): boolean => {
  return userRole === RoleType.ADMINISTRADOR;
};

/**
 * REGLA 10: Validar que no se elimine el último administrador
 */
export const canDeleteUser = (
  userId: string,
  users: User[],
  userAreaRoles: UserAreaRole[],
  roles: { id: string; name: RoleType }[]
): { canDelete: boolean; reason?: string } => {
  // Encontrar el rol de administrador
  const adminRole = roles.find((r) => r.name === RoleType.ADMINISTRADOR);
  if (!adminRole) {
    return { canDelete: false, reason: 'No se encontró el rol de Administrador' };
  }

  // Contar cuántos administradores activos hay
  const activeAdminUsers = users.filter((u) => {
    if (!u.active) return false;
    const userRoles = userAreaRoles.filter((uar) => uar.userId === u.id);
    return userRoles.some((uar) => uar.roleId === adminRole.id);
  });

  // Verificar si el usuario a eliminar es administrador
  const userToDeleteRoles = userAreaRoles.filter((uar) => uar.userId === userId);
  const isUserAdmin = userToDeleteRoles.some((uar) => uar.roleId === adminRole.id);

  if (isUserAdmin && activeAdminUsers.length <= 1) {
    return {
      canDelete: false,
      reason: 'No se puede eliminar el último administrador del sistema'
    };
  }

  return { canDelete: true };
};

/**
 * VALIDACIÓN COMPLETA: Crear Usuario
 */
export const validateCreateUser = (
  form: CreateUserForm,
  existingUsers: User[],
  existingAreas: Area[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar email
  if (!form.email || !form.email.trim()) {
    errors.push({ field: 'email', message: 'El email es obligatorio' });
  } else if (!validateEmail(form.email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  } else if (!isEmailUnique(form.email, existingUsers)) {
    errors.push({ field: 'email', message: 'Este email ya está registrado' });
  }

  // Validar nombres
  if (!form.firstName || !form.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'El nombre es obligatorio' });
  }

  if (!form.lastName || !form.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'El apellido es obligatorio' });
  }

  // Validar áreas y roles
  if (!form.areas || form.areas.length === 0) {
    errors.push({ field: 'areas', message: 'Debe asignar al menos un área con su rol' });
  } else {
    // Verificar que todas las áreas tengan área y rol seleccionados
    form.areas.forEach((area, index) => {
      if (!area.areaId || !area.roleId) {
        errors.push({
          field: 'areas',
          message: `Complete todos los campos de área y rol`
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * VALIDACIÓN COMPLETA: Editar Usuario
 */
export const validateEditUser = (
  userId: string,
  form: EditUserForm,
  existingUsers: User[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar email
  if (!form.email || !form.email.trim()) {
    errors.push({ field: 'email', message: 'El email es obligatorio' });
  } else if (!validateEmail(form.email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  } else if (!isEmailUnique(form.email, existingUsers, userId)) {
    errors.push({ field: 'email', message: 'Este email ya está registrado' });
  }

  // Validar nombres
  if (!form.firstName || !form.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'El nombre es obligatorio' });
  }

  if (!form.lastName || !form.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'El apellido es obligatorio' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * VALIDACIÓN COMPLETA: Crear Área
 */
export const validateCreateArea = (
  form: CreateAreaForm,
  existingAreas: Area[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar nombre
  if (!form.name || !form.name.trim()) {
    errors.push({ field: 'name', message: 'El nombre del área es obligatorio' });
  } else if (form.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'El nombre debe tener al menos 2 caracteres' });
  }

  // Validar descripción
  if (!form.description || !form.description.trim()) {
    errors.push({ field: 'description', message: 'La descripción es obligatoria' });
  }

  // Validar código
  if (!form.code || !form.code.trim()) {
    errors.push({ field: 'code', message: 'El código del área es obligatorio' });
  } else if (!validateAreaCode(form.code)) {
    errors.push({
      field: 'code',
      message: 'El código debe tener 2-10 caracteres alfanuméricos en mayúsculas'
    });
  } else if (!isAreaCodeUnique(form.code, existingAreas)) {
    errors.push({ field: 'code', message: 'Este código ya está en uso' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * VALIDACIÓN COMPLETA: Editar Área
 */
export const validateEditArea = (
  areaId: string,
  form: EditAreaForm,
  existingAreas: Area[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar nombre
  if (!form.name || !form.name.trim()) {
    errors.push({ field: 'name', message: 'El nombre del área es obligatorio' });
  } else if (form.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'El nombre debe tener al menos 2 caracteres' });
  }

  // Validar descripción
  if (!form.description || !form.description.trim()) {
    errors.push({ field: 'description', message: 'La descripción es obligatoria' });
  }

  // Validar código
  if (!form.code || !form.code.trim()) {
    errors.push({ field: 'code', message: 'El código del área es obligatorio' });
  } else if (!validateAreaCode(form.code)) {
    errors.push({
      field: 'code',
      message: 'El código debe tener 2-10 caracteres alfanuméricos en mayúsculas'
    });
  } else if (!isAreaCodeUnique(form.code, existingAreas, areaId)) {
    errors.push({ field: 'code', message: 'Este código ya está en uso' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * REGLA: Verificar si se puede desactivar un área
 */
export const canDeactivateArea = (
  areaId: string,
  userAreaRoles: UserAreaRole[]
): { canDeactivate: boolean; reason?: string; affectedUsers?: number } => {
  const affectedAssignments = userAreaRoles.filter((uar) => uar.areaId === areaId);

  if (affectedAssignments.length > 0) {
    return {
      canDeactivate: true,
      reason: 'Esta área tiene usuarios asignados. Al desactivarla, se eliminarán sus asignaciones.',
      affectedUsers: new Set(affectedAssignments.map((a) => a.userId)).size
    };
  }

  return { canDeactivate: true };
};

/**
 * REGLA: Verificar si se puede eliminar un área
 */
export const canDeleteArea = (
  areaId: string,
  userAreaRoles: UserAreaRole[]
): { canDelete: boolean; reason?: string; affectedUsers?: number } => {
  const affectedAssignments = userAreaRoles.filter((uar) => uar.areaId === areaId);

  if (affectedAssignments.length > 0) {
    return {
      canDelete: true,
      reason: 'Esta área tiene usuarios asignados. Al eliminarla, se eliminarán sus asignaciones.',
      affectedUsers: new Set(affectedAssignments.map((a) => a.userId)).size
    };
  }

  return { canDelete: true };
};