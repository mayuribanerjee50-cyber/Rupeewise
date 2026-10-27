package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * RecurringTransaction Entity
 *
 * Demonstrates:
 * - Automated schedules (Daily, Weekly, Monthly, Yearly)
 * - Safe manual confirmation pattern (does not auto-post without audit)
 */
@Entity
@Table(name = "recurring_transactions")
public class RecurringTransaction {

    public enum Frequency {
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY
    }

    public enum ScheduleType {
        INCOME,
        EXPENSE
    }

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Title is mandatory")
    @Column(nullable = false, length = 120)
    private String title;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private ScheduleType scheduleType = ScheduleType.EXPENSE;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be strictly positive")
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frequency frequency = Frequency.MONTHLY;

    @Column(name = "due_day", nullable = false)
    private Integer dueDay = 1;

    @NotBlank(message = "Category is mandatory")
    @Column(nullable = false, length = 80)
    private String category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "last_processed_date")
    private LocalDate lastProcessedDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RecurringTransaction() {}

    public RecurringTransaction(String id, String title, ScheduleType scheduleType, BigDecimal amount,
                                Frequency frequency, Integer dueDay, String category, Account account) {
        this.id = id;
        this.title = title;
        this.scheduleType = scheduleType;
        this.amount = amount;
        this.frequency = frequency;
        this.dueDay = dueDay;
        this.category = category;
        this.account = account;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ScheduleType getScheduleType() { return scheduleType; }
    public void setScheduleType(ScheduleType scheduleType) { this.scheduleType = scheduleType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Frequency getFrequency() { return frequency; }
    public void setFrequency(Frequency frequency) { this.frequency = frequency; }

    public Integer getDueDay() { return dueDay; }
    public void setDueDay(Integer dueDay) { this.dueDay = dueDay; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDate getLastProcessedDate() { return lastProcessedDate; }
    public void setLastProcessedDate(LocalDate lastProcessedDate) { this.lastProcessedDate = lastProcessedDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
