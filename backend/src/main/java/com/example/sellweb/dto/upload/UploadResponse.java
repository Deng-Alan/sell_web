package com.example.sellweb.dto.upload;

/**
 * 图片上传响应
 */
public class UploadResponse {

    private String originalName;
    private String storedName;
    private String storagePath;
    private String url;
    private Long size;
    private String contentType;

    public UploadResponse() {
    }

    public UploadResponse(String originalName,
                          String storedName,
                          String storagePath,
                          String url,
                          Long size,
                          String contentType) {
        this.originalName = originalName;
        this.storedName = storedName;
        this.storagePath = storagePath;
        this.url = url;
        this.size = size;
        this.contentType = contentType;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public String getStoredName() {
        return storedName;
    }

    public void setStoredName(String storedName) {
        this.storedName = storedName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
}
