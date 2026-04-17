UPDATE products
SET
    short_desc = '适合展示邮箱账号商品的价格、库存和联系路径。',
    content = '展示 Gmail 商品的标题、价格、库存、联系方式与详情说明，适合作为前台商品展示示例。'
WHERE name = 'Gmail 资源包';

UPDATE products
SET
    short_desc = '适合展示社媒账号商品的基础信息、库存和咨询路径。',
    content = '展示 Instagram 商品的基础信息、价格库存和咨询入口，适合作为社媒账号商品展示示例。'
WHERE name = 'Instagram 普通号';
