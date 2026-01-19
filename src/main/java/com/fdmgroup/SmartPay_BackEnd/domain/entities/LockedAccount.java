package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import java.util.Date;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;

@Entity
public class LockedAccount {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ACCOUNTLOCK_SEQ_GEN")
	@SequenceGenerator(name = "ACCOUNTLOCK_SEQ_GEN", sequenceName = "ACCOUNTLOCK_SEQ_GEN")
	private long 	id;
	
	private String 	email;
	private Date 	locked_at;
	
	public LockedAccount() {
		super();
	}

	public LockedAccount(long id, String email, Date locked_at) {
		super();
		this.id 		= id;
		this.email 		= email;
		this.locked_at 	= locked_at;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Date getLocked_at() {
		return locked_at;
	}

	public void setLocked_at(Date locked_at) {
		this.locked_at = locked_at;
	}

	@Override
	public String toString() {
		return "AccountLock [id=" + id + ", email=" + email + ", locked_at=" + locked_at + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(email, id, locked_at);
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
		return Objects.equals(email, other.email) && id == other.id && Objects.equals(locked_at, other.locked_at);
	}

}
