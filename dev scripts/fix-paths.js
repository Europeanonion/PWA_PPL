/**
 * Path Fixer
 * Finds and fixes path issues in the codebase
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

// Get the current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');  // Up one level from "dev scripts"
const appDir = path.join(projectRoot, 'ppl-workout');

// Configuration
const config = {
  fixPaths: true,  // Set to false to just report issues without fixing
  backupFiles: true, // Create .bak files before modifying
  checkDirs: [
    path.join(appDir, 'assets/js')  // Updated to use appDir
  ],
  fileTypes: ['.js', '.min.js']
};

// Fixed path mappings
const pathFixes = [
  {
    pattern: /\.\/dev\/exercise-data\/phase(\${phase}|\d+)-week(\${week}|\d+)\.json/g,
    replacement: '../../dev/exercise-data/phase$1-week$2.json'
  }
];

/**
 * Backup a file before modifying it
 * @param {string} filePath - Path of the file to backup
 */
function backupFile(filePath) {
  if (config.backupFiles) {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup created: ${backupPath}`);
  }
}

/**
 * Check if a directory exists
 * @param {string} dirPath - Path of the directory to check
 * @returns {boolean} - Whether the directory exists
 */
function checkDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Warning: Directory does not exist: ${dirPath}`);
    return false;
  }
  return true;
}

/**
 * Fix paths in a file
 * @param {string} filePath - Path of the file to fix
 * @returns {boolean} - Whether any fixes were made
 */
function fixPathsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let fixed = false;
    
    // Apply each path fix
    for (const fix of pathFixes) {
      const matches = content.match(fix.pattern);
      if (matches && matches.length > 0) {
        console.log(`Found ${matches.length} path issues in ${filePath}:`);
        
        matches.forEach(match => {
          console.log(`  ${match}`);
        });
        
        // Apply the fix
        if (config.fixPaths) {
          content = content.replace(fix.pattern, fix.replacement);
          fixed = true;
        }
      }
    }
    
    // Save the fixed file
    if (fixed) {
      console.log(`Fixing paths in ${filePath}`);
      backupFile(filePath);
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return fixed;
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Scan a directory for files to fix
 * @param {string} dir - Directory to scan
 * @returns {number} - Number of files fixed
 */
function scanDirectory(dir) {
  let fixedCount = 0;
  
  if (!fs.existsSync(dir)) {
    console.warn(`Skipping non-existent directory: ${dir}`);
    return fixedCount;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        fixedCount += scanDirectory(entryPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entryPath).toLowerCase();
        if (config.fileTypes.includes(ext)) {
          try {
            if (fixPathsInFile(entryPath)) {
              fixedCount++;
            }
          } catch (error) {
            console.error(`Error fixing paths in ${entryPath}: ${error.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}: ${error.message}`);
  }
  
  return fixedCount;
}

/**
 * Main function
 */
function main() {
  console.log('Starting path fixer...');
  console.log(config.fixPaths ? 'Mode: Fix issues' : 'Mode: Report only');
  
  let totalFixed = 0;
  
  // Process each directory
  for (const dir of config.checkDirs) {
    console.log(`\nScanning ${dir}`);
    const fixed = scanDirectory(dir);
    totalFixed += fixed;
    
    if (fixed > 0) {
      console.log(`Fixed paths in ${fixed} files in ${dir}`);
    } else {
      console.log(`No path issues found in ${dir}`);
    }
  }
  
  console.log(`\nSummary: ${totalFixed} files ${config.fixPaths ? 'fixed' : 'have issues'}`);
}

main();