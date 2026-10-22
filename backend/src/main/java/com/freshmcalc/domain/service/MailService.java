package com.freshmcalc.domain.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Transactional email.
 *
 * The app must run without an SMTP server (local dev, first deploy), so this
 * service never blocks a request: when mail is not configured it logs and
 * returns false. Set MAIL_HOST / MAIL_PORT / MAIL_USERNAME / MAIL_PASSWORD to
 * enable real delivery. Reset links are only written to logs when
 * APP_MAIL_EXPOSE_RESET_LINK=true (local development only).
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;
    private final String publicUrl;
    private final boolean exposeResetLink;

    public MailService(
            @Value("${spring.mail.host:}") String host,
            @Value("${spring.mail.port:587}") int port,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${app.mail.from:no-reply@freshmcalc.com}") String from,
            @Value("${app.public-url:http://localhost:5173}") String publicUrl,
            @Value("${app.mail.expose-reset-link:false}") boolean exposeResetLink) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.from = from;
        this.publicUrl = publicUrl;
        this.exposeResetLink = exposeResetLink;
    }

    public boolean isConfigured() {
        return host != null && !host.isBlank();
    }

    /** True when an SMTP server accepted the message. */
    public boolean sendPasswordReset(String to, String resetToken) {
        String link = publicUrl.replaceAll("/+$", "") + "/reset-password?token=" + resetToken;
        String subject = "Reset your FreshmCalc password";
        String body = """
            <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:28px;color:#132a1f">
              <h2 style="margin:0 0 8px;color:#17432f">Reset your FreshmCalc password</h2>
              <p style="margin:0 0 18px;line-height:1.6">We received a request to reset the password for your FreshmCalc account.
                 This link expires in 30 minutes and can be used once.</p>
              <p style="margin:0 0 22px">
                <a href="%s" style="display:inline-block;background:#206644;color:#ffffff;text-decoration:none;
                   font-weight:700;padding:12px 22px;border-radius:10px">Choose a new password</a>
              </p>
              <p style="margin:0 0 8px;font-size:13px;color:#5b6b62;line-height:1.6">
                If the button does not work, paste this link into your browser:<br>
                <span style="word-break:break-all;color:#206644">%s</span>
              </p>
              <p style="margin:18px 0 0;font-size:13px;color:#5b6b62;line-height:1.6">
                Did not request this? You can safely ignore this email — your password stays unchanged.
              </p>
              <p style="margin:22px 0 0;font-size:12px;color:#8b9a92">
                FreshmCalc · Dubai wholesale rates in AED · India → Dubai export costing
              </p>
            </div>
            """.formatted(link, link);

        boolean sent = send(to, subject, body);
        if (!sent) {
            if (exposeResetLink) {
                log.warn("SMTP is not configured — password reset link for {} (dev only): {}", to, link);
            } else {
                log.warn("SMTP is not configured — password reset email for {} could not be sent. "
                    + "Set MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD, or enable "
                    + "APP_MAIL_EXPOSE_RESET_LINK=true for local development.", to);
            }
        }
        return sent;
    }

    /** HTML email. Returns false (never throws) so callers keep responding normally. */
    public boolean send(String to, String subject, String htmlBody) {
        if (!isConfigured() || to == null || to.isBlank()) {
            return false;
        }
        try {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(host);
            sender.setPort(port);
            sender.setDefaultEncoding("UTF-8");
            if (username != null && !username.isBlank()) {
                sender.setUsername(username);
                sender.setPassword(password);
                // Port 465 is implicit TLS; 587 uses STARTTLS.
                if (port == 465) {
                    sender.getJavaMailProperties().put("mail.smtp.ssl.enable", "true");
                } else {
                    sender.getJavaMailProperties().put("mail.smtp.starttls.enable", "true");
                    sender.getJavaMailProperties().put("mail.smtp.starttls.required", "true");
                }
            }
            sender.getJavaMailProperties().put("mail.smtp.auth", String.valueOf(username != null && !username.isBlank()));
            sender.getJavaMailProperties().put("mail.smtp.connectiontimeout", "10000");
            sender.getJavaMailProperties().put("mail.smtp.timeout", "10000");

            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            sender.send(message);
            log.info("Email '{}' sent to {}", subject, to);
            return true;
        } catch (Exception e) {
            log.error("Could not send email '{}' to {}: {}", subject, to, e.getMessage());
            return false;
        }
    }
}
