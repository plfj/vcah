/**
 * Type-Safe HTTP Transport Client
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

export class ApiClient {
  constructor(private baseUrl: string = '/api') {}

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return { data, statusCode: res.status };
    } catch (err: any) {
      return { error: err?.message || 'Network error', statusCode: 500 };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { data, statusCode: res.status };
    } catch (err: any) {
      return { error: err?.message || 'Network error', statusCode: 500 };
    }
  }
}

export const apiClient = new ApiClient();
