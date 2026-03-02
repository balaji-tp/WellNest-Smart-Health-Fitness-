package com.wellnest.backend.controller;

import com.wellnest.backend.entity.User;
import com.wellnest.backend.payload.response.MessageResponse;
import com.wellnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.wellnest.backend.entity.Role;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Optional<User> user = getCurrentUser();
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        return ResponseEntity.ok(user.get());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody User updatedDetails) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        if (updatedDetails.getFirstName() != null)
            user.setFirstName(updatedDetails.getFirstName());
        if (updatedDetails.getLastName() != null)
            user.setLastName(updatedDetails.getLastName());
        if (updatedDetails.getAge() != null)
            user.setAge(updatedDetails.getAge());
        if (updatedDetails.getGender() != null)
            user.setGender(updatedDetails.getGender());
        if (updatedDetails.getPhoneNumber() != null)
            user.setPhoneNumber(updatedDetails.getPhoneNumber());
        if (updatedDetails.getHeightCm() != null)
            user.setHeightCm(updatedDetails.getHeightCm());
        if (updatedDetails.getWeightKg() != null)
            user.setWeightKg(updatedDetails.getWeightKg());

        // Trainer Specific Fields
        if (updatedDetails.getExperienceYears() != null)
            user.setExperienceYears(updatedDetails.getExperienceYears());
        if (updatedDetails.getSpecialization() != null)
            user.setSpecialization(updatedDetails.getSpecialization());
        if (updatedDetails.getCertifications() != null)
            user.setCertifications(updatedDetails.getCertifications());

        // Calculate BMI if height and weight are present
        if (user.getHeightCm() != null && user.getWeightKg() != null && user.getHeightCm() > 0) {
            double heightMeters = user.getHeightCm() / 100.0;
            double bmi = user.getWeightKg() / (heightMeters * heightMeters);
            user.setBmi(Math.round(bmi * 10.0) / 10.0);
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully, BMI calculated: " + user.getBmi()));
    }

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            return Optional.empty();
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername());
    }

    @GetMapping("/trainers")
    public ResponseEntity<List<User>> getTrainers() {
        List<User> trainers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TRAINER)
                .collect(Collectors.toList());
        return ResponseEntity.ok(trainers);
    }

    @PostMapping("/select-trainer/{trainerId}")
    public ResponseEntity<?> selectTrainer(@PathVariable("trainerId") Long trainerId) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        Optional<User> trainerOpt = userRepository.findById(trainerId);
        if (trainerOpt.isEmpty() || trainerOpt.get().getRole() != Role.TRAINER) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Trainer not found!"));
        }

        User user = userOpt.get();
        user.setTrainerId(trainerId);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Trainer selected successfully!"));
    }

    @GetMapping("/my-clients")
    public ResponseEntity<?> getMyClients() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty() || userOpt.get().getRole() != Role.TRAINER) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Unauthorized. Only trainers can view clients."));
        }

        Long trainerId = userOpt.get().getId();
        List<User> clients = userRepository.findAll().stream()
                .filter(u -> trainerId.equals(u.getTrainerId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(clients);
    }

    @GetMapping("/diet")
    public ResponseEntity<?> getDietSchedule() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        User user = userOpt.get();
        if (user.getBmi() == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Please calculate your BMI first."));
        }

        double bmi = user.getBmi();
        Integer age = user.getAge();
        boolean isOlder = age != null && age > 50;

        List<Map<String, String>> dietPlan;
        String fitnessGoal;
        List<String> dailyTasks;

        if (bmi < 18.5) {
            // Weight Gain Diet
            fitnessGoal = "Muscle & Weight Gain";
            dailyTasks = List.of(
                    "Complete a 45-minute strength training routine.",
                    "Consume a calorie surplus (approx +300-500 kcal).",
                    "Ensure at least 1.6g of protein per kg of body weight.",
                    "Drink 2.5-3 liters of water.");
            dietPlan = List.of(
                    Map.of("meal", "Breakfast", "food", isOlder
                            ? "Oatmeal with nuts, whole milk, 2 boiled eggs, and calcium-fortified juice. (450 kcal)"
                            : "Oatmeal with nuts, whole milk, and 2 boiled eggs. (450 kcal)"),
                    Map.of("meal", "Lunch", "food",
                            isOlder ? "Brown rice, baked fish (high omega-3), and avocado salad. (600 kcal)"
                                    : "Brown rice, grilled chicken breast, and avocado salad. (600 kcal)"),
                    Map.of("meal", "Snack", "food",
                            "Peanut butter sandwich with banana and Greek yogurt for bone health. (350 kcal)"),
                    Map.of("meal", "Dinner", "food",
                            isOlder ? "Salmon (excellent for joints), quinoa, and roasted sweet potatoes. (550 kcal)"
                                    : "Salmon, quinoa, and roasted sweet potatoes. (550 kcal)"));
        } else if (bmi >= 18.5 && bmi < 24.9) {
            // Maintenance Diet
            fitnessGoal = "Weight Maintenance & Toning";
            dailyTasks = List.of(
                    "Aim for 10,000 steps today.",
                    "Engage in 30 minutes of moderate cardio or flexibility training.",
                    "Maintain your baseline daily caloric intake.",
                    "Drink at least 2 liters of water.");
            dietPlan = List.of(
                    Map.of("meal", "Breakfast", "food", isOlder
                            ? "Calcium-rich Greek yogurt with berries and a slice of whole-grain toast. (300 kcal)"
                            : "Greek yogurt with berries and a slice of whole-grain toast. (300 kcal)"),
                    Map.of("meal", "Lunch", "food", "Quinoa salad with mixed veggies and grilled turkey. (450 kcal)"),
                    Map.of("meal", "Snack", "food", "A handful of almonds/walnuts and an apple. (200 kcal)"),
                    Map.of("meal", "Dinner", "food", isOlder
                            ? "Grilled chicken, steamed broccoli (for vitamin K), and a small portion of brown rice. (400 kcal)"
                            : "Grilled chicken, steamed broccoli, and a small portion of brown rice. (400 kcal)"));
        } else {
            // Weight Loss Diet
            fitnessGoal = "Healthy Weight Loss";
            dailyTasks = List.of(
                    "Aim for 12,000 steps today.",
                    "Complete 45 minutes of HIIT or brisk walking.",
                    "Maintain a safe calorie deficit (approx -300-500 kcal).",
                    "Drink 3-4 liters of water to aid metabolism.");
            dietPlan = List.of(
                    Map.of("meal", "Breakfast", "food",
                            "Scrambled egg whites with spinach and green tea. Add a calcium supplement if needed. (200 kcal)"),
                    Map.of("meal", "Lunch", "food",
                            "Large green salad with grilled chicken breast and light olive oil vinaigrette. (350 kcal)"),
                    Map.of("meal", "Snack", "food",
                            "Carrot sticks with 2 tablespoons of hummus and a small apple. (100 kcal)"),
                    Map.of("meal", "Dinner", "food",
                            isOlder ? "Baked white fish with roasted asparagus and a side of leafy greens. (250 kcal)"
                                    : "Baked white fish with roasted asparagus. (250 kcal)"));
        }

        // Return the diet wrapped with a nice meta message
        return ResponseEntity.ok(Map.of(
                "fitnessGoal", fitnessGoal,
                "dailyTasks", dailyTasks,
                "message",
                isOlder ? "Your diet plan has been tailored for your BMI with added emphasis on bone and joint health for your age group."
                        : "Your customized diet plan based on your BMI.",
                "age", age != null ? age.toString() : "Not provided",
                "schedule", dietPlan));
    }
}
