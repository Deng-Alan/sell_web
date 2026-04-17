-- V001: 管理员用户表
-- 用于后台登录认证的管理员账户

CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    status SMALLINT NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT uk_admin_users_username UNIQUE (username),
    CONSTRAINT chk_admin_users_status CHECK (status IN (0, 1))
);

-- 索引
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- 注释
COMMENT ON TABLE admin_users IS '管理员用户表';
COMMENT ON COLUMN admin_users.id IS '主键ID';
COMMENT ON COLUMN admin_users.username IS '登录用户名';
COMMENT ON COLUMN admin_users.password_hash IS '密码哈希值(BCrypt)';
COMMENT ON COLUMN admin_users.nickname IS '显示昵称';
COMMENT ON COLUMN admin_users.status IS '状态: 0=禁用, 1=启用';
COMMENT ON COLUMN admin_users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN admin_users.created_at IS '创建时间';
COMMENT ON COLUMN admin_users.updated_at IS '更新时间';

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();