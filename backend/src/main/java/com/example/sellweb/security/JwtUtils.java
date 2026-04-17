package com.example.sellweb.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;

/**
 * JWT 工具类
 * 负责 JWT 的生成、解析和校验
 */
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private static final long EXPIRATION_HOURS = 24;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成 JWT token
     *
     * @param username 用户名
     * @return JWT token
     */
    public String generateToken(String username, int tokenVersion) {
        Instant now = Instant.now();
        Instant expiration = now.plus(EXPIRATION_HOURS, ChronoUnit.HOURS);

        return Jwts.builder()
                .subject(username)
                .claim("tokenVersion", tokenVersion)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从 token 中解析用户名
     *
     * @param token JWT token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    public Integer getTokenVersionFromToken(String token) {
        Claims claims = parseClaims(token);
        Integer tokenVersion = claims.get("tokenVersion", Integer.class);
        return Objects.requireNonNullElse(tokenVersion, 0);
    }

    /**
     * 校验 token 是否有效
     *
     * @param token JWT token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
