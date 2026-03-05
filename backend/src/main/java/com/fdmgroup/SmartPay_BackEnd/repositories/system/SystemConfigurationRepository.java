package com.fdmgroup.SmartPay_BackEnd.repositories.system;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.system.SystemConfiguration;

import java.util.Optional;

public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Long> {
    Optional<SystemConfiguration> findByConfigKey(String configKey);
}