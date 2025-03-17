#!/bin/bash
# Script to consolidate backup folders into a single location

# Navigate to project root
cd /workspaces/exceljson

# Check if both backup folders exist
if [ -d "backup" ] && [ -d "backups" ]; then
  echo "Found both backup folders. Consolidating..."
  
  # Create timestamp for the consolidated backup
  timestamp=$(date +"%Y%m%d_%H%M%S")
  
  # Create a consolidated backup directory
  mkdir -p backups/consolidated_backup_$timestamp
  
  # Move contents from backup/ to the consolidated directory
  echo "Moving contents from backup/ to consolidated location..."
  cp -r backup/* backups/consolidated_backup_$timestamp/
  
  # Remove the old backup directory
  echo "Removing old backup/ directory..."
  rm -rf backup
  
  echo "Backup consolidation complete."
  echo "All backups are now in the backups/ directory."
  echo "A consolidated backup has been created at: backups/consolidated_backup_$timestamp"
  
  # List the current backup structure
  echo "Current backup structure:"
  find backups -maxdepth 2 -type d | sort
else
  echo "One or both backup directories don't exist. No consolidation needed."
  
  # If only one exists, report which one
  if [ -d "backup" ]; then
    echo "Only backup/ directory exists."
  fi
  
  if [ -d "backups" ]; then
    echo "Only backups/ directory exists."
  fi
fi