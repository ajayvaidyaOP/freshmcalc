package com.freshmcalc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.freshmcalc.domain")

public class FreshmcalcApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreshmcalcApplication.class, args);
    }
}
