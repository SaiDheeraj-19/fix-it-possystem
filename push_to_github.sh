#!/bin/bash

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
    echo "Git initialized."
fi

# Add remote if it doesn't exist
if ! git remote | grep -q 'origin'; then
    git remote add origin https://github.com/SaiDheeraj-19/fix-it-possystem.git
    echo "Remote origin added."
else
    git remote set-url origin https://github.com/SaiDheeraj-19/fix-it-possystem.git
    echo "Remote origin updated."
fi

# Stage all changes
git add .

# Commit changes
git commit -m "feat: premium UI overhaul, dynamic images, and live clock"

# Push to main branch
echo "Attempting to push to GitHub..."
git push -u origin main
