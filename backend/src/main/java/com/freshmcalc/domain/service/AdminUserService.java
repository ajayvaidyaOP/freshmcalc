package com.freshmcalc.domain.service;

import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.AdminUserDto;
import com.freshmcalc.dto.SubscriptionDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read-only, safe user directory for administrators (never exposes credentials). */
@Service
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;

    public AdminUserService(UserRepository userRepository, SubscriptionService subscriptionService) {
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
    }

    public List<AdminUserDto.AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(user -> {
                SubscriptionDto.SubscriptionResponse active = subscriptionService.getActiveSubscriptionOrNull(user.getId());
                return new AdminUserDto.AdminUserResponse(
                    user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getCompany(),
                    user.getRole() != null ? user.getRole().name() : null, user.getStatus(), user.getCreatedAt(),
                    active != null ? active.planName() : null,
                    active != null ? active.currentPeriodEnd() : null);
            })
            .toList();
    }
}
