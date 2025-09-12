@echo off
echo ========================================
echo Testing Payment Paid Notifications
echo ========================================
echo.

echo 1. First, update the database with new notification types:
echo    mysql -u root -p linarqa ^< update-notification-types.sql
echo.

echo 2. Start the backend server:
echo    cd backend
echo    mvn spring-boot:run
echo.

echo 3. In another terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.

echo 4. Test the notification system:
echo    - Login as a staff member
echo    - Go to payments page
echo    - Mark a payment as paid
echo    - Check if admin receives notification
echo.

echo 5. Check notification types in database:
echo    mysql -u root -p linarqa -e "SELECT DISTINCT type FROM notifications;"
echo.

echo ========================================
echo Payment Paid Notification Features:
echo ========================================
echo.
echo ✅ New notification types added:
echo    - PAYMENT_MARKED_PAID
echo    - EXTRA_PAYMENT_MARKED_PAID
echo.
echo ✅ Backend notifications:
echo    - DataController.markPaymentPaid() triggers notification
echo    - ExtraPaymentController.markPaymentAsPaid() triggers notification
echo    - Notifications sent to all admin users
echo.
echo ✅ Frontend improvements:
echo    - Green checkmark icons for payment paid notifications
echo    - Green border and background for paid notifications
echo    - Bilingual support (Arabic/French)
echo.
echo ✅ Database updates:
echo    - Updated constraint to include new notification types
echo    - Test notification creation script
echo.
echo ========================================
echo Ready to test!
echo ========================================
pause
