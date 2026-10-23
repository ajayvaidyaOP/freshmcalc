package com.freshmcalc.domain.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.lang.reflect.Field;
import org.junit.jupiter.api.Test;

/** Regression checks for mappings that must match the Flyway-owned schema. */
class EntityMappingTest {

    @Test
    void baseEntityProvidesTheSharedIdentity() throws NoSuchFieldException, NoSuchMethodException {
        Field id = BaseEntity.class.getDeclaredField("id");
        assertEquals(Long.class, id.getType());
        assertNotNull(id.getAnnotation(Id.class));
        assertEquals(GenerationType.IDENTITY, id.getAnnotation(GeneratedValue.class).strategy());
        assertEquals(BaseEntity.class, Product.class.getMethod("getId").getDeclaringClass());
    }

    @Test
    void booleanAndOperationalColumnsMatchFlywayNames() throws NoSuchFieldException {
        assertColumn(SubscriptionPlan.class, "active", "active");
        assertColumn(MarketDataSource.class, "active", "active");
        assertColumn(Port.class, "active", "active");
        assertColumn(ShippingRoute.class, "operational", "operational");
        assertColumn(ExpenseTemplate.class, "applicableByDefault", "applicable_by_default");
    }

    @Test
    void auditLogUsesTheBaseCreatedAtMapping() throws NoSuchMethodException {
        assertEquals(BaseEntity.class, AuditLog.class.getMethod("getCreatedAt").getDeclaringClass());
    }

    private static void assertColumn(Class<?> entityType, String fieldName, String columnName)
            throws NoSuchFieldException {
        Field field = entityType.getDeclaredField(fieldName);
        Column column = field.getAnnotation(Column.class);
        assertNotNull(column, () -> entityType.getSimpleName() + "." + fieldName + " must be mapped");
        assertEquals(columnName, column.name(),
            () -> entityType.getSimpleName() + "." + fieldName + " has the wrong column mapping");
    }
}
