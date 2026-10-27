package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * SavingsGoal Entity
 *
 * Demonstrates:
 * - Goal tracking with target dates and priorities
 * - Safe asset allocation without double-counting account funds
 */
@Entity
@Table(name = "savings_goals")
public class SavingsGoal {

    public enum Priority {
        HIGH,
        MEDIUM,
        LOW
    }

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Goal name is mandatory")
    @Column(nullable = false, length = 120)
    private String name;

    @NotNull
    @DecimalMin(value = "1.00", message = "Target amount must be greater than zero")
    @Column(name = "target_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal targetAmount;

    @NotNull
    @Column(name = "current_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @NotNull(message = "Target date is mandatory")
    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority priority = Priority.MEDIUM;

    @Column(length = 255)
    private String notes;

    @Column(name = "color_hex", length = 10)
    private String colorHex = "#06B6D4";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SavingsGoal() {}

    public SavingsGoal(String id, String name, BigDecimal targetAmount, BigDecimal currentAmount, LocalDate targetDate) {
        this.id = id;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount != null ? currentAmount : BigDecimal.ZERO;
        this.targetDate = targetDate;
        this.createdAt = LocalDateTime.now();
    }

    // Business Methods
    public void contribute(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution must be greater than zero");
        }
        this.currentAmount = this.currentAmount.add(amount);
    }

    public BigDecimal calculateProgressPercentage() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return currentAmount
                .multiply(BigDecimal.valueOf(100))
                .divide(targetAmount, 2, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100.00));
    }

    public BigDecimal getRemainingAmount() {
        if (targetAmount == null) return BigDecimal.ZERO;
        BigDecimal diff = targetAmount.subtract(currentAmount);
        return diff.compareTo(BigDecimal.ZERO) > 0 ? diff : BigDecimal.ZERO;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }

    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getColorHex() { return colorHex; }
    public void setColorHex(String colorHex) { this.colorHex = colorHex; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
