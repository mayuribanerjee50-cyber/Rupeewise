package com.rupeewise.service.impl;

import com.rupeewise.dto.TransactionRequestDTO;
import com.rupeewise.dto.TransactionResponseDTO;
import com.rupeewise.exception.InvalidTransactionException;
import com.rupeewise.exception.ResourceNotFoundException;
import com.rupeewise.model.entity.*;
import com.rupeewise.repository.AccountRepository;
import com.rupeewise.repository.TransactionRepository;
import com.rupeewise.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * TransactionServiceImpl
 *
 * Demonstrates:
 * - OOP Principle: Polymorphism in Action (calls tx.applyToAccount() and tx.reverseFromAccount())
 * - Spring @Transactional: Enforces ACID properties across account balance mutations and ledger records
 * - Clean DTO <-> Entity mappings
 */
@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public TransactionResponseDTO createTransaction(TransactionRequestDTO request) {
        Account sourceAccount = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found: " + request.getAccountId()));

        String id = request.getId() != null ? request.getId() : "tx-" + UUID.randomUUID().toString().substring(0, 8);
        FinancialTransaction transaction;

        String typeStr = request.getTransactionType().toUpperCase();
        if ("INCOME".equals(typeStr)) {
            transaction = new IncomeTransaction(
                    id, request.getTransactionDate(), request.getAmount(),
                    request.getCategory(), request.getDescription(), request.getPaymentMethod(),
                    sourceAccount, request.getNotes()
            );
        } else if ("EXPENSE".equals(typeStr)) {
            transaction = new ExpenseTransaction(
                    id, request.getTransactionDate(), request.getAmount(),
                    request.getCategory(), request.getDescription(), request.getPaymentMethod(),
                    sourceAccount, request.getNotes()
            );
        } else if ("TRANSFER".equals(typeStr)) {
            if (request.getTargetAccountId() == null || request.getTargetAccountId().equals(request.getAccountId())) {
                throw new InvalidTransactionException("Transfer requires a distinct target account");
            }
            Account targetAccount = accountRepository.findById(request.getTargetAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target account not found: " + request.getTargetAccountId()));

            transaction = new TransferTransaction(
                    id, request.getTransactionDate(), request.getAmount(),
                    request.getDescription(), sourceAccount, targetAccount, request.getNotes()
            );
        } else {
            throw new InvalidTransactionException("Unknown transaction type: " + request.getTransactionType());
        }

        transaction.setTags(request.getTags());

        // Polymorphic dynamic method dispatch: updates balances cleanly
        transaction.applyToAccount();

        accountRepository.save(sourceAccount);
        if (transaction instanceof TransferTransaction tt && tt.getTargetAccount() != null) {
            accountRepository.save(tt.getTargetAccount());
        }

        FinancialTransaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public TransactionResponseDTO updateTransaction(String id, TransactionRequestDTO request) {
        FinancialTransaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));

        // Reversal of old effect to maintain mathematical balance
        existing.reverseFromAccount();
        accountRepository.save(existing.getAccount());
        if (existing instanceof TransferTransaction tt && tt.getTargetAccount() != null) {
            accountRepository.save(tt.getTargetAccount());
        }

        // Apply new values
        existing.setTransactionDate(request.getTransactionDate());
        existing.setAmount(request.getAmount());
        existing.setCategory(request.getCategory());
        existing.setDescription(request.getDescription());
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setNotes(request.getNotes());
        existing.setTags(request.getTags());
        existing.setUpdatedAt(LocalDateTime.now());

        // Re-apply new polymorphic impact
        existing.applyToAccount();
        accountRepository.save(existing.getAccount());
        if (existing instanceof TransferTransaction tt && tt.getTargetAccount() != null) {
            accountRepository.save(tt.getTargetAccount());
        }

        FinancialTransaction updated = transactionRepository.save(existing);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteTransaction(String id) {
        FinancialTransaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));

        // Polymorphic reversal before deletion
        existing.reverseFromAccount();
        accountRepository.save(existing.getAccount());
        if (existing instanceof TransferTransaction tt && tt.getTargetAccount() != null) {
            accountRepository.save(tt.getTargetAccount());
        }

        transactionRepository.delete(existing);
    }

    @Override
    public TransactionResponseDTO getTransactionById(String id) {
        return transactionRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
    }

    @Override
    public List<TransactionResponseDTO> getAllTransactions() {
        return transactionRepository.findAllByOrderByTransactionDateDescCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponseDTO> getTransactionsByDateRange(LocalDate start, LocalDate end) {
        return transactionRepository.findByDateRange(start, end)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private TransactionResponseDTO mapToDTO(FinancialTransaction entity) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(entity.getId());
        dto.setTransactionDate(entity.getTransactionDate());
        dto.setTransactionType(entity.getTransactionType().name());
        dto.setAmount(entity.getAmount());
        dto.setCategory(entity.getCategory());
        dto.setDescription(entity.getDescription());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setNotes(entity.getNotes());
        dto.setTags(entity.getTags());
        dto.setCleared(entity.getCleared());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getAccount() != null) {
            dto.setAccountId(entity.getAccount().getId());
            dto.setAccountName(entity.getAccount().getName());
        }

        if (entity instanceof TransferTransaction tt && tt.getTargetAccount() != null) {
            dto.setTargetAccountId(tt.getTargetAccount().getId());
            dto.setTargetAccountName(tt.getTargetAccount().getName());
        }

        return dto;
    }
}
