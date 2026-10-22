package com.freshmcalc.repository;

import com.freshmcalc.FreshmcalcApplication;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DirtyContext;

/**
 * Opt-in PostgreSQL integration test: verifies the application context and all
 * Flyway migrations from an empty database. Unit tests do not require a local DB.
 * Set FMC_TEST_DB_URL (+ optional FMC_TEST_DB_USERNAME/PASSWORD) to run it.
 */
@EnabledIfEnvironmentVariable(named = "FMC_TEST_DB_URL", matches = ".+")
@SpringBootTest(classes = FreshmcalcApplication.class, properties = {
    "spring.datasource.url=${FMC_TEST_DB_URL}",
    "spring.datasource.username=${FMC_TEST_DB_USERNAME:freshmcalc}",
    "spring.datasource.password=${FMC_TEST_DB_PASSWORD:freshmcalc}",
    "spring.flyway.enabled=true",
    "spring.jpa.hibernate.ddl-auto=validate"
})
@DirtyContext
class MigrationContextTest {

    @Test
    void contextLoads() {
        // If this runs, the Spring context and entity mappings are wired.
    }
}
