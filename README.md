# RupeeWise — Personal Finance & Management System

> **College Software Engineering & OOP Capstone Project**  
> Developed with: **Java 21 LTS • Spring Boot 3.3 • H2 Database • React 19 • TypeScript • Chart.js • Indian Rupees (INR ₹)**

---

## 1. Project Overview
**RupeeWise** is a full-featured personal finance management platform architected to demonstrate enterprise software engineering principles to college faculty and project evaluators.

Unlike static prototypes, RupeeWise features:
- **Real Java Backend Architecture:** Domain models with validated inheritance hierarchies, Spring Data JPA repositories, ACID `@Transactional` service methods, and H2 file database persistence.
- **Strict Indian Currency Formatting:** All calculations and records operate exclusively in Indian Rupees (`en-IN` format, e.g. `₹1,25,000.00`) under the `Asia/Kolkata` timezone.
- **Double-Entry General Ledger:** Automatically computes chronological running balances; verifies that the ledger closing balance reconciles with physical account balances.
- **Interactive Specs Explorer & Teacher Presentation Mode:** Dedicated 11-step structured demonstration flow allowing the student to walk the teacher through architecture, actual Java source files, and 19 core OOP concepts.

---

## 2. Mandatory Tech Stack
- **Backend:** Java 21 LTS, Spring Boot 3.3.4, Maven, Spring Data JPA, Hibernate, Jakarta Bean Validation, JUnit 5.
- **Database:** H2 Relational Database with persistent file-based storage (`./data/rupeewisedb`).
- **Frontend:** React 19, TypeScript, Tailwind CSS, Chart.js, Lucide Icons, Web Audio API synthesizer.
- **Architecture:** Clear 3-Tier Layered Architecture (Presentation -> Business Logic -> Data Access).

---

## 3. How to Run Locally on Windows Laptop

### Option A: Using Windows One-Click Script
1. Clone or download this repository.
2. Double-click `scripts\start.bat`.
3. The script verifies that Java 21 is installed, compiles the Maven project with JUnit tests, and launches Spring Boot at `http://localhost:8080`.

### Option B: Manual Maven Command
```bash
cd backend
mvn clean spring-boot:run
```
Once started:
- **Application Web UI:** `http://localhost:8080` (or `http://localhost:3000` in AI Studio dev server)
- **H2 Database Web Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/rupeewisedb`, User: `sa`, Password: *[blank]*)
- **REST API Endpoints:** `http://localhost:8080/api/dashboard/summary`

---

## 4. Key College Viva Voce Questions & Answers

**Q1: Why did you use `BigDecimal` instead of `double` for currency?**  
*Answer:* Floating-point types (`float` and `double`) represent numbers in binary IEEE 754 format, which cannot accurately represent decimal fractions like 0.1 or 0.7, causing cumulative rounding errors in financial transactions. `BigDecimal` provides arbitrary-precision arithmetic with strict rounding modes (`HALF_UP`), which is mandatory for banking and accounting software.

**Q2: How does RupeeWise demonstrate Runtime Polymorphism?**  
*Answer:* We defined an abstract superclass `FinancialTransaction` with an abstract method `applyToAccount()`. At runtime, when processing a batch of transactions, `tx.applyToAccount()` is invoked. The Java Virtual Machine resolves dynamic method dispatch to call `IncomeTransaction.applyToAccount()` (which credits the account) or `ExpenseTransaction.applyToAccount()` (which debits the account) without requiring manual if-else branching.

**Q3: How do you prevent double-counting when contributing to a Savings Goal?**  
*Answer:* Contributing to a savings goal transfers existing liquid assets from a bank account into an earmarked goal reserve. It is not counted as new income because no new money entered the user's financial ecosystem.

**Q4: How does the General Ledger ensure reconciliation?**  
*Answer:* The ledger orders all transactions in strict ascending chronological order starting from the opening balance. Each row calculates the running balance. The final closing balance is compared against the live account current balance to guarantee that credits minus debits equal the net balance change.

---

## 5. GitHub Repository Note
*Note on GitHub Pages:* GitHub Pages only hosts static client files (HTML/CSS/JS) and cannot execute a Java Spring Boot JVM backend. For live cloud hosting, deploy the Spring Boot backend to Render, Railway, or Google Cloud Run, and point the frontend to the cloud REST API base URL.
