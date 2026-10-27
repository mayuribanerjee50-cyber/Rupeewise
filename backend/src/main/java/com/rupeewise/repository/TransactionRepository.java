package com.rupeewise.repository;

import com.rupeewise.model.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * TransactionRepository
 *
 * Demonstrates:
 * - Spring Data JPA Repository pattern
 * - Custom JPQL queries with date range and account filtering
 * - Strict chronological ordering for Ledger running balance calculations
 */
@Repository
public interface TransactionRepository extends JpaRepository<FinancialTransaction, String> {

    List<FinancialTransaction> findAllByOrderByTransactionDateDescCreatedAtDesc();

    List<FinancialTransaction> findAllByOrderByTransactionDateAscCreatedAtAsc();

    List<FinancialTransaction> findByAccountIdOrderByTransactionDateAscCreatedAtAsc(String accountId);

    @Query("SELECT t FROM FinancialTransaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate ASC, t.createdAt ASC")
    List<FinancialTransaction> findByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT t FROM FinancialTransaction t WHERE t.category = :category ORDER BY t.transactionDate DESC")
    List<FinancialTransaction> findByCategory(@Param("category") String category);
}
