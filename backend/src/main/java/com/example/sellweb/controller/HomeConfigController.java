package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.home.HomeConfigResponse;
import com.example.sellweb.service.HomeConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 首页配置聚合控制器
 */
@RestController
@RequestMapping("/api/home-config")
public class HomeConfigController {

    private final HomeConfigService homeConfigService;

    public HomeConfigController(HomeConfigService homeConfigService) {
        this.homeConfigService = homeConfigService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HomeConfigResponse>> getHomeConfig() {
        return ResponseEntity.ok(ApiResponse.success(homeConfigService.getHomeConfig()));
    }
}
