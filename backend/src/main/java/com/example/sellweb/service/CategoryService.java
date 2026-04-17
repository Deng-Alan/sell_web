package com.example.sellweb.service;

import com.example.sellweb.dto.category.CategoryRequest;
import com.example.sellweb.dto.category.CategoryResponse;
import com.example.sellweb.entity.ProductCategory;
import com.example.sellweb.repository.ProductCategoryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * 分类管理 Service
 */
@Service
@Transactional
public class CategoryService {

    private final ProductCategoryRepository categoryRepository;

    public CategoryService(ProductCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * 获取所有分类列表
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取前台可见分类列表
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getPublicCategories() {
        return categoryRepository.findByStatusOrderBySortOrderAsc((short) 1)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取单个分类
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        ProductCategory category = findCategoryOrThrow(id);
        return toResponse(category);
    }

    /**
     * 创建分类
     */
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalStateException("分类标识已存在");
        }

        ProductCategory category = new ProductCategory();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        category.setStatus(request.getStatus() != null ? request.getStatus() : 1);

        ProductCategory saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    /**
     * 更新分类
     */
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        ProductCategory category = findCategoryOrThrow(id);

        if (categoryRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
            throw new IllegalStateException("分类标识已存在");
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        ProductCategory saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    /**
     * 删除分类
     */
    public void deleteCategory(Long id) {
        ProductCategory category = findCategoryOrThrow(id);

        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("分类下存在商品，无法删除");
        }
    }

    /**
     * 更新分类状态（启停）
     */
    public CategoryResponse updateStatus(Long id, Short status) {
        ProductCategory category = findCategoryOrThrow(id);

        if (status == null || (status != 0 && status != 1)) {
            throw new IllegalArgumentException("状态值无效，必须为0或1");
        }

        category.setStatus(status);
        ProductCategory saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    /**
     * 更新分类排序
     */
    public CategoryResponse updateSortOrder(Long id, Integer sortOrder) {
        ProductCategory category = findCategoryOrThrow(id);

        if (sortOrder == null || sortOrder < 0) {
            throw new IllegalArgumentException("排序值无效，必须为非负整数");
        }

        category.setSortOrder(sortOrder);
        ProductCategory saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    /**
     * 实体转响应 DTO
     */
    private CategoryResponse toResponse(ProductCategory category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setSortOrder(category.getSortOrder());
        response.setStatus(category.getStatus());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }

    private ProductCategory findCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("分类不存在"));
    }
}
