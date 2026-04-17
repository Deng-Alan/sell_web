package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.setting.SiteSettingGroupSaveRequest;
import com.example.sellweb.dto.setting.SiteSettingRequest;
import com.example.sellweb.dto.setting.SiteSettingResponse;
import com.example.sellweb.service.SiteSettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 站点设置控制器
 */
@RestController
@RequestMapping("/api/site-settings")
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    public SiteSettingController(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SiteSettingResponse>>> getSettings(
            @RequestParam(required = false) String groupName) {
        return ResponseEntity.ok(ApiResponse.success(siteSettingService.getSettings(groupName)));
    }

    @GetMapping("/{settingKey}")
    public ResponseEntity<ApiResponse<SiteSettingResponse>> getSettingByKey(@PathVariable String settingKey) {
        return ResponseEntity.ok(ApiResponse.success(siteSettingService.getSettingByKey(settingKey)));
    }

    @PutMapping("/{settingKey}")
    public ResponseEntity<ApiResponse<SiteSettingResponse>> saveSetting(
            @PathVariable String settingKey,
            @Valid @RequestBody SiteSettingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("站点设置保存成功", siteSettingService.saveSetting(settingKey, request)));
    }

    @PutMapping("/groups/{groupName}")
    public ResponseEntity<ApiResponse<List<SiteSettingResponse>>> saveGroupSettings(
            @PathVariable String groupName,
            @Valid @RequestBody SiteSettingGroupSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success("站点设置分组保存成功", siteSettingService.saveGroupSettings(groupName, request)));
    }
}
