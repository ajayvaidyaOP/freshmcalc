package com.freshmcalc.config.security;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration. Stateless JWT authentication with role-based authorization.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    /** Comma-separated browser origins; `*` allows any (dev default). */
    @Value("${cors.allowed-origins:*}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(errors -> errors
                // Write the status + JSON body directly instead of sendError():
                // sendError triggers a servlet ERROR dispatch to /error, which
                // makes the final status depend on error-page handling (an
                // unauthenticated /auth/me was observed returning HTTP 500).
                // A direct write guarantees: no/invalid token -> 401 JSON.
                .authenticationEntryPoint((request, response, exception) ->
                    writeErrorJson(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Authentication required.", request.getRequestURI()))
                .accessDeniedHandler((request, response, exception) ->
                    writeErrorJson(response, HttpServletResponse.SC_FORBIDDEN,
                        "Access denied.", request.getRequestURI())))
            .authorizeHttpRequests(auth -> auth
                // Error dispatches must be able to render the real error body.
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers("/error").permitAll()
                // Profile is private even though it lives under /auth (GET/PATCH/DELETE)
                .requestMatchers("/api/v1/auth/me").authenticated()
                // Public
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                // OpenAPI docs
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                // Rates are a paid feature: any signed-in user may call the
                // endpoint, and MarketRateController then checks the plan
                // (dubaiRatesAccess). Management stays ADMIN-only.
                .requestMatchers(HttpMethod.GET, "/api/v1/rates/**").authenticated()
                // Products & ports: read public
                .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/ports/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/routes/**").permitAll()
                // Plan catalogue is public (pricing page); purchases and
                // subscription status still require authentication.
                .requestMatchers(HttpMethod.GET, "/api/v1/subscription-plans").permitAll()
                // Payment webhooks come from Razorpay's servers, not a browser
                // session. They carry an HMAC signature that WebhookController
                // verifies against RAZORPAY_WEBHOOK_SECRET before processing.
                .requestMatchers(HttpMethod.POST, "/api/v1/webhooks/**").permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Same shape as GlobalExceptionHandler.ErrorResponse, written at filter level. */
    private static void writeErrorJson(HttpServletResponse response, int status, String message, String uri)
            throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
            "{\"status\":" + status
                + ",\"error\":\"" + message + "\""
                + ",\"timestamp\":\"" + Instant.now() + "\""
                + ",\"path\":\"uri=" + uri + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList();
        // The Play/App Store shells load the bundle on a local origin, so the
        // two Capacitor origins are always allowed in addition to the config.
        List<String> withAppOrigins = new java.util.ArrayList<>(origins);
        withAppOrigins.add("https://localhost");
        withAppOrigins.add("capacitor://localhost");
        configuration.setAllowedOriginPatterns(withAppOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authProvider);
    }
}
