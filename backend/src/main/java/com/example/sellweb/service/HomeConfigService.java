package com.example.sellweb.service;

import com.example.sellweb.dto.home.HomeConfigResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 首页配置聚合服务
 */
@Service
@Transactional(readOnly = true)
public class HomeConfigService {

    private final SiteSettingService siteSettingService;
    private final HomeSectionService homeSectionService;

    public HomeConfigService(SiteSettingService siteSettingService, HomeSectionService homeSectionService) {
        this.siteSettingService = siteSettingService;
        this.homeSectionService = homeSectionService;
    }

    public HomeConfigResponse getHomeConfig() {
        HomeConfigResponse response = new HomeConfigResponse();
        response.setSiteSettings(siteSettingService.getAllSettings());
        response.setHomeSections(homeSectionService.getSections());
        return response;
    }

    /**
     * 获取前台公共首页配置。
     */
    public HomeConfigResponse getPublicHomeConfig() {
        HomeConfigResponse response = new HomeConfigResponse();
        response.setSiteSettings(siteSettingService.getAllSettings());
        response.setHomeSections(homeSectionService.getPublicSections());
        return response;
    }
}
