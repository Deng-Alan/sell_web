package com.example.sellweb.dto.product;

import jakarta.validation.constraints.NotNull;

/**
 * 商品推荐状态更新请求
 */
public class ProductRecommendationRequest {

    @NotNull(message = "推荐状态不能为空")
    private Short isRecommended;

    public Short getIsRecommended() {
        return isRecommended;
    }

    public void setIsRecommended(Short isRecommended) {
        this.isRecommended = isRecommended;
    }
}
