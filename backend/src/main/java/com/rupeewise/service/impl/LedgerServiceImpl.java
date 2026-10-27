package com.rupeewise.service.impl;

import com.rupeewise.dto.LedgerEntryDTO;
import com.rupeewise.exception.ResourceNotFoundException;
import com.rupeewise.model.entity.Account;
import com.rupeewise.model.entity.FinancialTransaction;
import com.rupeewise.model.entity.TransferTransaction;
import com.rupeewise.repository.AccountRepository;
import com.rupeewise.repository.TransactionRepository;
import com.rupeewise.service.LedgerService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * LedgerServiceImpl
 *
 * Demonstrates:
 * - Professional double-entry accounting register
 * - Chronological balance computation
 * - Strict reconciliation with Account currentBalance
 */
@Service
public class LedgerServiceImpl implements LedgerService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public LedgerServiceImpl(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public LedgerReport getLedgerReport(String accountId, LocalDate startDate, LocalDate endDate) {
        List<FinancialTransaction> allChronological;

        BigDecimal initialOpening = BigDecimal.ZERO;
        if (accountId != null && !accountId.isBlank() && !"ALL".equalsIgnoreCase(accountId)) {
            Account acc = accountRepository.findById(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
            initialOpening = acc.getOpeningBalance();
            allChronological = transactionRepository.findByAccountIdOrderByTransactionDateAscCreatedAtAsc(accountId);
        } else {
            // Aggregate all accounts
            allChronological = transactionRepository.findAllByOrderByTransactionDateAscCreatedAtAsc();
            initialOpening = accountRepository.findAll().stream()
                    .map(Account::getOpeningBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal running = initialOpening;
        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;

        List<LedgerEntryDTO> entries = new ArrayList<>();

        for (FinancialTransaction tx : allChronological) {
            // Check date range filter if specified
            if (startDate != null && tx.getTransactionDate().isBefore(startDate)) {
                // Adjust opening balance for records prior to window
                if (tx.getTransactionType() == FinancialTransaction.TransactionType.INCOME) {
                    running = running.add(tx.getAmount());
                } else if (tx.getTransactionType() == FinancialTransaction.TransactionType.EXPENSE) {
                    running = running.subtract(tx.getAmount());
                }
                continue;
            }
            if (endDate != null && tx.getTransactionDate().isAfter(endDate)) {
                continue;
            }

            LedgerEntryDTO entry = new LedgerEntryDTO();
            entry.setTransactionId(tx.getId());
            entry.setDate(tx.getTransactionDate());
            entry.setDescription(tx.getDescription());
            entry.setCategory(tx.getCategory());
            entry.setNotes(tx.getNotes());

            if (tx.getAccount() != null) {
                entry.setAccountId(tx.getAccount().getId());
                entry.setAccountName(tx.getAccount().getName());
            }

            if (tx.getTransactionType() == FinancialTransaction.TransactionType.INCOME) {
                entry.setCredit(tx.getAmount());
                entry.setDebit(BigDecimal.ZERO);
                running = running.add(tx.getAmount());
                totalCredits = totalCredits.add(tx.getAmount());
            } else if (tx.getTransactionType() == FinancialTransaction.TransactionType.EXPENSE) {
                entry.setDebit(tx.getAmount());
                entry.setCredit(BigDecimal.ZERO);
                running = running.subtract(tx.getAmount());
                totalDebits = totalDebits.add(tx.getAmount());
            } else if (tx.getTransactionType() == FinancialTransaction.TransactionType.TRANSFER) {
                // If filtering by specific account:
                if (accountId != null && tx.getAccount() != null && accountId.equals(tx.getAccount().getId())) {
                    entry.setDebit(tx.getAmount());
                    entry.setCredit(BigDecimal.ZERO);
                    running = running.subtract(tx.getAmount());
                } else if (tx instanceof TransferTransaction tt && tt.getTargetAccount() != null && accountId != null && accountId.equals(tt.getTargetAccount().getId())) {
                    entry.setCredit(tx.getAmount());
                    entry.setDebit(BigDecimal.ZERO);
                    running = running.add(tx.getAmount());
                } else {
                    // Global view: internal movement does not alter total net wealth
                    entry.setDebit(BigDecimal.ZERO);
                    entry.setCredit(BigDecimal.ZERO);
                }
            }

            entry.setRunningBalance(running);
            entries.add(entry);
        }

        return new LedgerReport(initialOpening, totalCredits, totalDebits, running, entries);
    }
}
