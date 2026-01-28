package com.fdmgroup.SmartPay_BackEnd.repositories;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.SessionEntity;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, Long> {
    List<SessionEntity> findByUser(User user);
    Optional<SessionEntity> findByRefreshToken(String refreshToken);

    @Query("SELECT s FROM SessionEntity s WHERE s.lastUsedAt < :expiryThreshold")
    List<SessionEntity> findExpiredSessions(@Param("expiryThreshold") LocalDateTime expiryThreshold);

    void deleteByUser(User user);
}
