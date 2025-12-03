import axios from 'axios';
import { getSession } from 'next-auth/react';

const createApiClient = (baseURL: string) => {
    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    api.interceptors.request.use(async (config) => {
        const session = await getSession();
        if (session?.user?.accessToken) {
            config.headers.Authorization = `Bearer ${session.user.accessToken}`;
        }
        return config;
    });

    return api;
};

export const userService = createApiClient('http://localhost:8080/api');
export const eventsService = createApiClient('http://localhost:8081/api');
export const notificationService = createApiClient('http://localhost:8082/api');
export const certificateService = createApiClient('http://localhost:8083/certificates'); // Note: Certificate controller has /certificates prefix, but main.ts might not have /api prefix or it does?
// Checking certificate service main.ts: app.listen(process.env.PORT ?? 3000); No setGlobalPrefix('api').
// But the controller has @Controller('certificates').
// So it is http://localhost:8083/certificates
// Wait, the other services have /api prefix.
// User Service: @RequestMapping("/api/admin"), @RequestMapping("/api/auth"), @RequestMapping("/api/users")
// Events Service: @RequestMapping("/api/events"), @RequestMapping("/api")
// Notification Service: app.setGlobalPrefix('api');
// Certificate Service: No global prefix in main.ts. Controller is 'certificates'.
// So URL is http://localhost:8083/certificates

// Correction for certificate service base URL
export const certificateApi = createApiClient('http://localhost:8083'); 
