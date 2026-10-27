package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Account Entity
 *
 * Demonstrates:
 * - OOP Principle: Encapsulation (private fields, verified business mutations)
 * - JPA Mapping: @Entity, @Table, @Id
 * - Precision Finance: Uses BigDecimal for all currency amounts to eliminate floating-point rounding errors.
 */
@Entity
@Table(name = "accounts")
public class Account {

    public enum AccountType {
        CASH_WALLET,
        SAVINGS_BANK,
        CURRENT_BANK,
        OTHER
    }

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Account name is mandatory")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "Account type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 30)
    private AccountType accountType;

    @NotNull
    @DecimalMin(value = "0.00", message = "Opening balance cannot be negative")
    @Column(name = "opening_balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @NotNull
    @Column(name = "current_balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "institution_name", length = 100)
    private String institutionName;

    @Column(name = "account_number_mask", length = 20)
    private String accountNumberMask;

    @Column(name = "color_hex", length = 10)
    private String colorHex = "#10B981";

    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default No-Arg Constructor required by JPA
    public Account() {}

    // Parameterized Constructor
    public Account(String id, String name, AccountType accountType, BigDecimal openingBalance, String institutionName) {
        this.id = id;
        this.name = name;
        this.accountType = accountType;
        this.openingBalance = openingBalance != null ? openingBalance : BigDecimal.ZERO;
        this.currentBalance = this.openingBalance;
        this.institutionName = institutionName;
        this.createdAt = LocalDateTime.now();
    }

    // Business Methods (Encapsulation Guard)
    public void credit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be strictly positive");
        }
        this.currentBalance = this.currentBalance.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be strictly positive");
        }
        this.currentBalance = this.currentBalance.subtract(amount);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getAccountNumberMask() { return accountNumberMask; }
    public void setAccountNumberMask(String accountNumberMask) { this.accountNumberMask = accountNumberMask; }

    public String getColorHex() { return colorHex; }
    public void setColorHex(String colorHex) { this.colorHex = colorHex; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
