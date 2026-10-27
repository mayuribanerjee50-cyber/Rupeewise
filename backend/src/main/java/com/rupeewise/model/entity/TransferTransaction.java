package com.rupeewise.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * TransferTransaction
 *
 * Demonstrates:
 * - OOP Principle: Inheritance & Double-Entry Accounting
 * - Polymorphic behavior: debits source account, credits target account.
 * - Crucial Financial Rule: Transfers NEVER inflate total income or total expense.
 */
@Entity
@DiscriminatorValue("TRANSFER")
public class TransferTransaction extends FinancialTransaction {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_account_id")
    private Account targetAccount;

    public TransferTransaction() {
        super();
    }

    public TransferTransaction(String id, LocalDate transactionDate, BigDecimal amount,
                               String description, Account sourceAccount, Account targetAccount, String notes) {
        super(id, transactionDate, amount, "Transfer", description, "Internal Transfer", sourceAccount, notes);
        this.targetAccount = targetAccount;
    }

    @Override
    public void applyToAccount() {
        if (getAccount() != null) {
            getAccount().debit(getAmount());
        }
        if (this.targetAccount != null) {
            this.targetAccount.credit(getAmount());
        }
    }

    @Override
    public void reverseFromAccount() {
        if (getAccount() != null) {
            getAccount().credit(getAmount());
        }
        if (this.targetAccount != null) {
            this.targetAccount.debit(getAmount());
        }
    }

    @Override
    public TransactionType getTransactionType() {
        return TransactionType.TRANSFER;
    }

    public Account getTargetAccount() { return targetAccount; }
    public void setTargetAccount(Account targetAccount) { this.targetAccount = targetAccount; }
}
