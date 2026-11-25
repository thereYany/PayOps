package com.payops.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TokenProductRepository extends JpaRepository<TokenProduct, Long> {

    List<TokenProduct> findByEnabledTrueOrderByPriceAsc();

    List<TokenProduct> findAllByOrderByIdDesc();
}
