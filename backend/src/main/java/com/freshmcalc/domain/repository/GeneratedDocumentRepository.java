package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.GeneratedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeneratedDocumentRepository extends JpaRepository<GeneratedDocument, Long> {
}
