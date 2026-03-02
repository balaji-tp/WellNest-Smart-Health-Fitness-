package com.wellnest.backend.controller;

import com.wellnest.backend.entity.Activity;
import com.wellnest.backend.entity.User;
import com.wellnest.backend.payload.response.MessageResponse;
import com.wellnest.backend.repository.ActivityRepository;
import com.wellnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    ActivityRepository activityRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserActivities() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        List<Activity> activities = activityRepository.findByUserIdOrderByActivityDateDesc(userOpt.get().getId());
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getClientActivities(@PathVariable("clientId") Long clientId) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty() || userOpt.get().getRole() != com.wellnest.backend.entity.Role.TRAINER) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Unauthorized. Only trainers can view client activities."));
        }

        Long trainerId = userOpt.get().getId();
        Optional<User> clientOpt = userRepository.findById(clientId);

        if (clientOpt.isEmpty() || !trainerId.equals(clientOpt.get().getTrainerId())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Client not found or not assigned to you."));
        }

        List<Activity> activities = activityRepository.findByUserIdOrderByActivityDateDesc(clientId);
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<?> logActivity(@RequestBody Activity activityRequest) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        Activity activity = Activity.builder()
                .userId(user.getId())
                .activityName(activityRequest.getActivityName())
                .durationMinutes(activityRequest.getDurationMinutes())
                .caloriesBurned(activityRequest.getCaloriesBurned())
                .activityDate(
                        activityRequest.getActivityDate() != null ? activityRequest.getActivityDate() : LocalDate.now())
                .category(activityRequest.getCategory())
                .build();

        activityRepository.save(activity);
        return ResponseEntity.ok(new MessageResponse("Activity logged successfully!"));
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
