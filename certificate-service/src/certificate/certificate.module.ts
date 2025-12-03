import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { Certificate } from './entities/certificate.entity';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
    imports: [TypeOrmModule.forFeature([Certificate])],
    controllers: [CertificateController],
    providers: [CertificateService, PdfGeneratorService],
})
export class CertificateModule { }
