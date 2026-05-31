# ⚡ Quick Deploy - 3 Steps

## Step 1: Setup Demo Users in Render Database

1. Visit: **https://sparklo-in.onrender.com/api/generate-hash**
2. Copy the SQL output
3. Connect to Render PostgreSQL database
4. Run the SQL

## Step 2: Push to GitHub

```powershell
cd "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"
git add .
git commit -m "feat: Add landing page and demo buttons"
git push origin main
```

## Step 3: Wait for Auto-Deploy

- **Render:** Auto-deploys in 3-5 minutes
- **Vercel:** Auto-deploys in 2-3 minutes

## Test

Visit: **https://sparklo.in**
- Click "Demo Participant" → Should login
- Click "Demo Host" → Should login

---

**See DEPLOYMENT.md for detailed instructions**
