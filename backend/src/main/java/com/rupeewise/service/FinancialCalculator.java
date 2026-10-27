package com.rupeewise.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * FinancialCalculator (Interface Contract)
 *
 * Demonstrates:
 * - OOP Principle: Abstraction (defines strict financial calculation specifications)
 * - Safe zero-division handling
 * - BigDecimal mathematical precision
 */
public interface FinancialCalculator {

    /**
     * Savings Rate = (Income - Expenses) / Income * 100
     * Handles zero-income safely without throwing ArithmeticException.
     */
    default BigDecimal calculateSavingsRate(BigDecimal income, BigDecimal expenses) {
        if (income == null || income.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (expenses == null) {
            expenses = BigDecimal.ZERO;
        }
        BigDecimal savings = income.subtract(expenses);
        if (savings.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return savings
                .multiply(BigDecimal.valueOf(100))
                .divide(income, 2, RoundingMode.HALF_UP);
    }

    /**
     * Budget Utilisation = (Actual Category Expenses / Category Budget) * 100
     */
    default BigDecimal calculateBudgetUtilisation(BigDecimal actualExpenses, BigDecimal budgetLimit) {
        if (budgetLimit == null || budgetLimit.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (actualExpenses == null) {
            actualExpenses = BigDecimal.ZERO;
        }
        return actualExpenses
                .multiply(BigDecimal.valueOf(100))
                .divide(budgetLimit, 2, RoundingMode.HALF_UP);
    }

    /**
     * Monthly Expense Growth = (Current Month Expenses - Previous Month Expenses) / Previous Month Expenses * 100
     */
    default BigDecimal calculateExpenseGrowth(BigDecimal currentExpenses, BigDecimal previousExpenses) {
        if (previousExpenses == null || previousExpenses.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (currentExpenses == null) {
            currentExpenses = BigDecimal.ZERO;
        }
        return currentExpenses.subtract(previousExpenses)
                .multiply(BigDecimal.valueOf(100))
                .divide(previousExpenses, 2, RoundingMode.HALF_UP);
    }

    /**
     * Net Cash Flow = Income - Expenses
     */
    default BigDecimal calculateNetCashFlow(BigDecimal income, BigDecimal expenses) {
        BigDecimal inc = income != null ? income : BigDecimal.ZERO;
        BigDecimal exp = expenses != null ? expenses : BigDecimal.ZERO;
        return inc.subtract(exp);
    }
}
