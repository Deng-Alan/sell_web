package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.ApiListResponse;
import com.example.sellweb.dto.product.ProductQueryRequest;
import com.example.sellweb.dto.product.ProductRecommendationRequest;
import com.example.sellweb.dto.product.ProductRequest;
import com.example.sellweb.dto.product.ProductResponse;
import com.example.sellweb.dto.product.ProductSortOrderRequest;
import com.example.sellweb.dto.product.ProductStatusRequest;
import com.example.sellweb.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
/**
 * Product management controller.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ApiListResponse<ProductResponse>>> getProducts(@ModelAttribute ProductQueryRequest query) {
        ApiListResponse<ProductResponse> products = productService.getProducts(query);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductStatusRequest request) {
        ProductResponse product = productService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", product));
    }

    @PutMapping("/{id}/recommended")
    public ResponseEntity<ApiResponse<ProductResponse>> updateRecommended(
            @PathVariable Long id,
            @Valid @RequestBody ProductRecommendationRequest request) {
        ProductResponse product = productService.updateRecommended(id, request.getIsRecommended());
        return ResponseEntity.ok(ApiResponse.success("Recommendation updated successfully", product));
    }

    @PutMapping("/{id}/sort")
    public ResponseEntity<ApiResponse<ProductResponse>> updateSortOrder(
            @PathVariable Long id,
            @Valid @RequestBody ProductSortOrderRequest request) {
        ProductResponse product = productService.updateSortOrder(id, request.getSortOrder());
        return ResponseEntity.ok(ApiResponse.success("Sort order updated successfully", product));
    }
}
