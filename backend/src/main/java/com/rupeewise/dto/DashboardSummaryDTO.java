package com.rupeewise.dto;

import java.math.BigDecimal;

public class DashboardSummaryDTO {

    private BigDecimal totalAvailableBalance = BigDecimal.ZERO;
    private BigDecimal totalSavings = BigDecimal.ZERO;
    private BigDecimal currentMonthIncome = BigDecimal.ZERO;
    private BigDecimal currentMonthExpenses = BigDecimal.ZERO;
    private BigDecimal currentMonthNetCashFlow = BigDecimal.ZERO;
    private BigDecimal remainingMonthlyBudget = BigDecimal.ZERO;
    private BigDecimal savingsRate = BigDecimal.ZERO;
    private BigDecimal outstandingPlannedPayments = BigDecimal.ZERO;

    // Month-over-month comparison percentages
    private BigDecimal incomeChangePct = BigDecimal.ZERO;
    private BigDecimal expenseChangePct = BigDecimal.ZERO;

    public DashboardSummaryDTO() {}

    public BigDecimal getTotalAvailableBalance() { return totalAvailableBalance; }
    public void setTotalAvailableBalance(BigDecimal totalAvailableBalance) { this.totalAvailableBalance = totalAvailableBalance; }

    public BigDecimal getTotalSavings() { return totalSavings; }
    public void setTotalSavings(BigDecimal totalSavings) { this.totalSavings = totalSavings; }

    public BigDecimal getCurrentMonthIncome() { return currentMonthIncome; }
    public void setCurrentMonthIncome(BigDecimal currentMonthIncome) { this.currentMonthIncome = currentMonthIncome; }

    public BigDecimal getCurrentMonthExpenses() { return currentMonthExpenses; }
    public void setCurrentMonthExpenses(BigDecimal currentMonthExpenses) { this.currentMonthExpenses = currentMonthExpenses; }

    public BigDecimal getCurrentMonthNetCashFlow() { return currentMonthNetCashFlow; }
    public void setCurrentMonthNetCashFlow(BigDecimal currentMonthNetCashFlow) { this.currentMonthNetCashFlow = currentMonthNetCashFlow; }

    public BigDecimal getRemainingMonthlyBudget() { return remainingMonthlyBudget; }
    public void setRemainingMonthlyBudget(BigDecimal remainingMonthlyBudget) { this.remainingMonthlyBudget = remainingMonthlyBudget; }

    public BigDecimal getSavingsRate() { return savingsRate; }
    public void setSavingsRate(BigDecimal savingsRate) { this.savingsRate = savingsRate; }

    public BigDecimal getOutstandingPlannedPayments() { return outstandingPlannedPayments; }
    public void setOutstandingPlannedPayments(BigDecimal outstandingPlannedPayments) { this.outstandingPlannedPayments = outstandingPlannedPayments; }

    public BigDecimal getIncomeChangePct() { return incomeChangePct; }
    public void setIncomeChangePct(BigDecimal incomeChangePct) { this.incomeChangePct = incomeChangePct; }

    public BigDecimal getExpenseChangePct() { return expenseChangePct; }
    public void setExpenseChangePct(BigDecimal expenseChangePct) { this.expenseChangePct = expenseChangePct; }
}
