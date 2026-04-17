package com.example.sellweb.service;

import com.example.sellweb.dto.setting.SiteSettingGroupSaveRequest;
import com.example.sellweb.dto.setting.SiteSettingRequest;
import com.example.sellweb.dto.setting.SiteSettingResponse;
import com.example.sellweb.entity.SiteSetting;
import com.example.sellweb.repository.SiteSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 站点设置服务
 */
@Service
@Transactional
public class SiteSettingService {

    private final SiteSettingRepository siteSettingRepository;

    public SiteSettingService(SiteSettingRepository siteSettingRepository) {
        this.siteSettingRepository = siteSettingRepository;
    }

    @Transactional(readOnly = true)
    public List<SiteSettingResponse> getSettings(String groupName) {
        List<SiteSetting> settings = StringUtils.hasText(groupName)
                ? siteSettingRepository.findByGroupName(groupName)
                : siteSettingRepository.findAll();

        return settings.stream()
                .sorted(settingComparator())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteSettingResponse getSettingByKey(String settingKey) {
        return toResponse(findSettingOrThrow(settingKey));
    }

    public SiteSettingResponse saveSetting(String settingKey, SiteSettingRequest request) {
        validateSettingKey(settingKey);

        SiteSetting setting = siteSettingRepository.findBySettingKey(settingKey)
                .orElseGet(SiteSetting::new);

        if (setting.getId() == null) {
            setting.setSettingKey(settingKey.trim());
        }

        setting.setSettingValue(request.getSettingValue());
        setting.setGroupName(resolveGroupName(request.getGroupName()));

        return toResponse(siteSettingRepository.save(setting));
    }

    public List<SiteSettingResponse> saveGroupSettings(String groupName, SiteSettingGroupSaveRequest request) {
        if (!StringUtils.hasText(groupName)) {
            throw new IllegalArgumentException("groupName不能为空");
        }
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("items不能为空");
        }

        List<SiteSettingResponse> responses = new ArrayList<>();
        for (SiteSettingRequest item : request.getItems()) {
            validateSettingKey(item.getSettingKey());
            SiteSetting setting = siteSettingRepository.findBySettingKey(item.getSettingKey().trim())
                    .orElseGet(SiteSetting::new);
            if (setting.getId() == null) {
                setting.setSettingKey(item.getSettingKey().trim());
            }
            setting.setSettingValue(item.getSettingValue());
            setting.setGroupName(groupName.trim());
            responses.add(toResponse(siteSettingRepository.save(setting)));
        }

        responses.sort(Comparator.comparing(SiteSettingResponse::getSettingKey, Comparator.nullsFirst(String::compareTo)));
        return responses;
    }

    @Transactional(readOnly = true)
    public List<SiteSettingResponse> getAllSettings() {
        return getSettings(null);
    }

    private SiteSetting findSettingOrThrow(String settingKey) {
        validateSettingKey(settingKey);
        return siteSettingRepository.findBySettingKey(settingKey.trim())
                .orElseThrow(() -> new NoSuchElementException("站点设置不存在"));
    }

    private void validateSettingKey(String settingKey) {
        if (!StringUtils.hasText(settingKey)) {
            throw new IllegalArgumentException("settingKey不能为空");
        }
    }

    private String resolveGroupName(String groupName) {
        return StringUtils.hasText(groupName) ? groupName.trim() : null;
    }

    private Comparator<SiteSetting> settingComparator() {
        return Comparator
                .comparing(SiteSetting::getGroupName, Comparator.nullsFirst(String::compareTo))
                .thenComparing(SiteSetting::getSettingKey, Comparator.nullsFirst(String::compareTo))
                .thenComparing(SiteSetting::getId, Comparator.nullsFirst(Long::compareTo));
    }

    private SiteSettingResponse toResponse(SiteSetting setting) {
        SiteSettingResponse response = new SiteSettingResponse();
        response.setId(setting.getId());
        response.setSettingKey(setting.getSettingKey());
        response.setSettingValue(setting.getSettingValue());
        response.setGroupName(setting.getGroupName());
        response.setCreatedAt(setting.getCreatedAt());
        response.setUpdatedAt(setting.getUpdatedAt());
        return response;
    }
}
