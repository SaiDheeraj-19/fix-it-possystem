#!/bin/bash

echo "1. Installing Stable Prisma..."
npm install prisma@5.11.0 @prisma/client@5.11.0 --save-exact

echo "2. Resetting Database completely..."
# Force reset to ensure 'User' table exists exactly as per schema
npx prisma migrate reset --force --skip-seed

echo "3. Applying Migration..."
npx prisma migrate dev --name init

echo "4. Starting App..."
npm run dev
