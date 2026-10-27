/**
 * Detailed Explanations for all 19 OOP & Software Engineering Concepts.
 * Complies directly with Section 17.C of the RupeeWise Master Development Prompt.
 */

export interface OOPConcept {
  id: string;
  number: number;
  title: string;
  summary: string;
  theory: string;
  codeSnippet: string;
  projectUsage: string;
  realWorldFinanceExample: string;
}

export const OOP_CONCEPTS: OOPConcept[] = [
  {
    id: 'classes-and-objects',
    number: 1,
    title: 'Classes and Objects',
    summary: 'A class is a blueprint or template, while an object is a distinct runtime instance possessing state and behavior.',
    theory: 'In RupeeWise, Account or FinancialTransaction serves as the class blueprint defining data fields (like id, currentBalance) and methods (like credit(), debit()). At runtime, when the user creates a Cash Wallet or HDFC Savings Account, distinct object instances are allocated in JVM heap memory. Each object maintains its own distinct internal state while sharing the common behavioral methods defined in the class.',
    codeSnippet: `// Blueprint Class Definition
public class Account {
    private String id;
    private BigDecimal currentBalance;

    public void credit(BigDecimal amount) {
        this.currentBalance = this.currentBalance.add(amount);
    }
}

// Runtime Object Instantiation
Account cashWallet = new Account("acc-1", "Cash Wallet", AccountType.CASH_WALLET, new BigDecimal("5000.00"), "Physical Cash");
Account sbiSavings = new Account("acc-2", "SBI Salary Account", AccountType.SAVINGS_BANK, new BigDecimal("45000.00"), "State Bank of India");`,
    projectUsage: 'Used across Account, Budget, SavingsGoal, and FinancialTransaction domain models.',
    realWorldFinanceExample: 'Having multiple bank accounts (Cash, HDFC, SBI) each tracking separate balances using the identical Account class blueprint.'
  },
  {
    id: 'encapsulation',
    number: 2,
    title: 'Encapsulation & Data Hiding',
    summary: 'Restricting direct access to an object’s internal state through private fields and controlled public methods.',
    theory: 'Encapsulation prevents unauthorized or inconsistent balance modifications. In Account.java, balance fields are strictly private. Callers cannot directly execute account.currentBalance = -99999. Instead, mutations must pass through validated business methods credit(amount) and debit(amount), which assert non-negative and non-null amounts before altering internal state.',
    codeSnippet: `public class Account {
    // Private state hidden from external tampering
    private BigDecimal currentBalance = BigDecimal.ZERO;

    // Controlled public mutator with validation guard
    public void debit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be strictly positive");
        }
        if (this.currentBalance.compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient account funds");
        }
        this.currentBalance = this.currentBalance.subtract(amount);
    }

    // Read-only getter
    public BigDecimal getCurrentBalance() {
        return this.currentBalance;
    }
}`,
    projectUsage: 'All entities (Account, Budget, FinancialTransaction, SavingsGoal) encapsulate their fields and expose domain methods.',
    realWorldFinanceExample: 'An ATM machine will not let you change your bank balance directly; you must submit an authentic withdrawal request through its secure interface.'
  },
  {
    id: 'abstraction',
    number: 3,
    title: 'Abstraction',
    summary: 'Hiding internal implementation complexity and exposing only essential functional contracts.',
    theory: 'Abstraction is implemented using abstract classes (FinancialTransaction) and interfaces (TransactionProcessor, FinancialCalculator). The presentation and controller layers interact with the clean contract calculateSavingsRate(income, expenses) without needing to know the low-level BigDecimal division rounding modes or zero-income guard algorithms.',
    codeSnippet: `// Abstract Contract
public interface FinancialCalculator {
    BigDecimal calculateSavingsRate(BigDecimal income, BigDecimal expenses);
    BigDecimal calculateBudgetUtilisation(BigDecimal actualExpenses, BigDecimal budgetLimit);
}

// Concrete Implementation hiding complex math & edge cases
public class FinancialCalculationService implements FinancialCalculator {
    @Override
    public BigDecimal calculateSavingsRate(BigDecimal income, BigDecimal expenses) {
        if (income == null || income.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        BigDecimal diff = income.subtract(expenses != null ? expenses : BigDecimal.ZERO);
        if (diff.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return diff.multiply(BigDecimal.valueOf(100)).divide(income, 2, RoundingMode.HALF_UP);
    }
}`,
    projectUsage: 'FinancialCalculator interface, TransactionService interface, and abstract FinancialTransaction superclass.',
    realWorldFinanceExample: 'Using a debit card swipe machine requires only entering a PIN, hiding the complex banking encryption and settlement protocols.'
  },
  {
    id: 'inheritance',
    number: 4,
    title: 'Inheritance (IS-A Hierarchy)',
    summary: 'Mechanism where specialized subclasses inherit common state and behavior from a generalized superclass.',
    theory: 'RupeeWise establishes a justified inheritance hierarchy rooted at the abstract superclass FinancialTransaction. Specialized child classes IncomeTransaction, ExpenseTransaction, and TransferTransaction extend this base class. They inherit common properties (id, amount, date, description, account) and focus exclusively on their specialized domain logic.',
    codeSnippet: `// Superclass
public abstract class FinancialTransaction {
    protected String id;
    protected LocalDate transactionDate;
    protected BigDecimal amount;
    protected Account account;

    public abstract void applyToAccount();
}

// Subclasses inheriting fields and specializing behavior
public class IncomeTransaction extends FinancialTransaction {
    @Override
    public void applyToAccount() {
        this.account.credit(this.amount);
    }
}

public class ExpenseTransaction extends FinancialTransaction {
    @Override
    public void applyToAccount() {
        this.account.debit(this.amount);
    }
}`,
    projectUsage: 'FinancialTransaction -> IncomeTransaction, ExpenseTransaction, TransferTransaction.',
    realWorldFinanceExample: 'Both a Salary Credit and a Grocery Purchase are Financial Transactions, but one adds money while the other subtracts it.'
  },
  {
    id: 'polymorphism',
    number: 5,
    title: 'Polymorphism (Dynamic Method Dispatch)',
    summary: 'The ability of different objects to respond to the same method invocation in their own unique manner.',
    theory: 'Runtime polymorphism is demonstrated during transaction execution. When iterating through a collection of FinancialTransaction objects, calling tx.applyToAccount() automatically resolves at runtime (via the JVM vtable) to IncomeTransaction.applyToAccount() or ExpenseTransaction.applyToAccount() based on the actual object instance, eliminating ugly if-else or switch ladders.',
    codeSnippet: `List<FinancialTransaction> batch = List.of(
    new IncomeTransaction("tx-1", LocalDate.now(), new BigDecimal("9000.00"), "Tuition", "Coaching", "UPI", bankAcc, null),
    new ExpenseTransaction("tx-2", LocalDate.now(), new BigDecimal("1500.00"), "Groceries", "Supermarket", "Cash", cashWallet, null)
);

// Polymorphic loop: Same invocation, completely different behaviors!
for (FinancialTransaction tx : batch) {
    tx.applyToAccount(); // Dynamic dispatch determines whether account is credited or debited
}`,
    projectUsage: 'TransactionServiceImpl balance mutation loop and reversals.',
    realWorldFinanceExample: 'Pressing "Process Payment" on a POS terminal behaves differently whether you inserted a credit card, tapped UPI, or used cash.'
  },
  {
    id: 'constructors',
    number: 6,
    title: 'Constructors & Constructor Overloading',
    summary: 'Special methods invoked during object instantiation to initialize state, support default values, and enforce mandatory fields.',
    theory: 'Account.java and FinancialTransaction subclasses feature overloaded constructors. A default no-argument constructor is provided for Hibernate/JPA reflection, while parameterized constructors guarantee that mandatory fields (such as ID, name, initial balance, and account type) are set at the time of creation.',
    codeSnippet: `public class Account {
    // 1. No-arg constructor required by JPA
    public Account() {}

    // 2. Overloaded constructor for rapid testing
    public Account(String id, String name) {
        this(id, name, AccountType.CASH_WALLET, BigDecimal.ZERO, "Manual");
    }

    // 3. Full parameterized constructor
    public Account(String id, String name, AccountType type, BigDecimal openingBalance, String institution) {
        this.id = id;
        this.name = name;
        this.accountType = type;
        this.openingBalance = openingBalance != null ? openingBalance : BigDecimal.ZERO;
        this.currentBalance = this.openingBalance;
        this.institutionName = institution;
    }
}`,
    projectUsage: 'All entities, DTOs, and Service constructors for Dependency Injection.',
    realWorldFinanceExample: 'Opening a standard savings bank account with initial zero balance vs opening a premier wealth account with a mandatory minimum deposit.'
  },
  {
    id: 'method-overloading-overriding',
    number: 7,
    title: 'Method Overloading vs Overriding',
    summary: 'Overloading is compile-time polymorphism with different parameter signatures; Overriding is runtime polymorphism replacing superclass logic.',
    theory: 'Method overloading occurs in LedgerService where getLedgerReport(accountId) is overloaded with getLedgerReport(accountId, startDate, endDate). Method overriding occurs in IncomeTransaction where the inherited abstract method applyToAccount() is completely overridden with credit logic.',
    codeSnippet: `// METHOD OVERLOADING (Compile-Time)
public LedgerReport getLedgerReport(String accountId) {
    return getLedgerReport(accountId, null, null);
}
public LedgerReport getLedgerReport(String accountId, LocalDate start, LocalDate end) {
    // Custom filtering logic...
}

// METHOD OVERRIDING (Runtime)
@Override
public void applyToAccount() {
    this.account.credit(this.amount);
}`,
    projectUsage: 'LedgerService query methods and FinancialTransaction subclasses.',
    realWorldFinanceExample: 'Overloading: Searching transactions by keyword vs keyword + date range. Overriding: Different banks calculating interest differently.'
  },
  {
    id: 'interfaces',
    number: 8,
    title: 'Interfaces',
    summary: 'Pure abstract contracts specifying what operations a class must provide without dictating how they are implemented.',
    theory: 'In Spring Boot, coding to interfaces enables loose coupling and testability. TransactionService is an interface implemented by TransactionServiceImpl. In unit tests, a mock TransactionService can be injected into TransactionController without spinning up a real database.',
    codeSnippet: `public interface TransactionService {
    TransactionResponseDTO createTransaction(TransactionRequestDTO request);
    void deleteTransaction(String id);
    List<TransactionResponseDTO> getAllTransactions();
}

@Service
public class TransactionServiceImpl implements TransactionService {
    // Concrete Spring JPA implementation
}`,
    projectUsage: 'TransactionService, LedgerService, FinancialCalculator, JpaRepository interfaces.',
    realWorldFinanceExample: 'Unified Payments Interface (UPI) is a standard contract that Google Pay, PhonePe, and Paytm all implement differently.'
  },
  {
    id: 'composition-aggregation',
    number: 9,
    title: 'Composition and Aggregation (HAS-A)',
    summary: 'Structuring systems through component relationships rather than deep inheritance hierarchies.',
    theory: 'FinancialTransaction has an Account (aggregation — the account exists independently of any single transaction). Conversely, a LedgerReport is composed of multiple LedgerEntryDTO objects (composition — the report manages the lifecycle of its rows).',
    codeSnippet: `public class FinancialTransaction {
    // Aggregation: Transaction HAS-A reference to Account
    @ManyToOne
    private Account account;
}

public class LedgerReport {
    // Composition: LedgerReport OWNS the list of rows
    private final List<LedgerEntryDTO> entries = new ArrayList<>();
}`,
    projectUsage: 'Transaction-to-Account mapping, Budget-to-Category mapping.',
    realWorldFinanceExample: 'A Bank Account exists independently of transactions, but a Monthly Bank Statement only exists for that specific period.'
  },
  {
    id: 'access-modifiers',
    number: 10,
    title: 'Access Modifiers',
    summary: 'Controlling visibility and scope across classes, packages, and subclasses.',
    theory: 'RupeeWise uses private for all entity fields to protect state; protected for abstract superclass fields and helper methods; public for REST controller endpoints and service contracts; and package-private for internal mapper utilities.',
    codeSnippet: `public class Account {
    private BigDecimal currentBalance; // Accessible ONLY within Account class

    protected void setBalanceDirectly(BigDecimal b) { ... } // Package & Subclass access

    public BigDecimal getCurrentBalance() { return currentBalance; } // Accessible anywhere
}`,
    projectUsage: 'Security hardening across all backend classes.',
    realWorldFinanceExample: 'A bank vault is private, the teller desk is protected, and the ATM lobby is public.'
  },
  {
    id: 'static-instance',
    number: 11,
    title: 'Static vs Instance Members',
    summary: 'Instance members belong to individual object copies; static members belong to the class itself and are shared globally.',
    theory: 'In RupeeWise, currentBalance is an instance variable (each account has its own balance). Conversely, CURRENCY_SYMBOL = "₹" or DEFAULT_TIMEZONE = "Asia/Kolkata" are static constants shared across all instances without wasting memory.',
    codeSnippet: `public class FinancialConstants {
    public static final String CURRENCY_CODE = "INR";
    public static final String CURRENCY_SYMBOL = "₹";
    public static final String DEFAULT_TIMEZONE = "Asia/Kolkata";
}

// Instance field:
public class Account {
    private BigDecimal currentBalance; // Distinct for each account
}`,
    projectUsage: 'Financial constants, utility formatters, and instance balances.',
    realWorldFinanceExample: 'The Reserve Bank of India repo rate is static for all banks, while your personal account balance is an instance variable.'
  },
  {
    id: 'this-and-super',
    number: 12,
    title: 'this and super Keywords',
    summary: 'this references the current object instance; super invokes superclass constructors and methods.',
    theory: 'In IncomeTransaction constructor, super(...) passes ID, date, and amount up to the FinancialTransaction constructor. In setters, this.category = category disambiguates the instance variable from the parameter.',
    codeSnippet: `public class IncomeTransaction extends FinancialTransaction {
    public IncomeTransaction(String id, LocalDate date, BigDecimal amount, Account account) {
        // Calls the constructor of FinancialTransaction superclass
        super(id, date, amount, "Income", "Payee", "UPI", account, null);
    }

    public void setCategory(String category) {
        this.category = category; // this refers to the current object's field
    }
}`,
    projectUsage: 'Subclass initializations and constructor chaining.',
    realWorldFinanceExample: 'A specialized Gold Savings Account inherits base bank account features via super, while setting its custom reward tier via this.'
  },
  {
    id: 'exception-handling',
    number: 13,
    title: 'Exception Handling & Custom Exceptions',
    summary: 'Robust recovery from errors without crashing the server, utilizing structured custom exceptions.',
    theory: 'When an account ID is missing, ResourceNotFoundException is thrown. If an invalid transfer is requested, InvalidTransactionException is thrown. Spring’s @ControllerAdvice intercepts these exceptions and returns standard HTTP 404 or 400 JSON payloads with clear error messages.',
    codeSnippet: `if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
    throw new InvalidTransactionException("Transaction amount must be strictly positive");
}

@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    return new ResponseEntity<>(new ErrorResponse(404, ex.getMessage()), HttpStatus.NOT_FOUND);
}`,
    projectUsage: 'ResourceNotFoundException, InvalidTransactionException, GlobalExceptionHandler.',
    realWorldFinanceExample: 'Entering an invalid ATM PIN prompts "Invalid PIN" and rejects the withdrawal instead of crashing the ATM system.'
  },
  {
    id: 'collections-generics',
    number: 14,
    title: 'Collections and Generics',
    summary: 'Type-safe data structures (List, Map, Set) parameterized with compile-time type safety.',
    theory: 'RupeeWise uses List<FinancialTransaction> for chronological ordering, Map<String, BigDecimal> for category expense grouping, and Set<String> for distinct tags. Generics prevent ClassCastException at runtime by catching type errors at compile time.',
    codeSnippet: `// Type-safe Generic List and Stream Grouping
List<FinancialTransaction> transactions = transactionRepository.findAll();

Map<String, BigDecimal> categoryTotals = transactions.stream()
    .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
    .collect(Collectors.groupingBy(
        FinancialTransaction::getCategory,
        Collectors.reducing(BigDecimal.ZERO, FinancialTransaction::getAmount, BigDecimal::add)
    ));`,
    projectUsage: 'Transaction streams, category groupings, and Spring Data JpaRepository<Account, String>.',
    realWorldFinanceExample: 'Organizing financial receipts into labeled folders (Food, Transport, Bills) rather than dumping all receipts into a random box.'
  },
  {
    id: 'solid-principles',
    number: 15,
    title: 'SOLID Principles in Architecture',
    summary: 'Five foundational design principles promoting maintainability, flexibility, and testability.',
    theory: '1. SRP: LedgerService only manages ledger registers; TransactionService manages CRUD operations. 2. OCP: New transaction types (e.g. InvestmentTransaction) can be added without modifying existing code. 3. LSP: Any subtype of FinancialTransaction can substitute its parent seamlessly. 4. ISP: Clean specific interfaces like FinancialCalculator. 5. DIP: High-level controllers depend on service interfaces, not concrete implementations.',
    codeSnippet: `// Dependency Inversion: Controller depends on interface, not concrete class
@RestController
public class TransactionController {
    private final TransactionService transactionService; // Interface DIP

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService; // Injected
    }
}`,
    projectUsage: 'Architecture-wide clean layering across presentation, services, and repositories.',
    realWorldFinanceExample: 'Standard USB ports allow connecting any compatible flash drive without rebuilding your computer.'
  },
  {
    id: 'dependency-injection',
    number: 16,
    title: 'Dependency Injection & Inversion of Control',
    summary: 'The framework creates and provides dependencies to objects rather than objects instantiating them directly with new.',
    theory: 'Using Spring’s Constructor Injection, TransactionServiceImpl declares its dependencies (TransactionRepository, AccountRepository). Spring Boot IoC container instantiates these dependencies and injects them automatically at startup, drastically simplifying testing and reducing tight coupling.',
    codeSnippet: `@Service
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository txRepo;
    private final AccountRepository accountRepo;

    // Spring Inversion of Control (IoC) automatically passes beans here
    public TransactionServiceImpl(TransactionRepository txRepo, AccountRepository accountRepo) {
        this.txRepo = txRepo;
        this.accountRepo = accountRepo;
    }
}`,
    projectUsage: 'All Spring @Service, @RestController, and @Repository beans.',
    realWorldFinanceExample: 'A car does not manufacture its own tires; standard tires are supplied and attached during assembly.'
  },
  {
    id: 'persistence-orm',
    number: 17,
    title: 'Persistence & Hibernate ORM',
    summary: 'Mapping in-memory Java objects to relational database tables with automatic SQL generation.',
    theory: 'Spring Data JPA and Hibernate map Java entities directly to H2 tables. Annotations like @Entity, @Table, @Id, @Column, and @ManyToOne instruct Hibernate on how to generate schema DDL and execute SQL queries while safeguarding data across server restarts.',
    codeSnippet: `@Entity
@Table(name = "accounts")
public class Account {
    @Id
    private String id;

    @Column(name = "current_balance", precision = 15, scale = 2)
    private BigDecimal currentBalance;
}`,
    projectUsage: 'H2 file-based persistence at ./data/rupeewisedb with JPA repositories.',
    realWorldFinanceExample: 'Your bank ledger is recorded into an encrypted permanent database so your balance remains safe when the bank servers reboot.'
  },
  {
    id: 'rest-apis',
    number: 18,
    title: 'RESTful API Design & DTOs',
    summary: 'Standardized HTTP endpoints, status codes, and separate Data Transfer Objects to protect entity layers.',
    theory: 'RupeeWise implements REST conventions: GET to retrieve, POST to create (201 Created), PUT to update (200 OK), and DELETE to remove (204 No Content). Request and Response DTOs isolate internal database representations from external API consumers.',
    codeSnippet: `@PostMapping
public ResponseEntity<TransactionResponseDTO> create(@Valid @RequestBody TransactionRequestDTO dto) {
    TransactionResponseDTO created = transactionService.createTransaction(dto);
    return new ResponseEntity<>(created, HttpStatus.CREATED);
}`,
    projectUsage: 'All REST Controllers under /api/ (dashboard, transactions, ledger, budgets, savings, profile).',
    realWorldFinanceExample: 'Checking your account balance through a mobile banking app uses a REST API to query the central bank server.'
  },
  {
    id: 'unit-testing',
    number: 19,
    title: 'Unit Testing with JUnit 5',
    summary: 'Automated verification ensuring critical financial formulas, calculations, and boundaries operate flawlessly.',
    theory: 'Financial software demands absolute mathematical correctness. The JUnit 5 test suite verifies that savings rate formulas return exact BigDecimal numbers, handle zero-income without division by zero, and ensure transfers do not alter total net wealth.',
    codeSnippet: `@Test
void testSavingsRateNormal() {
    BigDecimal income = new BigDecimal("50000.00");
    BigDecimal expense = new BigDecimal("35000.00");
    BigDecimal rate = calculator.calculateSavingsRate(income, expense);
    assertEquals(0, new BigDecimal("30.00").compareTo(rate));
}`,
    projectUsage: 'FinancialCalculationsTest.java, TransactionServiceTest.java.',
    realWorldFinanceExample: 'Rigorous pre-flight checks and automated stress tests run before approving automated stock exchange algorithms.'
  }
];
