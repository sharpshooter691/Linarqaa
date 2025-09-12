@echo off
REM Payment System Test Script for Windows
REM This script tests the payment system functionality

echo === Linarqaa Payment System Test ===
echo.

REM Base URL
set BASE_URL=http://localhost:8080/api

echo 1. Testing payment statistics...
curl -s -X GET "%BASE_URL%/payments/statistics"
if %errorlevel% equ 0 (
    echo ✓ Payment statistics endpoint
) else (
    echo ✗ Payment statistics endpoint
)

echo.
echo 2. Testing overdue payments...
curl -s -X GET "%BASE_URL%/payments/overdue"
if %errorlevel% equ 0 (
    echo ✓ Overdue payments endpoint
) else (
    echo ✗ Overdue payments endpoint
)

echo.
echo 3. Testing all payments endpoint...
curl -s -X GET "%BASE_URL%/payments"
if %errorlevel% equ 0 (
    echo ✓ All payments endpoint
) else (
    echo ✗ All payments endpoint
)

echo.
echo 4. Testing monthly bill generation...
REM Get current year and month
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "year=%dt:~2,4%"
set "month=%dt:~6,2%"

curl -s -X POST "%BASE_URL%/payments/generate-monthly?year=%year%&month=%month%"
if %errorlevel% equ 0 (
    echo ✓ Monthly bill generation
) else (
    echo ✗ Monthly bill generation
)

echo.
echo === Usage Examples ===
echo To generate bills for current month:
echo curl -X POST "%BASE_URL%/payments/generate-monthly"
echo.
echo To get all unpaid payments:
echo curl "%BASE_URL%/payments?status=UNPAID"
echo.
echo To get payment statistics:
echo curl "%BASE_URL%/payments/statistics"
echo.
echo To get overdue payments:
echo curl "%BASE_URL%/payments/overdue"
echo.
pause
