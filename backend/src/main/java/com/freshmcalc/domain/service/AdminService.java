package com.freshmcalc.domain.service;

import com.freshmcalc.domain.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final AuditLogRepository auditLogRepository;

    public AdminService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public Object dashboardStats() {
        return java.util.Map.of(
            "market", "Dubai, UAE",
            "currency", "AED",
            "note", "Admin dashboard statistics"
        );
    }

    public List<Object> auditLogs() {
        return auditLogRepository.findAll().stream()
            .map(log -> java.util.Map.of(
                "id", log.getId(),
                "actor", log.getActor(),
                "action", log.getAction(),
                "entityType", log.getEntityType(),
                "entityId", log.getEntityId(),
                "createdAt", log.getCreatedAt()))
            .collect(Collectors.toList());
    }
}
