# 🚀 Deployment Guide - Render + Vercel

## Current Setup
- **Backend:** Deployed on Render (https://sparklo-in.onrender.com)
- **Frontend:** Deployed on Vercel (https://sparklo.in)
- **Database:** PostgreSQL on Render

---

## Step 1: Setup Demo Users in Render Database

### Generate BCrypt Hash

Visit your Render backend:
```
https://sparklo-in.onrender.com/api/generate-hash
```

You'll see JSON output with SQL statements. Copy the `sql_participant` and `sql_host` values.

### Connect to Render Database

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your PostgreSQL database
3. Click **"Connect"** → Copy the **External Database URL**
4. Use a database client (DBeaver, pgAdmin, or psql)

### Run SQL

Paste and execute the SQL from the hash generation endpoint:

```sql
-- Example (use the actual SQL from the endpoint):
INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
VALUES ('demo@sparklo.in', '$2a$10$...', 'Demo Participant', 'ROLE_PARTICIPANT', NOW(), NOW(), true)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
VALUES ('demohost@sparklo.in', '$2a$10$...', 'Demo Host', 'ROLE_HOST', NOW(), NOW(), true)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
```

### Verify Users Created

```sql
SELECT id, email, display_name, role, enabled 
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');
```

---

## Step 2: Push Changes to GitHub

```powershell
cd "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"
git add .
git commit -m "feat: Add landing page, demo buttons for Host and Participant, mobile optimization"
git push origin main
```

---

## Step 3: Deploy Backend to Render

### Automatic Deployment (if connected to GitHub)
- Render will auto-deploy when you push to GitHub
- Check deployment status in Render Dashboard
- Wait 3-5 minutes for build to complete

### Manual Deployment
1. Go to Render Dashboard
2. Click on your backend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Step 4: Deploy Frontend to Vercel

### Automatic Deployment (if connected to GitHub)
- Vercel will auto-deploy when you push to GitHub
- Check deployment status in Vercel Dashboard
- Wait 2-3 minutes for build to complete

### Manual Deployment
```powershell
cd "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive\frontend"
vercel --prod
```

---

## Step 5: Test on Production

### Test Demo Participant
1. Visit: https://sparklo.in/login
2. Click **"Demo Participant"** button
3. Should auto-fill: demo@sparklo.in / demo123
4. Click "Sign In"
5. Should redirect to participant dashboard

### Test Demo Host
1. Logout
2. Click **"Demo Host"** button
3. Should auto-fill: demohost@sparklo.in / demo123
4. Click "Sign In"
5. Should redirect to host dashboard

### Test Mobile
1. Open https://sparklo.in on your phone
2. Test both demo buttons
3. Verify responsive layout works

---

## Troubleshooting

### Demo login fails with "Invalid password"

**Solution:** Regenerate the hash
1. Visit: https://sparklo-in.onrender.com/api/generate-hash
2. Copy the new SQL
3. Run in Render database
4. Try login again

### Demo login fails with "User not found"

**Solution:** Check if users exist
```sql
SELECT * FROM users WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');
```

If empty, run the INSERT statements again.

### Render deployment failed

**Solution:** Check Render logs
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages

### Vercel deployment failed

**Solution:** Check Vercel logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click on the failed deployment
4. Check build logs

---

## Environment Variables

### Render (Backend)
Already configured:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT secret key
- Other backend configs

### Vercel (Frontend)
Already configured:
- `VITE_API_BASE_URL` = https://sparklo-in.onrender.com/api
- `VITE_WS_URL` = https://sparklo-in.onrender.com

---

## Quick Commands Summary

```powershell
# 1. Push to GitHub
cd "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"
git add .
git commit -m "feat: Add landing page and demo buttons"
git push origin main

# 2. Generate hash (in browser)
# Visit: https://sparklo-in.onrender.com/api/generate-hash

# 3. Run SQL in Render database
# Use database client with Render connection string

# 4. Wait for auto-deployment
# Render: 3-5 minutes
# Vercel: 2-3 minutes

# 5. Test
# Visit: https://sparklo.in
```

---

## What's Deployed

✅ Landing page at root URL (/)
✅ Two demo buttons (Host & Participant)
✅ Mobile-responsive design
✅ Auto-fill credentials on demo click
✅ Professional README

---

## Support

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Backend Health:** https://sparklo-in.onrender.com/actuator/health
- **Frontend:** https://sparklo.in

---

**That's it! Your changes will be live after GitHub push and auto-deployment! 🎉**
