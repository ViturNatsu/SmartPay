package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fdmgroup.SmartPay_BackEnd.security.PersonalInformationEncryptor;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Customer_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_info_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "fk_user_id",
            nullable = false,
            unique = true
    )
    @JsonBackReference
    private User user;

    //@Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String firstName;


    //@Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String lastName;


    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String addressLine1;

    @Convert(converter = PersonalInformationEncryptor.class)
    private String addressLine2;

    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String city;

    //@Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String province;

    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String postalCode;

    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String phoneNumber;


    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String socialInsuranceNumber;

   // @Convert(converter = PersonalInformationEncryptor.class)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GovernmentIdType governmentIdType;

    @Convert(converter = PersonalInformationEncryptor.class)
    @Column(nullable = false)
    private String governmentIdNumber;


    //@Convert(converter = PersonalInformationEncryptor.class)
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
