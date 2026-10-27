package com.rupeewise.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * IncomeTransaction
 *
 * Demonstrates:
 * - OOP Principle: Inheritance (extends FinancialTransaction)
 * - OOP Principle: Polymorphism (overrides applyToAccount to credit the associated account)
 */
@Entity
@DiscriminatorValue("INCOME")
public class IncomeTransaction extends FinancialTransaction {

    public IncomeTransaction() {
        super();
    }

    public IncomeTransaction(String id, LocalDate transactionDate, BigDecimal amount,
                             String category, String description, String paymentMethod,
                             Account account, String notes) {
        super(id, transactionDate, amount, category, description, paymentMethod, account, notes);
    }

    @Override
    public void applyToAccount() {
        if (getAccount() != null) {
            getAccount().credit(getAmount());
        }
    }

    @Override
    public void reverseFromAccount() {
        if (getAccount() != null) {
            getAccount().debit(getAmount());
        }
    }

    @Override
    public TransactionType getTransactionType() {
        return TransactionType.INCOME;
    }
}
