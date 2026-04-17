package com.example.sellweb.repository;

import com.example.sellweb.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 商品 Repository
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    long countByStatus(Short status);

    long countByIsRecommendedAndStatus(Short isRecommended, Short status);

    List<Product> findByStatus(Short status);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByCategoryIdAndStatus(Long categoryId, Short status);

    List<Product> findByIsRecommendedAndStatusOrderBySortOrderAsc(Short isRecommended, Short status);

    List<Product> findByStatusOrderBySortOrderAsc(Short status);
}
