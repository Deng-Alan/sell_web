package com.example.sellweb.repository;

import com.example.sellweb.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 联系方式 Repository
 */
@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    long countByStatus(Short status);

    List<Contact> findAllByOrderBySortOrderAscIdAsc();

    List<Contact> findByStatus(Short status);

    List<Contact> findByStatusOrderBySortOrderAsc(Short status);

    List<Contact> findByType(String type);
}
