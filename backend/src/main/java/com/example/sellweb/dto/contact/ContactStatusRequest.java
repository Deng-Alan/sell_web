package com.example.sellweb.dto.contact;

import jakarta.validation.constraints.NotNull;

/**
 * 联系方式状态请求
 */
public class ContactStatusRequest {

    @NotNull(message = "状态不能为空")
    private Short status;

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }
}
