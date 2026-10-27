package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Budget Entity
 *
 * Demonstrates:
 * - Domain model for category spending limits
 * - Encapsulates carry-forward rules and percentage calculations
 */
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Category name is mandatory")
    @Column(nullable = false, unique = true, length = 80)
    private String category;

    @NotNull
    @DecimalMin(value = "1.00", message = "Monthly budget limit must be at least ₹1")
    @Column(name = "monthly_limit", precision = 15, scale = 2, nullable = false)
    private BigDecimal monthlyLimit;

    @Column(name = "color_hex", length = 10)
    private String colorHex = "#6366F1";

    @Column(name = "carry_forward_enabled")
    private Boolean carryForwardEnabled = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Budget() {}

    public Budget(String id, String category, BigDecimal monthlyLimit, String colorHex) {
        this.id = id;
        this.category = category;
        this.monthlyLimit = monthlyLimit;
        this.colorHex = colorHex != null ? colorHex : "#6366F1";
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public void setMonthlyLimit(BigDecimal monthlyLimit) { this.monthlyLimit = monthlyLimit; }

    public String getColorHex() { return colorHex; }
    public void setColorHex(String colorHex) { this.colorHex = colorHex; }

    public Boolean getCarryForwardEnabled() { return carryForwardEnabled; }
    public void setCarryForwardEnabled(Boolean carryForwardEnabled) { this.carryForwardEnabled = carryForwardEnabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
