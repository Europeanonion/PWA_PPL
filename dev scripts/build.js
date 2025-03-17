/**
 * Production Build Script
 * Prepares the app for production deployment
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');  // Up one level from "dev scripts"
const appDir = path.join(projectRoot, 'ppl-workout');
const distDir = path.join(projectRoot, 'dist');

// Configuration
const config = {
  copyFiles: [
    'index.html',
    'offline.html',
    'manifest.json',
    'service-worker.js',
    'favicon.ico'
  ],
  copyDirs: [
    'assets',
    'dev'
  ],
  // Add version number to filenames for cache busting
  addVersioning: true,
  version: new Date().toISOString().replace(/[-:T.Z]/g, '')
};

/**
 * Check if a directory exists, and optionally create it if missing
 * @param {string} dirPath - Directory path
 * @param {boolean} createIfMissing - Whether to create the directory if it doesn't exist
 * @returns {boolean} - True if the directory exists or was created, false otherwise
 */
function checkDirectoryExists(dirPath, createIfMissing = false) {
  if (!fs.existsSync(dirPath)) {
    if (createIfMissing) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
        return true;
      } catch (error) {
        console.error(`Failed to create directory ${dirPath}: ${error.message}`);
        return false;
      }
    }
    console.warn(`Warning: Directory does not exist: ${dirPath}`);
    return false;
  }
  return true;
}

/**
 * Clean the distribution directory
 */
function cleanDist() {
  console.log('Cleaning distribution directory...');
  
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(distDir, { recursive: true });
}

/**
 * Copy files and directories
 */
function copyAssets() {
  console.log('Copying files and directories...');
  
  // Make sure the dist directory exists
  checkDirectoryExists(distDir, true);
  
  // Check if app directory exists
  if (!checkDirectoryExists(appDir)) {
    console.error(`Error: Application directory not found: ${appDir}`);
    process.exit(1);
  }
  
  // Copy individual files
  config.copyFiles.forEach(file => {
    const sourcePath = path.join(appDir, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied: ${file}`);
      } catch (error) {
        console.error(`Error copying ${file}: ${error.message}`);
      }
    } else {
      console.warn(`Warning: ${file} not found`);
    }
  });
  
  // Copy directories
  config.copyDirs.forEach(dir => {
    const sourceDir = path.join(appDir, dir);
    const destDir = path.join(distDir, dir);
    
    if (fs.existsSync(sourceDir)) {
      try {
        copyDir(sourceDir, destDir);
        console.log(`Copied: ${dir}/`);
      } catch (error) {
        console.error(`Error copying directory ${dir}: ${error.message}`);
      }
    } else {
      console.warn(`Warning: ${dir}/ not found`);
    }
  });
}

/**
 * Copy a directory recursively with error handling
 * @param {string} source - Source directory
 * @param {string} dest - Destination directory
 */
function copyDir(source, dest) {
  try {
    fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error copying directory from ${source} to ${dest}: ${error.message}`);
    throw error; // Re-throw to allow the caller to handle it
  }
}

/**
 * Update references in HTML and JS files with versioning
 */
function updateReferences() {
  if (!config.addVersioning) return;
  
  console.log('Updating file references with version numbers...');
  
  // Update HTML files
  const htmlFiles = ['index.html', 'offline.html'];
  htmlFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update CSS references
      content = content.replace(
        /href="([^"]+\.css)"/g, 
        `href="$1?v=${config.version}"`
      );
      
      // Update JS references
      content = content.replace(
        /src="([^"]+\.js)"/g, 
        `src="$1?v=${config.version}"`
      );
      
      fs.writeFileSync(filePath, content);
    }
  });
  
  // Update service worker
  const swPath = path.join(distDir, 'service-worker.js');
  if (fs.existsSync(swPath)) {
    let content = fs.readFileSync(swPath, 'utf8');
    
    // Update cache version
    content = content.replace(
      /const CACHE_NAME = ['"`]([^'"`]+)['"`];/,
      `const CACHE_NAME = 'ppl-workout-${config.version}';`
    );
    
    fs.writeFileSync(swPath, content);
  }
}

/**
 * Run tests before build
 */
function runTests() {
  console.log('Running tests...');
  
  try {
    // Execute your test command here
    // execSync('npm run test', { stdio: 'inherit' });
    console.log('Tests passed!');
  } catch (error) {
    console.error('Tests failed. Aborting build.');
    process.exit(1);
  }
}

/**
 * Run linters before build
 */
function runLinters() {
  console.log('Running linters...');
  
  try {
    // Execute your linter commands here
    // execSync('node scripts/lint.js', { stdio: 'inherit' });
    console.log('Linting passed!');
  } catch (error) {
    console.error('Linting failed. Aborting build.');
    process.exit(1);
  }
}

/**
 * Run the minifier
 */
function runMinifier() {
  console.log('Running minifier...');
  
  try {
    // Use correct path to minify.js with space in folder name
    execSync('node "./dev scripts/minify.js"', { stdio: 'inherit' });
    console.log('Minification complete!');
  } catch (error) {
    console.error('Minification failed:', error);
    process.exit(1);
  }
}

/**
 * Main build function
 */
async function build() {
  console.log('Starting production build...');
  
  // Run tests and linters first
  // runTests();
  // runLinters();
  
  // Clean and prepare
  cleanDist();
  
  // Run minifier
  runMinifier();
  
  // Copy assets
  copyAssets();
  
  // Update references
  updateReferences();
  
  console.log('\nBuild complete! Files are ready in the dist directory.');
}

build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});