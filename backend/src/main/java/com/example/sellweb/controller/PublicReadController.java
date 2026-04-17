package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.ApiListResponse;
import com.example.sellweb.dto.category.CategoryResponse;
import com.example.sellweb.dto.contact.ContactResponse;
import com.example.sellweb.dto.home.HomeConfigResponse;
import com.example.sellweb.dto.product.ProductQueryRequest;
import com.example.sellweb.dto.product.ProductResponse;
import com.example.sellweb.service.CategoryService;
import com.example.sellweb.service.ContactService;
import com.example.sellweb.service.HomeConfigService;
import com.example.sellweb.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 前台公共只读接口。
 */
@RestController
@RequestMapping("/api/public")
public class PublicReadController {

    private final HomeConfigService homeConfigService;
    private final CategoryService categoryService;
    private final ProductService productService;
    private final ContactService contactService;

    public PublicReadController(
            HomeConfigService homeConfigService,
            CategoryService categoryService,
            ProductService productService,
            ContactService contactService) {
        this.homeConfigService = homeConfigService;
        this.categoryService = categoryService;
        this.productService = productService;
        this.contactService = contactService;
    }

    @GetMapping("/home-config")
    public ResponseEntity<ApiResponse<HomeConfigResponse>> getHomeConfig() {
        return ResponseEntity.ok(ApiResponse.success(homeConfigService.getPublicHomeConfig()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getPublicCategories()));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getContacts() {
        return ResponseEntity.ok(ApiResponse.success(contactService.getPublicContacts()));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<ApiListResponse<ProductResponse>>> getProducts(@ModelAttribute ProductQueryRequest query) {
        return ResponseEntity.ok(ApiResponse.success(productService.getPublicProducts(query)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getPublicProductById(id)));
    }
}
