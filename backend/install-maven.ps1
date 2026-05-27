# Maven Installation Script for Windows
Write-Host "Installing Maven 3.9.6..." -ForegroundColor Green

$mavenVersion = "3.9.6"
$mavenHome = "$env:USERPROFILE\.m2\wrapper\apache-maven-$mavenVersion"
$downloadUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$zipFile = "$env:USERPROFILE\.m2\wrapper\maven.zip"

# Create directory
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.m2\wrapper" | Out-Null

# Download Maven
Write-Host "Downloading Maven from $downloadUrl..." -ForegroundColor Yellow
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile

# Extract
Write-Host "Extracting Maven..." -ForegroundColor Yellow
Expand-Archive -Path $zipFile -DestinationPath "$env:USERPROFILE\.m2\wrapper" -Force

# Cleanup
Remove-Item $zipFile

Write-Host "Maven installed successfully at: $mavenHome" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run:" -ForegroundColor Cyan
Write-Host "  .\mvnw.cmd clean install" -ForegroundColor White
Write-Host "  .\mvnw.cmd spring-boot:run" -ForegroundColor White
