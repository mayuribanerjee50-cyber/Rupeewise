package com.rupeewise.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UserProfile Entity
 *
 * Demonstrates:
 * - Storing personalized financial targets, onboarding setup, and custom thresholds
 * - Indian Financial Year default (April)
 */
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(length = 50)
    private String id = "default_user";

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName = "Your Name";

    @Column(length = 150)
    private String email;

    @Column(name = "monthly_income_target", precision = 15, scale = 2)
    private BigDecimal monthlyIncomeTarget = new BigDecimal("50000.00");

    @Column(name = "initial_savings_balance", precision = 15, scale = 2)
    private BigDecimal initialSavingsBalance = new BigDecimal("20000.00");

    @Column(name = "monthly_savings_goal", precision = 15, scale = 2)
    private BigDecimal monthlySavingsGoal = new BigDecimal("10000.00");

    @Column(name = "budgeting_method", length = 50)
    private String budgetingMethod = "50/30/20 Rule";

    @Column(name = "financial_year_start", length = 20)
    private String financialYearStart = "April";

    @Column(name = "monthly_expense_budget", precision = 15, scale = 2)
    private BigDecimal monthlyExpenseBudget = new BigDecimal("35000.00");

    @Column(name = "short_term_goal", length = 255)
    private String shortTermGoal = "Build 3-month emergency fund";

    @Column(name = "long_term_goal", length = 255)
    private String longTermGoal = "Higher education fund & mutual funds";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public UserProfile() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public BigDecimal getMonthlyIncomeTarget() { return monthlyIncomeTarget; }
    public void setMonthlyIncomeTarget(BigDecimal monthlyIncomeTarget) { this.monthlyIncomeTarget = monthlyIncomeTarget; }

    public BigDecimal getInitialSavingsBalance() { return initialSavingsBalance; }
    public void setInitialSavingsBalance(BigDecimal initialSavingsBalance) { this.initialSavingsBalance = initialSavingsBalance; }

    public BigDecimal getMonthlySavingsGoal() { return monthlySavingsGoal; }
    public void setMonthlySavingsGoal(BigDecimal monthlySavingsGoal) { this.monthlySavingsGoal = monthlySavingsGoal; }

    public String getBudgetingMethod() { return budgetingMethod; }
    public void setBudgetingMethod(String budgetingMethod) { this.budgetingMethod = budgetingMethod; }

    public String getFinancialYearStart() { return financialYearStart; }
    public void setFinancialYearStart(String financialYearStart) { this.financialYearStart = financialYearStart; }

    public BigDecimal getMonthlyExpenseBudget() { return monthlyExpenseBudget; }
    public void setMonthlyExpenseBudget(BigDecimal monthlyExpenseBudget) { this.monthlyExpenseBudget = monthlyExpenseBudget; }

    public String getShortTermGoal() { return shortTermGoal; }
    public void setShortTermGoal(String shortTermGoal) { this.shortTermGoal = shortTermGoal; }

    public String getLongTermGoal() { return longTermGoal; }
    public void setLongTermGoal(String longTermGoal) { this.longTermGoal = longTermGoal; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
