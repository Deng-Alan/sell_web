package com.example.sellweb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 分类创建/更新请求 DTO
 */
public class CategoryRequest {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称长度不能超过100")
    private String name;

    @NotBlank(message = "分类标识不能为空")
    @Size(max = 100, message = "分类标识长度不能超过100")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "分类标识只能包含小写字母、数字和连字符")
    private String slug;

    private Integer sortOrder = 0;

    private Short status = 1;

    public CategoryRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }
}