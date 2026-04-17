package com.example.sellweb.dto.product;

/**
 * Product list query parameters.
 */
public class ProductQueryRequest {

    private Integer page;

    private Integer pageSize;

    private Long categoryId;

    private Short status;

    private Short isRecommended;

    private String keyword;

    public ProductQueryRequest() {
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }

    public Short getIsRecommended() {
        return isRecommended;
    }

    public void setIsRecommended(Short isRecommended) {
        this.isRecommended = isRecommended;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
