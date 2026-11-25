package com.payops.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TokenOrderRepository extends JpaRepository<TokenOrder, Long> {

    List<TokenOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<TokenOrder> findAllByOrderByCreatedAtDesc();
}
