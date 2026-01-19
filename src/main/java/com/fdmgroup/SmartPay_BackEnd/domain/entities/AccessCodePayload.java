package com.fdmgroup.SmartPay_BackEnd.domain.entities;

public class AccessCodePayload {

    private String accessCode;
    private String email;

    public AccessCodePayload() {
        super();
    }

    public AccessCodePayload(String accessCode, String email) {
        this.accessCode = accessCode;
        this.email = email;
    }

    public String getAccessCode() {
        return accessCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((accessCode == null) ? 0 : accessCode.hashCode());
        result = prime * result + ((email == null) ? 0 : email.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        AccessCodePayload other = (AccessCodePayload) obj;
        if (accessCode == null) {
            if (other.accessCode != null)
                return false;
        } else if (!accessCode.equals(other.accessCode))
            return false;
        if (email == null) {
            if (other.email != null)
                return false;
        } else if (!email.equals(other.email))
            return false;
        return true;
    }

    @Override
    public String toString() {
        return "AccessCodePayload [accessCode=" + accessCode + ", email=" + email + "]";
    }

}
