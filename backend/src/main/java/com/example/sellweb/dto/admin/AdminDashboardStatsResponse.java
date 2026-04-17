package com.example.sellweb.dto.admin;

/**
 * 后台概览统计响应 DTO
 */
public class AdminDashboardStatsResponse {

    private long totalProducts;
    private long activeProducts;
    private long recommendedProducts;
    private long totalCategories;
    private long activeCategories;
    private long totalContacts;
    private long activeContacts;

    public AdminDashboardStatsResponse() {
    }

    public AdminDashboardStatsResponse(
            long totalProducts,
            long activeProducts,
            long recommendedProducts,
            long totalCategories,
            long activeCategories,
            long totalContacts,
            long activeContacts) {
        this.totalProducts = totalProducts;
        this.activeProducts = activeProducts;
        this.recommendedProducts = recommendedProducts;
        this.totalCategories = totalCategories;
        this.activeCategories = activeCategories;
        this.totalContacts = totalContacts;
        this.activeContacts = activeContacts;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getActiveProducts() {
        return activeProducts;
    }

    public void setActiveProducts(long activeProducts) {
        this.activeProducts = activeProducts;
    }

    public long getRecommendedProducts() {
        return recommendedProducts;
    }

    public void setRecommendedProducts(long recommendedProducts) {
        this.recommendedProducts = recommendedProducts;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getActiveCategories() {
        return activeCategories;
    }

    public void setActiveCategories(long activeCategories) {
        this.activeCategories = activeCategories;
    }

    public long getTotalContacts() {
        return totalContacts;
    }

    public void setTotalContacts(long totalContacts) {
        this.totalContacts = totalContacts;
    }

    public long getActiveContacts() {
        return activeContacts;
    }

    public void setActiveContacts(long activeContacts) {
        this.activeContacts = activeContacts;
    }
}
