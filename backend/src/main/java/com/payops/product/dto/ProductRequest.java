package com.payops.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "请输入套餐名称")
        @Size(max = 64, message = "套餐名称不能超过 64 个字符")
        String name,

        @NotNull(message = "请输入售价")
        @DecimalMin(value = "0.01", message = "售价必须大于 0")
        @Digits(integer = 8, fraction = 2, message = "售价格式不正确")
        BigDecimal price,

        @NotNull(message = "请输入到账 token 数量")
        @DecimalMin(value = "0.01", message = "token 数量必须大于 0")
        @Digits(integer = 8, fraction = 2, message = "token 数量格式不正确")
        BigDecimal tokenAmount,

        boolean enabled
) {
}
