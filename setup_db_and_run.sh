#!/bin/bash

echo "1. Creating Database if not exists..."
createdb fixit_pos || echo "Database might already exist, continuing..."

echo "2. Applying Schema..."
psql -d fixit_pos -f "src/lib/schema.sql"

echo "3. Starting Server..."
npm run dev
