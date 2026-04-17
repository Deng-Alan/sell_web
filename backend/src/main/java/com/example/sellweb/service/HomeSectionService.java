package com.example.sellweb.service;

import com.example.sellweb.dto.home.HomeSectionRequest;
import com.example.sellweb.dto.home.HomeSectionResponse;
import com.example.sellweb.entity.HomeSection;
import com.example.sellweb.repository.HomeSectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * 首页区块服务
 */
@Service
@Transactional
public class HomeSectionService {

    private final HomeSectionRepository homeSectionRepository;

    public HomeSectionService(HomeSectionRepository homeSectionRepository) {
        this.homeSectionRepository = homeSectionRepository;
    }

    @Transactional(readOnly = true)
    public List<HomeSectionResponse> getSections() {
        return homeSectionRepository.findAll()
                .stream()
                .sorted(sectionComparator())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取前台可见首页区块
     */
    @Transactional(readOnly = true)
    public List<HomeSectionResponse> getPublicSections() {
        return homeSectionRepository.findByStatusOrderBySortOrderAsc((short) 1)
                .stream()
                .sorted(sectionComparator())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HomeSectionResponse getSectionByKey(String sectionKey) {
        return toResponse(findSectionOrThrow(sectionKey));
    }

    public HomeSectionResponse upsertSection(String sectionKey, HomeSectionRequest request) {
        validateSectionKey(sectionKey);

        HomeSection section = homeSectionRepository.findBySectionKey(sectionKey.trim())
                .orElseGet(HomeSection::new);
        boolean isCreate = section.getId() == null;

        if (isCreate) {
            section.setSectionKey(sectionKey.trim());
            section.setSortOrder(0);
            section.setStatus((short) 1);
        }

        if (request.getTitle() != null || isCreate) {
            section.setTitle(request.getTitle());
        }
        if (request.getContent() != null || isCreate) {
            section.setContent(request.getContent());
        }
        if (request.getImageUrl() != null || isCreate) {
            section.setImageUrl(request.getImageUrl());
        }
        if (request.getExtraJson() != null || isCreate) {
            section.setExtraJson(request.getExtraJson());
        }
        if (request.getSortOrder() != null) {
            section.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            section.setStatus(request.getStatus());
        }

        return toResponse(homeSectionRepository.save(section));
    }

    private HomeSection findSectionOrThrow(String sectionKey) {
        validateSectionKey(sectionKey);
        return homeSectionRepository.findBySectionKey(sectionKey.trim())
                .orElseThrow(() -> new NoSuchElementException("首页区块不存在"));
    }

    private void validateSectionKey(String sectionKey) {
        if (!StringUtils.hasText(sectionKey)) {
            throw new IllegalArgumentException("sectionKey不能为空");
        }
    }

    private Comparator<HomeSection> sectionComparator() {
        return Comparator
                .comparing(HomeSection::getSortOrder, Comparator.nullsFirst(Integer::compareTo))
                .thenComparing(HomeSection::getId, Comparator.nullsFirst(Long::compareTo));
    }

    private HomeSectionResponse toResponse(HomeSection section) {
        HomeSectionResponse response = new HomeSectionResponse();
        response.setId(section.getId());
        response.setSectionKey(section.getSectionKey());
        response.setTitle(section.getTitle());
        response.setContent(section.getContent());
        response.setImageUrl(section.getImageUrl());
        response.setExtraJson(section.getExtraJson());
        response.setSortOrder(section.getSortOrder());
        response.setStatus(section.getStatus());
        response.setCreatedAt(section.getCreatedAt());
        response.setUpdatedAt(section.getUpdatedAt());
        return response;
    }
}
