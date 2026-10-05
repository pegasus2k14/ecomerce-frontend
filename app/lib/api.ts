const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Producto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  user_id: number;
  user?: User;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  type_token: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  //API_URL = http://127.0.0.1:8000/api
  //endpoint -> Me lo pasan por Param request('/posts',)
  //http://127.0.0.1:8000/api/posts
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data; 
}

export const api = {
  // Auth 
  /* api.register({
    name: "Ciro"; 
    email: "ciro@kpo.com"; 
    password: "Asd.1234" 
  }) */
  register: (body: { name: string; email: string; password: string }) =>
    request<{ message: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),



  // Obtener Productos
  getPosts: () => request<{ data: Producto[] }>('/productos', { method: 'GET' }),

  // CRUD Productos
  createProducto: (body: { name: string; description: string; price: string; stock: number }) =>
    request<{ message: string; data: Producto }>('/productos', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateProducto: (id: number, body: { name: string; description: string; price: string; stock: number }) =>
    request<{ message: string; data: Producto }>(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteProductos: (id: number) =>
    request<{ message: string }>(`/productos/${id}`, {
      method: 'DELETE',
    }),

    //No es funcional, falta logica del lado del api <-----
  restoreProductos: (id: number) =>
    request<{ message: string }>(`/productos/${id}/restore`, {
      method: 'PUT',
    }),
};