package com.wellnest.backend.controller;

import com.wellnest.backend.entity.DailyMetric;
import com.wellnest.backend.entity.User;
import com.wellnest.backend.payload.response.MessageResponse;
import com.wellnest.backend.repository.DailyMetricRepository;
import com.wellnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/metrics")
public class MetricController {

    @Autowired
    DailyMetricRepository metricRepository;

    @Autowired
    UserRepository userRepository;

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            return Optional.empty();
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername());
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayMetrics() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        Optional<DailyMetric> metricOpt = metricRepository.findByUserIdAndRecordDate(user.getId(), today);

        if (metricOpt.isPresent()) {
            return ResponseEntity.ok(metricOpt.get());
        } else {
            // Return an empty template for today if none exists yet
            return ResponseEntity.ok(DailyMetric.builder()
                    .userId(user.getId())
                    .recordDate(today)
                    .waterLiters(0.0)
                    .sleepHours(0.0)
                    .build());
        }
    }

    @PostMapping("/today")
    public ResponseEntity<?> updateTodayMetrics(@RequestBody DailyMetric updatedMetrics) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        DailyMetric metric = metricRepository.findByUserIdAndRecordDate(user.getId(), today)
                .orElse(DailyMetric.builder()
                        .userId(user.getId())
                        .recordDate(today)
                        .waterLiters(0.0)
                        .sleepHours(0.0)
                        .build());

        if (updatedMetrics.getWaterLiters() != null) {
            metric.setWaterLiters(updatedMetrics.getWaterLiters());
        }
        if (updatedMetrics.getSleepHours() != null) {
            metric.setSleepHours(updatedMetrics.getSleepHours());
        }

        metricRepository.save(metric);
        return ResponseEntity.ok(new MessageResponse("Metrics updated successfully!"));
    }
}
