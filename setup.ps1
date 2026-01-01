# StudySync AI - Quick Setup Script
# Run this after getting all API credentials

Write-Host "🚀 StudySync AI Setup Script" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root (sp3 folder)" -ForegroundColor Red
    exit 1
}

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Step 1: Backend Setup
Write-Host "`n📦 Step 1: Setting up Backend..." -ForegroundColor Cyan
cd backend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  IMPORTANT: Edit backend\.env with your credentials!" -ForegroundColor Yellow
    Write-Host "   You need:" -ForegroundColor Yellow
    Write-Host "   - Firebase Project ID, Service Account" -ForegroundColor Yellow
    Write-Host "   - Cloudinary: Cloud Name, API Key, API Secret" -ForegroundColor Yellow
    Write-Host "   - Gemini API Key" -ForegroundColor Yellow
    Write-Host "   - Google Cloud Vision API credentials`n" -ForegroundColor Yellow
    
    # Open .env in notepad
    Start-Process notepad ".env"
    
    $continue = Read-Host "Press Enter when you've updated the .env file (or type 'skip' to continue without editing)"
    if ($continue -eq 'skip') {
        Write-Host "⚠️  Warning: Backend may not work without proper credentials!" -ForegroundColor Yellow
    }
}

# Install dependencies
Write-Host "`n📥 Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
cd ..

# Step 2: Frontend Setup
Write-Host "`n📦 Step 2: Setting up Frontend..." -ForegroundColor Cyan
cd frontend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  IMPORTANT: Edit frontend\.env with your Firebase config!" -ForegroundColor Yellow
    Write-Host "   You need Firebase Web App credentials from Firebase Console`n" -ForegroundColor Yellow
    
    # Open .env in notepad
    Start-Process notepad ".env"
    
    $continue = Read-Host "Press Enter when you've updated the .env file (or type 'skip' to continue)"
    if ($continue -eq 'skip') {
        Write-Host "⚠️  Warning: Frontend may not work without proper credentials!" -ForegroundColor Yellow
    }
}

# Install dependencies
Write-Host "`n📥 Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
cd ..

# Step 3: Firebase Functions Setup (Optional)
Write-Host "`n📦 Step 3: Setting up Firebase Functions (optional)..." -ForegroundColor Cyan
$setupFunctions = Read-Host "Do you want to set up Firebase Functions? (y/n)"
if ($setupFunctions -eq 'y') {
    cd functions
    npm install
    Write-Host "✅ Functions setup complete!" -ForegroundColor Green
    cd ..
}

# Final Summary
Write-Host "`n`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you've configured all .env files with your credentials" -ForegroundColor White
Write-Host "2. Set up Firebase project:" -ForegroundColor White
Write-Host "   - Run: firebase login" -ForegroundColor Yellow
Write-Host "   - Run: firebase init" -ForegroundColor Yellow
Write-Host "   - Deploy: firebase deploy --only firestore:rules,firestore:indexes`n" -ForegroundColor Yellow

Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "   Frontend: cd frontend && npm start`n" -ForegroundColor Yellow

Write-Host "🌐 Access the app at: http://localhost:3000" -ForegroundColor Green
Write-Host "📡 API will run at: http://localhost:5000`n" -ForegroundColor Green

# Ask if user wants to start now
$startNow = Read-Host "Would you like to start the development servers now? (y/n)"
if ($startNow -eq 'y') {
    Write-Host "`n🚀 Starting servers..." -ForegroundColor Cyan
    
    # Start backend in new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; npm run dev"
    
    # Wait a moment
    Start-Sleep -Seconds 2
    
    # Start frontend in new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '⚛️  Frontend Server' -ForegroundColor Cyan; npm start"
    
    Write-Host "✅ Servers starting in new windows!" -ForegroundColor Green
    Write-Host "⏳ Wait for both servers to start, then open http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n🎉 Happy Coding!" -ForegroundColor Magenta
