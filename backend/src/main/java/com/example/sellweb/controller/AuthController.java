package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.LoginRequest;
import com.example.sellweb.dto.LoginResponse;
import com.example.sellweb.dto.auth.ChangePasswordRequest;
import com.example.sellweb.dto.auth.CurrentUserResponse;
import com.example.sellweb.entity.AdminUser;
import com.example.sellweb.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证控制器
 * 处理管理员登录请求
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 管理员登录接口
     *
     * @param request 登录请求
     * @return 登录响应
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 当前登录用户信息
     * 用于前端在登录后快速确认认证状态。
     *
     * @param authentication 当前认证对象
     * @return 当前用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> me(Authentication authentication) {
        AdminUser user = authService.requireAuthenticatedUser(authentication);
        CurrentUserResponse response = new CurrentUserResponse(
                user.getUsername(),
                user.getNickname(),
                user.getLastLoginAt()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        authService.logout(authentication);
        return ResponseEntity.ok(ApiResponse.success("退出登录成功", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication, request);
        return ResponseEntity.ok(ApiResponse.success("密码修改成功，请重新登录", null));
    }
}
