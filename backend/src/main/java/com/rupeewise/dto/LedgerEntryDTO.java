package com.rupeewise.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * LedgerEntryDTO
 * Represents a row in the professional double-entry financial register.
 */
public class LedgerEntryDTO {

    private String transactionId;
    private LocalDate date;
    private String description;
    private String category;
    private BigDecimal debit;   // Expenses appear as debits
    private BigDecimal credit;  // Income appears as credits
    private String accountId;
    private String accountName;
    private BigDecimal runningBalance;
    private String notes;

    public LedgerEntryDTO() {}

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getDebit() { return debit; }
    public void setDebit(BigDecimal debit) { this.debit = debit; }

    public BigDecimal getCredit() { return credit; }
    public void setCredit(BigDecimal credit) { this.credit = credit; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public BigDecimal getRunningBalance() { return runningBalance; }
    public void setRunningBalance(BigDecimal runningBalance) { this.runningBalance = runningBalance; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
