import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Param,
    StreamableFile,
} from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { createReadStream } from 'fs';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
    constructor(private readonly certificateService: CertificateService) { }

    @Post('issue')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Emitir certificado para um evento' })
    @ApiResponse({ status: 201, description: 'Certificado emitido com sucesso.' })
    @ApiResponse({ status: 400, description: 'Presença não confirmada ou certificado já emitido.' })
    async issueCertificate(@Body() dto: IssueCertificateDto, @Req() req): Promise<StreamableFile> {
        const user = req.user;
        // user.userId comes from the JWT sub claim, which is the email in this system
        const certificate = await this.certificateService.issueCertificate(
            user.userId,
            dto,
        );

        const file = createReadStream(certificate.pdfPath);
        return new StreamableFile(file, {
            type: 'application/pdf',
            disposition: `attachment; filename="${certificate.code}.pdf"`,
        });
    }

    @Get('my-certificates')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar meus certificados' })
    @ApiResponse({ status: 200, description: 'Lista de certificados.' })
    async getMyCertificates(@Req() req) {
        const user = req.user;
        return this.certificateService.getUserCertificates(user.userId);
    }

    @Get('download/:code')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Baixar certificado (seguro)' })
    @ApiResponse({ status: 200, description: 'Arquivo PDF do certificado.' })
    @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
    async downloadCertificate(@Param('code') code: string, @Req() req): Promise<StreamableFile> {
        const user = req.user;
        const pdfPath = await this.certificateService.downloadCertificate(
            user.userId,
            code,
        );

        const file = createReadStream(pdfPath);
        return new StreamableFile(file, {
            type: 'application/pdf',
            disposition: `attachment; filename="${code}.pdf"`,
        });
    }

    @Get('verify/:code')
    @ApiOperation({ summary: 'Verificar autenticidade de um certificado' })
    @ApiResponse({ status: 200, description: 'Certificado válido.' })
    @ApiResponse({ status: 404, description: 'Certificado inválido.' })
    async verifyCertificate(@Param('code') code: string) {
        return this.certificateService.verifyCertificate(code);
    }
}
