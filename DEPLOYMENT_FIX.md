# Fix Password Issue - Deployment Guide

## Issue
Invalid password error when signing in on Vercel deployment due to BCrypt hash mismatch.

## Root Cause
Existing user passwords in database were hashed with different BCrypt strength than what the app uses for validation.

## Solution Applied
Modified `DatabaseInitializer.java` to force-update demo user passwords on every backend startup to match current BCrypt configuration (strength 8).

## Deployment Steps

### Step 1: Commit Changes to GitHub
```bash
cd "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"
git add .
git commit -m "Fix: Force update demo user passwords to match BCrypt strength 8"
git push origin main
```

### Step 2: Redeploy Backend on Render
The backend is hosted on Render at: https://sparklo-in.onrender.com

**Option A: Automatic (if auto-deploy is enabled)**
- Push will automatically trigger Render deployment

**Option B: Manual**
1. Go to https://dashboard.render.com
2. Find your `sparklo-in` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete (~5-10 minutes)

### Step 3: Verify Fix
1. Check Render logs for: `✓ Updated password for: demo@sparklo.in (ROLE_PARTICIPANT)`
2. Test login at: https://sparklo-in.vercel.app/login
   - Email: `demo@sparklo.in`
   - Password: `demo123`

## For Existing Users with Login Issues

If users still can't login after this fix:

1. **Use Forgot Password** (RECOMMENDED)
   - Go to: https://sparklo-in.vercel.app/forgot-password
   - Enter email
   - Use OTP sent to email
   - Set new password
   - Login with new password

2. **Contact Admin** to manually reset password in database

## Technical Details
- BCrypt strength: **8** (defined in SecurityConfig.java)
- Demo accounts recreated on every backend startup
- All new registrations will use correct BCrypt strength
- Existing users need password reset to fix their hashes
