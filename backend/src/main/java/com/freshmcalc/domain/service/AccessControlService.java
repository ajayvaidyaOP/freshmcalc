package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.entity.UserRole;
import com.freshmcalc.dto.SubscriptionDto;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/**
 * Server-side plan enforcement.
 *
 * The UI hides paid screens behind friendly upgrade cards, but hiding a button
 * is not security. Every paid endpoint re-checks the plan here, so a free
 * account cannot read live rates or save cost sheets by calling the API
 * directly. Administrators always have full access.
 */
@Service
public class AccessControlService {

    private final SubscriptionService subscriptionService;

    public AccessControlService(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    public enum Feature {
        DUBAI_RATES("Live Dubai rates"),
        CALCULATOR("The export calculator"),
        SAVED_SHEETS("Saved cost sheets"),
        PDF_EXPORT("PDF quotations");

        private final String label;

        Feature(String label) {
            this.label = label;
        }

        public String label() {
            return label;
        }
    }

    /** Throws 403 with an actionable message when the plan does not include the feature. */
    public void require(User user, Feature feature) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }
        boolean allowed = hasFeature(subscriptionService.getEntitlements(user.getId()), feature);
        if (!allowed) {
            throw new AccessDeniedException(
                feature.label() + " needs an active FreshmCalc plan. Subscribe or renew from Subscription & Billing.");
        }
    }

    public boolean hasFeature(User user, Feature feature) {
        if (user == null) return false;
        if (user.getRole() == UserRole.ADMIN) return true;
        return hasFeature(subscriptionService.getEntitlements(user.getId()), feature);
    }

    private boolean hasFeature(SubscriptionDto.PlanEntitlements entitlements, Feature feature) {
        if (entitlements == null) return false;
        return switch (feature) {
            case DUBAI_RATES -> Boolean.TRUE.equals(entitlements.dubaiRatesAccess());
            case CALCULATOR -> Boolean.TRUE.equals(entitlements.calculatorAccess());
            case SAVED_SHEETS -> Boolean.TRUE.equals(entitlements.savedCalculationsAccess());
            case PDF_EXPORT -> Boolean.TRUE.equals(entitlements.pdfExportAccess());
        };
    }
}
