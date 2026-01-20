package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import java.util.Date;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "locked_accounts")
public class LockedAccount {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ACCOUNTLOCK_SEQ_GEN")
	@SequenceGenerator(name = "ACCOUNTLOCK_SEQ_GEN", sequenceName = "ACCOUNTLOCK_SEQ_GEN")
	private long 	id;
	
	@Email
	private String 	email;
	
	@NotBlank
	@Column(name = "locked_at")
	private Date 	lockedAt;
	
	public LockedAccount() {
		super();
	}
	
	public LockedAccount(String email, Date lockedAt) {
		super();
		this.email 		= email;
		this.lockedAt 	= lockedAt;
	}

	public LockedAccount(long id, String email, Date lockedAt) {
		super();
		this.id 		= id;
		this.email 		= email;
		this.lockedAt 	= lockedAt;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Date getLockedAt() {
		return lockedAt;
	}

	public void setLockedAt(Date lockedAt) {
		this.lockedAt = lockedAt;
	}

	@Override
	public String toString() {
		return "AccountLock [id=" + id + ", email=" + email + ", lockedAt=" + lockedAt + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(email, id, lockedAt);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		LockedAccount other = (LockedAccount) obj;
		return Objects.equals(email, other.email) && id == other.id && Objects.equals(lockedAt, other.lockedAt);
	}

}
