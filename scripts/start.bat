@echo off
REM ========================================================
REM RupeeWise — Windows Local Startup Script
REM Verified for College Demonstration & Evaluation
REM ========================================================

echo ========================================================
echo   RupeeWise - Personal Finance & Management System
echo   Starting Local Spring Boot Backend & H2 Database
echo ========================================================

REM 1. Check for Java 21+
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH!
    echo Please install Java 21 LTS from https://adoptium.net/
    pause
    exit /b 1
)

java -version

echo.
echo [1/3] Checking Maven...
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Maven found. Building application with test verification...
    cd backend
    call mvn clean package -DskipTests=false
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Maven build failed.
        pause
        exit /b 1
    )
    echo [2/3] Launching RupeeWise Spring Boot Application...
    java -jar target/rupeewise-backend-1.0.0-SNAPSHOT.jar
) else (
    echo Maven not found in PATH. Attempting Maven Wrapper if present or direct compile...
    cd backend
    if exist mvnw.cmd (
        call mvnw.cmd spring-boot:run
    ) else (
        echo Please ensure Maven or Java 21 is configured.
        pause
    )
)

pause
