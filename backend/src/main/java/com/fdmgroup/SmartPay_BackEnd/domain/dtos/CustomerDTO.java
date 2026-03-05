package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Locale;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {

    private String firstName;
    private String lastName;
    // contact information
    @NotBlank(message = "Address Line 1 is required.")
    @Size(max = 120, message = "Address Line 1 cannot exceed 120 characters.")
    private String addressLine1;

    @Size(max = 120, message = "Address Line 2 cannot exceed 120 characters.")
    private String addressLine2;

    @NotBlank(message = "City is required.")
    @Size(max = 80, message = "City cannot exceed 80 characters.")
    @Pattern(regexp = "^[A-Za-z0-9 .'-]+$", message = "City contains invalid characters.")
    private String city;

    @NotBlank(message = "Province is required.")
    @Pattern(regexp = "^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$", message = "Province is invalid.")
    private String province;

    @NotBlank(message = "Country is required.")
    @Pattern(regexp = "^(?i)canada$", message = "Country must be Canada.")
    private String country;

    @NotBlank(message = "Postal Code is required.")
    @Pattern(regexp = "^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ -]?\\d[ABCEGHJ-NPRSTV-Z]\\d$", message = "Postal Code must match Canadian format (A1A 1A1).")
    private String postalCode;

    @NotBlank(message = "Phone Number is required.")
    @Pattern(regexp = "^(?:\\+?1[\\s.-]?)?(?:\\(?\\d{3}\\)?[\\s.-]?)\\d{3}[\\s.-]?\\d{4}$", message = "Phone Number must be 10 digits (optional +1).")
    private String phoneNumber;

    // identification informatoin
    @NotBlank(message = "Social Insurance Number is required.")
    @Pattern(regexp = "^(?:\\d[\\s-]?){8}\\d$", message = "SIN must be exactly 9 digits.")
    private String socialInsuranceNumber;

    @NotBlank(message = "Government ID Type is required.")
    @Pattern(regexp = "^(PASSPORT|DRIVER_LICENSE|PRCARD_NUMBER)$", message = "Government ID Type is invalid.")
    private String governmentIdType;

    @NotBlank(message = "Government ID Number is required.")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "Government ID Number must be alphanumeric.")
    private String governmentIdNumber;

    @NotBlank(message = "Occupation is required.")
    @Size(max = 80, message = "Occupation cannot exceed 80 characters.")
    @Pattern(regexp = "^[A-Za-z0-9 .'-]+$", message = "Occupation contains invalid characters.")
    private String occupation;

    @NotBlank(message = "Date of Birth is required.")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date of Birth must be in YYYY-MM-DD format.")
    private String dob;

    @AssertTrue(message = "Date of Birth cannot be in the future.")
    public boolean isDobNotInFuture() {
        if (dob == null || dob.isBlank()) {
            return true;
        }
        try {
            LocalDate parsed = LocalDate.parse(dob);
            return !parsed.isAfter(LocalDate.now());
        } catch (DateTimeParseException ex) {
            return true;
        }
    }

    @AssertTrue(message = "Occupation must include at least one letter.")
    public boolean isOccupationContainsLetter() {
        if (occupation == null || occupation.isBlank()) {
            return true;
        }
        return occupation.matches(".*[A-Za-z].*");
    }

    @AssertTrue(message = "Passport number must be 6-11 alphanumeric characters.")
    public boolean isPassportGovernmentIdValid() {
        if (!"PASSPORT".equals(governmentIdType) || governmentIdNumber == null || governmentIdNumber.isBlank()) {
            return true;
        }
        return governmentIdNumber.matches("^[A-Z0-9]{6,11}$");
    }

    @AssertTrue(message = "Driver's licence number must be 5-15 alphanumeric characters.")
    public boolean isDriverLicenseGovernmentIdValid() {
        if (!"DRIVER_LICENSE".equals(governmentIdType) || governmentIdNumber == null || governmentIdNumber.isBlank()) {
            return true;
        }
        return governmentIdNumber.matches("^[A-Z0-9]{5,15}$");
    }

    @AssertTrue(message = "PR card number must be 9-12 alphanumeric characters.")
    public boolean isPrCardGovernmentIdValid() {
        if (!"PRCARD_NUMBER".equals(governmentIdType) || governmentIdNumber == null || governmentIdNumber.isBlank()) {
            return true;
        }
        return governmentIdNumber.matches("^[A-Z0-9]{9,12}$");
    }

    public void setGovernmentIdNumber(String governmentIdNumber) {
        if (governmentIdNumber == null) {
            this.governmentIdNumber = null;
        } else {
            this.governmentIdNumber = governmentIdNumber.trim().replace("-", "").toUpperCase(Locale.ROOT);
        }
    }
}
