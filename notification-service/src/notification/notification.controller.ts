import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AccountCreatedDto } from './dto/account-created.dto';
import { TemporaryCodeDto } from './dto/temporary-code.dto';
import { PasswordChangedDto } from './dto/password-changed.dto';
import { AccountDeletedDto } from './dto/account-deleted.dto';
import { EventRegistrationDto } from './dto/event-registration.dto';
import { EventCancellationDto } from './dto/event-cancellation.dto';
import { AttendanceConfirmedDto } from './dto/attendance-confirmed.dto';
import { CertificateIssuedDto } from './dto/certificate-issued.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('account-created')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email de criação de conta' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendAccountCreatedEmail(@Body() dto: AccountCreatedDto) {
        await this.notificationService.sendAccountCreatedEmail(dto);
        return { message: 'Email de criação de conta enviado com sucesso' };
    }

    @Post('temporary-code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email com código temporário' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendTemporaryCodeEmail(@Body() dto: TemporaryCodeDto) {
        await this.notificationService.sendTemporaryCodeEmail(dto);
        return { message: 'Email com código temporário enviado com sucesso' };
    }

    @Post('password-changed')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email de alteração de senha' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendPasswordChangedEmail(@Body() dto: PasswordChangedDto) {
        await this.notificationService.sendPasswordChangedEmail(dto);
        return { message: 'Email de alteração de senha enviado com sucesso' };
    }

    @Post('account-deleted')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email de exclusão de conta' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendAccountDeletedEmail(@Body() dto: AccountDeletedDto) {
        await this.notificationService.sendAccountDeletedEmail(dto);
        return { message: 'Email de exclusão de conta enviado com sucesso' };
    }

    @Post('event-registration')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email de inscrição em evento' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendEventRegistrationEmail(@Body() dto: EventRegistrationDto) {
        await this.notificationService.sendEventRegistrationEmail(dto);
        return { message: 'Email de inscrição em evento enviado com sucesso' };
    }

    @Post('event-cancellation')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email de cancelamento de inscrição' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendEventCancellationEmail(@Body() dto: EventCancellationDto) {
        await this.notificationService.sendEventCancellationEmail(dto);
        return {
            message: 'Email de cancelamento de inscrição enviado com sucesso',
        };
    }

    @Post('attendance-confirmed')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email de confirmação de presença' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendAttendanceConfirmedEmail(@Body() dto: AttendanceConfirmedDto) {
        await this.notificationService.sendAttendanceConfirmedEmail(dto);
        return { message: 'Email de confirmação de presença enviado com sucesso' };
    }
    @Post('certificate-issued')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar email com certificado' })
    @ApiResponse({
        status: 200,
        description: 'Email enviado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    async sendCertificateIssuedEmail(@Body() dto: CertificateIssuedDto) {
        await this.notificationService.sendCertificateIssuedEmail(dto);
        return { message: 'Email com certificado enviado com sucesso' };
    }
}
