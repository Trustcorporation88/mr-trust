#!/bin/bash
# MEISHOP CRM - Start All Services

echo "=========================================="
echo "  MEISHOP CRM - Starting All Services"
echo "=========================================="
echo ""

# Diretórios
SERVER_DIR="/c/Mr.Holmes/marketing/crm/server"
FRONTEND_DIR="/c/Mr.Holmes/marketing/crm/frontend"

echo "1. Starting Backend (Express.js on port 3000)..."
cd "$SERVER_DIR"
npm run dev &
BACKEND_PID=$!
sleep 3
echo "   ✅ Backend started (PID: $BACKEND_PID)"
echo ""

echo "2. Starting Frontend (Vite on port 5173)..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 5
echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "=========================================="
echo "  SERVICES RUNNING"
echo "=========================================="
echo ""
echo "Backend:   http://localhost:3000/api/v1"
echo "Frontend:  http://localhost:5173"
echo "Health:    http://localhost:3000/health"
echo ""
echo "Demo Login:"
echo "  Email:    admin@meishop.com"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for signals
wait
