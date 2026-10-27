package com.rupeewise.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ExpenseTransaction
 *
 * Demonstrates:
 * - OOP Principle: Inheritance (extends FinancialTransaction)
 * - OOP Principle: Polymorphism (overrides applyToAccount to debit the associated account)
 */
@Entity
@DiscriminatorValue("EXPENSE")
public class ExpenseTransaction extends FinancialTransaction {

    public ExpenseTransaction() {
        super();
    }

    public ExpenseTransaction(String id, LocalDate transactionDate, BigDecimal amount,
                              String category, String description, String paymentMethod,
                              Account account, String notes) {
        super(id, transactionDate, amount, category, description, paymentMethod, account, notes);
    }

    @Override
    public void applyToAccount() {
        if (getAccount() != null) {
            getAccount().debit(getAmount());
        }
    }

    @Override
    public void reverseFromAccount() {
        if (getAccount() != null) {
            getAccount().credit(getAmount());
        }
    }

    @Override
    public TransactionType getTransactionType() {
        return TransactionType.EXPENSE;
    }
}
