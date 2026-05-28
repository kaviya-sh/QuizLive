# Deployment Instructions

## Before Each Deployment

To force all users to logout and login again after deployment, update the version in `public/version.json`:

### Manual Method:
1. Open `public/version.json`
2. Change the `version` value to current timestamp or increment it
3. Example:
```json
{
  "version": "1.0.1",
  "deployedAt": "2024-01-15T10:30:00Z"
}
```

### Automatic Method (Linux/Mac):
Run the update script before committing:
```bash
chmod +x update-version.sh
./update-version.sh
git add public/version.json
git commit -m "Update version for deployment"
git push origin main
```

### Windows PowerShell:
```powershell
$version = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$deployedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
@"
{
  "version": "$version",
  "deployedAt": "$deployedAt"
}
"@ | Out-File -FilePath public\version.json -Encoding utf8
```

## What Happens After Deployment

1. Users visit the app
2. App checks `version.json`
3. If version changed, shows "New version deployed. Please login again."
4. User is logged out automatically
5. Redirected to login page

## Session Expiry

- Sessions expire after 24 hours
- Users see "Session expired. Please login again."
- Automatic logout and redirect to login page
