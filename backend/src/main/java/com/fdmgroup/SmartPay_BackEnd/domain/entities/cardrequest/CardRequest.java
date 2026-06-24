package com.fdmgroup.SmartPay_BackEnd.domain.entities.cardrequest;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cardrequest")
@Getter
@Setter
public class CardRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "cardrequest_id")
    private Long id;

    @Column(columnDefinition = "DATE")
    private LocalDateTime requestCreatedAt;

    @Column(columnDefinition = "DATE")
    private LocalDateTime requestResolvedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus  requestStatus;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "fk_card_id")
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_user_id")
    private User user;

    @Column(name = "request_reason", length = 500)
    private String requestReason;

    @Column(name = "deny_reason", length = 500)
    private String denyReason;

}

// CardRequestRepo9sitoy extends JPARepostiryo(){
//
//     specialFunction = () => do we have more than 4?- but in SQL
// }
//
// WHERE THE DATE < F , USER_ID = 0