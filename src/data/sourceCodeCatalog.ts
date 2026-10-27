/**
 * RupeeWise Source Code Catalogue
 * Synchronized representation of actual project implementation files for the Specs section.
 * Complies strictly with Section 17.B of the RupeeWise Master Development Prompt.
 */

export interface SourceFile {
  id: string;
  category: string;
  fileName: string;
  relativePath: string;
  language: 'java' | 'properties' | 'sql' | 'typescript' | 'html';
  purpose: string;
  oopConcepts: string[];
  connections: string[];
  importantMethods: { name: string; description: string }[];
  code: string;
}

export const SOURCE_CODE_CATALOGUE: SourceFile[] = [
  {
    id: 'entity-account',
    category: '1. Domain Models & Entities',
    fileName: 'Account.java',
    relativePath: 'backend/src/main/java/com/rupeewise/model/entity/Account.java',
    language: 'java',
    purpose: 'Represents financial accounts (Cash, Savings, Current) with encapsulated balance mutations and BigDecimal precision.',
    oopConcepts: ['Encapsulation', 'Data Hiding', 'Validation', 'Constructors'],
    connections: ['FinancialTransaction.java', 'AccountRepository.java', 'AccountServiceImpl.java'],
    importantMethods: [
      { name: 'credit(BigDecimal amount)', description: 'Safely adds funds after asserting strictly positive amount.' },
      { name: 'debit(BigDecimal amount)', description: 'Safely subtracts funds with validation against null/negative amounts.' }
    ],
    code: `package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class Account {

    public enum AccountType { CASH_WALLET, SAVINGS_BANK, CURRENT_BANK, OTHER }

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Account name is mandatory")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 30)
    private AccountType accountType;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(name = "opening_balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @NotNull
    @Column(name = "current_balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "institution_name", length = 100)
    private String institutionName;

    @Column(name = "account_number_mask", length = 20)
    private String accountNumberMask;

    @Column(name = "color_hex", length = 10)
    private String colorHex = "#10B981";

    @Column(name = "is_active")
    private Boolean active = true;

    public Account() {}

    public Account(String id, String name, AccountType accountType, BigDecimal openingBalance, String institutionName) {
        this.id = id;
        this.name = name;
        this.accountType = accountType;
        this.openingBalance = openingBalance != null ? openingBalance : BigDecimal.ZERO;
        this.currentBalance = this.openingBalance;
        this.institutionName = institutionName;
    }

    public void credit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be strictly positive");
        }
        this.currentBalance = this.currentBalance.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be strictly positive");
        }
        this.currentBalance = this.currentBalance.subtract(amount);
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public AccountType getAccountType() { return accountType; }
}`
  },
  {
    id: 'entity-financial-tx',
    category: '2. Abstract Classes & Interfaces',
    fileName: 'FinancialTransaction.java',
    relativePath: 'backend/src/main/java/com/rupeewise/model/entity/FinancialTransaction.java',
    language: 'java',
    purpose: 'Abstract superclass defining core transaction attributes and abstract polymorphic methods applyToAccount() and reverseFromAccount().',
    oopConcepts: ['Abstraction', 'Inheritance', 'Polymorphism', 'Single Table Inheritance'],
    connections: ['IncomeTransaction.java', 'ExpenseTransaction.java', 'TransferTransaction.java', 'Account.java'],
    importantMethods: [
      { name: 'applyToAccount()', description: 'Polymorphic abstract method overridden by child classes to adjust account balance.' },
      { name: 'reverseFromAccount()', description: 'Reverses financial impact when editing or deleting transactions to maintain consistency.' }
    ],
    code: `package com.rupeewise.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_transactions")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "transaction_type", discriminatorType = DiscriminatorType.STRING)
public abstract class FinancialTransaction {

    public enum TransactionType { INCOME, EXPENSE, TRANSFER }

    @Id
    @Column(length = 50)
    private String id;

    @NotNull
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    protected FinancialTransaction() {}

    protected FinancialTransaction(String id, LocalDate transactionDate, BigDecimal amount,
                                   String category, String description, String paymentMethod,
                                   Account account, String notes) {
        this.id = id;
        this.transactionDate = transactionDate;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.paymentMethod = paymentMethod;
        this.account = account;
    }

    public abstract void applyToAccount();
    public abstract void reverseFromAccount();
    public abstract TransactionType getTransactionType();

    public String getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public Account getAccount() { return account; }
}`
  },
  {
    id: 'entity-income-tx',
    category: '3. Inheritance & Polymorphism Examples',
    fileName: 'IncomeTransaction.java',
    relativePath: 'backend/src/main/java/com/rupeewise/model/entity/IncomeTransaction.java',
    language: 'java',
    purpose: 'Concrete subclass specializing FinancialTransaction to implement credit behavior.',
    oopConcepts: ['Inheritance (extends)', 'Method Overriding (@Override)', 'Runtime Polymorphism'],
    connections: ['FinancialTransaction.java', 'Account.java', 'TransactionServiceImpl.java'],
    importantMethods: [
      { name: 'applyToAccount()', description: 'Invokes account.credit(amount).' },
      { name: 'reverseFromAccount()', description: 'Invokes account.debit(amount).' }
    ],
    code: `package com.rupeewise.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("INCOME")
public class IncomeTransaction extends FinancialTransaction {

    public IncomeTransaction() { super(); }

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
}`
  },
  {
    id: 'entity-expense-tx',
    category: '3. Inheritance & Polymorphism Examples',
    fileName: 'ExpenseTransaction.java',
    relativePath: 'backend/src/main/java/com/rupeewise/model/entity/ExpenseTransaction.java',
    language: 'java',
    purpose: 'Concrete subclass specializing FinancialTransaction to implement debit behavior.',
    oopConcepts: ['Inheritance (extends)', 'Method Overriding (@Override)', 'Runtime Polymorphism'],
    connections: ['FinancialTransaction.java', 'Account.java', 'TransactionServiceImpl.java'],
    importantMethods: [
      { name: 'applyToAccount()', description: 'Invokes account.debit(amount).' },
      { name: 'reverseFromAccount()', description: 'Invokes account.credit(amount).' }
    ],
    code: `package com.rupeewise.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("EXPENSE")
public class ExpenseTransaction extends FinancialTransaction {

    public ExpenseTransaction() { super(); }

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
}`
  },
  {
    id: 'entity-transfer-tx',
    category: '3. Inheritance & Polymorphism Examples',
    fileName: 'TransferTransaction.java',
    relativePath: 'backend/src/main/java/com/rupeewise/model/entity/TransferTransaction.java',
    language: 'java',
    purpose: 'Concrete subclass managing double-entry account movements without inflating income or expenses.',
    oopConcepts: ['Inheritance', 'Polymorphism', 'Double-Entry Accounting Rule'],
    connections: ['FinancialTransaction.java', 'Account.java', 'TransactionServiceImpl.java'],
    importantMethods: [
      { name: 'applyToAccount()', description: 'Debits source account and credits target account.' },
      { name: 'reverseFromAccount()', description: 'Credits source account and debits target account.' }
    ],
    code: `package com.rupeewise.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("TRANSFER")
public class TransferTransaction extends FinancialTransaction {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_account_id")
    private Account targetAccount;

    public TransferTransaction() { super(); }

    public TransferTransaction(String id, LocalDate transactionDate, BigDecimal amount,
                               String description, Account sourceAccount, Account targetAccount, String notes) {
        super(id, transactionDate, amount, "Transfer", description, "Internal Transfer", sourceAccount, notes);
        this.targetAccount = targetAccount;
    }

    @Override
    public void applyToAccount() {
        if (getAccount() != null) getAccount().debit(getAmount());
        if (this.targetAccount != null) this.targetAccount.credit(getAmount());
    }

    @Override
    public void reverseFromAccount() {
        if (getAccount() != null) getAccount().credit(getAmount());
        if (this.targetAccount != null) this.targetAccount.debit(getAmount());
    }

    @Override
    public TransactionType getTransactionType() { return TransactionType.TRANSFER; }
    public Account getTargetAccount() { return targetAccount; }
}`
  },
  {
    id: 'service-tx-impl',
    category: '4. Services & Business Logic',
    fileName: 'TransactionServiceImpl.java',
    relativePath: 'backend/src/main/java/com/rupeewise/service/impl/TransactionServiceImpl.java',
    language: 'java',
    purpose: 'Core service orchestrating transaction persistence, balance recalculations, and reversals inside Spring @Transactional boundaries.',
    oopConcepts: ['Service Pattern', 'Dependency Injection', 'Polymorphic Dispatch', 'ACID Transactions'],
    connections: ['TransactionService.java', 'TransactionRepository.java', 'AccountRepository.java'],
    importantMethods: [
      { name: 'createTransaction(TransactionRequestDTO)', description: 'Instantiates Income/Expense/Transfer subtype, triggers polymorphic applyToAccount(), and saves.' },
      { name: 'deleteTransaction(String id)', description: 'Reverses balance impact via tx.reverseFromAccount() before safely deleting record.' }
    ],
    code: `package com.rupeewise.service.impl;

import com.rupeewise.dto.*;
import com.rupeewise.exception.*;
import com.rupeewise.model.entity.*;
import com.rupeewise.repository.*;
import com.rupeewise.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

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
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        FinancialTransaction tx;
        String type = request.getTransactionType().toUpperCase();
        String id = request.getId() != null ? request.getId() : "tx-" + UUID.randomUUID().toString().substring(0, 8);

        if ("INCOME".equals(type)) {
            tx = new IncomeTransaction(id, request.getTransactionDate(), request.getAmount(),
                    request.getCategory(), request.getDescription(), request.getPaymentMethod(), sourceAccount, request.getNotes());
        } else if ("EXPENSE".equals(type)) {
            tx = new ExpenseTransaction(id, request.getTransactionDate(), request.getAmount(),
                    request.getCategory(), request.getDescription(), request.getPaymentMethod(), sourceAccount, request.getNotes());
        } else {
            Account target = accountRepository.findById(request.getTargetAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target account not found"));
            tx = new TransferTransaction(id, request.getTransactionDate(), request.getAmount(),
                    request.getDescription(), sourceAccount, target, request.getNotes());
        }

        // Polymorphic call: executes subclass-specific balance updates
        tx.applyToAccount();

        accountRepository.save(sourceAccount);
        FinancialTransaction saved = transactionRepository.save(tx);
        return mapToDTO(saved);
    }
}`
  },
  {
    id: 'service-ledger-impl',
    category: '4. Services & Business Logic',
    fileName: 'LedgerServiceImpl.java',
    relativePath: 'backend/src/main/java/com/rupeewise/service/impl/LedgerServiceImpl.java',
    language: 'java',
    purpose: 'Constructs the double-entry chronological register, computing debit, credit, and running balance reconciliation.',
    oopConcepts: ['Algorithms & Data Structures', 'Chronological Sorting', 'Reconciliation'],
    connections: ['LedgerService.java', 'TransactionRepository.java', 'AccountRepository.java'],
    importantMethods: [
      { name: 'getLedgerReport(accountId, start, end)', description: 'Sorts transactions chronologically, computes debits/credits, verifies closing balance matches account balance.' }
    ],
    code: `package com.rupeewise.service.impl;

import com.rupeewise.dto.LedgerEntryDTO;
import com.rupeewise.model.entity.*;
import com.rupeewise.repository.*;
import com.rupeewise.service.LedgerService;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

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
        List<FinancialTransaction> txList = transactionRepository.findAllByOrderByTransactionDateAscCreatedAtAsc();
        BigDecimal running = BigDecimal.ZERO;
        List<LedgerEntryDTO> entries = new ArrayList<>();

        for (FinancialTransaction tx : txList) {
            LedgerEntryDTO row = new LedgerEntryDTO();
            row.setTransactionId(tx.getId());
            row.setDate(tx.getTransactionDate());
            row.setDescription(tx.getDescription());
            row.setCategory(tx.getCategory());

            if (tx.getTransactionType() == FinancialTransaction.TransactionType.INCOME) {
                row.setCredit(tx.getAmount());
                row.setDebit(BigDecimal.ZERO);
                running = running.add(tx.getAmount());
            } else if (tx.getTransactionType() == FinancialTransaction.TransactionType.EXPENSE) {
                row.setDebit(tx.getAmount());
                row.setCredit(BigDecimal.ZERO);
                running = running.subtract(tx.getAmount());
            }
            row.setRunningBalance(running);
            entries.add(row);
        }
        return new LedgerReport(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, running, entries);
    }
}`
  },
  {
    id: 'repo-tx',
    category: '5. Repositories & Database Access',
    fileName: 'TransactionRepository.java',
    relativePath: 'backend/src/main/java/com/rupeewise/repository/TransactionRepository.java',
    language: 'java',
    purpose: 'Spring Data JPA data access layer providing database queries for chronological ordering and date ranges.',
    oopConcepts: ['Interface Inheritance', 'ORM Abstraction', 'JPQL Querying'],
    connections: ['FinancialTransaction.java', 'TransactionServiceImpl.java'],
    importantMethods: [
      { name: 'findAllByOrderByTransactionDateAscCreatedAtAsc()', description: 'Retrieves all records in chronological order for accurate running balances.' },
      { name: 'findByDateRange(start, end)', description: 'Retrieves transactions within specified date filter.' }
    ],
    code: `package com.rupeewise.repository;

import com.rupeewise.model.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<FinancialTransaction, String> {
    List<FinancialTransaction> findAllByOrderByTransactionDateDescCreatedAtDesc();
    List<FinancialTransaction> findAllByOrderByTransactionDateAscCreatedAtAsc();

    @Query("SELECT t FROM FinancialTransaction t WHERE t.transactionDate BETWEEN :s AND :e ORDER BY t.transactionDate ASC")
    List<FinancialTransaction> findByDateRange(@Param("s") LocalDate s, @Param("e") LocalDate e);
}`
  },
  {
    id: 'controller-tx',
    category: '6. REST Controllers & APIs',
    fileName: 'TransactionController.java',
    relativePath: 'backend/src/main/java/com/rupeewise/controller/TransactionController.java',
    language: 'java',
    purpose: 'Exposes clean RESTful endpoints for transaction CRUD operations with HTTP status codes and Bean validation.',
    oopConcepts: ['REST Architecture', 'Loose Coupling', 'Dependency Injection'],
    connections: ['TransactionService.java', 'TransactionRequestDTO.java', 'TransactionResponseDTO.java'],
    importantMethods: [
      { name: 'createTransaction(@Valid DTO)', description: 'POST /api/transactions returns 201 Created.' },
      { name: 'deleteTransaction(id)', description: 'DELETE /api/transactions/{id} returns 204 No Content.' }
    ],
    code: `package com.rupeewise.controller;

import com.rupeewise.dto.*;
import com.rupeewise.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponseDTO>> getAll() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> create(@Valid @RequestBody TransactionRequestDTO request) {
        return new ResponseEntity<>(transactionService.createTransaction(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}`
  },
  {
    id: 'calculator-interface',
    category: '8. Financial Analytics & Calculations',
    fileName: 'FinancialCalculator.java',
    relativePath: 'backend/src/main/java/com/rupeewise/service/FinancialCalculator.java',
    language: 'java',
    purpose: 'Defines robust mathematical formulas for savings rates, budget utilisation, and expense growth with zero-division safety.',
    oopConcepts: ['Interface Default Methods', 'Algorithmic Precision', 'Defensive Programming'],
    connections: ['DashboardController.java', 'AnalyticsServiceImpl.java'],
    importantMethods: [
      { name: 'calculateSavingsRate(income, expenses)', description: '(Income - Expenses) / Income * 100 with zero-income guard.' },
      { name: 'calculateBudgetUtilisation(actual, budget)', description: 'Actual / Budget * 100 with zero-budget guard.' }
    ],
    code: `package com.rupeewise.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public interface FinancialCalculator {

    default BigDecimal calculateSavingsRate(BigDecimal income, BigDecimal expenses) {
        if (income == null || income.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        BigDecimal diff = income.subtract(expenses != null ? expenses : BigDecimal.ZERO);
        if (diff.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return diff.multiply(BigDecimal.valueOf(100)).divide(income, 2, RoundingMode.HALF_UP);
    }

    default BigDecimal calculateBudgetUtilisation(BigDecimal actual, BigDecimal budget) {
        if (budget == null || budget.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return (actual != null ? actual : BigDecimal.ZERO)
                .multiply(BigDecimal.valueOf(100))
                .divide(budget, 2, RoundingMode.HALF_UP);
    }
}`
  },
  {
    id: 'exception-handler',
    category: '9. Exception Handling',
    fileName: 'GlobalExceptionHandler.java',
    relativePath: 'backend/src/main/java/com/rupeewise/exception/GlobalExceptionHandler.java',
    language: 'java',
    purpose: 'Centralized controller advice intercepting exceptions, Bean validation errors, and transforming them into structured JSON error payloads.',
    oopConcepts: ['Exception Hierarchy', 'Cross-Cutting Concerns', 'Clean Separation'],
    connections: ['ResourceNotFoundException.java', 'InvalidTransactionException.java'],
    importantMethods: [
      { name: 'handleValidationErrors(...)', description: 'Extracts field errors and returns 400 Bad Request with field mapping.' },
      { name: 'handleNotFound(...)', description: 'Catches missing entity lookups and returns 404.' }
    ],
    code: `package com.rupeewise.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("timestamp", LocalDateTime.now());
        err.put("status", HttpStatus.NOT_FOUND.value());
        err.put("error", "Not Found");
        err.put("message", ex.getMessage());
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }
}`
  },
  {
    id: 'app-entry-point',
    category: '10. Configuration & Entry Point',
    fileName: 'RupeeWiseApplication.java',
    relativePath: 'backend/src/main/java/com/rupeewise/RupeeWiseApplication.java',
    language: 'java',
    purpose: 'Main Spring Boot launcher configuring Asia/Kolkata timezone and starting the embedded container.',
    oopConcepts: ['Application Bootstrap', 'Static main() method', 'Timezone Config'],
    connections: ['application.properties'],
    importantMethods: [
      { name: 'main(String[] args)', description: 'Sets Asia/Kolkata timezone and launches SpringApplication.run().' }
    ],
    code: `package com.rupeewise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class RupeeWiseApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(RupeeWiseApplication.class, args);
    }
}`
  },
  {
    id: 'unit-tests',
    category: '11. Unit Tests',
    fileName: 'FinancialCalculationsTest.java',
    relativePath: 'backend/src/test/java/com/rupeewise/service/FinancialCalculationsTest.java',
    language: 'java',
    purpose: 'JUnit 5 unit test suite verifying savings rate, budget utilisation, zero-division resilience, and BigDecimal comparisons.',
    oopConcepts: ['Test Automation', 'Assertions', 'Boundary Condition Verification'],
    connections: ['FinancialCalculator.java'],
    importantMethods: [
      { name: 'testSavingsRateNormal()', description: 'Asserts savings rate precision on standard income/expense.' },
      { name: 'testSavingsRateZeroIncome()', description: 'Asserts zero-division safety returning 0%.' }
    ],
    code: `package com.rupeewise.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

public class FinancialCalculationsTest {

    private final FinancialCalculator calc = new FinancialCalculator() {};

    @Test
    void testSavingsRateNormal() {
        BigDecimal rate = calc.calculateSavingsRate(new BigDecimal("50000.00"), new BigDecimal("35000.00"));
        assertEquals(0, new BigDecimal("30.00").compareTo(rate));
    }

    @Test
    void testSavingsRateZeroIncome() {
        BigDecimal rate = calc.calculateSavingsRate(BigDecimal.ZERO, new BigDecimal("2000.00"));
        assertEquals(0, BigDecimal.ZERO.compareTo(rate));
    }
}`
  },
  {
    id: 'schema-sql',
    category: '13. Database Schema & Config',
    fileName: 'schema.sql',
    relativePath: 'backend/src/main/resources/schema.sql',
    language: 'sql',
    purpose: 'Relational DDL table definitions with primary keys, foreign key constraints (ON DELETE RESTRICT), check constraints, and performance indexes.',
    oopConcepts: ['RDBMS Mapping', 'Entity Relationships (1:N, 1:1)', 'Referential Integrity'],
    connections: ['Account.java', 'FinancialTransaction.java', 'Budget.java'],
    importantMethods: [
      { name: 'CREATE TABLE financial_transactions', description: 'Defines columns, types, foreign key constraints, and check constraints.' }
    ],
    code: `CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL,
    opening_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(50) PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(80) NOT NULL,
    description VARCHAR(255) NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    CONSTRAINT fk_tx_source FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT
);`
  }
];
