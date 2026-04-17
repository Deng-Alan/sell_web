package com.example.sellweb.dto.contact;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * 联系方式排序请求
 */
public class ContactSortRequest {

    @NotNull(message = "排序值不能为空")
    @Min(value = 0, message = "排序值必须大于等于0")
    private Integer sortOrder;

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
