package com.wellnest.backend.controller;

import com.wellnest.backend.entity.Subscription;
import com.wellnest.backend.entity.SubscriptionType;
import com.wellnest.backend.entity.User;
import com.wellnest.backend.payload.response.MessageResponse;
import com.wellnest.backend.repository.SubscriptionRepository;
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
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    SubscriptionRepository subscriptionRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserSubscription() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        Optional<Subscription> subscription = subscriptionRepository.findByUserIdAndIsActiveTrue(userOpt.get().getId());
        if (subscription.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No active subscription"));
        }

        return ResponseEntity.ok(subscription.get());
    }

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseSubscription(@RequestParam String planType) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        try {
            SubscriptionType type = SubscriptionType.valueOf(planType.toUpperCase());
            User user = userOpt.get();

            // Deactivate old subscription
            Optional<Subscription> oldSub = subscriptionRepository.findByUserIdAndIsActiveTrue(user.getId());
            if (oldSub.isPresent()) {
                Subscription sub = oldSub.get();
                sub.setIsActive(false);
                subscriptionRepository.save(sub);
            }

            // Create new subscription
            Subscription newSubscription = Subscription.builder()
                    .userId(user.getId())
                    .planType(type.name())
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(1)) // Assume 1-month plan for simplicity
                    .isActive(true)
                    .build();

            subscriptionRepository.save(newSubscription);
            return ResponseEntity.ok(new MessageResponse("Subscription upgraded to " + type));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid plan type."));
        }
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
