package com.example.sellweb.service;

import com.example.sellweb.dto.upload.UploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 本地图片上传服务
 */
@Service
public class UploadService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp"
    );
    private static final DateTimeFormatter DATE_FOLDER_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final Path uploadBasePath;
    private final String publicPrefix;

    public UploadService(
            @Value("${app.upload.base-dir:uploads}") String baseDir,
            @Value("${app.upload.public-prefix:/api/admin/uploads/files}") String publicPrefix) {
        this.uploadBasePath = Paths.get(baseDir).toAbsolutePath().normalize();
        this.publicPrefix = normalizePrefix(publicPrefix);
    }

    public UploadResponse uploadImage(MultipartFile file) {
        validateImage(file);

        try {
            Files.createDirectories(uploadBasePath);
            String dateFolder = LocalDate.now().format(DATE_FOLDER_FORMAT);
            String storedName = UUID.randomUUID().toString().replace("-", "") + resolveExtension(file);
            Path relativePath = Paths.get("images", dateFolder, storedName);
            Path targetFile = uploadBasePath.resolve(relativePath).normalize();
            Files.createDirectories(targetFile.getParent());
            file.transferTo(targetFile);

            String storagePath = Paths.get("uploads").resolve(relativePath).toString().replace("\\", "/");
            String downloadUrl = publicPrefix + "/" + relativePath.toString().replace("\\", "/");

            return new UploadResponse(
                    file.getOriginalFilename(),
                    storedName,
                    storagePath,
                    downloadUrl,
                    file.getSize(),
                    file.getContentType()
            );
        } catch (IOException e) {
            throw new IllegalStateException("图片上传失败", e);
        }
    }

    public Resource loadResource(String relativePath) {
        Path targetFile = resolveSafePath(relativePath);
        if (!Files.exists(targetFile) || !Files.isRegularFile(targetFile)) {
            throw new IllegalArgumentException("文件不存在");
        }

        try {
            return new UrlResource(targetFile.toUri());
        } catch (MalformedURLException e) {
            throw new IllegalStateException("文件读取失败", e);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("请选择要上传的图片");
        }

        String originalName = file.getOriginalFilename();
        String contentType = file.getContentType();
        if ((originalName == null || originalName.isBlank()) && (contentType == null || contentType.isBlank())) {
            throw new IllegalArgumentException("无法识别图片类型");
        }

        if (!isAllowedImage(originalName, contentType)) {
            throw new IllegalArgumentException("仅支持 JPG、PNG、GIF、WEBP、BMP 图片");
        }
    }

    private boolean isAllowedImage(String originalName, String contentType) {
        if (contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            return true;
        }
        if (originalName == null) {
            return false;
        }
        String lowerName = Paths.get(originalName).getFileName().toString().toLowerCase(Locale.ROOT);
        for (String extension : ALLOWED_EXTENSIONS) {
            if (lowerName.endsWith(extension)) {
                return true;
            }
        }
        return false;
    }

    private String resolveExtension(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName != null) {
            String lowerName = Paths.get(originalName).getFileName().toString().toLowerCase(Locale.ROOT);
            for (String extension : ALLOWED_EXTENSIONS) {
                if (lowerName.endsWith(extension)) {
                    return extension;
                }
            }
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            return ".png";
        }

        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/bmp" -> ".bmp";
            default -> ".png";
        };
    }

    private Path resolveSafePath(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            throw new IllegalArgumentException("文件路径不能为空");
        }

        Path resolvedPath = uploadBasePath.resolve(relativePath).normalize();
        if (!resolvedPath.startsWith(uploadBasePath)) {
            throw new IllegalArgumentException("非法文件路径");
        }
        return resolvedPath;
    }

    private String normalizePrefix(String prefix) {
        String normalized = prefix == null || prefix.isBlank() ? "/api/admin/uploads/files" : prefix.trim();
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }
        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
