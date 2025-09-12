# Debug JWT Token Authentication Issue

## 🔍 **Problem Analysis:**
The frontend is getting **403 Forbidden** errors because the JWT token is not being properly attached to requests.

## 🧪 **Debugging Steps:**

### **1. Check Browser Console:**
Open Developer Tools (F12) and look for these debug messages:

#### **API Request Debug:**
```
🔐 API Request with token: /notifications/admin/unread Token present: true
```
OR
```
⚠️ API Request without token: /notifications/admin/unread
```

#### **TopBar Debug:**
```
🔍 TopBar fetchNotifications - User: {email: "admin@example.com", role: "OWNER"}
🔍 TopBar fetchNotifications - Is Admin: true
🔍 TopBar fetchNotifications - JWT Token: Present
```

### **2. Check Network Tab:**
1. Go to **Network** tab in Developer Tools
2. Refresh the page
3. Look for the request to `/api/notifications/admin/unread`
4. Check the **Request Headers** section
5. Look for: `Authorization: Bearer <token>`

### **3. Check localStorage:**
1. Go to **Application** tab in Developer Tools
2. Expand **Local Storage** → `http://localhost:5173`
3. Look for `jwt-token` key
4. Verify the token value exists and is not empty

### **4. Check Authentication State:**
1. In browser console, run:
```javascript
console.log('JWT Token:', localStorage.getItem('jwt-token'));
console.log('User from auth:', window.__ZUSTAND_STORE__?.auth?.user);
```

## 🔧 **Common Issues & Solutions:**

### **Issue 1: Token Not in localStorage**
**Symptoms:** `⚠️ API Request without token`
**Causes:**
- User not logged in
- Token expired and cleared
- Login failed

**Solution:**
- Login again
- Check if login is successful

### **Issue 2: Token Present but Request Fails**
**Symptoms:** `🔐 API Request with token` but still 403
**Causes:**
- Token expired
- Token malformed
- Backend not recognizing token

**Solution:**
- Check backend logs for JWT validation errors
- Try logging out and logging in again

### **Issue 3: User Role Mismatch**
**Symptoms:** Token present, but user role is not OWNER
**Causes:**
- User is STAFF instead of OWNER
- Role not properly set in database

**Solution:**
- Check user role in database
- Login with admin account

### **Issue 4: CORS Issues**
**Symptoms:** Request blocked by browser
**Causes:**
- CORS configuration issues
- Wrong origin

**Solution:**
- Check backend CORS configuration
- Verify frontend URL matches allowed origins

## 🚀 **Quick Test:**

### **Test 1: Manual API Call**
```javascript
// In browser console:
fetch('http://localhost:8080/api/notifications/admin/unread', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));
```

### **Test 2: Check Token Validity**
```javascript
// In browser console:
const token = localStorage.getItem('jwt-token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Token expired:', new Date(payload.exp * 1000) < new Date());
} else {
  console.log('No token found');
}
```

## 📋 **Expected Debug Output:**

### **Successful Authentication:**
```
🔐 API Request with token: /notifications/admin/unread Token present: true
🔍 TopBar fetchNotifications - User: {email: "admin@example.com", role: "OWNER"}
🔍 TopBar fetchNotifications - Is Admin: true
🔍 TopBar fetchNotifications - JWT Token: Present
🔔 NotificationController.getUnreadAdminNotifications() called
✅ Admin user authenticated: admin@example.com
📋 Found X unread admin notifications
```

### **Failed Authentication:**
```
⚠️ API Request without token: /notifications/admin/unread
🔍 TopBar fetchNotifications - User: null
🔍 TopBar fetchNotifications - Is Admin: false
🔍 TopBar fetchNotifications - JWT Token: Missing
```

## 🎯 **Next Steps:**
1. Run the debugging steps above
2. Check the console output
3. Identify which issue is occurring
4. Apply the appropriate solution
