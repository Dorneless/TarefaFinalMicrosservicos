import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { PdfGeneratorService } from './pdf-generator.service';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class CertificateService {
    constructor(
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        private readonly pdfGeneratorService: PdfGeneratorService,
    ) { }

    async issueCertificate(
        userEmail: string,
        dto: IssueCertificateDto,
    ): Promise<Certificate> {
        // 1. Check if certificate already exists
        const existingCertificate = await this.certificateRepository.findOne({
            where: { userEmail, eventId: dto.eventId },
        });

        if (existingCertificate) {
            throw new BadRequestException(
                'Certificado já emitido para este evento e usuário.',
            );
        }

        // 2. Verify attendance with events-service (via DB)
        const attendanceCheck = await this.certificateRepository.query(
            `SELECT er.user_id, er.user_name, er.attended, e.title, e.date
       FROM events_schema.event_registrations er
       JOIN events_schema.events e ON e.id = er.event_id
       WHERE er.user_email = $1 AND er.event_id = $2`,
            [userEmail, dto.eventId],
        );

        if (attendanceCheck.length === 0) {
            throw new NotFoundException('Inscrição no evento não encontrada.');
        }

        const registration = attendanceCheck[0];

        if (!registration.attended) {
            throw new BadRequestException(
                'Presença não confirmada neste evento. Não é possível emitir o certificado.',
            );
        }

        // 3. Generate Certificate
        const certificate = new Certificate();
        certificate.userId = registration.user_id;
        certificate.userEmail = userEmail;
        certificate.userName = registration.user_name;
        certificate.eventId = dto.eventId;
        certificate.eventName = registration.title;
        certificate.eventDate = registration.date;
        certificate.code = `CERT-${uuidv4()}`;

        // 4. Generate PDF
        const pdfPath =
            await this.pdfGeneratorService.generateCertificate(certificate);
        certificate.pdfPath = pdfPath;

        // 5. Save to DB
        const savedCertificate = await this.certificateRepository.save(certificate);

        // 6. Send Notification
        await this.sendNotification(savedCertificate);

        return savedCertificate;
    }

    async verifyCertificate(code: string): Promise<Certificate> {
        const certificate = await this.certificateRepository.findOne({
            where: { code, active: true },
        });

        if (!certificate) {
            throw new NotFoundException('Certificado inválido ou não encontrado.');
        }

        return certificate;
    }

    private async sendNotification(certificate: Certificate) {
        try {
            await axios.post(
                `${process.env.NOTIFICATION_SERVICE_URL}/notifications/certificate-issued`,
                {
                    email: certificate.userEmail,
                    userName: certificate.userName,
                    eventName: certificate.eventName,
                    certificateCode: certificate.code,
                    pdfPath: certificate.pdfPath,
                },
            );
        } catch (error) {
            console.error('Erro ao enviar notificação de certificado:', error);
        }
    }
}
