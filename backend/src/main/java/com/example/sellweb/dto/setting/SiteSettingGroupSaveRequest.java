package com.example.sellweb.dto.setting;

import jakarta.validation.Valid;

import java.util.List;

/**
 * 站点设置分组保存请求
 */
public class SiteSettingGroupSaveRequest {

    @Valid
    private List<SiteSettingRequest> items;

    public List<SiteSettingRequest> getItems() {
        return items;
    }

    public void setItems(List<SiteSettingRequest> items) {
        this.items = items;
    }
}
