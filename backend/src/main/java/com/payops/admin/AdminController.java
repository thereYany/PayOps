package com.payops.admin;

import com.payops.order.OrderService;
import com.payops.order.dto.OrderResponse;
import com.payops.product.ProductService;
import com.payops.product.dto.ProductRequest;
import com.payops.product.dto.ProductResponse;
import com.payops.user.UserService;
import com.payops.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;

    public AdminController(UserService userService,
                           ProductService productService,
                           OrderService orderService) {
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userService.listAll();
    }

    @GetMapping("/products")
    public List<ProductResponse> products() {
        return productService.listAll();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(@PathVariable Long id,
                                         @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @GetMapping("/orders")
    public List<OrderResponse> orders() {
        return orderService.allOrders();
    }
}
