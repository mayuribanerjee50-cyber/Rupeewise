package com.rupeewise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

/**
 * RupeeWise - Personal Finance & Management System
 * Entry Point for the Spring Boot 3.3 / Java 21 Application.
 *
 * Demonstrates:
 * - Spring Boot Configuration & Component Scanning
 * - TimeZone Initialization (Asia/Kolkata for Indian Standard Time)
 * - Automatic JPA Schema Validation
 */
@SpringBootApplication
@EnableScheduling
public class RupeeWiseApplication {

    public static void main(String[] args) {
        // Enforce application-wide Indian Standard Time (IST)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(RupeeWiseApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" RupeeWise Personal Finance Backend Running on port 8080 ");
        System.out.println(" H2 Web Console: http://localhost:8080/h2-console        ");
        System.out.println(" REST API Base:  http://localhost:8080/api               ");
        System.out.println("==========================================================");
    }
}
