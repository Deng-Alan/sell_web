package com.example.sellweb.controller;

import com.example.sellweb.dto.ApiResponse;
import com.example.sellweb.dto.contact.ContactRequest;
import com.example.sellweb.dto.contact.ContactResponse;
import com.example.sellweb.dto.contact.ContactSortRequest;
import com.example.sellweb.dto.contact.ContactStatusRequest;
import com.example.sellweb.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 联系方式管理控制器
 */
@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    /**
     * 获取所有联系方式
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getAllContacts() {
        List<ContactResponse> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(ApiResponse.success(contacts));
    }

    /**
     * 获取单个联系方式
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> getContactById(@PathVariable Long id) {
        ContactResponse contact = contactService.getContactById(id);
        return ResponseEntity.ok(ApiResponse.success(contact));
    }

    /**
     * 创建联系方式
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> createContact(@Valid @RequestBody ContactRequest request) {
        ContactResponse contact = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("联系方式创建成功", contact));
    }

    /**
     * 更新联系方式
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request) {
        ContactResponse contact = contactService.updateContact(id, request);
        return ResponseEntity.ok(ApiResponse.success("联系方式更新成功", contact));
    }

    /**
     * 删除联系方式
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success("联系方式删除成功", null));
    }

    /**
     * 更新联系方式状态
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ContactResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactStatusRequest request) {
        ContactResponse contact = contactService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("状态更新成功", contact));
    }

    /**
     * 更新联系方式排序
     */
    @PutMapping("/{id}/sort")
    public ResponseEntity<ApiResponse<ContactResponse>> updateSortOrder(
            @PathVariable Long id,
            @Valid @RequestBody ContactSortRequest request) {
        ContactResponse contact = contactService.updateSortOrder(id, request.getSortOrder());
        return ResponseEntity.ok(ApiResponse.success("排序更新成功", contact));
    }
}
