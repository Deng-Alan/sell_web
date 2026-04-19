package com.example.sellweb.service;

import com.example.sellweb.dto.contact.ContactRequest;
import com.example.sellweb.dto.contact.ContactResponse;
import com.example.sellweb.entity.Contact;
import com.example.sellweb.repository.ContactRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 联系方式管理 Service
 */
@Service
@Transactional
public class ContactService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "wechat",
            "qq",
            "phone",
            "email",
            "website",
            "telegram",
            "qr",
            "link",
            "other"
    );
    private static final String PRODUCTS_TAG = "public:products";
    private static final String CONTACTS_TAG = "public:contacts";
    private static final String HOME_TAG = "public:home";
    private static final String PUBLIC_UPLOAD_PATH_PREFIX = "/api/admin/uploads/files/";
    private static final String PUBLIC_UPLOAD_PATH_PREFIX_WITHOUT_SLASH = "api/admin/uploads/files/";
    private static final Set<String> BLOCKED_QR_IMAGE_HOSTS = Set.of("localhost", "127.0.0.1", "::1", "backend");
    private static final String QR_IMAGE_ERROR_MESSAGE = "二维码图片必须使用站内上传地址或公开可访问的 http/https 地址";

    private final ContactRepository contactRepository;
    private final FrontendRevalidationService frontendRevalidationService;

    public ContactService(
            ContactRepository contactRepository,
            FrontendRevalidationService frontendRevalidationService) {
        this.contactRepository = contactRepository;
        this.frontendRevalidationService = frontendRevalidationService;
    }

    /**
     * 获取所有联系方式列表
     */
    @Transactional(readOnly = true)
    public List<ContactResponse> getAllContacts() {
        return contactRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取前台可展示的联系方式列表
     */
    @Transactional(readOnly = true)
    public List<ContactResponse> getPublicContacts() {
        return contactRepository.findByStatusOrderBySortOrderAsc((short) 1)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取单个联系方式
     */
    @Transactional(readOnly = true)
    public ContactResponse getContactById(Long id) {
        return toResponse(findContactOrThrow(id));
    }

    /**
     * 创建联系方式
     */
    public ContactResponse createContact(ContactRequest request) {
        validateType(request.getType());

        Contact contact = new Contact();
        applyRequest(contact, request, true);

        Contact saved = contactRepository.save(contact);
        scheduleContactRevalidation();
        return toResponse(saved);
    }

    /**
     * 更新联系方式
     */
    public ContactResponse updateContact(Long id, ContactRequest request) {
        validateType(request.getType());

        Contact contact = findContactOrThrow(id);
        applyRequest(contact, request, false);

        Contact saved = contactRepository.save(contact);
        scheduleContactRevalidation();
        return toResponse(saved);
    }

    /**
     * 删除联系方式
     */
    public void deleteContact(Long id) {
        Contact contact = findContactOrThrow(id);
        contactRepository.delete(contact);
        contactRepository.flush();
        scheduleContactRevalidation();
    }

    /**
     * 更新状态
     */
    public ContactResponse updateStatus(Long id, Short status) {
        validateStatus(status);

        Contact contact = findContactOrThrow(id);
        contact.setStatus(status);

        Contact saved = contactRepository.save(contact);
        scheduleContactRevalidation();
        return toResponse(saved);
    }

    /**
     * 更新排序
     */
    public ContactResponse updateSortOrder(Long id, Integer sortOrder) {
        if (sortOrder == null || sortOrder < 0) {
            throw new IllegalArgumentException("排序值无效，必须为非负整数");
        }

        Contact contact = findContactOrThrow(id);
        contact.setSortOrder(sortOrder);

        Contact saved = contactRepository.save(contact);
        scheduleContactRevalidation();
        return toResponse(saved);
    }

    private void scheduleContactRevalidation() {
        frontendRevalidationService.scheduleRevalidation(
                List.of(PRODUCTS_TAG, CONTACTS_TAG, HOME_TAG),
                List.of("/", "/contact")
        );
    }

    private void applyRequest(Contact contact, ContactRequest request, boolean isCreate) {
        contact.setType(normalizeType(request.getType()));
        contact.setName(request.getName().trim());
        contact.setValue(request.getValue().trim());
        contact.setQrImage(normalizeQrImage(request.getQrImage()));
        contact.setJumpUrl(normalizeNullable(request.getJumpUrl()));
        contact.setDisplayPlaces(normalizeNullable(request.getDisplayPlaces()));

        if (isCreate || request.getSortOrder() != null) {
            contact.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        }
        if (isCreate || request.getStatus() != null) {
            contact.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        }
    }

    private ContactResponse toResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.setId(contact.getId());
        response.setType(contact.getType());
        response.setName(contact.getName());
        response.setValue(contact.getValue());
        response.setQrImage(normalizePublicQrImageForResponse(contact.getQrImage()));
        response.setJumpUrl(contact.getJumpUrl());
        response.setDisplayPlaces(contact.getDisplayPlaces());
        response.setSortOrder(contact.getSortOrder());
        response.setStatus(contact.getStatus());
        response.setCreatedAt(contact.getCreatedAt());
        response.setUpdatedAt(contact.getUpdatedAt());
        return response;
    }

    private Contact findContactOrThrow(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("联系方式不存在"));
    }

    private void validateType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("类型不能为空");
        }

        if (!ALLOWED_TYPES.contains(type.trim().toLowerCase())) {
            throw new IllegalArgumentException("类型无效，必须为 wechat/qq/phone/email/website/telegram/qr/link/other");
        }
    }

    private String normalizeType(String type) {
        return type.trim().toLowerCase();
    }

    private void validateStatus(Short status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new IllegalArgumentException("状态值无效，必须为0或1");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeQrImage(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }

        validateQrImage(normalized);
        return normalized;
    }

    private void validateQrImage(String qrImage) {
        if (qrImage.startsWith(PUBLIC_UPLOAD_PATH_PREFIX)) {
            return;
        }

        URI uri;
        try {
            uri = URI.create(qrImage);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(QR_IMAGE_ERROR_MESSAGE);
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();
        if (scheme == null || host == null || host.isBlank()) {
            throw new IllegalArgumentException(QR_IMAGE_ERROR_MESSAGE);
        }

        String normalizedScheme = scheme.toLowerCase(Locale.ROOT);
        if (!normalizedScheme.equals("http") && !normalizedScheme.equals("https")) {
            throw new IllegalArgumentException(QR_IMAGE_ERROR_MESSAGE);
        }

        String normalizedHost = host.toLowerCase(Locale.ROOT);
        if (BLOCKED_QR_IMAGE_HOSTS.contains(normalizedHost)) {
            throw new IllegalArgumentException("二维码图片不能使用本机或内网地址，请改用站内上传地址或公开域名");
        }
    }

    private String normalizePublicQrImageForResponse(String value) {
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
}
