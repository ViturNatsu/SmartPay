package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fdmgroup.SmartPay_BackEnd.security.PersonalInformationEncryptor;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_ID_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalIdentityInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "personal_info_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "fk_user_id",
            nullable = false,
            unique = true
    )
    @JsonBackReference
    private User user;

    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String firstName;


    @Column(nullable = false)
    private String lastName;


    @Column(nullable = false)
    private String addressLine1;

    private String addressLine2;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String province;

    @Column(nullable = false)
    private String postalCode;

    @Column(nullable = false)
    private String phoneNumber;


    @Column(nullable = false)
    private String socialInsuranceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GovernmentIdType governmentIdType;

    @Column(nullable = false)
    private String governmentIdNumber;


    private String occupation;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
