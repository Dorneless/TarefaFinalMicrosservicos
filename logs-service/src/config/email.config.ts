import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const MailerConfig = MailerModule.forRoot({
    transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
    defaults: {
        from: `"Sistema de Eventos" <${process.env.EMAIL_FROM || 'noreply@gmail.com'}>`,
    },
    template: {
        dir: join(__dirname, '..', 'notification', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
            strict: true,
        },
    },
});
