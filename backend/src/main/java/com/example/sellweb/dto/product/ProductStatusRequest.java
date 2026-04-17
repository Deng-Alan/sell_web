package com.example.sellweb.dto.product;

import jakarta.validation.constraints.NotNull;

/**
 * 商品状态更新请求
 */
public class ProductStatusRequest {

    @NotNull(message = "状态不能为空")
    private Short status;

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }
}
