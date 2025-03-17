#!/bin/bash
# clean_deploy.sh - Script to properly deploy the PPL Workout PWA to GitHub Pages
# This script ensures a clean structure on the gh-pages branch with no duplications

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${GREEN}=== PPL Workout PWA Clean Deployment Script ===${RESET}"
echo "This script will create a clean gh-pages branch with the proper structure."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${RESET}"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}You have uncommitted changes. Please commit or stash them before deploying.${RESET}"
  exit 1
fi

# Create a temporary directory for files
echo -e "${YELLOW}Creating temporary directory for files...${RESET}"
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}Temporary directory created at ${TEMP_DIR}${RESET}"

# Copy necessary files to the temporary directory
echo -e "${YELLOW}Copying PWA files to temporary directory...${RESET}"
mkdir -p ${TEMP_DIR}/assets/css ${TEMP_DIR}/assets/js ${TEMP_DIR}/assets/icons/optimized ${TEMP_DIR}/dev/exercise-data

# Copy main files
cp -r /workspaces/exceljson/ppl-workout/index.html ${TEMP_DIR}/
cp -r /workspaces/exceljson/ppl-workout/favicon.ico ${TEMP_DIR}/
cp -r /workspaces/exceljson/ppl-workout/manifest.json ${TEMP_DIR}/
cp -r /workspaces/exceljson/ppl-workout/offline.html ${TEMP_DIR}/
cp -r /workspaces/exceljson/ppl-workout/service-worker.js ${TEMP_DIR}/

# Copy CSS files
cp -r /workspaces/exceljson/ppl-workout/assets/css/modern-ui.css ${TEMP_DIR}/assets/css/
cp -r /workspaces/exceljson/ppl-workout/assets/css/modern-ui.min.css ${TEMP_DIR}/assets/css/
cp -r /workspaces/exceljson/ppl-workout/assets/css/weight-tracker.css ${TEMP_DIR}/assets/css/
cp -r /workspaces/exceljson/ppl-workout/assets/css/weight-tracker.min.css ${TEMP_DIR}/assets/css/

# Copy JS files
cp -r /workspaces/exceljson/ppl-workout/assets/js/exercise-inputs.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/exercise-inputs.min.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/load-all-phases.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/load-all-phases.min.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/network-status.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/network-status.min.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/progress-tracker.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/progress-tracker.min.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/toggle-functions.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/toggle-functions.min.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/workout-loader.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/workout-loader.min.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/workout-storage.js ${TEMP_DIR}/assets/js/
cp -r /workspaces/exceljson/ppl-workout/assets/js/workout-storage.min.js ${TEMP_DIR}/assets/js/

# Copy icon files
cp -r /workspaces/exceljson/ppl-workout/assets/icons/Icon-192.png ${TEMP_DIR}/assets/icons/
cp -r /workspaces/exceljson/ppl-workout/assets/icons/icon-512.png ${TEMP_DIR}/assets/icons/
cp -r /workspaces/exceljson/ppl-workout/assets/icons/maskable-icon.png ${TEMP_DIR}/assets/icons/
cp -r /workspaces/exceljson/ppl-workout/assets/icons/optimized/Icon-192.png ${TEMP_DIR}/assets/icons/optimized/
cp -r /workspaces/exceljson/ppl-workout/assets/icons/optimized/icon-512.png ${TEMP_DIR}/assets/icons/optimized/
cp -r /workspaces/exceljson/ppl-workout/assets/icons/optimized/maskable-icon.png ${TEMP_DIR}/assets/icons/optimized/

# Copy exercise data JSON files
cp -r /workspaces/exceljson/ppl-workout/dev/exercise-data/*.json ${TEMP_DIR}/dev/exercise-data/

# Create .nojekyll file
touch ${TEMP_DIR}/.nojekyll

# Backup the current gh-pages branch if it exists
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
if git show-ref --verify --quiet refs/heads/gh-pages; then
  echo -e "${YELLOW}Backing up current gh-pages branch...${RESET}"
  git branch -m gh-pages gh-pages-backup-${TIMESTAMP}
  echo -e "${GREEN}Current gh-pages branch backed up as gh-pages-backup-${TIMESTAMP}${RESET}"
fi

# Create a clean orphan branch
echo -e "${YELLOW}Creating clean gh-pages branch...${RESET}"
git checkout --orphan gh-pages

# Remove everything from staging
echo -e "${YELLOW}Clearing staging area...${RESET}"
git rm -rf --cached .

# Clear the working directory except .git
find . -not -path "./.git*" -not -path "." -delete

# Copy files from temporary directory to the working directory
echo -e "${YELLOW}Copying files from temporary directory to working directory...${RESET}"
cp -r ${TEMP_DIR}/* .
cp -r ${TEMP_DIR}/.nojekyll .

# Check for repository-specific path adjustments
echo -e "${YELLOW}Checking for path adjustments needed for GitHub Pages...${RESET}"
REPO_NAME=$(basename -s .git `git config --get remote.origin.url`)

# Prompt for path adjustments
read -p "Do you need to adjust paths for GitHub Pages? (y/n): " ADJUST_PATHS
if [[ $ADJUST_PATHS == "y" || $ADJUST_PATHS == "Y" ]]; then
  echo -e "${YELLOW}Adjusting paths in service-worker.js, manifest.json, and index.html...${RESET}"
  
  # Perform actual path adjustments
  sed -i "s|'\./|'/${REPO_NAME}/|g" service-worker.js
  sed -i "s|\"./|\"/${REPO_NAME}/|g" manifest.json
  sed -i "s|src=\"./|src=\"/${REPO_NAME}/|g" index.html
  sed -i "s|href=\"./|href=\"/${REPO_NAME}/|g" index.html
  
  # Update service worker registration in index.html
  sed -i "s|register(\"./service-worker.js\"|register(\"/${REPO_NAME}/service-worker.js\"|g" index.html
  
  # Update paths in workout-loader.js for exercise data
  sed -i "s|\"../../dev/exercise-data/|\"/${REPO_NAME}/dev/exercise-data/|g" assets/js/workout-loader.js
  sed -i "s|\`../../dev/exercise-data/|\`/${REPO_NAME}/dev/exercise-data/|g" assets/js/workout-loader.js
  
  echo -e "${GREEN}Path adjustments completed.${RESET}"
  echo -e "${YELLOW}Verifying path adjustments...${RESET}"
  
  # Check if the adjustments were made
  echo -e "Sample paths from service-worker.js:"
  grep -n "ASSETS_TO_CACHE" -A 5 service-worker.js
  
  echo -e "\nSample paths from manifest.json:"
  grep -n "icons" -A 5 manifest.json
  
  echo -e "\nSample paths from index.html:"
  grep -n "serviceWorker.register" index.html
  
  echo -e "\nSample paths from workout-loader.js:"
  grep -n "exercise-data" assets/js/workout-loader.js | head -n 3
  
  echo -e "${RED}IMPORTANT: Please verify the path adjustments above.${RESET}"
fi

# Commit the new files
echo -e "${YELLOW}Committing changes...${RESET}"
git add .
git commit -m "Deploy PWA to GitHub Pages with clean structure $(date)"

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

# Clean up temporary directory
echo -e "${YELLOW}Cleaning up temporary directory...${RESET}"
rm -rf ${TEMP_DIR}
echo -e "${GREEN}Temporary directory removed.${RESET}"

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
if git show-ref --verify --quiet refs/heads/gh-pages-backup-${TIMESTAMP}; then
  echo -e "- Previous gh-pages branch backed up as: gh-pages-backup-${TIMESTAMP}"
fi