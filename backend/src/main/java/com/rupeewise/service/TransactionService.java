package com.rupeewise.service;

import com.rupeewise.dto.TransactionRequestDTO;
import com.rupeewise.dto.TransactionResponseDTO;
import com.rupeewise.model.entity.FinancialTransaction;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionResponseDTO createTransaction(TransactionRequestDTO request);
    TransactionResponseDTO updateTransaction(String id, TransactionRequestDTO request);
    void deleteTransaction(String id);
    TransactionResponseDTO getTransactionById(String id);
    List<TransactionResponseDTO> getAllTransactions();
    List<TransactionResponseDTO> getTransactionsByDateRange(LocalDate start, LocalDate end);
}
