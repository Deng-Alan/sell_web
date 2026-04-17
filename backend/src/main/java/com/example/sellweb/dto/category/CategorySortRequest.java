package com.example.sellweb.dto.category;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class CategorySortRequest {

    @NotNull(message = "Sort order cannot be null")
    @PositiveOrZero(message = "Sort order must be greater than or equal to 0")
    private Integer sortOrder;

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
