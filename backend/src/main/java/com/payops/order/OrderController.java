package com.payops.order;

import com.payops.order.dto.OrderResponse;
import com.payops.order.dto.PurchaseRequest;
import com.payops.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse purchase(@RequestAttribute("currentUser") User user,
                                  @Valid @RequestBody PurchaseRequest request) {
        return orderService.purchase(user.getId(), request.productId());
    }

    @GetMapping("/my")
    public List<OrderResponse> myOrders(@RequestAttribute("currentUser") User user) {
        return orderService.myOrders(user.getId());
    }
}
