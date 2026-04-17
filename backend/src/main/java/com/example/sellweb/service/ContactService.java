package com.example.sellweb.service;

import com.example.sellweb.dto.contact.ContactRequest;
import com.example.sellweb.dto.contact.ContactResponse;
import com.example.sellweb.entity.Contact;
import com.example.sellweb.repository.ContactRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 联系方式管理 Service
 */
@Service
@Transactional
public class ContactService {

    private static final Set<String> ALLOWED_TYPES = Set.of("wechat", "qq", "phone", "email", "website", "other");

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
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
        return toResponse(saved);
    }

    /**
     * 删除联系方式
     */
    public void deleteContact(Long id) {
        Contact contact = findContactOrThrow(id);
        contactRepository.delete(contact);
        contactRepository.flush();
    }

    /**
     * 更新状态
     */
    public ContactResponse updateStatus(Long id, Short status) {
        validateStatus(status);

        Contact contact = findContactOrThrow(id);
        contact.setStatus(status);

        Contact saved = contactRepository.save(contact);
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
        return toResponse(saved);
    }

    private void applyRequest(Contact contact, ContactRequest request, boolean isCreate) {
        contact.setType(normalizeType(request.getType()));
        contact.setName(request.getName().trim());
        contact.setValue(request.getValue().trim());
        contact.setQrImage(normalizeNullable(request.getQrImage()));
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
        response.setQrImage(contact.getQrImage());
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
            throw new IllegalArgumentException("类型无效，必须为 wechat/qq/phone/email/website/other");
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
}
