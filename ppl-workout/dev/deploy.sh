#!/bin/bash
# deploy.sh - Script to deploy the PPL Workout PWA to GitHub Pages using a clean branch approach
#
# This script creates a clean gh-pages branch containing only the PWA files in the root
# while ensuring no work is lost in the development branch

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${GREEN}=== PPL Workout PWA Deployment Script ===${RESET}"
echo "This script will deploy your PWA to GitHub Pages."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${RESET}"

# Ensure we're on the development branch
if [[ "$CURRENT_BRANCH" != "development" ]]; then
  echo -e "${YELLOW}You are not on the development branch. Recommended to deploy from development branch.${RESET}"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
    echo -e "${YELLOW}Deployment cancelled. Switch to development branch first.${RESET}"
    exit 0
  fi
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}You have uncommitted changes. Please commit or stash them before deploying.${RESET}"
  exit 1
fi

# Backup the dev directory to ensure no work is lost
echo -e "${YELLOW}Creating backup of dev directory...${RESET}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/ppl_dev_backup_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"
cp -r /workspaces/exceljson/ppl-workout/dev/* "$BACKUP_DIR"
echo -e "${GREEN}Backup created at: ${BACKUP_DIR}${RESET}"

# Create a clean orphan branch
echo -e "${YELLOW}Creating clean gh-pages branch...${RESET}"
git checkout --orphan temp_gh_pages

# Remove everything from staging
echo -e "${YELLOW}Clearing staging area...${RESET}"
git rm -rf --cached .

# Clear the working directory except .git
find . -not -path "./.git*" -not -path "." -delete

# Copy PWA files directly to the root
echo -e "${YELLOW}Copying PWA files to root directory...${RESET}"
# Copy all files from the PWA directory to root
cp -r /workspaces/exceljson/ppl-workout/* .

# Create .nojekyll file to prevent Jekyll processing
echo -e "${YELLOW}Creating .nojekyll file...${RESET}"
touch .nojekyll

# Check for repository-specific path adjustments
echo -e "${YELLOW}Checking for path adjustments needed for GitHub Pages...${RESET}"
REPO_NAME=$(basename -s .git `git config --get remote.origin.url`)

# Prompt for path adjustments
read -p "Do you need to adjust paths for GitHub Pages? (y/n): " ADJUST_PATHS
if [[ $ADJUST_PATHS == "y" || $ADJUST_PATHS == "Y" ]]; then
  echo -e "${YELLOW}Adjusting paths in service-worker.js, manifest.json, and index.html...${RESET}"
  
  # Example adjustments - these would need to be customized based on the actual files
  # sed -i "s|'\./|'/${REPO_NAME}/|g" service-worker.js
  # sed -i "s|\"./|\"/${REPO_NAME}/|g" manifest.json
  # sed -i "s|src=\"./|src=\"/${REPO_NAME}/|g" index.html
  
  echo -e "${RED}IMPORTANT: Manual verification of path adjustments is recommended.${RESET}"
fi

# Commit the new files
echo -e "${YELLOW}Committing changes...${RESET}"
git add .
git commit -m "Deploy PWA to GitHub Pages $(date)"

# Save the current gh-pages branch if it exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
  echo -e "${YELLOW}Backing up current gh-pages branch...${RESET}"
  git branch -m gh-pages gh-pages-backup-${TIMESTAMP}
  echo -e "${GREEN}Current gh-pages branch backed up as gh-pages-backup-${TIMESTAMP}${RESET}"
fi

# Rename our temp branch to gh-pages
git branch -m gh-pages

# Force push to replace the gh-pages branch on remote
echo -e "${YELLOW}Pushing to GitHub...${RESET}"
git push -f origin gh-pages

# Return to original branch
echo -e "${YELLOW}Returning to ${CURRENT_BRANCH} branch...${RESET}"
git checkout ${CURRENT_BRANCH}

# Verify that we're back on the original branch
if [[ "$(git branch --show-current)" != "$CURRENT_BRANCH" ]]; then
  echo -e "${RED}Failed to return to ${CURRENT_BRANCH} branch. Please run 'git checkout ${CURRENT_BRANCH}' manually.${RESET}"
else
  echo -e "${GREEN}Successfully returned to ${CURRENT_BRANCH} branch.${RESET}"
fi

# Restore dev directory from backup if needed
if [[ -d "$BACKUP_DIR" ]]; then
  echo -e "${YELLOW}Checking if dev directory needs to be restored...${RESET}"
  if [[ ! -d "/workspaces/exceljson/ppl-workout/dev" || -z "$(ls -A /workspaces/exceljson/ppl-workout/dev)" ]]; then
    echo -e "${YELLOW}Restoring dev directory from backup...${RESET}"
    mkdir -p /workspaces/exceljson/ppl-workout/dev
    cp -r "$BACKUP_DIR"/* /workspaces/exceljson/ppl-workout/dev/
    echo -e "${GREEN}Dev directory restored from backup.${RESET}"
  else
    echo -e "${GREEN}Dev directory appears intact, no restoration needed.${RESET}"
  fi
fi

echo -e "${BOLD}${GREEN}Deployment complete!${RESET}"
echo -e "Your PWA should be available at: ${BOLD}https://YOUR-USERNAME.github.io/${REPO_NAME}/${RESET}"
echo -e "Note: It may take a few minutes for GitHub Pages to build and deploy your site."
echo -e "${YELLOW}Don't forget to configure GitHub Pages in your repository settings:${RESET}"
echo -e "1. Go to your repository on GitHub"
echo -e "2. Click on Settings > Pages"
echo -e "3. Under 'Build and deployment' > 'Source', select 'Deploy from a branch'"
echo -e "4. Select 'gh-pages' branch and '/ (root)' folder"
echo -e "5. Click Save"
echo -e ""
echo -e "${YELLOW}Backup Information:${RESET}"
echo -e "- Dev directory backup: ${BACKUP_DIR}"
if git show-ref --verify --quiet refs/heads/gh-pages-backup-${TIMESTAMP}; then
  echo -e "- Previous gh-pages branch backed up as: gh-pages-backup-${TIMESTAMP}"
fi