-- V007: 首页区块表
-- 首页动态内容区块配置

CREATE TABLE home_sections (
    id BIGSERIAL PRIMARY KEY,
    section_key VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    content TEXT,
    image_url VARCHAR(255),
    extra_json JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT uk_home_sections_key UNIQUE (section_key),
    CONSTRAINT chk_home_sections_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_home_sections_sort_order CHECK (sort_order >= 0)
);

-- 索引
CREATE INDEX idx_home_sections_status ON home_sections(status);
CREATE INDEX idx_home_sections_sort_order ON home_sections(sort_order);

-- 注释
COMMENT ON TABLE home_sections IS '首页区块表';
COMMENT ON COLUMN home_sections.id IS '主键ID';
COMMENT ON COLUMN home_sections.section_key IS '区块标识键(如 hero_banner, featured_products)';
COMMENT ON COLUMN home_sections.title IS '区块标题';
COMMENT ON COLUMN home_sections.content IS '区块内容';
COMMENT ON COLUMN home_sections.image_url IS '区块图片URL';
COMMENT ON COLUMN home_sections.extra_json IS '扩展配置(JSON格式)';
COMMENT ON COLUMN home_sections.sort_order IS '排序序号(越小越靠前)';
COMMENT ON COLUMN home_sections.status IS '状态: 0=隐藏, 1=显示';
COMMENT ON COLUMN home_sections.created_at IS '创建时间';
COMMENT ON COLUMN home_sections.updated_at IS '更新时间';

-- 触发器：自动更新 updated_at
CREATE TRIGGER trg_home_sections_updated_at
    BEFORE UPDATE ON home_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();