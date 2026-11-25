package com.payops;

import com.payops.auth.AuthService;
import com.payops.auth.dto.AuthResponse;
import com.payops.auth.dto.LoginRequest;
import com.payops.auth.dto.RegisterRequest;
import com.payops.order.OrderService;
import com.payops.order.dto.OrderResponse;
import com.payops.product.TokenProduct;
import com.payops.product.TokenProductRepository;
import com.payops.user.Role;
import com.payops.user.User;
import com.payops.user.UserRepository;
import com.payops.user.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PurchaseFlowTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenProductRepository productRepository;

    @Test
    void registerLoginAndPurchaseUpdatesBalances() {
        String username = "user_" + UUID.randomUUID().toString().substring(0, 8);

        UserResponse registered = authService.register(new RegisterRequest(username, "secret123"));
        assertThat(registered.cnyBalance()).isEqualByComparingTo("10.00");
        assertThat(registered.tokenBalance()).isEqualByComparingTo("0.00");

        AuthResponse login = authService.login(new LoginRequest(username, "secret123", true));
        assertThat(login.token()).isNotBlank();
        assertThat(login.user().role()).isEqualTo("USER");

        TokenProduct product = productRepository.findByEnabledTrueOrderByPriceAsc().get(0);
        OrderResponse order = orderService.purchase(registered.id(), product.getId());
        assertThat(order.status()).isEqualTo("PAID");

        User user = userRepository.findById(registered.id()).orElseThrow();
        assertThat(user.getCnyBalance()).isEqualByComparingTo("9.05");
        assertThat(user.getTokenBalance()).isEqualByComparingTo("1.00");
        assertThat(orderService.myOrders(registered.id())).hasSize(1);
    }

    @Test
    void adminAccountIsSeeded() {
        User admin = userRepository.findByUsername("admin").orElseThrow();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(productRepository.count()).isEqualTo(3);
    }
}
