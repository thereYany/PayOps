package com.payops.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.payops.user.Role;
import com.payops.user.User;
import com.payops.user.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Map;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public JwtAuthInterceptor(JwtService jwtService,
                              UserRepository userRepository,
                              ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return reject(response, 401, "请先登录");
        }

        try {
            Long userId = jwtService.parseUserId(header.substring(7));
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return reject(response, 401, "登录状态已失效");
            }
            if (request.getRequestURI().startsWith("/api/admin") && user.getRole() != Role.ADMIN) {
                return reject(response, 403, "没有管理员权限");
            }
            request.setAttribute("currentUser", user);
            return true;
        } catch (JwtException | IllegalArgumentException exception) {
            return reject(response, 401, "登录状态已失效");
        }
    }

    private boolean reject(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of("message", message));
        return false;
    }
}
