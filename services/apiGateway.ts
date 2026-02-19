const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';

interface ServiceResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('bloom_jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiGateway = {
    request: async <T>(_service: string, endpoint: string, body?: any): Promise<ServiceResponse<T>> => {
        const url = `${BACKEND_URL}${endpoint}`;
        try {
            const isFormData = body instanceof FormData;
            const response = await fetch(url, {
                method: body ? 'POST' : 'GET',
                headers: { ...getAuthHeader(), ...(isFormData ? {} : { 'Content-Type': 'application/json' }) },
                body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
                signal: AbortSignal.timeout(15_000),
            });
            if (response.status === 204) return { status: 200 };
            const data = await response.json().catch(() => null);
            if (!response.ok) return { status: response.status, error: data?.error || `HTTP ${response.status}` };
            return { status: 200, data: data as T };
        } catch (err: any) {
            if (err.name === 'TimeoutError') return { status: 408, error: 'Сервер не ответил вовремя.' };
            if (err.name === 'TypeError') return { status: 0, error: 'Нет связи с сервером.' };
            return { status: 500, error: err.message || 'Неизвестная ошибка' };
        }
    },

    get: async <T>(endpoint: string): Promise<ServiceResponse<T>> => {
        const url = `${BACKEND_URL}${endpoint}`;
        try {
            const response = await fetch(url, { headers: getAuthHeader(), signal: AbortSignal.timeout(15_000) });
            const data = await response.json().catch(() => null);
            if (!response.ok) return { status: response.status, error: data?.error };
            return { status: 200, data: data as T };
        } catch (err: any) {
            return { status: 0, error: err.message };
        }
    },

    put: async <T>(endpoint: string, body: any): Promise<ServiceResponse<T>> => {
        const url = `${BACKEND_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(15_000),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) return { status: response.status, error: data?.error };
            return { status: 200, data: data as T };
        } catch (err: any) {
            return { status: 0, error: err.message };
        }
    },

    delete: async <T>(endpoint: string): Promise<ServiceResponse<T>> => {
        const url = `${BACKEND_URL}${endpoint}`;
        try {
            const response = await fetch(url, { method: 'DELETE', headers: getAuthHeader(), signal: AbortSignal.timeout(15_000) });
            const data = await response.json().catch(() => null);
            if (!response.ok) return { status: response.status, error: data?.error };
            return { status: 200, data: data as T };
        } catch (err: any) {
            return { status: 0, error: err.message };
        }
    },
};
