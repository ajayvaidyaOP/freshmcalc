package com.freshmcalc.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

/**
 * OpenAPI / Swagger documentation configuration.
 */
@Configuration
public class OpenApiConfig {

    @Value("${api.base-path:/api/v1}")
    private String basePath;

    @Bean
    public OpenAPI freshmcalcOpenAPI() {
        return new OpenAPI()
            .addServersItem(new Server().url(basePath).description("FreshmCalc API"))
            .info(new Info()
                .title("FreshmCalc API")
                .description("Dubai fresh produce market-rate and India-to-Dubai export costing platform.")
                .version("1.0.0")
                .contact(new Contact().name("FreshmCalc Support").email("support@freshmcalc.example"))
                .license(new License().name("Proprietary").url("https://freshmcalc.example/terms")));
    }
}
