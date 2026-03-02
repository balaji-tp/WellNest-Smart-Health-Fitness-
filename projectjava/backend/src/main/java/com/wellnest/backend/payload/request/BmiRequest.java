package com.wellnest.backend.payload.request;

import lombok.Data;

@Data
public class BmiRequest {
    private Double heightCm;
    private Double weightKg;
}
