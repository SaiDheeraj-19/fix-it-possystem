#!/bin/bash
# Install Prisma and client
echo "Installing Prisma..."
npm install prisma @prisma/client

# Create DB if not exists (using manual createdb to be safe, though prisma creates it)
createdb fixit_pos || echo "DB fixit_pos might already exist"

# Generate Client
echo "Generating Prisma Client..."
npx prisma generate

# Run Migration
echo "Running Migration..."
# Resetting dev to ensure clean slate as per request
npx prisma migrate dev --name init

# Start App
echo "Starting App..."
npm run dev
