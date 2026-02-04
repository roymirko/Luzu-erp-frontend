const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('erp_auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.error || 'Request failed' };
    }

    return { data: json };
  } catch (err) {
    return { error: 'Network error' };
  }
}

// Auth types
export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  avatar?: string;
  active?: boolean;
  metadata?: Record<string, any>;
}

// User types
export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  active: boolean;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  userType?: string;
  active?: boolean;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () => request<AuthUser>('/auth/me')
};

// Users API
export const usersApi = {
  list: () => request<ApiUser[]>('/users'),

  create: (input: CreateUserInput) =>
    request<ApiUser>('/users', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  update: (id: string, input: UpdateUserInput) =>
    request<ApiUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    }),

  resetPassword: (id: string, password: string) =>
    request<{ success: boolean }>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password })
    })
};
