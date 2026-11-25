package com.payops.order;

import com.payops.common.ApiException;
import com.payops.order.dto.OrderResponse;
import com.payops.product.TokenProduct;
import com.payops.product.TokenProductRepository;
import com.payops.user.User;
import com.payops.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final UserRepository userRepository;
    private final TokenProductRepository productRepository;
    private final TokenOrderRepository orderRepository;

    public OrderService(UserRepository userRepository,
                        TokenProductRepository productRepository,
                        TokenOrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponse purchase(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "用户不存在"));
        TokenProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "套餐不存在"));

        if (!product.isEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "该套餐已停用");
        }
        if (user.getCnyBalance().compareTo(product.getPrice()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "余额不足");
        }

        user.setCnyBalance(user.getCnyBalance().subtract(product.getPrice()));
        user.setTokenBalance(user.getTokenBalance().add(product.getTokenAmount()));
        userRepository.save(user);

        TokenOrder order = new TokenOrder();
        order.setUserId(user.getId());
        order.setUsername(user.getUsername());
        order.setProductId(product.getId());
        order.setProductName(product.getName());
        order.setPrice(product.getPrice());
        order.setTokenAmount(product.getTokenAmount());
        order.setStatus(OrderStatus.PAID);
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::from)
                .toList();
    }
}
