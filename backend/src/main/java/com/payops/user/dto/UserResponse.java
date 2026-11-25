package com.payops.user.dto;

import com.payops.user.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String role,
        BigDecimal cnyBalance,
        BigDecimal tokenBalance,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getCnyBalance(),
                user.getTokenBalance(),
                user.getCreatedAt()
        );
    }
}
