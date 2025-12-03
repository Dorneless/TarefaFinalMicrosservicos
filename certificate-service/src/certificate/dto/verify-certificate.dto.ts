import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCertificateDto {
    @ApiProperty({
        description: 'Código do certificado para verificar',
        example: 'CERT-123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    code: string;
}
