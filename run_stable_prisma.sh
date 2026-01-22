#!/bin/bash
# Install Stable Prisma Version
echo "Installing Stable Prisma (v5)..."
npm install prisma@5.11.0 @prisma/client@5.11.0 --save-exact

# Generate Client
echo "Generating Prisma Client..."
npx prisma generate

# Run Migration
echo "Running Migration..."
npx prisma migrate dev --name init

# Start App
echo "Starting App..."
npm run dev
