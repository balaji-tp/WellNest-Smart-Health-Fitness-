package com.wellnest.backend.repository;

import com.wellnest.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserIdAndIsActiveTrue(Long userId);

    List<Subscription> findByUserId(Long userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);
}
