-- V005: 商品图片表
-- 商品详情页的多图展示

CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 外键约束
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,

    -- 检查约束
    CONSTRAINT chk_product_images_sort_order CHECK (sort_order >= 0)
);

-- 索引
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(product_id, sort_order);

-- 注释
COMMENT ON TABLE product_images IS '商品图片表';
COMMENT ON COLUMN product_images.id IS '主键ID';
COMMENT ON COLUMN product_images.product_id IS '所属商品ID';
COMMENT ON COLUMN product_images.image_url IS '图片URL';
COMMENT ON COLUMN product_images.sort_order IS '排序序号(越小越靠前)';
COMMENT ON COLUMN product_images.created_at IS '创建时间';