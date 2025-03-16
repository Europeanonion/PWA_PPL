#!/bin/bash
# deploy.sh - Script to deploy the PPL Workout PWA to GitHub Pages
# 
# This script automates the process of deploying the PWA to GitHub Pages
# using the dedicated branch approach. It:
# 1. Creates a gh-pages branch if it doesn't exist
# 2. Updates the gh-pages branch with the latest changes
# 3. Moves files from ppl-workout/ to the root in the gh-pages branch
# 4. Commits and pushes the changes to GitHub
#
# Usage: ./deploy.sh

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

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}You have uncommitted changes. Please commit or stash them before deploying.${RESET}"
  exit 1
fi

# Check if gh-pages branch exists
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
  echo -e "${YELLOW}Creating gh-pages branch...${RESET}"
  git checkout -b gh-pages
  echo -e "${GREEN}Created gh-pages branch.${RESET}"
else
  # Update development branch
  echo -e "${YELLOW}Updating ${CURRENT_BRANCH} branch...${RESET}"
  git checkout ${CURRENT_BRANCH}
  git pull origin ${CURRENT_BRANCH}
  
  # Switch to gh-pages branch
  echo -e "${YELLOW}Switching to gh-pages branch...${RESET}"
  git checkout gh-pages
  git pull origin gh-pages
  
  # Merge changes from development branch
  echo -e "${YELLOW}Merging changes from ${CURRENT_BRANCH}...${RESET}"
  git merge ${CURRENT_BRANCH} -m "Merge ${CURRENT_BRANCH} into gh-pages for deployment"
fi

# Clean up root directory (preserve .git and other important files)
echo -e "${YELLOW}Cleaning up root directory...${RESET}"
find . -maxdepth 1 -not -path "./.git*" -not -path "." -not -path "./ppl-workout" -exec rm -rf {} \;

# Copy files from ppl-workout/ to root
echo -e "${YELLOW}Copying files from ppl-workout/ to root...${RESET}"
cp -r ppl-workout/* .
cp ppl-workout/.nojekyll .

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

# Commit and push changes
echo -e "${YELLOW}Committing changes...${RESET}"
git add .
git commit -m "Update deployment $(date)"

echo -e "${YELLOW}Pushing to GitHub...${RESET}"
git push origin gh-pages

# Return to original branch
echo -e "${YELLOW}Returning to ${CURRENT_BRANCH} branch...${RESET}"
git checkout ${CURRENT_BRANCH}

echo -e "${BOLD}${GREEN}Deployment complete!${RESET}"
echo -e "Your PWA should be available at: ${BOLD}https://YOUR-USERNAME.github.io/${REPO_NAME}/${RESET}"
echo -e "Note: It may take a few minutes for GitHub Pages to build and deploy your site."
echo -e "${YELLOW}Don't forget to configure GitHub Pages in your repository settings:${RESET}"
echo -e "1. Go to your repository on GitHub"
echo -e "2. Click on Settings > Pages"
echo -e "3. Under 'Build and deployment' > 'Source', select 'Deploy from a branch'"
echo -e "4. Select 'gh-pages' branch and '/ (root)' folder"
echo -e "5. Click Save"