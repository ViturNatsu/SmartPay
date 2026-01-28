package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String configKey;

    @Column(nullable = false)
    private String configValue;
}

