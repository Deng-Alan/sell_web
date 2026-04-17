package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.upload.UploadResponse;
import com.example.sellweb.service.UploadService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 管理员图片上传控制器
 */
@RestController
@RequestMapping("/api/admin/uploads")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadResponse>> uploadImage(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        UploadResponse response = uploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("图片上传成功", response));
    }

    @GetMapping("/files/{*path}")
    public ResponseEntity<Resource> getFile(@PathVariable("path") String path) {
        try {
            Resource resource = uploadService.loadResource(path);
            MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
