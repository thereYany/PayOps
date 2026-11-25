package com.payops.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "请输入用户名")
        @Size(min = 3, max = 32, message = "用户名长度需要 3 到 32 个字符")
        String username,

        @NotBlank(message = "请输入密码")
        @Size(min = 6, max = 64, message = "密码长度需要 6 到 64 个字符")
        String password
) {
}
