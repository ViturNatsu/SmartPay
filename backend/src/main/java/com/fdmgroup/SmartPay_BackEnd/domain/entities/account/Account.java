package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "accounts")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SavingsAccount.class, name = "SAVINGS"),
        @JsonSubTypes.Type(value = CheckingAccount.class, name = "CHECKING")
})
public abstract class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long id;

    @Column(name = "account_number", unique = true, nullable = false, updatable = false)
    private String accountNumber;

    @Column(name = "account_name")
    private String accountName;

    @Column(name = "institution_number")
    private String institutionNumber;

    @Column(name = "transit_number")
    private String transitNumber;

    @Column(name = "balance")
    private Double balance;

    @ManyToOne
	@JoinColumn(name = "fk_user_id")
	@JsonBackReference
	private User user;

    @JsonProperty("type")
    public abstract AccountType getType();
}
