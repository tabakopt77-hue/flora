
import { Order } from '../types';
import { GoogleGenAI } from "@google/genai";

const REAL_BACKEND_URL = 'http://localhost:8080/api/v1';

// Initialize Client-Side AI for Fallback Mode
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simulation of network characteristics per service
const simulateServiceCall = async (serviceType: 'rust' | 'node' | 'python') => {
    let latency = 0;
    switch (serviceType) {
        case 'rust': 
            latency = Math.floor(Math.random() * 40) + 10; 
            break;
        case 'node':
            latency = Math.floor(Math.random() * 60) + 20; 
            break;
        case 'python':
            latency = Math.floor(Math.random() * 400) + 100; 
            break;
    }
    return new Promise(resolve => setTimeout(resolve, latency));
};

interface ServiceResponse<T> {
    data?: T;
    error?: string;
    status: number;
    meta: {
        service: string;
        latency: string;
        traceId: string;
        timestamp: number;
        mode: 'REAL' | 'SIMULATION';
    }
}

// --- GATEWAY EXPORT ---

export const apiGateway = {
    /**
     * Proxies requests. Tries Real Backend first (Hybrid Architecture).
     * If backend is offline, falls back to Client-Side Logic (Serverless/Mock).
     */
    request: async <T>(
        target: 'core' | 'ai' | 'auth', 
        endpoint: string, 
        payload?: any,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
    ): Promise<ServiceResponse<T>> => {
        const start = Date.now();
        const traceId = `req_${Math.random().toString(36).substr(2, 9)}`;

        console.log(`[Gateway] Routing ${traceId} -> ${target.toUpperCase()} Service: ${method} ${endpoint}`);

        // 1. Try REAL BACKEND
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); 

            const headers: Record<string, string> = {};
            let body = undefined;
            
            if (payload) {
                if (payload instanceof FormData) {
                    body = payload;
                } else {
                    headers['Content-Type'] = 'application/json';
                    body = JSON.stringify(payload);
                }
            }

            const token = localStorage.getItem('bloom_jwt_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${REAL_BACKEND_URL}${endpoint}`, {
                method,
                headers,
                body,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return {
                    status: 200,
                    data: data as T,
                    meta: {
                        service: `${target}-prod`,
                        latency: `${Date.now() - start}ms`,
                        traceId,
                        timestamp: Date.now(),
                        mode: 'REAL'
                    }
                };
            }
        } catch (e) {
            // Backend unreachable, proceed to fallback
        }

        // 2. FALLBACK TO CLIENT-SIDE SIMULATION
        // This ensures the app works beautifully without the Rust/Python backend running locally.
        
        let mockData: any = {};
        let serviceName = 'gateway-sim';

        try {
            await simulateServiceCall(target === 'core' ? 'rust' : target === 'ai' ? 'python' : 'node');

            // --- AI FALLBACK (Uses Client-Side Gemini SDK) ---
            if (target === 'ai') {
                serviceName = 'client-gemini-sdk';
                
                if (endpoint === '/ai/chat') {
                    const fullPrompt = payload.messages.map((m: any) => 
                        `${m.role === 'model' ? 'Model' : 'User'}: ${m.parts[0].text}`
                    ).join('\n');

                    const response = await genAI.models.generateContent({
                        model: 'gemini-2.5-flash-latest',
                        contents: fullPrompt,
                        config: { systemInstruction: "You are Flora, a helpful AI florist assistant." }
                    });
                    
                    mockData = { text: response.text };
                } 
                else if (endpoint === '/ai/vision') {
                     const formData = payload as FormData;
                     const prompt = formData.get('prompt') as string;
                     const file = formData.get('image') as File;
                     
                     if (file && prompt) {
                        const arrayBuffer = await file.arrayBuffer();
                        const base64String = btoa(
                            new Uint8Array(arrayBuffer)
                                .reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        
                        const response = await genAI.models.generateContent({
                             model: 'gemini-2.5-flash-latest',
                             contents: {
                                 parts: [
                                     { text: prompt },
                                     { inlineData: { mimeType: file.type, data: base64String } }
                                 ]
                             }
                        });
                        mockData = { text: response.text };
                     }
                }
            }
            
            // --- AUTH FALLBACK ---
            else if (target === 'auth') {
                serviceName = 'client-auth-mock';
                if (endpoint === '/auth/login' || endpoint === '/auth/register') {
                     mockData = {
                        token: "mock_jwt_token_" + Date.now(),
                        user: {
                            id: 'u1',
                            name: 'Алексей Смирнов',
                            email: payload.email,
                            role: payload.email.includes('admin') ? 'admin' : payload.email.includes('partner') ? 'seller' : 'buyer',
                            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
                            status: 'active'
                        }
                    };
                }
            }

            // --- CORE FALLBACK ---
            else if (target === 'core') {
                serviceName = 'client-core-mock';
                // Note: GET requests for Lists usually return arrays, POST returns Objects
                if (endpoint === '/products' && method === 'GET') {
                    // Fallback to local constants if backend down
                    const { PRODUCTS } = await import('../constants');
                    mockData = PRODUCTS;
                }
                else if (endpoint === '/orders/create') {
                    mockData = {
                        id: `ORD-MOCK-${Math.floor(Math.random() * 10000)}`,
                        status: 'created',
                        ...payload
                    };
                }
                else if (endpoint === '/payments/charge') {
                    mockData = { transactionId: `TX-MOCK-${Date.now()}` };
                }
            }

        } catch (error: any) {
            console.error("Simulation Error:", error);
            if (target === 'ai') {
                mockData = { text: "Извините, я сейчас не могу подключиться к серверу AI. Попробуйте позже." };
            } else {
                return {
                    status: 500,
                    error: "Service Simulation Failed",
                    meta: { service: serviceName, latency: '0ms', traceId, timestamp: Date.now(), mode: 'SIMULATION' }
                };
            }
        }

        const duration = Date.now() - start;

        return {
            status: 200,
            data: mockData as T,
            meta: {
                service: serviceName,
                latency: `${duration}ms`,
                traceId,
                timestamp: Date.now(),
                mode: 'SIMULATION'
            }
        };
    },

    getTelemetry: async () => {
        const jitter = (base: number) => base + Math.floor(Math.random() * 10) - 5;
        return {
            gateway: { status: 'healthy', uptime: '99.99%', rps: jitter(340), active_sockets: 1200 },
            rust: { status: 'healthy', active_connections: 45, tx_per_sec: jitter(120), lock_contention: '0.01%' },
            python: { status: 'healthy', gpu_load: '45%', queue_depth: Math.max(0, jitter(3)), model: 'gemini-pro-vision' },
            kafka: { status: 'healthy', lag: 0, brokers: 3, throughput: `${jitter(45)}MB/s` }
        };
    }
};
