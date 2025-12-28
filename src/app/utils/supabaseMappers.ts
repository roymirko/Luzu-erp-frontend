import { User, Area, Role, UserAreaRole, AuditLog, RoleType, LogAction, LogEntity, LogResult } from '../types/business';

// HELPERS
const toDate = (str: string | Date | null | undefined): Date => {
    if (!str) return new Date();
    return typeof str === 'string' ? new Date(str) : str;
};

// USERS
export const mapUserFromDB = (dbUser: any): User => ({
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    avatar: dbUser.avatar,
    active: dbUser.active,
    createdAt: toDate(dbUser.created_at),
    updatedAt: toDate(dbUser.updated_at),
    lastLogin: dbUser.last_login ? toDate(dbUser.last_login) : undefined,
    createdBy: dbUser.created_by,
    metadata: dbUser.metadata || {}
});

export const mapUserToDB = (user: Partial<User>) => {
    const dbUser: any = {};
    if (user.id) dbUser.id = user.id;
    if (user.email) dbUser.email = user.email;
    if (user.firstName) dbUser.first_name = user.firstName;
    if (user.lastName) dbUser.last_name = user.lastName;
    if (user.avatar !== undefined) dbUser.avatar = user.avatar;
    if (user.active !== undefined) dbUser.active = user.active;
    if (user.lastLogin) dbUser.last_login = user.lastLogin.toISOString();
    if (user.createdBy) dbUser.created_by = user.createdBy;
    if (user.metadata) dbUser.metadata = user.metadata;
    return dbUser;
};

// AREAS
export const mapAreaFromDB = (dbArea: any): Area => ({
    id: dbArea.id,
    name: dbArea.name,
    code: dbArea.code,
    description: dbArea.description,
    manager: dbArea.manager_id,
    active: dbArea.active,
    createdAt: toDate(dbArea.created_at),
    updatedAt: toDate(dbArea.updated_at),
    createdBy: dbArea.created_by,
    metadata: dbArea.metadata || {}
});

export const mapAreaToDB = (area: Partial<Area>) => {
    const dbArea: any = {};
    if (area.id) dbArea.id = area.id;
    if (area.name) dbArea.name = area.name;
    if (area.code) dbArea.code = area.code;
    if (area.description) dbArea.description = area.description;
    if (area.manager) dbArea.manager_id = area.manager;
    if (area.active !== undefined) dbArea.active = area.active;
    if (area.createdBy) dbArea.created_by = area.createdBy;
    if (area.metadata) dbArea.metadata = area.metadata;
    return dbArea;
};

// ROLES
export const mapRoleFromDB = (dbRole: any): Role => ({
    id: dbRole.id,
    name: dbRole.name as RoleType,
    description: dbRole.description,
    permissions: dbRole.permissions || [],
    createdAt: toDate(dbRole.created_at)
});

// USER AREA ROLES
export const mapUserAreaRoleFromDB = (dbUar: any): UserAreaRole => ({
    id: dbUar.id,
    userId: dbUar.user_id,
    areaId: dbUar.area_id,
    roleId: dbUar.role_id,
    assignedAt: toDate(dbUar.assigned_at),
    assignedBy: dbUar.assigned_by
});

export const mapUserAreaRoleToDB = (uar: Partial<UserAreaRole>) => {
    const dbUar: any = {};
    if (uar.userId) dbUar.user_id = uar.userId;
    if (uar.areaId) dbUar.area_id = uar.areaId;
    if (uar.roleId) dbUar.role_id = uar.roleId;
    if (uar.assignedBy) dbUar.assigned_by = uar.assignedBy;
    return dbUar;
};

// LOGS
export const mapLogFromDB = (dbLog: any): AuditLog => ({
    id: dbLog.id,
    timestamp: toDate(dbLog.timestamp),
    userId: dbLog.user_id,
    userEmail: dbLog.user_email || '',
    userRole: (dbLog.user_role as RoleType) || RoleType.VISUALIZADOR,
    action: dbLog.action as LogAction,
    entity: dbLog.entity as LogEntity,
    entityId: dbLog.entity_id,
    entityName: dbLog.entity_name || '',
    details: dbLog.details || '',
    result: dbLog.result as LogResult,
    metadata: dbLog.metadata,
    ipAddress: dbLog.ip_address,
    userAgent: dbLog.user_agent
});

export const mapLogToDB = (log: Partial<AuditLog>) => {
    const dbLog: any = {};
    if (log.userId) dbLog.user_id = log.userId;
    if (log.userEmail) dbLog.user_email = log.userEmail;
    if (log.userRole) dbLog.user_role = log.userRole;
    if (log.action) dbLog.action = log.action;
    if (log.entity) dbLog.entity = log.entity;
    if (log.entityId) dbLog.entity_id = log.entityId;
    if (log.entityName) dbLog.entity_name = log.entityName;
    if (log.details) dbLog.details = log.details;
    if (log.result) dbLog.result = log.result;
    if (log.metadata) dbLog.metadata = log.metadata;
    return dbLog;
};
