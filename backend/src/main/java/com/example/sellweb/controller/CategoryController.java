package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.category.CategoryRequest;
import com.example.sellweb.dto.category.CategoryResponse;
import com.example.sellweb.dto.category.CategorySortRequest;
import com.example.sellweb.dto.category.CategoryStatusRequest;
import com.example.sellweb.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类管理控制器
 * 提供分类 CRUD 和排序/启停接口
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * 获取所有分类列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * 获取单个分类
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * 创建分类
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("分类创建成功", category));
    }

    /**
     * 更新分类
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("分类更新成功", category));
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("分类删除成功", null));
    }

    /**
     * 更新分类状态（启停）
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusRequest request) {
        CategoryResponse category = categoryService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("状态更新成功", category));
    }

    /**
     * 更新分类排序
     */
    @PutMapping("/{id}/sort")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateSortOrder(
            @PathVariable Long id,
            @Valid @RequestBody CategorySortRequest request) {
        CategoryResponse category = categoryService.updateSortOrder(id, request.getSortOrder());
        return ResponseEntity.ok(ApiResponse.success("排序更新成功", category));
    }
}
