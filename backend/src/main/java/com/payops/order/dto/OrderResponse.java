package com.payops.order.dto;

import com.payops.order.TokenOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long userId,
        String username,
        Long productId,
        String productName,
        BigDecimal price,
        BigDecimal tokenAmount,
        String status,
        LocalDateTime createdAt
) {

    public static OrderResponse from(TokenOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getUsername(),
                order.getProductId(),
                order.getProductName(),
                order.getPrice(),
                order.getTokenAmount(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }
}
