package com.example.sellweb.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Product create/update request.
 */
public class ProductRequest {

    @NotNull(message = "categoryId is required")
    private Long categoryId;

    @NotBlank(message = "name is required")
    @Size(max = 200, message = "name must be at most 200 characters")
    private String name;

    @Size(max = 255, message = "coverImage must be at most 255 characters")
    private String coverImage;

    @Size(max = 500, message = "shortDesc must be at most 500 characters")
    private String shortDesc;

    private String content;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "price must be greater than or equal to 0")
    private BigDecimal price;

    @DecimalMin(value = "0.00", inclusive = true, message = "originalPrice must be greater than or equal to 0")
    private BigDecimal originalPrice;

    @NotNull(message = "stock is required")
    private Integer stock;

    private Long contactId;

    private Short isRecommended;

    private Integer sortOrder;

    private Short status;

    private List<@NotBlank(message = "imageUrl cannot be blank") @Size(max = 255, message = "imageUrl must be at most 255 characters") String> imageUrls;

    public ProductRequest() {
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getShortDesc() {
        return shortDesc;
    }

    public void setShortDesc(String shortDesc) {
        this.shortDesc = shortDesc;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public Short getIsRecommended() {
        return isRecommended;
    }

    public void setIsRecommended(Short isRecommended) {
        this.isRecommended = isRecommended;
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

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
