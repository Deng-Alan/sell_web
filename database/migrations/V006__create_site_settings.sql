-- V006: 站点配置表
-- 全局站点设置，支持分组和键值存储

CREATE TABLE site_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    group_name VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT uk_site_settings_key UNIQUE (setting_key)
);

-- 索引
CREATE INDEX idx_site_settings_group ON site_settings(group_name);

-- 注释
COMMENT ON TABLE site_settings IS '站点配置表';
COMMENT ON COLUMN site_settings.id IS '主键ID';
COMMENT ON COLUMN site_settings.setting_key IS '配置键';
COMMENT ON COLUMN site_settings.setting_value IS '配置值';
COMMENT ON COLUMN site_settings.group_name IS '配置分组名称';
COMMENT ON COLUMN site_settings.created_at IS '创建时间';
COMMENT ON COLUMN site_settings.updated_at IS '更新时间';

-- 触发器：自动更新 updated_at
CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();