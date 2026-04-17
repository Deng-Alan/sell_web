-- V002: 商品分类表
-- 用于组织商品分类，支持排序和启用/禁用

CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT uk_product_categories_slug UNIQUE (slug),
    CONSTRAINT chk_product_categories_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_product_categories_sort_order CHECK (sort_order >= 0)
);

-- 索引
CREATE INDEX idx_product_categories_status ON product_categories(status);
CREATE INDEX idx_product_categories_sort_order ON product_categories(sort_order);

-- 注释
COMMENT ON TABLE product_categories IS '商品分类表';
COMMENT ON COLUMN product_categories.id IS '主键ID';
COMMENT ON COLUMN product_categories.name IS '分类名称';
COMMENT ON COLUMN product_categories.slug IS '分类别名(URL友好)';
COMMENT ON COLUMN product_categories.sort_order IS '排序序号(越小越靠前)';
COMMENT ON COLUMN product_categories.status IS '状态: 0=禁用, 1=启用';
COMMENT ON COLUMN product_categories.created_at IS '创建时间';
COMMENT ON COLUMN product_categories.updated_at IS '更新时间';

-- 触发器：自动更新 updated_at
CREATE TRIGGER trg_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();