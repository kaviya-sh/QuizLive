# Render Environment Variables Setup

## Problem
Email OTP is not sending because SMTP connection times out on Render free tier.

## Root Cause
Render free tier blocks outbound SMTP connections on port 587.

## Solution Options

### Option 1: Use SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Get API key
3. Add to Render environment variables:
   ```
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USERNAME=apikey
   MAIL_PASSWORD=<your-sendgrid-api-key>
   MAIL_FROM=sparklo.team.in@gmail.com
   ```

### Option 2: Use Port 465 (SSL/TLS)
Add to Render environment variables:
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=sparklo.team.in@gmail.com
MAIL_PASSWORD=cuckcgkrxtfhxmzo
MAIL_FROM=sparklo.team.in@gmail.com
```

### Option 3: Upgrade Render Plan
Upgrade to paid plan ($7/month) which allows SMTP connections.

## How to Set Environment Variables in Render

1. Go to https://dashboard.render.com
2. Click on your service: `sparklo-in`
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add the variables from Option 1 or 2
6. Click "Save Changes"
7. Service will auto-redeploy

## Testing After Setup

1. Wait for deployment to complete
2. Go to: https://sparklo-in.vercel.app/forgot-password
3. Enter email
4. Check inbox for OTP
5. If still fails, check Render logs for OTP (it will be logged)

## Current Status
- Gmail credentials are already in application-prod.yml
- SMTP timeout is set to 5 seconds
- OTP is logged in Render logs when email fails
- To find OTP in logs: Search for "OTP for"
