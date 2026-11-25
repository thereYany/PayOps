package com.payops.order.dto;

import jakarta.validation.constraints.NotNull;

public record PurchaseRequest(
        @NotNull(message = "请选择套餐")
        Long productId
) {
}
