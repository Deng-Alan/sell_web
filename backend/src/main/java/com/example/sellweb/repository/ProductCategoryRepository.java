package com.example.sellweb.repository;

import com.example.sellweb.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 商品分类 Repository
 */
@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    long countByStatus(Short status);

    List<ProductCategory> findByStatus(Short status);

    List<ProductCategory> findByStatusOrderBySortOrderAsc(Short status);

    List<ProductCategory> findAllByOrderBySortOrderAscIdAsc();

    Optional<ProductCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
