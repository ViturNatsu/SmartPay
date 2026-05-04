package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "accounts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_account_institution_transit_account",
                        columnNames = {"institution_number", "transit_number", "account_number"}
                )
        }
)
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "accountType",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SavingsAccount.class, name = "SAVINGS"),
        @JsonSubTypes.Type(value = CheckingAccount.class, name = "CHECKING"),
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

    @Column(name = "active")
    private Boolean active;

    @ManyToOne
	@JoinColumn(name = "fk_user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
	private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type")
    private AccountType accountType;

    @CreationTimestamp
    @Column(name = "creation_timestamp", updatable = false)
    private LocalDateTime creationTimestamp;

    @PrePersist
    @PreUpdate
    private void syncTypeForDb() {
        this.accountType = getType();
    }

    @JsonProperty("type")
    public abstract AccountType getType();
}
