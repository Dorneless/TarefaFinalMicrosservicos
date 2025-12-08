import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AccountCreatedDto } from './dto/account-created.dto';
import { TemporaryCodeDto } from './dto/temporary-code.dto';
import { PasswordChangedDto } from './dto/password-changed.dto';
import { AccountDeletedDto } from './dto/account-deleted.dto';
import { EventRegistrationDto } from './dto/event-registration.dto';
import { EventCancellationDto } from './dto/event-cancellation.dto';
import { AttendanceConfirmedDto } from './dto/attendance-confirmed.dto';
import { CertificateIssuedDto } from './dto/certificate-issued.dto';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(private readonly mailerService: MailerService) { }

    async sendAccountCreatedEmail(dto: AccountCreatedDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: 'Bem-vindo ao Sistema de Eventos!',
                template: 'account-created',
                context: {
                    name: dto.name,
                },
            });
            this.logger.log(`Email de criação de conta enviado para ${dto.email}`);
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de criação de conta para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de criação de conta');
        }
    }

    async sendTemporaryCodeEmail(dto: TemporaryCodeDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: 'Seu Código de Verificação',
                template: 'temporary-code',
                context: {
                    code: dto.code,
                    expirationMinutes: dto.expirationMinutes,
                },
            });
            this.logger.log(`Email de código temporário enviado para ${dto.email}`);
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de código temporário para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de código temporário');
        }
    }

    async sendPasswordChangedEmail(dto: PasswordChangedDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: 'Senha Alterada com Sucesso',
                template: 'password-changed',
                context: {
                    name: dto.name,
                },
            });
            this.logger.log(`Email de alteração de senha enviado para ${dto.email}`);
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de alteração de senha para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de alteração de senha');
        }
    }

    async sendAccountDeletedEmail(dto: AccountDeletedDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: 'Conta Excluída',
                template: 'account-deleted',
                context: {
                    name: dto.name,
                },
            });
            this.logger.log(`Email de exclusão de conta enviado para ${dto.email}`);
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de exclusão de conta para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de exclusão de conta');
        }
    }

    async sendEventRegistrationEmail(dto: EventRegistrationDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: `Inscrição Confirmada: ${dto.eventName}`,
                template: 'event-registration',
                context: {
                    name: dto.name,
                    eventName: dto.eventName,
                    eventDate: this.formatDate(dto.eventDate),
                    eventLocation: dto.eventLocation,
                },
            });
            this.logger.log(
                `Email de inscrição em evento enviado para ${dto.email}`,
            );
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de inscrição em evento para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de inscrição em evento');
        }
    }

    async sendEventCancellationEmail(dto: EventCancellationDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: `Inscrição Cancelada: ${dto.eventName}`,
                template: 'event-cancellation',
                context: {
                    name: dto.name,
                    eventName: dto.eventName,
                    eventDate: this.formatDate(dto.eventDate),
                },
            });
            this.logger.log(
                `Email de cancelamento de inscrição enviado para ${dto.email}`,
            );
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de cancelamento de inscrição para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de cancelamento de inscrição');
        }
    }

    async sendAttendanceConfirmedEmail(
        dto: AttendanceConfirmedDto,
    ): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: `Presença Confirmada: ${dto.eventName}`,
                template: 'attendance-confirmed',
                context: {
                    name: dto.name,
                    eventName: dto.eventName,
                    eventDate: this.formatDate(dto.eventDate),
                },
            });
            this.logger.log(
                `Email de confirmação de presença enviado para ${dto.email}`,
            );
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de confirmação de presença para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de confirmação de presença');
        }
    }
    async sendCertificateIssuedEmail(dto: CertificateIssuedDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: `Certificado de Participação: ${dto.eventName}`,
                template: 'certificate-issued',
                context: {
                    userName: dto.userName,
                    eventName: dto.eventName,
                    certificateCode: dto.certificateCode,
                },
                attachments: [
                    {
                        filename: 'certificado.pdf',
                        path: dto.pdfPath,
                    },
                ],
            });
            this.logger.log(
                `Email de certificado enviado para ${dto.email}`,
            );
        } catch (error) {
            this.logger.error(
                `Erro ao enviar email de certificado para ${dto.email}`,
                error,
            );
            throw new Error('Falha ao enviar email de certificado');
        }
    }

    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (e) {
            return dateString; // Fallback if parsing fails
        }
    }
}
