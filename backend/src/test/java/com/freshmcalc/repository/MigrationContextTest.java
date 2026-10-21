package com.freshmcalc.repository;

import com.freshmcalc.FreshmcalcApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DirtyContext;
import org.springframework.test.context.jdbc.Sql;

/**
 * Verifies the application context loads and migrations can run from an empty database.
 * (Executed against a test PostgreSQL container in CI.)
 */
@SpringBootTest(classes = FreshmcalcApplication.class, properties = {
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
