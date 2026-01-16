#!/bin/bash

echo "🚀 Preparing iiifl Platform for COSMIC..."

# 0. CLEANUP: Free up ports
echo "🧹 Clearing existing processes on ports 3000 and 5000..."
sudo fuser -k 5000/tcp > /dev/null 2>&1
sudo fuser -k 3000/tcp > /dev/null 2>&1

# Define terminal command
# COSMIC terminal uses -e for execution
TERM_CMD="cosmic-term -e"

# 1. Start Database
echo "📦 Opening Database Terminal..."
$TERM_CMD bash -c "echo '--- DATABASE LOGS ---'; cd iiifl-website && sudo docker compose up; exec bash" &

# Wait a moment for Docker
sleep 2

# 2. Start Backend
echo "🔥 Opening Backend Terminal..."
$TERM_CMD bash -c "echo '--- BACKEND API LOGS ---'; cd iiifl-website/backend && node src/app.js; exec bash" &

# 3. Start Frontend
echo "💻 Opening Frontend Terminal..."
$TERM_CMD bash -c "echo '--- FRONTEND UI LOGS ---'; cd iiifl-website/dashboard && npm run dev -- --host --port 3000; exec bash" &

echo "✅ All terminals launched!"
echo "👉 Dashboard: http://localhost:3000"
echo "👉 Backend:   http://localhost:5000"
