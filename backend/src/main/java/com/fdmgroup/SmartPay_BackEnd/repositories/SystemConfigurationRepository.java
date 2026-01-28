package com.fdmgroup.SmartPay_BackEnd.repositories;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Long> {
    Optional<SystemConfiguration> findByConfigKey(String configKey);
}