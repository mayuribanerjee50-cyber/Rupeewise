# RupeeWise — Object-Oriented Programming (OOP) Guide

Prepared for College Project Viva Voce & Faculty Evaluation.

## 1. Encapsulation & Data Hiding
- **Definition:** Restricting direct access to internal state through `private` variables and providing public business methods.
- **Project Implementation:** In `Account.java`, `currentBalance` is `private`. Modifying the balance directly is prohibited. Users must invoke `credit(amount)` or `debit(amount)`, which validate that the amount is strictly positive and that sufficient funds exist.

## 2. Abstraction
- **Definition:** Exposing essential behavioral contracts while hiding implementation complexity.
- **Project Implementation:** `FinancialCalculator` interface specifies formulas (`calculateSavingsRate`, `calculateBudgetUtilisation`). Callers invoke the contract without worrying about low-level `BigDecimal` division rounding modes or zero-income guards.

## 3. Inheritance
- **Definition:** Specialization where child classes inherit common fields and methods from a superclass.
- **Project Implementation:** `FinancialTransaction` is an abstract superclass. `IncomeTransaction`, `ExpenseTransaction`, and `TransferTransaction` extend it, inheriting `id`, `amount`, `transactionDate`, and `account`.

## 4. Polymorphism (Dynamic Method Dispatch)
- **Definition:** The ability of different objects to execute customized behavior through a common method interface.
- **Project Implementation:** `tx.applyToAccount()` is defined in `FinancialTransaction`. At runtime, calling `tx.applyToAccount()` executes `IncomeTransaction.credit()` or `ExpenseTransaction.debit()` depending on the concrete object instance.

## 5. Composition vs Aggregation
- **Aggregation:** A `FinancialTransaction` has a reference to an `Account`, but the account exists independently.
- **Composition:** A `LedgerReport` owns its `LedgerEntryDTO` rows; the rows have no standalone meaning outside the report.

## 6. Dependency Injection & Inversion of Control (IoC)
- Spring Boot creates and injects dependencies (`TransactionRepository`, `AccountRepository`) into `TransactionServiceImpl` via constructor injection, eliminating tight coupling and enabling mock unit testing.
