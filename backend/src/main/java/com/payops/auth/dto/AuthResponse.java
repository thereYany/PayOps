package com.payops.auth.dto;

import com.payops.user.dto.UserResponse;

public record AuthResponse(String token, UserResponse user) {
}
