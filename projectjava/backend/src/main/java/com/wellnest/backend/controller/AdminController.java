package com.wellnest.backend.controller;

import com.wellnest.backend.entity.User;
import com.wellnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    com.wellnest.backend.repository.ActivityRepository activityRepository;

    @Autowired
    com.wellnest.backend.repository.SubscriptionRepository subscriptionRepository;

    @Autowired
    com.wellnest.backend.repository.BmiRecordRepository bmiRecordRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboard() {
        long totalUsers = userRepository.countByRoleNot(com.wellnest.backend.entity.Role.ADMIN);
        long totalActivities = activityRepository.count();
        long totalSubscriptions = subscriptionRepository.count();

        java.util.List<com.wellnest.backend.entity.Subscription> allSubscriptions = subscriptionRepository.findAll();
        double totalRevenue = 0.0;
        for (com.wellnest.backend.entity.Subscription sub : allSubscriptions) {
            String plan = sub.getPlanType();
            if ("BASIC".equals(plan))
                totalRevenue += 9.99;
            else if ("PREMIUM".equals(plan))
                totalRevenue += 19.99;
            else if ("PRO".equals(plan))
                totalRevenue += 29.99;
        }

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalActivities", totalActivities);
        stats.put("totalSubscriptions", totalSubscriptions);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/user/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestParam boolean isEnabled) {
        java.util.Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new com.wellnest.backend.payload.response.MessageResponse("Error: User not found!"));
        }
        User user = userOpt.get();
        user.setIsEnabled(isEnabled);
        userRepository.save(user);
        return ResponseEntity.ok(new com.wellnest.backend.payload.response.MessageResponse(
                "User status updated successfully to " + (isEnabled ? "enabled" : "disabled") + "."));
    }

    @GetMapping("/user/{id}/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserDetails(@PathVariable Long id) {
        java.util.Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new com.wellnest.backend.payload.response.MessageResponse("Error: User not found!"));
        }
        User user = userOpt.get();

        java.util.Map<String, Object> userDetails = new java.util.HashMap<>();
        userDetails.put("profile", user);
        userDetails.put("bmiHistory", bmiRecordRepository.findByUserIdOrderByRecordedAtDesc(user.getId()));

        // To prevent potential circular references or huge payload, we just get them as
        // lists
        userDetails.put("activities", activityRepository.findByUserId(user.getId()));
        userDetails.put("subscriptions", subscriptionRepository.findByUserId(user.getId()));

        return ResponseEntity.ok(userDetails);
    }

    @DeleteMapping("/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest()
                    .body(new com.wellnest.backend.payload.response.MessageResponse("Error: User not found!"));
        }

        // Manually delete dependent records to avoid foreign key constraint errors
        activityRepository.deleteByUserId(id);
        subscriptionRepository.deleteByUserId(id);
        bmiRecordRepository.deleteByUserId(id);

        userRepository.deleteById(id);
        return ResponseEntity
                .ok(new com.wellnest.backend.payload.response.MessageResponse("User deleted successfully."));
    }
}
