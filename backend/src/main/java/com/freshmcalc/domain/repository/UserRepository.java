package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Password reset links store a SHA-256 hash of the token, never the token itself. */
    Optional<User> findByPasswordResetToken(String passwordResetToken);
}
