package com.freshmcalc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.domain.AuditorAware;
import org.springframework.context.annotation.Bean;
import java.util.Optional;

/**
 * Enables JPA auditing (createdAt/updatedAt/createdBy/updatedBy).
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> Optional.of("system");
    }
}
