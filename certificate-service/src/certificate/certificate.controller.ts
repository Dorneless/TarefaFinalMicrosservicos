import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Param,
} from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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
    async issueCertificate(@Body() dto: IssueCertificateDto, @Req() req) {
        const user = req.user;
        // user.userId comes from the JWT sub claim, which is the email in this system
        return this.certificateService.issueCertificate(
            user.userId,
            dto,
        );
    }

    @Get('verify/:code')
    @ApiOperation({ summary: 'Verificar autenticidade de um certificado' })
    @ApiResponse({ status: 200, description: 'Certificado válido.' })
    @ApiResponse({ status: 404, description: 'Certificado inválido.' })
    async verifyCertificate(@Param('code') code: string) {
        return this.certificateService.verifyCertificate(code);
    }
}
