package com.payops.auth;

import com.payops.auth.dto.AuthResponse;
import com.payops.auth.dto.LoginRequest;
import com.payops.auth.dto.RegisterRequest;
import com.payops.common.ApiException;
import com.payops.security.JwtService;
import com.payops.user.Role;
import com.payops.user.User;
import com.payops.user.UserRepository;
import com.payops.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    private static final BigDecimal REGISTER_BALANCE = new BigDecimal("10.00");
    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.username().trim();
        if (username.length() < 3 || username.length() > 32) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "用户名长度需要 3 到 32 个字符");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.CONFLICT, "用户名已存在");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user.setCnyBalance(REGISTER_BALANCE);
        user.setTokenBalance(ZERO);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "用户名或密码错误"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
        }
        String token = jwtService.generate(user, request.rememberMe());
        return new AuthResponse(token, UserResponse.from(user));
    }
}
