package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;

@Repository
public interface RecurringPayeeRepository extends JpaRepository<RecurringPayee, Long>{

}
