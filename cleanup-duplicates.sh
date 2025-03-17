#!/bin/bash
# Script to clean up duplicate files after moving PWA files to root

# Navigate to project root
cd /workspaces/exceljson

# Check if files were successfully moved to root
if [ -f "index.html" ] && [ -f "manifest.json" ] && [ -f "service-worker.js" ]; then
  echo "Verified that core PWA files exist in root directory."
  
  # Create a backup of the ppl-workout directory (optional)
  echo "Creating backup of ppl-workout directory..."
  mkdir -p backups
  timestamp=$(date +"%Y%m%d_%H%M%S")
  cp -r ppl-workout "backups/ppl-workout_backup_$timestamp"
  
  # Remove the ppl-workout directory to eliminate duplicates
  echo "Removing ppl-workout directory to eliminate duplicates..."
  rm -rf ppl-workout
  
  echo "Cleanup complete. Duplicates have been removed."
  echo "A backup of the original ppl-workout directory has been saved to backups/ppl-workout_backup_$timestamp"
else
  echo "ERROR: Core PWA files not found in root directory."
  echo "Please run move-to-root.sh first to move files before cleaning up duplicates."
  exit 1
fi

# Verify the structure is clean
echo "Current directory structure:"
find . -maxdepth 2 -type d | sort