#!/bin/bash

echo "============================================"
echo "FIX IT POS - SYSTEM STABILIZATION SCRIPT"
echo "============================================"

# Step 1: Ensure database exists
echo "Step 1: Creating database if not exists..."
createdb fixit_pos 2>/dev/null || echo "Database fixit_pos already exists or createdb not available"

# Step 2: Start the application
echo "Step 2: Starting Next.js development server..."
npm run dev
