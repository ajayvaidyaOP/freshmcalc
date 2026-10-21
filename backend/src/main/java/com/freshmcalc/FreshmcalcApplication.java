package com.freshmcalc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.freshmcalc.domain")
@EnableJpaRepositories("com.freshmcalc.domain.repository")
public class FreshmcalcApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreshmcalcApplication.class, args);
    }
}
