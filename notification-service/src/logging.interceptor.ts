import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import axios from 'axios';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, ip, user } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    this.logRequest(request, 200, data); // Assuming 200 for success, can be refined
                },
                error: (error) => {
                    const status = error.status || 500;
                    this.logRequest(request, status, error.message);
                },
            }),
        );
    }

    private async logRequest(request: any, statusCode: number, responseBody: any) {
        const { method, url, body, ip, user } = request;

        // Avoid logging sensitive data or large bodies if needed
        const logData = {
            userEmail: user?.email || 'anonymous',
            body: JSON.stringify(body),
            statusCode,
            method,
            service: 'notification-service',
            ip: ip || request.socket.remoteAddress,
            path: url,
        };

        try {
            // Fire and forget
            const logsUrl = process.env.LOGS_API_URL || 'http://localhost:8084/logs';
            axios.post(logsUrl, logData).catch(err => {
                this.logger.error(`Failed to send log: ${err.message}`);
            });
        } catch (err) {
            // Ignore errors to not block the main flow
        }
    }
}
