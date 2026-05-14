package com.fdmgroup.SmartPay_BackEnd.Utility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

// Note: The current ThreadLocal var is small enough with narrow tasks that we dont need to
//       call remove on it. Expanding this class means reconsidering that fact.
@Component
public class MaskingUtil {
    // ThreadLocal to make the utility thread safe, allowing a single hasher per request
    private final ThreadLocal<MessageDigest> hashers = ThreadLocal.withInitial(() -> {
        try{
            return MessageDigest.getInstance("SHA-256");
        }catch (NoSuchAlgorithmException e){
            throw new IllegalStateException(e);
        }
    });
    private final Logger log = LoggerFactory.getLogger(MaskingUtil.class);

    public String digest(String message) throws IllegalArgumentException{
        log.info("Hashed: {}", message);
        if(message == null || message.isEmpty()){
            throw new IllegalArgumentException("Cannot hash null or empty Strings");
        }
        MessageDigest hasher = hashers.get();
        hasher.reset();
        hasher.update(message.getBytes());
        return HexFormat.of().formatHex(hasher.digest());
    }

    public Pair<String, String> maskSin(String sin) throws IllegalArgumentException {
        if (sin == null || sin.length()<3) {
            throw new IllegalArgumentException("Cannot mask sin values that are null or have length < 3");
        }
        String mask = "***-***-" + sin.substring(sin.length()-3);
        String digest = this.digest(sin);
        return Pair.of(mask, digest);
    }


    public Pair<String, String> maskGovernmentId(String idNumber) throws IllegalArgumentException {
        if (idNumber == null || idNumber.length()<3){
            throw new IllegalArgumentException("Cannot mask government ID values that are null or have length < 3");
        }
        String mask = "*******" + idNumber.substring(idNumber.length()-3);
        String digest = this.digest(idNumber);
        return Pair.of(mask, digest);
    }



    public Pair<String, String> maskAccountNumber(String accountNumber) throws IllegalArgumentException {
        if (accountNumber == null){
            throw new IllegalArgumentException("Cannot mask account number values that are null or have length < 3");
        }
        String mask = "*******" + accountNumber.substring(accountNumber.length()-3);
        String digest = this.digest(accountNumber);
        return Pair.of(mask, digest);
    }
}