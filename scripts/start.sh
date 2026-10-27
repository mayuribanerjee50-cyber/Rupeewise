#!/usr/bin/env bash
# RupeeWise Unix / macOS Startup Script
set -e

echo "========================================================"
echo "  RupeeWise - Personal Finance & Management System"
echo "  Starting Local Spring Boot Backend & H2 Database"
echo "========================================================"

if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed or not in PATH."
    echo "Please install Java 21 LTS."
    exit 1
fi

java -version

cd backend
if command -v mvn &> /dev/null; then
    echo "Building application with Maven..."
    mvn clean spring-boot:run
else
    echo "[ERROR] Maven is required to launch Spring Boot."
    exit 1
fi
