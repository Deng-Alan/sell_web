package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.home.HomeSectionRequest;
import com.example.sellweb.dto.home.HomeSectionResponse;
import com.example.sellweb.service.HomeSectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 首页区块控制器
 */
@RestController
@RequestMapping("/api/home-sections")
public class HomeSectionController {

    private final HomeSectionService homeSectionService;

    public HomeSectionController(HomeSectionService homeSectionService) {
        this.homeSectionService = homeSectionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HomeSectionResponse>>> getSections() {
        return ResponseEntity.ok(ApiResponse.success(homeSectionService.getSections()));
    }

    @GetMapping("/{sectionKey}")
    public ResponseEntity<ApiResponse<HomeSectionResponse>> getSectionByKey(@PathVariable String sectionKey) {
        return ResponseEntity.ok(ApiResponse.success(homeSectionService.getSectionByKey(sectionKey)));
    }

    @PutMapping("/{sectionKey}")
    public ResponseEntity<ApiResponse<HomeSectionResponse>> upsertSection(
            @PathVariable String sectionKey,
            @Valid @RequestBody HomeSectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("首页区块保存成功", homeSectionService.upsertSection(sectionKey, request)));
    }

    @DeleteMapping("/{sectionKey}")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable String sectionKey) {
        homeSectionService.deleteSection(sectionKey);
        return ResponseEntity.ok(ApiResponse.success("首页区块删除成功", null));
    }
}
