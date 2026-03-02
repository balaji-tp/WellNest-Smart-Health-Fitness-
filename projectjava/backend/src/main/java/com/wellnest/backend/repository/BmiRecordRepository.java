package com.wellnest.backend.repository;

import com.wellnest.backend.entity.BmiRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BmiRecordRepository extends JpaRepository<BmiRecord, Long> {
    List<BmiRecord> findByUserIdOrderByRecordedAtDesc(Long userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);
}
