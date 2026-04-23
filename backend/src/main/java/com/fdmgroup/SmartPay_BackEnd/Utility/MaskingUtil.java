package com.fdmgroup.SmartPay_BackEnd.Utility;


public class MaskingUtil {

    public static String maskSin(String sin) {
        if (sin == null) return null;

        String digits = sin.replaceAll("\\D", "");

        if (digits.length() < 3) return "***";

        return "***-***-" + digits.substring(digits.length() - 3);
    }



    public static String maskGovernmentId(String idNumber) {
        if (idNumber == null) return null;

        if (idNumber.length() <= 4) {
            return "****";
        }

        return "****" + idNumber.substring(idNumber.length() - 4);
    }



    public static String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return null;
        }

        String digits = accountNumber.replaceAll("\\D", "");

        if (digits.length() <= 4) {
            return "•".repeat(digits.length());
        }

        return "•".repeat(digits.length() - 4) + digits.substring(digits.length() - 4);
    }
}