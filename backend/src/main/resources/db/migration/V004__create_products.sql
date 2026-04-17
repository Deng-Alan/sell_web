-- V004: 商品表
-- 核心商品信息，包含价格、库存、状态等

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    cover_image VARCHAR(255),
    short_desc VARCHAR(500),
    content TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    contact_id BIGINT,
    is_recommended SMALLINT NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 外键约束
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES product_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_contact FOREIGN KEY (contact_id)
        REFERENCES contacts(id) ON DELETE SET NULL,

    -- 检查约束
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_original_price CHECK (original_price IS NULL OR original_price >= 0),
    CONSTRAINT chk_products_stock CHECK (stock >= 0),
    CONSTRAINT chk_products_is_recommended CHECK (is_recommended IN (0, 1)),
    CONSTRAINT chk_products_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_products_sort_order CHECK (sort_order >= 0)
);

-- 索引
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_recommended ON products(is_recommended);
CREATE INDEX idx_products_sort_order ON products(sort_order);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('simple', name));

-- 注释
COMMENT ON TABLE products IS '商品表';
COMMENT ON COLUMN products.id IS '主键ID';
COMMENT ON COLUMN products.category_id IS '所属分类ID';
COMMENT ON COLUMN products.name IS '商品名称';
COMMENT ON COLUMN products.cover_image IS '封面图片URL';
COMMENT ON COLUMN products.short_desc IS '简短描述';
COMMENT ON COLUMN products.content IS '详情内容(富文本)';
COMMENT ON COLUMN products.price IS '当前价格';
COMMENT ON COLUMN products.original_price IS '原价(可选)';
COMMENT ON COLUMN products.stock IS '库存数量';
COMMENT ON COLUMN products.contact_id IS '联系方式ID(可选)';
COMMENT ON COLUMN products.is_recommended IS '是否推荐: 0=否, 1=是';
COMMENT ON COLUMN products.sort_order IS '排序序号(越小越靠前)';
COMMENT ON COLUMN products.status IS '状态: 0=下架, 1=上架';
COMMENT ON COLUMN products.created_at IS '创建时间';
COMMENT ON COLUMN products.updated_at IS '更新时间';

-- 触发器：自动更新 updated_at
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();