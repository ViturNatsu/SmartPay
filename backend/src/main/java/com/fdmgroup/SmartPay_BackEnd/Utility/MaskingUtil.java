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
}
