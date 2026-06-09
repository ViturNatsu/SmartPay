package com.fdmgroup.SmartPay_BackEnd.Utility;

import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * A Class that generates String Objects for specific use-cases.
 *
 */
@Component
@RequiredArgsConstructor
public class GenerateStringsHelper {

    @Autowired
    private CardRepository cardRepository;

    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates the 16-digit card number using basic random number generation, starting with 6400.
     *
     * @return The generated card number as a String object.
     */
    public String generateCardNumber(){
        String bankIdentificationNumber = "6400";
        String cardNumber;

        // Naive Implementation
        // There are other methods that can be used to generate the remaining 12-digits.

        do{
            // Check if 12 digits are unique/duplicate on the DB
            // If not unique, regenerate
            String candidate = generateDigits(12);
            cardNumber = bankIdentificationNumber+candidate;
        }
        while(cardRepository.existsByCardNumber(cardNumber));

        return cardNumber;
    }

    /**
     * Generates the expiry date as a LocalDateTime object.
     * Expiry date is currently hard-coded to be 2-years from the current date.
     *
     * @return The generated LocalDateTime with a 2-year offset from the current date.
     */
    public LocalDateTime generateExpiryDate(){
        return LocalDateTime.now().plusYears(2);
    }

    /**
     * Generates a 3-digit CVV.
     *
     * @return The String object as a 3-digit code
     */
    public String generateCVV() {
        return generateDigits(3);
    }

    /**
     * Generates a string of digits.
     * @param count The number of digits generated.
     * @return The String object with count-numbered digits.
     */
    public String generateDigits(int count){
        StringBuilder sb = new StringBuilder(count);

        for(int i = 0; i < count; i++){
            sb.append(random.nextInt(10));
        }

        return sb.toString();
    }


}
