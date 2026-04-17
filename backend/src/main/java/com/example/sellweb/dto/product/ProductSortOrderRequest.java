package com.example.sellweb.dto.product;

import jakarta.validation.constraints.NotNull;

/**
 * 商品排序更新请求
 */
public class ProductSortOrderRequest {

    @NotNull(message = "排序值不能为空")
    private Integer sortOrder;

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
