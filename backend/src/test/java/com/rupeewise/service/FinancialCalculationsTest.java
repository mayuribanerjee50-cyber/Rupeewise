package com.rupeewise.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * FinancialCalculationsTest
 *
 * Demonstrates:
 * - JUnit 5 Unit Testing for college evaluation
 * - BigDecimal precision assertions (using compareTo)
 * - Zero-division edge case handling
 */
public class FinancialCalculationsTest {

    private FinancialCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new FinancialCalculator() {};
    }

    @Test
    @DisplayName("Savings Rate should calculate correctly when income exceeds expenses")
    void testSavingsRateNormal() {
        BigDecimal income = new BigDecimal("50000.00");
        BigDecimal expense = new BigDecimal("35000.00");

        // Savings = 15,000 / 50,000 = 30.00%
        BigDecimal savingsRate = calculator.calculateSavingsRate(income, expense);

        assertEquals(0, new BigDecimal("30.00").compareTo(savingsRate));
    }

    @Test
    @DisplayName("Savings Rate must handle zero income safely without division by zero")
    void testSavingsRateZeroIncome() {
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = new BigDecimal("2000.00");

        BigDecimal savingsRate = calculator.calculateSavingsRate(income, expense);

        assertEquals(0, BigDecimal.ZERO.compareTo(savingsRate), "Zero income should return 0% savings rate safely");
    }

    @Test
    @DisplayName("Budget utilisation calculation with precision")
    void testBudgetUtilisation() {
        BigDecimal actual = new BigDecimal("7500.00");
        BigDecimal budget = new BigDecimal("10000.00");

        BigDecimal utilisation = calculator.calculateBudgetUtilisation(actual, budget);

        assertEquals(0, new BigDecimal("75.00").compareTo(utilisation));
    }

    @Test
    @DisplayName("Budget utilisation must return 0% when budget is zero to prevent division by zero")
    void testBudgetUtilisationZeroBudget() {
        BigDecimal actual = new BigDecimal("500.00");
        BigDecimal budget = BigDecimal.ZERO;

        BigDecimal utilisation = calculator.calculateBudgetUtilisation(actual, budget);

        assertEquals(0, BigDecimal.ZERO.compareTo(utilisation));
    }

    @Test
    @DisplayName("Net cash flow calculation (Income - Expense)")
    void testNetCashFlow() {
        BigDecimal income = new BigDecimal("25000.00");
        BigDecimal expense = new BigDecimal("18250.50");

        BigDecimal netCashFlow = calculator.calculateNetCashFlow(income, expense);

        assertEquals(0, new BigDecimal("6749.50").compareTo(netCashFlow));
    }
}
