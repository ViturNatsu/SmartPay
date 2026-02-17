package com.fdmgroup.SmartPay_BackEnd.security;

import com.fdmgroup.SmartPay_BackEnd.config.EncryptionProperties;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Converter
public class PersonalInformationEncryptor implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";

    private SecretKeySpec getKey() {
        String secret = EncryptionProperties.getSecretKey();

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Encryption key not configured");
        }

        return new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                ALGORITHM
        );
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;

        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, getKey());

            return Base64.getEncoder().encodeToString(
                    cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception e) {
            throw new IllegalStateException("Encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;

        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, getKey());

            return new String(
                    cipher.doFinal(Base64.getDecoder().decode(dbData)),
                    StandardCharsets.UTF_8
            );
        } catch (Exception e) {
            throw new IllegalStateException("Decryption failed", e);
        }
    }
}
