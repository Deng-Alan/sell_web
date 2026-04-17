package com.example.sellweb.service;

import com.example.sellweb.dto.admin.AdminDashboardStatsResponse;
import com.example.sellweb.repository.ContactRepository;
import com.example.sellweb.repository.ProductCategoryRepository;
import com.example.sellweb.repository.ProductRepository;
import org.springframework.stereotype.Service;

/**
 * 后台概览统计服务
 */
@Service
public class AdminDashboardService {

    private static final short ENABLED_STATUS = 1;
    private static final short RECOMMENDED_STATUS = 1;

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ContactRepository contactRepository;

    public AdminDashboardService(
            ProductRepository productRepository,
            ProductCategoryRepository productCategoryRepository,
            ContactRepository contactRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.contactRepository = contactRepository;
    }

    public AdminDashboardStatsResponse getStats() {
        return new AdminDashboardStatsResponse(
                productRepository.count(),
                productRepository.countByStatus(ENABLED_STATUS),
                productRepository.countByIsRecommendedAndStatus(RECOMMENDED_STATUS, ENABLED_STATUS),
                productCategoryRepository.count(),
                productCategoryRepository.countByStatus(ENABLED_STATUS),
                contactRepository.count(),
                contactRepository.countByStatus(ENABLED_STATUS)
        );
    }
}
