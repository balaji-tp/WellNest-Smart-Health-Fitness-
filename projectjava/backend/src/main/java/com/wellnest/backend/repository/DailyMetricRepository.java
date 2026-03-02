package com.wellnest.backend.repository;

import com.wellnest.backend.entity.DailyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyMetricRepository extends JpaRepository<DailyMetric, Long> {
    Optional<DailyMetric> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);
}
