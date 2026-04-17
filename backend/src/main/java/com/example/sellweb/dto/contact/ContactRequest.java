package com.example.sellweb.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 联系方式创建/更新请求
 */
public class ContactRequest {

    @NotBlank(message = "类型不能为空")
    @Size(max = 30, message = "类型长度不能超过30")
    private String type;

    @NotBlank(message = "名称不能为空")
    @Size(max = 100, message = "名称长度不能超过100")
    private String name;

    @NotBlank(message = "联系方式值不能为空")
    @Size(max = 255, message = "联系方式值长度不能超过255")
    private String value;

    @Size(max = 255, message = "二维码图片地址长度不能超过255")
    private String qrImage;

    @Size(max = 255, message = "跳转链接长度不能超过255")
    private String jumpUrl;

    @Size(max = 255, message = "展示位置长度不能超过255")
    private String displayPlaces;

    private Integer sortOrder;

    private Short status;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getQrImage() {
        return qrImage;
    }

    public void setQrImage(String qrImage) {
        this.qrImage = qrImage;
    }

    public String getJumpUrl() {
        return jumpUrl;
    }

    public void setJumpUrl(String jumpUrl) {
        this.jumpUrl = jumpUrl;
    }

    public String getDisplayPlaces() {
        return displayPlaces;
    }

    public void setDisplayPlaces(String displayPlaces) {
        this.displayPlaces = displayPlaces;
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
