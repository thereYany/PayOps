package com.payops.product;

import com.payops.common.ApiException;
import com.payops.product.dto.ProductRequest;
import com.payops.product.dto.ProductResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.util.List;

@Service
public class ProductService {

    private final TokenProductRepository productRepository;

    public ProductService(TokenProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listEnabled() {
        return productRepository.findByEnabledTrueOrderByPriceAsc().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAll() {
        return productRepository.findAllByOrderByIdDesc().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        TokenProduct product = new TokenProduct();
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        TokenProduct product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "套餐不存在"));
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    private void apply(TokenProduct product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setPrice(request.price().setScale(2, RoundingMode.HALF_UP));
        product.setTokenAmount(request.tokenAmount().setScale(2, RoundingMode.HALF_UP));
        product.setEnabled(request.enabled());
    }
}
