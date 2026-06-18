package com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class IntegrationTestHelper {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private EntityManager entityManager;

    public void clearDB() {

        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        tx.execute(status -> {
            entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY FALSE").executeUpdate();

            entityManager.createNativeQuery("""
                SELECT CONCAT('TRUNCATE TABLE ', TABLE_NAME)
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'PUBLIC'
            """).getResultList().forEach(sql ->
                    entityManager.createNativeQuery((String) sql).executeUpdate()
            );

            entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY TRUE").executeUpdate();

            return null;
        });
    }

}
