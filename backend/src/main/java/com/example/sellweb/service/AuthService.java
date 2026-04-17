package com.example.sellweb.service;

import com.example.sellweb.dto.LoginRequest;
import com.example.sellweb.dto.LoginResponse;
import com.example.sellweb.dto.auth.ChangePasswordRequest;
import com.example.sellweb.entity.AdminUser;
import com.example.sellweb.repository.AdminUserRepository;
import com.example.sellweb.security.JwtUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

/**
 * 认证服务
 * 处理管理员登录逻辑
 */
@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AdminUserRepository adminUserRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * 管理员登录
     *
     * @param request 登录请求
     * @return 登录响应（包含 JWT token）
     * @throws RuntimeException 登录失败时抛出
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 查找用户
        AdminUser user = adminUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new SecurityException("用户名或密码错误"));

        // 校验用户状态
        if (user.getStatus() != 1) {
            throw new SecurityException("账号已禁用");
        }

        // 校验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new SecurityException("用户名或密码错误");
        }

        // 生成 token
        String token = jwtUtils.generateToken(user.getUsername(), user.getTokenVersion());

        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        adminUserRepository.save(user);

        return new LoginResponse(token, user.getUsername(), user.getNickname());
    }

    /**
     * 根据用户名获取用户信息
     *
     * @param username 用户名
     * @return 用户实体
     * @throws RuntimeException 用户不存在时抛出
     */
    public AdminUser getUserByUsername(String username) {
        return adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("用户不存在"));
    }

    @Transactional
    public void logout(Authentication authentication) {
        AdminUser user = requireAuthenticatedUser(authentication);
        user.setTokenVersion(user.getTokenVersion() + 1);
        adminUserRepository.save(user);
    }

    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {
        AdminUser user = requireAuthenticatedUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("当前密码不正确");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("新密码不能与当前密码相同");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        adminUserRepository.save(user);
    }

    public AdminUser requireAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new SecurityException("未登录");
        }
        return getUserByUsername(authentication.getName());
    }
}
