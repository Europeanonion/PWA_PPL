#!/bin/bash
# Script to move PWA files to root directory for Live Server access

# Navigate to project root
cd /workspaces/exceljson

# Create backup of current root structure
echo "Creating backup of current root files..."
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p backups/root_backup_$timestamp
find . -maxdepth 1 -not -path "./ppl-workout*" -not -path "./backups*" -not -path "./.*" -exec cp -r {} backups/root_backup_$timestamp/ \;

# Create dev/exercise-data directory if it doesn't exist
echo "Creating dev/exercise-data directory..."
mkdir -p dev/exercise-data

# Move PWA files to root
echo "Moving PWA files to root..."
cp -r ppl-workout/* .

# Move exercise data to correct location
echo "Moving exercise data files..."
if [ -d "ppl-workout/dev/exercise-data" ]; then
  cp -r ppl-workout/dev/exercise-data/* dev/exercise-data/
fi

# Fix any path references in HTML and JS files
echo "Updating path references in files..."
sed -i 's/href="\.\/manifest\.json"/href="manifest.json"/g' index.html
sed -i 's/href="\.\/assets\//href="assets\//g' index.html
sed -i 's/src="\.\/assets\//src="assets\//g' index.html
sed -i 's/register("\.\/service-worker\.js")/register("service-worker.js")/g' index.html

echo "Files moved to root directory successfully"
echo "You can now use Live Server to access the app at http://localhost:8080"

# Ask if user wants to clean up duplicates
echo ""
echo "Do you want to clean up duplicate files in the ppl-workout directory? (y/n)"
read -p "> " cleanup_choice

if [ "$cleanup_choice" = "y" ] || [ "$cleanup_choice" = "Y" ]; then
  echo "Running cleanup script..."
  ./cleanup-duplicates.sh
else
  echo "Skipping cleanup. You can run ./cleanup-duplicates.sh later if needed."
  echo "NOTE: Having duplicate files in both root and ppl-workout/ may cause confusion."
fi