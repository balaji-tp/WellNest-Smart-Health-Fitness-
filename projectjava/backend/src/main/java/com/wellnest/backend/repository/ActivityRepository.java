package com.wellnest.backend.repository;

import com.wellnest.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserIdOrderByActivityDateDesc(Long userId);

    List<Activity> findByUserId(Long userId);

    List<Activity> findByUserIdAndActivityDate(Long userId, LocalDate date);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);
}
