package com.wellnest.backend.controller;

import com.wellnest.backend.entity.Role;
import com.wellnest.backend.entity.User;
import com.wellnest.backend.payload.request.LoginRequest;
import com.wellnest.backend.payload.request.SignupRequest;
import com.wellnest.backend.payload.response.JwtResponse;
import com.wellnest.backend.payload.response.MessageResponse;
import com.wellnest.backend.repository.UserRepository;
import com.wellnest.backend.security.jwt.JwtUtils;
import com.wellnest.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import org.springframework.web.client.RestTemplate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles.get(0)));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        Role userRole = Role.USER;
        if (signUpRequest.getRole() != null) {
            String roleReq = signUpRequest.getRole().toLowerCase();
            if (roleReq.equals("admin")) {
                userRole = Role.ADMIN;
            } else if (roleReq.equals("trainer")) {
                userRole = Role.TRAINER;
            }
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(userRole)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Token is required!"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;

            @SuppressWarnings("unchecked")
            Map<String, Object> googleInfo = restTemplate.getForObject(url, Map.class);

            if (googleInfo == null || !googleInfo.containsKey("email")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Google Token!"));
            }

            String email = (String) googleInfo.get("email");
            String name = (String) googleInfo.get("name");
            String firstName = (String) googleInfo.get("given_name");
            String lastName = (String) googleInfo.get("family_name");

            User user;
            if (userRepository.existsByEmail(email)) {
                user = userRepository.findByEmail(email).get();
            } else {
                // Register new user immediately
                user = User.builder()
                        .username(name.replaceAll("\\s+", "").toLowerCase() + new java.util.Random().nextInt(1000))
                        .email(email)
                        .password(encoder.encode(java.util.UUID.randomUUID().toString()))
                        .role(Role.USER)
                        .firstName(firstName)
                        .lastName(lastName)
                        .isEnabled(true)
                        .build();
                userRepository.save(user);
            }

            // Authenticate directly
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    user.getRole().name()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Google Sign-in verification failed."));
        }
    }

    // Mock OTP functionality for Forgot Password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (!userRepository.existsByEmail(email)) {
            // Return success anyway to prevent email enumeration, but log internally if
            // needed
            return ResponseEntity.ok(new MessageResponse("If your email is registered, an OTP was sent."));
        }

        // Generate mock OTP
        String mockOtp = String.format("%06d", new java.util.Random().nextInt(999999));

        System.out.println("=============================================");
        System.out.println("MOCK OTP FOR " + email + " IS: " + mockOtp);
        System.out.println("=============================================");

        User user = userRepository.findByEmail(email).get();
        user.setOtpCode(mockOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("If your email is registered, an OTP was sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid details."));
        }

        User user = userRepository.findByEmail(email).get();

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid OTP."));
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: OTP has expired."));
        }

        // Update password
        user.setPassword(encoder.encode(newPassword));
        // Clear OTP state
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully. You can now login."));
    }
}
