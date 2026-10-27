package com.rupeewise.controller;

import com.rupeewise.dto.DashboardSummaryDTO;
import com.rupeewise.model.entity.Account;
import com.rupeewise.model.entity.FinancialTransaction;
import com.rupeewise.model.entity.SavingsGoal;
import com.rupeewise.repository.AccountRepository;
import com.rupeewise.repository.BudgetRepository;
import com.rupeewise.repository.SavingsGoalRepository;
import com.rupeewise.repository.TransactionRepository;
import com.rupeewise.service.FinancialCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController implements FinancialCalculator {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final BudgetRepository budgetRepository;

    public DashboardController(AccountRepository accountRepository,
                               TransactionRepository transactionRepository,
                               SavingsGoalRepository savingsGoalRepository,
                               BudgetRepository budgetRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.budgetRepository = budgetRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        // 1. Total available balance across all accounts
        BigDecimal totalBalance = accountRepository.findAll().stream()
                .map(Account::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalAvailableBalance(totalBalance);

        // 2. Total savings goals accumulated
        BigDecimal totalSavings = savingsGoalRepository.findAll().stream()
                .map(SavingsGoal::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalSavings(totalSavings);

        // 3. Current Month Income & Expenses
        LocalDate now = LocalDate.now();
        LocalDate firstOfMonth = now.withDayOfMonth(1);
        LocalDate lastOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<FinancialTransaction> thisMonthTxs = transactionRepository.findByDateRange(firstOfMonth, lastOfMonth);

        BigDecimal monthIncome = thisMonthTxs.stream()
                .filter(t -> t.getTransactionType() == FinancialTransaction.TransactionType.INCOME)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthExpense = thisMonthTxs.stream()
                .filter(t -> t.getTransactionType() == FinancialTransaction.TransactionType.EXPENSE)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        summary.setCurrentMonthIncome(monthIncome);
        summary.setCurrentMonthExpenses(monthExpense);

        // 4. Net Cash Flow
        summary.setCurrentMonthNetCashFlow(calculateNetCashFlow(monthIncome, monthExpense));

        // 5. Savings Rate
        summary.setSavingsRate(calculateSavingsRate(monthIncome, monthExpense));

        // 6. Remaining Monthly Budget
        BigDecimal totalBudget = budgetRepository.findAll().stream()
                .map(b -> b.getMonthlyLimit())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingBudget = totalBudget.subtract(monthExpense);
        summary.setRemainingMonthlyBudget(remainingBudget.compareTo(BigDecimal.ZERO) > 0 ? remainingBudget : BigDecimal.ZERO);

        return ResponseEntity.ok(summary);
    }
}
