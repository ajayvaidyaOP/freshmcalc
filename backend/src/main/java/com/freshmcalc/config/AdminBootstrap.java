package com.freshmcalc.config;

import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.entity.UserRole;
import com.freshmcalc.domain.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates (or promotes) the first ADMIN account on startup when
 * {@code ADMIN_EMAIL} and {@code ADMIN_PASSWORD} environment variables are set.
 *
 * <p>Registration via the public API always creates CUSTOMER accounts, so this
 * is the supported way to bootstrap an administrator. Behaviour:</p>
 * <ul>
 *   <li>Both variables unset/blank &rarr; does nothing.</li>
 *   <li>Email not registered &rarr; creates an ACTIVE ADMIN with the given password (BCrypt-hashed).</li>
 *   <li>Email registered as CUSTOMER &rarr; promotes it to ADMIN (password is NOT changed).</li>
 *   <li>Email already ADMIN &rarr; leaves the account untouched.</li>
 * </ul>
 *
 * <p>After first login, remove {@code ADMIN_PASSWORD} from the environment and
 * keep the credentials in your password manager.</p>
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminFirstName;

    public AdminBootstrap(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin.email:}") String adminEmail,
                          @Value("${app.admin.password:}") String adminPassword,
                          @Value("${app.admin.first-name:Admin}") String adminFirstName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim();
        this.adminPassword = adminPassword == null ? "" : adminPassword;
        this.adminFirstName = adminFirstName == null || adminFirstName.isBlank() ? "Admin" : adminFirstName.trim();
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.info("Admin bootstrap skipped: ADMIN_EMAIL / ADMIN_PASSWORD not configured. "
                    + "Set both environment variables to create the first admin account.");
            return;
        }

        userRepository.findByEmail(adminEmail).ifPresentOrElse(existing -> {
            if (existing.getRole() != UserRole.ADMIN) {
                existing.setRole(UserRole.ADMIN);
                existing.setStatus("ACTIVE");
                userRepository.save(existing);
                log.info("Admin bootstrap: promoted existing user {} to ADMIN.", adminEmail);
            } else {
                log.info("Admin bootstrap: admin account {} already exists — nothing to do.", adminEmail);
            }
        }, () -> {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setFirstName(adminFirstName);
            admin.setLastName("");
            admin.setRole(UserRole.ADMIN);
            admin.setStatus("ACTIVE");
            admin.setEmailVerified(true);
            userRepository.save(admin);
            log.info("Admin bootstrap: created ADMIN account {}. "
                    + "You can now remove ADMIN_PASSWORD from the environment.", adminEmail);
        });
    }
}
