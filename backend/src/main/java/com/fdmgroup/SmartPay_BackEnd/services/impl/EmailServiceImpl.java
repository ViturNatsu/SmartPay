package com.fdmgroup.SmartPay_BackEnd.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;

import java.util.logging.Logger;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@smartpay.local}")
    private String sender;

    private static final Logger LOGGER = Logger.getLogger(EmailServiceImpl.class.getName());

    public EmailServiceImpl(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Override
    public void sendSimpleMail(EmailDetails details) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();

            mailMessage.setFrom(sender);
            mailMessage.setTo(details.getRecipient());
            mailMessage.setText(details.getMsgBody());
            mailMessage.setSubject(details.getSubject());

            LOGGER.info("Sending email to: " + details.getRecipient());
            javaMailSender.send(mailMessage);
            LOGGER.info("Email sent successfully to MailHog");
        } catch (Exception e) {
        	LOGGER.warning("Error while Sending Mail: " + e.getMessage());
            throw(new MailSendException("Email failed to send"));
        }
    }

}
