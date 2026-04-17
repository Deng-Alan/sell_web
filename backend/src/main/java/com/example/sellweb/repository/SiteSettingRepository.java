package com.example.sellweb.repository;

import com.example.sellweb.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 站点配置 Repository
 */
@Repository
public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {

    Optional<SiteSetting> findBySettingKey(String settingKey);

    List<SiteSetting> findByGroupName(String groupName);

    boolean existsBySettingKey(String settingKey);
}