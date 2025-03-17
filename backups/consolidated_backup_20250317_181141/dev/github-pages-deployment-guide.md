# GitHub Pages Deployment Guide for PPL Workout PWA

This guide provides step-by-step instructions for deploying the Push-Pull-Legs Workout Tracker PWA to GitHub Pages using a dedicated deployment branch.

## Deployment Strategy: Dedicated Branch Approach

We'll use a dedicated `gh-pages` branch for deployment while keeping all development in the `ppl-workout/` directory on the main development branch. This approach offers several advantages:

1. **Clear Separation:** Development files stay in `ppl-workout/`, deployment files in the root of the `gh-pages` branch
2. **No Duplication During Development:** You only work with one set of files
3. **Easy Updates:** When ready to deploy, merge changes from development to gh-pages
4. **Standard Practice:** This is a common approach for GitHub Pages deployments

## Initial Setup

### Step 1: Create the gh-pages Branch

```bash
# Make sure you have the latest changes
git checkout development
git pull

# Create and switch to a new gh-pages branch
git checkout -b gh-pages

# Move all files from ppl-workout/ to the root
cp -r ppl-workout/* .
cp ppl-workout/.nojekyll .

# Remove the now-redundant ppl-workout directory (optional)
# Only do this in the gh-pages branch!
rm -rf ppl-workout

# Commit these changes
git add .
git commit -m "Prepare files for GitHub Pages deployment"

# Push the gh-pages branch to GitHub
git push origin gh-pages

# Switch back to your development branch
git checkout development
```

### Step 2: Configure GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click on "Settings" in the top navigation bar
3. In the left sidebar, click on "Pages" under "Code and automation"
4. Under "Build and deployment" > "Source", select "Deploy from a branch"
5. In the "Branch" dropdown, select `gh-pages`
6. In the "Folder" dropdown, select `/ (root)`
7. Click "Save"

GitHub will now build and deploy your site. This may take a few minutes.

## Ongoing Development Workflow

### For Development:

1. Always work in the `ppl-workout/` directory on the `development` branch
2. Make all your changes, test locally, and commit to the development branch

### For Deployment:

When you're ready to deploy new changes:

```bash
# 1. Make sure development branch is up to date
git checkout development
git pull

# 2. Switch to gh-pages branch and get latest
git checkout gh-pages
git pull origin gh-pages

# 3. Merge changes from development branch
git merge development

# 4. Update the files at the root level
rm -rf *.html *.js *.json assets dev
cp -r ppl-workout/* .
cp ppl-workout/.nojekyll .

# 5. Commit and push the changes
git add .
git commit -m "Update deployment with latest changes"
git push origin gh-pages

# 6. Switch back to development branch
git checkout development
```

## Troubleshooting

### 404 Errors
- Ensure your repository has an `index.html` file at the root level of the gh-pages branch
- Check that all file paths in your HTML, CSS, and JS files are relative, not absolute
- Verify that the service worker paths are correctly configured for GitHub Pages

### Path Issues
If your site is deployed to a subdirectory of your GitHub Pages domain (e.g., username.github.io/repo-name/), you may need to update paths in:

1. **service-worker.js** - Update the cache paths to include the repository name:
   ```javascript
   const ASSETS_TO_CACHE = [
     '/repo-name/',
     '/repo-name/index.html',
     '/repo-name/assets/css/modern-ui.min.css',
     // etc.
   ];
   ```

2. **manifest.json** - Update icon paths:
   ```json
   "icons": [
     {
       "src": "/repo-name/assets/icons/optimized/icon-192.png",
       // etc.
     }
   ]
   ```

3. **index.html** - Update the service worker registration path:
   ```javascript
   navigator.serviceWorker.register('/repo-name/service-worker.js')
   ```

### Repository-Specific Path Fix

For this specific repository, you may need to update paths in the following files before deployment:

1. **service-worker.js** - Check the `ASSETS_TO_CACHE` array
2. **index.html** - Check the service worker registration path
3. **manifest.json** - Check the icon paths

## Verifying Deployment

After GitHub Pages builds your site:

1. Visit the provided URL (typically `https://YOUR-USERNAME.github.io/REPO-NAME/`)
2. Test the PWA functionality:
   - Offline access
   - Service worker registration
   - Installation prompt
   - All phases and workouts display correctly

## Automating Deployment (Optional)

For more frequent deployments, consider creating a deployment script:

```bash
#!/bin/bash
# deploy.sh

echo "Deploying latest changes to GitHub Pages..."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Update development branch
git checkout development
git pull

# Switch to gh-pages branch
git checkout gh-pages
git pull origin gh-pages

# Merge changes from development
git merge development

# Update files
rm -rf *.html *.js *.json assets dev
cp -r ppl-workout/* .
cp ppl-workout/.nojekyll .

# Commit and push
git add .
git commit -m "Update deployment $(date)"
git push origin gh-pages

# Return to original branch
git checkout $CURRENT_BRANCH

echo "Deployment complete!"
```

Make the script executable with `chmod +x deploy.sh` and run it with `./deploy.sh` whenever you want to deploy.