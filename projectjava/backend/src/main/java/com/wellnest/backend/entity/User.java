package com.wellnest.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    private Role role;

    @Builder.Default
    private Boolean isEnabled = true;

    // Profile Details
    private String firstName;
    private String lastName;
    private Integer age;
    private String gender; // M, F, or Other
    private String phoneNumber;
    private Double heightCm;
    private Double weightKg;
    private Double bmi;

    // Trainer Specific Professional Details
    private Integer experienceYears;
    private String specialization;
    private String certifications;

    // Link User to a Trainer
    private Long trainerId;

    // OTP
    private String otpCode;
    private LocalDateTime otpExpiry;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void setCreatedAt() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}
