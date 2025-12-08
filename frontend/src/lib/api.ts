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

export const userService = createApiClient(process.env.NEXT_PUBLIC_USER_API_URL || 'http://177.44.248.107:8080/api');
export const eventsService = createApiClient(process.env.NEXT_PUBLIC_EVENTS_API_URL || 'http://177.44.248.107:8081/api');
export const notificationService = createApiClient(process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || 'http://177.44.248.107:8082/api');
export const certificateService = createApiClient(process.env.NEXT_PUBLIC_CERTIFICATE_API_URL || 'http://177.44.248.107:8083/certificates');
export const certificateApi = createApiClient(process.env.NEXT_PUBLIC_CERTIFICATE_API_BASE_URL || 'http://177.44.248.107:8083');
export const logsApi = createApiClient(process.env.NEXT_PUBLIC_LOGS_API_URL || 'http://177.44.248.107:8084');
