package com.example.sellweb.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadServiceTests {

    @TempDir
    Path tempDir;

    @Test
    void loadResourceSupportsLeadingSlash() throws Exception {
        UploadService uploadService = new UploadService(tempDir.toString(), "/api/admin/uploads/files");
        Path imagePath = tempDir.resolve(Path.of("images", "2026", "04", "19", "sample.jpg"));
        Files.createDirectories(imagePath.getParent());
        Files.write(imagePath, "test-image".getBytes());

        Resource resource = uploadService.loadResource("/images/2026/04/19/sample.jpg");

        assertThat(resource.exists()).isTrue();
        assertThat(resource.getFilename()).isEqualTo("sample.jpg");
    }

    @Test
    void loadResourceRejectsPathTraversal() {
        UploadService uploadService = new UploadService(tempDir.toString(), "/api/admin/uploads/files");

        assertThatThrownBy(() -> uploadService.loadResource("../secret.txt"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("非法文件路径");
    }
}
