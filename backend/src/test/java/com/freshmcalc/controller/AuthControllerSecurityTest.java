package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.config.security.CustomerUserDetailsService;
import com.freshmcalc.config.security.JwtAuthenticationFilter;
import com.freshmcalc.config.security.SecurityConfig;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.entity.UserRole;
import com.freshmcalc.domain.service.AuthService;
import com.freshmcalc.dto.AuthDto;
import com.freshmcalc.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression tests for the /auth/me 500 error:
 * a request without a token must get 401 (never a 5xx), and an authenticated
 * ADMIN must get role "ADMIN" back so the frontend can show the admin area.
 * Uses the real SecurityConfig + JWT filter; only the service layer is mocked.
 */
@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerSecurityTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private AuthService authService;
    @MockBean private CustomerUserDetailsService customerUserDetailsService;
    @MockBean private JwtUtil jwtUtil;

    @Test
    void meWithoutTokenReturns401Not500() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Authentication required."));
    }

    @Test
    void meForAdminReturnsAdminRole() throws Exception {
        User admin = new User();
        admin.setEmail("admin@freshmcalc.com");
        admin.setPasswordHash("hash");
        admin.setRole(UserRole.ADMIN);
        admin.setStatus("ACTIVE");

        when(authService.me("admin@freshmcalc.com")).thenReturn(new AuthDto.MeResponse(
            1L, "admin@freshmcalc.com", "Admin", "", null, null, null, null,
            "ADMIN", "ACTIVE", null, null));

        mockMvc.perform(get("/api/v1/auth/me").with(user(new CustomerUserDetails(admin))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("ADMIN"))
            .andExpect(jsonPath("$.email").value("admin@freshmcalc.com"));
    }
}
