package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "payees")
@Getter
@Setter
public class Payee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payee_id")
    private Long payeeId;

    @ManyToOne
    @JoinColumn(name = "fk_owner_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties({"accounts", "password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username"})
    private User owner;

    @ManyToOne
    @JoinColumn(name = "fk_recipient_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties({"accounts", "password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username"})
    private User recipient;
}
