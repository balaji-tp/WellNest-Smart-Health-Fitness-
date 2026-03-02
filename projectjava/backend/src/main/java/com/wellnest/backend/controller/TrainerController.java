package com.wellnest.backend.controller;

import com.wellnest.backend.entity.User;
import com.wellnest.backend.entity.Role;
import com.wellnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trainer")
public class TrainerController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/clients")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<User>> getClients() {
        // Just return all standard users for simplicity in this demo demo
        List<User> clients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clients);
    }
}
