package com.example.sellweb.dto;

import java.util.List;

/**
 * 统一错误响应 DTO
 */
public class ErrorResponse {

    private boolean success;
    private String message;
    private List<ErrorDetail> errors;

    public ErrorResponse() {
    }

    public ErrorResponse(boolean success, String message, List<ErrorDetail> errors) {
        this.success = success;
        this.message = message;
        this.errors = errors;
    }

    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message, null);
    }

    public static ErrorResponse of(String message, List<ErrorDetail> errors) {
        return new ErrorResponse(false, message, errors);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ErrorDetail> getErrors() {
        return errors;
    }

    public void setErrors(List<ErrorDetail> errors) {
        this.errors = errors;
    }
}
