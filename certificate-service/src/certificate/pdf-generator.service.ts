import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Certificate } from './entities/certificate.entity';

@Injectable()
export class PdfGeneratorService {
    private readonly certificatesDir = path.join(process.cwd(), 'certificates');

    constructor() {
        if (!fs.existsSync(this.certificatesDir)) {
            fs.mkdirSync(this.certificatesDir, { recursive: true });
        }
    }

    async generateCertificate(certificate: Certificate): Promise<string> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
            });

            const fileName = `${certificate.code}.pdf`;
            const filePath = path.join(this.certificatesDir, fileName);
            const writeStream = fs.createWriteStream(filePath);

            doc.pipe(writeStream);

            // Background or Border (Optional - simple border for now)
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
            doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

            // Header
            doc
                .font('Helvetica-Bold')
                .fontSize(40)
                .text('CERTIFICADO DE PARTICIPAÇÃO', 0, 100, { align: 'center' });

            doc.moveDown();

            // Body
            doc.font('Helvetica').fontSize(20).text('Certificamos que', {
                align: 'center',
            });

            doc.moveDown();

            doc
                .font('Helvetica-Bold')
                .fontSize(30)
                .text(certificate.userName, { align: 'center' });

            doc.moveDown();

            doc.font('Helvetica').fontSize(20).text('participou do evento', {
                align: 'center',
            });

            doc.moveDown();

            doc
                .font('Helvetica-Bold')
                .fontSize(25)
                .text(certificate.eventName, { align: 'center' });

            doc.moveDown();

            const formattedDate = new Date(certificate.eventDate).toLocaleDateString(
                'pt-BR',
                {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                },
            );

            doc
                .font('Helvetica')
                .fontSize(18)
                .text(`realizado em ${formattedDate}`, { align: 'center' });

            // Footer
            doc.moveDown(4);

            doc
                .font('Helvetica')
                .fontSize(12)
                .text(`Código de Verificação: ${certificate.code}`, {
                    align: 'center',
                });

            doc
                .font('Helvetica')
                .fontSize(10)
                .text(
                    `Verifique a autenticidade deste certificado em: http://localhost:8083/api/certificates/verify/${certificate.code}`,
                    { align: 'center' },
                );

            doc.end();

            writeStream.on('finish', () => {
                resolve(filePath);
            });

            writeStream.on('error', (err) => {
                reject(err);
            });
        });
    }
}
