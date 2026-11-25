package com.payops.product.dto;

import com.payops.product.TokenProduct;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        BigDecimal price,
        BigDecimal tokenAmount,
        boolean enabled,
        LocalDateTime createdAt
) {

    public static ProductResponse from(TokenProduct product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getTokenAmount(),
                product.isEnabled(),
                product.getCreatedAt()
        );
    }
}
