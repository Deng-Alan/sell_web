package com.example.sellweb.dto.home;

import com.example.sellweb.dto.setting.SiteSettingResponse;

import java.util.List;

/**
 * 首页配置聚合响应
 */
public class HomeConfigResponse {

    private List<SiteSettingResponse> siteSettings;
    private List<HomeSectionResponse> homeSections;

    public List<SiteSettingResponse> getSiteSettings() {
        return siteSettings;
    }

    public void setSiteSettings(List<SiteSettingResponse> siteSettings) {
        this.siteSettings = siteSettings;
    }

    public List<HomeSectionResponse> getHomeSections() {
        return homeSections;
    }

    public void setHomeSections(List<HomeSectionResponse> homeSections) {
        this.homeSections = homeSections;
    }
}
