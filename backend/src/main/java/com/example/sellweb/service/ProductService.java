package com.example.sellweb.service;

import com.example.sellweb.dto.ApiListResponse;
import com.example.sellweb.dto.product.ProductQueryRequest;
import com.example.sellweb.dto.product.ProductRequest;
import com.example.sellweb.dto.product.ProductResponse;
import com.example.sellweb.entity.Contact;
import com.example.sellweb.entity.Product;
import com.example.sellweb.entity.ProductCategory;
import com.example.sellweb.entity.ProductImage;
import com.example.sellweb.repository.ContactRepository;
import com.example.sellweb.repository.ProductCategoryRepository;
import com.example.sellweb.repository.ProductImageRepository;
import com.example.sellweb.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Product management service.
 */
@Service
@Transactional
public class ProductService {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String PRODUCTS_TAG = "public:products";
    private static final String CATEGORIES_TAG = "public:categories";
    private static final String CONTACTS_TAG = "public:contacts";
    private static final String PUBLIC_UPLOAD_PATH_PREFIX = "/api/admin/uploads/files/";
    private static final String PUBLIC_UPLOAD_PATH_PREFIX_WITHOUT_SLASH = "api/admin/uploads/files/";
    private static final Set<String> BLOCKED_PRODUCT_IMAGE_HOSTS = Set.of("localhost", "127.0.0.1", "::1", "backend");
    private static final String PRODUCT_IMAGE_ERROR_MESSAGE = "商品图片必须使用站内上传地址或公开可访问的 http/https 地址";

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ContactRepository contactRepository;
    private final FrontendRevalidationService frontendRevalidationService;

