import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CertificateIssuedDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    userName: string;

    @ApiProperty({ example: 'Tech Conference 2024' })
    @IsString()
    @IsNotEmpty()
    eventName: string;

    @ApiProperty({ example: 'CERT-123456' })
    @IsString()
    @IsNotEmpty()
    certificateCode: string;

    @ApiProperty({ example: '/path/to/certificate.pdf' })
    @IsString()
    @IsNotEmpty()
    pdfPath: string;
}
