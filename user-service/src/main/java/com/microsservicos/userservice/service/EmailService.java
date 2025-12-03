package com.microsservicos.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    /**
     * Envia um código temporário por email.
     * NOTA: Por enquanto, apenas loga o código no console.
     * Para produção, configure Spring Mail no application.properties e implemente
     * envio real.
     * 
     * @param email Email do destinatário
     * @param code  Código temporário de 6 dígitos
     */
    public void sendTemporaryCode(String email, String code) {
        log.info("=".repeat(60));
        log.info("📧 CÓDIGO TEMPORÁRIO DE ACESSO");
        log.info("=".repeat(60));
        log.info("Para: {}", email);
        log.info("Código: {}", code);
        log.info("Válido por: 15 minutos");
        log.info("=".repeat(60));

        // TODO: Implementar envio real de email quando configurar Spring Mail
        // Exemplo de implementação com JavaMailSender:
        /*
         * try {
         * MimeMessage message = mailSender.createMimeMessage();
         * MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
         * 
         * helper.setFrom(fromEmail);
         * helper.setTo(email);
         * helper.setSubject("Seu código de acesso temporário");
         * 
         * String htmlContent = String.format("""
         * <html>
         * <body style="font-family: Arial, sans-serif; padding: 20px;">
         * <h2 style="color: #333;">Código de Acesso Temporário</h2>
         * <p>Olá,</p>
         * <p>Seu código de acesso temporário é:</p>
         * <div
         * style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;"
         * >
         * %s
         * </div>
         * <p>Este código é válido por <strong>15 minutos</strong>.</p>
         * <p>Se você não solicitou este código, ignore este email.</p>
         * <br>
         * <p>Atenciosamente,<br>Equipe User Service</p>
         * </body>
         * </html>
         * """, code);
         * 
         * helper.setText(htmlContent, true);
         * mailSender.send(message);
         * 
         * log.info("Email com código temporário enviado para: {}", email);
         * } catch (Exception e) {
         * log.error("Erro ao enviar email para {}: {}", email, e.getMessage());
         * throw new RuntimeException("Failed to send email", e);
         * }
         */
    }
}
