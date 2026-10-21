package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

/**
 * Platform user. Soft-deleted.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email")
    }
)
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW(), status = 'DELETED' WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "company", length = 200)
    private String company;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "city", length = 100)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role = UserRole.CUSTOMER;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED, DELETED

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "email_verification_token", length = 255)
    private String emailVerificationToken;

    @Column(name = "password_reset_token", length = 255)
    private String passwordResetToken;

    @Column(name = "password_reset_expiry")
    private Instant passwordResetExpiry;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // Getters / setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getEmailVerificationToken() { return emailVerificationToken; }
    public void setEmailVerificationToken(String emailVerificationToken) { this.emailVerificationToken = emailVerificationToken; }

    public String getPasswordResetToken() { return passwordResetToken; }
    public void setPasswordResetToken(String passwordResetToken) { this.passwordResetToken = passwordResetToken; }

    public Instant getPasswordResetExpiry() { return passwordResetExpiry; }
    public void setPasswordResetExpiry(Instant passwordResetExpiry) { this.passwordResetExpiry = passwordResetExpiry; }

    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
}
