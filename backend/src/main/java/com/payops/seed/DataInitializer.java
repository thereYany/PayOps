package com.payops.seed;

import com.payops.product.TokenProduct;
import com.payops.product.TokenProductRepository;
import com.payops.user.Role;
import com.payops.user.User;
import com.payops.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TokenProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository,
                           TokenProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.existsByUsername(adminUsername)) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setCnyBalance(new BigDecimal("0.00"));
            admin.setTokenBalance(new BigDecimal("0.00"));
            userRepository.save(admin);
            log.info("Seeded admin account: {}", adminUsername);
        }

        if (productRepository.count() == 0) {
            productRepository.save(product("1 元 token", "0.95", "1.00"));
            productRepository.save(product("5 元 token", "4.50", "5.00"));
            productRepository.save(product("10 元 token", "8.50", "10.00"));
            log.info("Seeded default token products");
        }
    }

    private TokenProduct product(String name, String price, String tokenAmount) {
        TokenProduct product = new TokenProduct();
        product.setName(name);
        product.setPrice(new BigDecimal(price));
        product.setTokenAmount(new BigDecimal(tokenAmount));
        product.setEnabled(true);
        return product;
    }
}
