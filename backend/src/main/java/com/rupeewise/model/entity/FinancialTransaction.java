package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * FinancialTransaction (Abstract Superclass)
 *
 * Demonstrates:
 * - OOP Principle: Abstraction & Inheritance (Single Table Inheritance strategy)
 * - OOP Principle: Polymorphism (defines abstract method applyToAccount() overridden by subclasses)
 * - Strict Financial Integrity: Non-negative amounts, immutable IDs, audit timestamps.
 */
@Entity
@Table(name = "financial_transactions")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "transaction_type", discriminatorType = DiscriminatorType.STRING)
public abstract class FinancialTransaction {

    public enum TransactionType {
        INCOME,
        EXPENSE,
        TRANSFER
    }

    @Id
    @Column(length = 50)
    private String id;

    @NotNull(message = "Transaction date is mandatory")
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @NotNull(message = "Amount is mandatory")
    @DecimalMin(value = "0.01", message = "Transaction amount must be strictly greater than zero")
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotBlank(message = "Category is mandatory")
    @Column(nullable = false, length = 80)
    private String category;

    @NotBlank(message = "Description / Payee is mandatory")
    @Column(nullable = false, length = 255)
    private String description;

    @NotBlank(message = "Payment method is mandatory (e.g. UPI, NetBanking, Cash)")
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(length = 500)
    private String notes;

    @Column(length = 255)
    private String tags;

    @Column(name = "is_cleared")
    private Boolean cleared = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Default Constructor
    protected FinancialTransaction() {}

    // Superclass Constructor
    protected FinancialTransaction(String id, LocalDate transactionDate, BigDecimal amount,
                                   String category, String description, String paymentMethod,
                                   Account account, String notes) {
        this.id = id;
        this.transactionDate = transactionDate;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.paymentMethod = paymentMethod;
        this.account = account;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Polymorphic Abstract Method:
     * Each transaction subclass encapsulates its own balance impact.
     * Dynamic method dispatch determines whether account is credited or debited.
     */
    public abstract void applyToAccount();

    /**
     * Polymorphic Reversal:
     * When a transaction is edited or deleted, this safely reverses the effect on the account.
     */
    public abstract void reverseFromAccount();

    public abstract TransactionType getTransactionType();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Boolean getCleared() { return cleared; }
    public void setCleared(Boolean cleared) { this.cleared = cleared; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