    public ProductService(
            ProductRepository productRepository,
            ProductCategoryRepository productCategoryRepository,
            ProductImageRepository productImageRepository,
            ContactRepository contactRepository,
            FrontendRevalidationService frontendRevalidationService) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productImageRepository = productImageRepository;
        this.contactRepository = contactRepository;
        this.frontendRevalidationService = frontendRevalidationService;
    }

    @Transactional(readOnly = true)
    public ApiListResponse<ProductResponse> getProducts(ProductQueryRequest query) {
        List<Product> products = productRepository.findAll();

        List<ProductResponse> filteredProducts = products.stream()
                .filter(product -> matchesQuery(product, query))
                .sorted(productComparator())
                .map(product -> toResponse(product, false))
                .collect(Collectors.toList());

        return paginate(filteredProducts, query);
    }

    /**
     * 获取前台可见商品列表。
     */
    @Transactional(readOnly = true)
    public ApiListResponse<ProductResponse> getPublicProducts(ProductQueryRequest query) {
        List<Product> products = productRepository.findByStatusOrderBySortOrderAsc((short) 1);

        List<ProductResponse> filteredProducts = products.stream()
                .filter(product -> matchesPublicQuery(product, query))
                .sorted(productComparator())
                .map(product -> toResponse(product, false))
                .collect(Collectors.toList());

        return paginate(filteredProducts, query);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        return toResponse(product, true);
    }

    /**
     * 获取前台可见商品详情。
     */
    @Transactional(readOnly = true)
    public ProductResponse getPublicProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        if (!Objects.equals(product.getStatus(), (short) 1)) {
            throw new NoSuchElementException("Product not found");
        }
        if (product.getCategory() != null && !Objects.equals(product.getCategory().getStatus(), (short) 1)) {
            throw new NoSuchElementException("Product not found");
        }

        return toResponse(product, true);
    }

    public ProductResponse createProduct(ProductRequest request) {
        ProductCategory category = productCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        Contact contact = resolveContact(request.getContactId());

        Product product = new Product();
        applyRequest(product, request, category, contact, true);

        Product saved = productRepository.save(product);
        replaceImages(saved.getId(), request.getImageUrls());
        scheduleProductRevalidation(saved.getId());
        return toResponse(saved, true);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        ProductCategory category = productCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        Contact contact = resolveContact(request.getContactId());

        applyRequest(product, request, category, contact, false);

        Product saved = productRepository.save(product);
        if (request.getImageUrls() != null) {
            replaceImages(saved.getId(), request.getImageUrls());
        }
        scheduleProductRevalidation(saved.getId());
        return toResponse(saved, true);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        productImageRepository.deleteByProductId(product.getId());
        productRepository.delete(product);
        scheduleProductRevalidation(id);
    }

    public ProductResponse updateStatus(Long id, Short status) {
        validateFlag(status, "status");

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        product.setStatus(status);
        Product saved = productRepository.save(product);
        scheduleProductRevalidation(saved.getId());
        return toResponse(saved, true);
    }

    public ProductResponse updateRecommended(Long id, Short isRecommended) {
        validateFlag(isRecommended, "isRecommended");

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        product.setIsRecommended(isRecommended);
        Product saved = productRepository.save(product);
        scheduleProductRevalidation(saved.getId());
        return toResponse(saved, true);
    }

    public ProductResponse updateSortOrder(Long id, Integer sortOrder) {
        if (sortOrder == null || sortOrder < 0) {
            throw new IllegalArgumentException("sortOrder must be greater than or equal to 0");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        product.setSortOrder(sortOrder);
        Product saved = productRepository.save(product);
        scheduleProductRevalidation(saved.getId());
        return toResponse(saved, true);
    }

    private void scheduleProductRevalidation(Long productId) {
        frontendRevalidationService.scheduleRevalidation(
                List.of(PRODUCTS_TAG, CATEGORIES_TAG, CONTACTS_TAG, "public:product:" + productId),
                List.of("/", "/products/" + productId)
        );
    }

    private void applyRequest(Product product, ProductRequest request, ProductCategory category, Contact contact, boolean isCreate) {
        product.setCategory(category);
        product.setName(request.getName());
        if (isCreate || request.getCoverImage() != null) {
            product.setCoverImage(normalizeProductImage(request.getCoverImage()));
        }
        if (isCreate || request.getShortDesc() != null) {
            product.setShortDesc(request.getShortDesc());
        }
        if (isCreate || request.getContent() != null) {
            product.setContent(request.getContent());
        }
        product.setPrice(request.getPrice());
        if (isCreate || request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        product.setStock(request.getStock());
        if (isCreate || request.getContactId() != null) {
            product.setContact(contact);
        }
        if (isCreate || request.getIsRecommended() != null) {
            product.setIsRecommended(request.getIsRecommended() != null ? request.getIsRecommended() : 0);
        }
        if (isCreate || request.getSortOrder() != null) {
            product.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        }
        if (isCreate || request.getStatus() != null) {
            product.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        }
    }

    private Contact resolveContact(Long contactId) {
        if (contactId == null) {
            return null;
        }
        return contactRepository.findById(contactId)
                .orElseThrow(() -> new IllegalArgumentException("Contact not found"));
    }

    private void replaceImages(Long productId, List<String> imageUrls) {
        List<String> normalizedImageUrls = normalizeProductImageUrls(imageUrls);
        productImageRepository.deleteByProductId(productId);

        if (normalizedImageUrls == null || normalizedImageUrls.isEmpty()) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        List<ProductImage> images = new ArrayList<>();
        for (int i = 0; i < normalizedImageUrls.size(); i++) {
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(normalizedImageUrls.get(i));
            image.setSortOrder(i);
            images.add(image);
        }
        productImageRepository.saveAll(images);
    }

    private ProductResponse toResponse(Product product, boolean includeImages) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        response.setContactId(product.getContact() != null ? product.getContact().getId() : null);
        response.setContactName(product.getContact() != null ? product.getContact().getName() : null);
        response.setName(product.getName());
        response.setCoverImage(normalizePublicImageForResponse(product.getCoverImage()));
        response.setShortDesc(product.getShortDesc());
        response.setContent(product.getContent());
        response.setPrice(product.getPrice());
        response.setOriginalPrice(product.getOriginalPrice());
        response.setStock(product.getStock());
        response.setIsRecommended(product.getIsRecommended());
        response.setSortOrder(product.getSortOrder());
        response.setStatus(product.getStatus());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        response.setImageUrls(includeImages ? loadImageUrls(product.getId()) : List.of());
        return response;
    }

    private List<String> loadImageUrls(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAsc(productId)
                .stream()
                .map(ProductImage::getImageUrl)
                .map(this::normalizePublicImageForResponse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<String> normalizeProductImageUrls(List<String> imageUrls) {
        if (imageUrls == null) {
            return null;
        }

        return imageUrls.stream()
                .map(this::normalizeProductImage)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private String normalizeProductImage(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }

        validateProductImage(normalized);
        return normalized;
    }

    private void validateProductImage(String imageUrl) {
        if (imageUrl.startsWith(PUBLIC_UPLOAD_PATH_PREFIX)) {
            return;
        }

        URI uri;
        try {
            uri = URI.create(imageUrl);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(PRODUCT_IMAGE_ERROR_MESSAGE);
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();
        if (scheme == null || host == null || host.isBlank()) {
            throw new IllegalArgumentException(PRODUCT_IMAGE_ERROR_MESSAGE);
        }

        String normalizedScheme = scheme.toLowerCase(Locale.ROOT);
        if (!normalizedScheme.equals("http") && !normalizedScheme.equals("https")) {
            throw new IllegalArgumentException(PRODUCT_IMAGE_ERROR_MESSAGE);
        }

        String normalizedHost = host.toLowerCase(Locale.ROOT);
        if (BLOCKED_PRODUCT_IMAGE_HOSTS.contains(normalizedHost)) {
            throw new IllegalArgumentException("商品图片不能使用本机或内网地址，请改用站内上传地址或公开域名");
        }
    }

    private String normalizePublicImageForResponse(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }

        int publicPathIndex = normalized.indexOf(PUBLIC_UPLOAD_PATH_PREFIX);
        if (publicPathIndex >= 0) {
            return normalized.substring(publicPathIndex);
        }

        int publicPathWithoutSlashIndex = normalized.indexOf(PUBLIC_UPLOAD_PATH_PREFIX_WITHOUT_SLASH);
        if (publicPathWithoutSlashIndex >= 0) {
            return "/" + normalized.substring(publicPathWithoutSlashIndex);
        }

        return normalized;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Comparator<Product> productComparator() {
        return Comparator
                .comparing((Product product) -> Optional.ofNullable(product.getSortOrder()).orElse(0))
                .thenComparing(Product::getId, Comparator.reverseOrder());
    }

    private boolean matchesQuery(Product product, ProductQueryRequest query) {
        if (query == null) {
            return true;
        }

        if (query.getCategoryId() != null
                && (product.getCategory() == null || !Objects.equals(product.getCategory().getId(), query.getCategoryId()))) {
            return false;
        }

        if (query.getStatus() != null && !Objects.equals(product.getStatus(), query.getStatus())) {
            return false;
        }

        if (query.getIsRecommended() != null && !Objects.equals(product.getIsRecommended(), query.getIsRecommended())) {
            return false;
        }

        if (query.getKeyword() != null && !query.getKeyword().isBlank()) {
            String keyword = query.getKeyword().trim().toLowerCase();
            String name = Optional.ofNullable(product.getName()).orElse("").toLowerCase();
            String shortDesc = Optional.ofNullable(product.getShortDesc()).orElse("").toLowerCase();
            if (!name.contains(keyword) && !shortDesc.contains(keyword)) {
                return false;
            }
        }

        return true;
    }

    private boolean matchesPublicQuery(Product product, ProductQueryRequest query) {
        if (!Objects.equals(product.getStatus(), (short) 1)) {
            return false;
        }
        if (product.getCategory() == null || !Objects.equals(product.getCategory().getStatus(), (short) 1)) {
            return false;
        }
        if (query != null && query.getStatus() != null && !Objects.equals(query.getStatus(), (short) 1)) {
            return false;
        }
        return matchesQuery(product, query);
    }

    private void validateFlag(Short value, String fieldName) {
        if (value == null || (value != 0 && value != 1)) {
            throw new IllegalArgumentException(fieldName + " must be 0 or 1");
        }
    }

    private ApiListResponse<ProductResponse> paginate(List<ProductResponse> items, ProductQueryRequest query) {
        int total = items.size();
        if (query == null || (query.getPage() == null && query.getPageSize() == null)) {
            return new ApiListResponse<>(items, total, DEFAULT_PAGE, total);
        }

        int page = query.getPage() == null ? DEFAULT_PAGE : query.getPage();
        int pageSize = query.getPageSize() == null ? DEFAULT_PAGE_SIZE : query.getPageSize();

        if (page < 1) {
            throw new IllegalArgumentException("page must be greater than or equal to 1");
        }
        if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("pageSize must be between 1 and " + MAX_PAGE_SIZE);
        }

        int fromIndex = Math.min((page - 1) * pageSize, total);
        int toIndex = Math.min(fromIndex + pageSize, total);
        List<ProductResponse> pagedItems = items.subList(fromIndex, toIndex);

        return new ApiListResponse<>(pagedItems, total, page, pageSize);
    }
}
