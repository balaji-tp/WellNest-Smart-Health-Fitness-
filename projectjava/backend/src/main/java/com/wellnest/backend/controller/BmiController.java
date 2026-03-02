package com.wellnest.backend.controller;

import com.wellnest.backend.entity.BmiRecord;
import com.wellnest.backend.entity.User;
import com.wellnest.backend.payload.request.BmiRequest;
import com.wellnest.backend.payload.response.MessageResponse;
import com.wellnest.backend.repository.BmiRecordRepository;
import com.wellnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bmi")
public class BmiController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    BmiRecordRepository bmiRecordRepository;

    @PostMapping("/record")
    public ResponseEntity<?> recordBmi(@RequestBody BmiRequest request) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();

        if (request.getHeightCm() == null || request.getWeightKg() == null || request.getHeightCm() <= 0) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid height or weight parameters."));
        }

        double heightMeters = request.getHeightCm() / 100.0;
        double bmi = request.getWeightKg() / (heightMeters * heightMeters);
        bmi = Math.round(bmi * 10.0) / 10.0;

        // Update User profile directly as well
        user.setHeightCm(request.getHeightCm());
        user.setWeightKg(request.getWeightKg());
        user.setBmi(bmi);
        userRepository.save(user);

        // Save history record
        BmiRecord record = BmiRecord.builder()
                .userId(user.getId())
                .heightCm(request.getHeightCm())
                .weightKg(request.getWeightKg())
                .bmi(bmi)
                .build();
        record.setRecordedAt();
        bmiRecordRepository.save(record);

        return ResponseEntity.ok(new MessageResponse("BMI recorded successfully! Current BMI: " + bmi));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getBmiHistory() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        List<BmiRecord> records = bmiRecordRepository.findByUserIdOrderByRecordedAtDesc(userOpt.get().getId());
        return ResponseEntity.ok(records);
    }

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            return Optional.empty();
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername());
    }
}
