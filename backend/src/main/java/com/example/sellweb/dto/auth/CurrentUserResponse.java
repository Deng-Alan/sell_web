package com.example.sellweb.dto.auth;

import java.time.LocalDateTime;

/**
 * 当前登录用户信息
 */
public class CurrentUserResponse {

    private String username;
    private String nickname;
    private LocalDateTime lastLoginAt;

    public CurrentUserResponse() {
    }

    public CurrentUserResponse(String username, String nickname, LocalDateTime lastLoginAt) {
        this.username = username;
        this.nickname = nickname;
        this.lastLoginAt = lastLoginAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
