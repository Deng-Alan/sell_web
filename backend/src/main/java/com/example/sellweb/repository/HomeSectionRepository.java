package com.example.sellweb.repository;

import com.example.sellweb.entity.HomeSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 首页区块 Repository
 */
@Repository
public interface HomeSectionRepository extends JpaRepository<HomeSection, Long> {

    Optional<HomeSection> findBySectionKey(String sectionKey);

    List<HomeSection> findByStatus(Short status);

    List<HomeSection> findByStatusOrderBySortOrderAsc(Short status);

    boolean existsBySectionKey(String sectionKey);
}