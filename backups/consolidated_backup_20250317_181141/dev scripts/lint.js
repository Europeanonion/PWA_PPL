/**
 * JavaScript & CSS Minifier
 * Automatically minifies all JS and CSS files in the assets directory
 * Code Linter
 * Checks JavaScript files for potential issues
 */
import { ESLint } from 'eslint';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as minifyJS } from 'terser';
import CleanCSS from 'clean-css';

// Get the current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');  // Up one level from "dev scripts"
const appDir = path.join(projectRoot, 'ppl-workout');

// Configuration
const config = {
  jsDir: path.join(appDir, 'assets/js'),
  exclude: [/\.min\.js$/, /node_modules/],
  fix: false, // Set to true to auto-fix issues
  js: {
    sourceDir: path.join(appDir, 'assets/js'),
    skipPattern: /\.min\.js$/
  },
  css: {
    sourceDir: path.join(appDir, 'assets/css'),
    skipPattern: /\.min\.css$/
  }
};

/**
 * Create .min version of a file
 * @param {string} filePath - Source file path
 * @param {function} minifyFn - Minification function
 */
async function createMinifiedVersion(filePath, minifyFn) {
  try {
    // Check if file should be skipped
    const fileName = path.basename(filePath);
    const isJS = path.extname(filePath).toLowerCase() === '.js';
    const skipPattern = isJS ? config.js.skipPattern : config.css.skipPattern;
    
    if (skipPattern.test(fileName)) {
      console.log(`Skipping already minified file: ${fileName}`);
      return;
    }
    
    // Read the source file
    const source = fs.readFileSync(filePath, 'utf8');
    
    // Create the minified file name
    const dirName = path.dirname(filePath);
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
    const minFileName = `${fileNameWithoutExt}.min${path.extname(fileName)}`;
    const minFilePath = path.join(dirName, minFileName);
    
    // Minify and save
    const minified = await minifyFn(source, filePath);
    fs.writeFileSync(minFilePath, minified);
    
    // Output the size reduction
    const originalSize = Buffer.byteLength(source, 'utf8');
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    const reduction = 100 - (minifiedSize / originalSize * 100);
    
    console.log(`Minified ${fileName} → ${minFileName} (${reduction.toFixed(1)}% reduction)`);
  } catch (error) {
    console.error(`Error minifying ${filePath}: ${error.message}`);
  }
}

/**
 * Minify JavaScript with Terser
 * @param {string} source - Source code
 * @returns {Promise<string>} - Minified code
 */
async function minifyJavaScript(source) {
  const result = await minifyJS(source, {
    compress: {
      drop_console: false,
      drop_debugger: true
    },
    mangle: true
  });
  return result.code;
}

/**
 * Minify CSS with CleanCSS
 * @param {string} source - Source CSS
 * @returns {Promise<string>} - Minified CSS
 */
async function minifyCSS(source) {
  const result = new CleanCSS({
    level: 2,
    format: 'keep-breaks'
  }).minify(source);
  return result.styles;
}

/**
 * Process all files in a directory
 * @param {string} dir - Directory to process
 * @param {function} processor - Processing function
 */
async function processDirectory(dir, processor) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(entryPath, processor);
    } else if (entry.isFile()) {
      await processor(entryPath);
    }
  }
}

/**
 * Run ESLint on files
 * @param {Array<string>} files - Array of file paths
 */
async function lintFiles(files) {
  const eslint = new ESLint({
    fix: config.fix,
    overrideConfig: {
      env: {
        browser: true,
        es2021: true
      },
      extends: 'eslint:recommended',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
        'semi': ['error', 'always']
      }
    }
  });

  const results = await eslint.lintFiles(files);
  
  if (config.fix) {
    await ESLint.outputFixes(results);
  }
  
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);
  
  console.log(resultText);
  
  // Return success/failure
  const errorCount = results.reduce((acc, result) => acc + result.errorCount, 0);
  return errorCount === 0;
}

/**
 * Check if a directory exists
 * @param {string} dirPath - Directory path
 * @returns {boolean} - True if directory exists, false otherwise
 */
function checkDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Warning: Directory does not exist: ${dirPath}`);
    return false;
  }
  return true;
}

/**
 * Get all JavaScript files
 * @returns {Array<string>} Array of file paths
 */
function getJavaScriptFiles() {
  const files = [];
  
  if (!checkDirectoryExists(config.jsDir)) {
    return files;  // Return empty array if directory doesn't exist
  }
  
  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        
        // Skip excluded patterns
        if (config.exclude.some(pattern => pattern.test(entryPath))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          scanDir(entryPath);
        } else if (entry.isFile() && path.extname(entryPath).toLowerCase() === '.js') {
          files.push(entryPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}: ${error.message}`);
    }
  }
  
  scanDir(config.jsDir);
  return files;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting minification...');
  
  // Process JS files
  console.log('\nMinifying JavaScript files:');
  await processDirectory(config.js.sourceDir, async (filePath) => {
    if (path.extname(filePath).toLowerCase() === '.js') {
      await createMinifiedVersion(filePath, minifyJavaScript);
    }
  });
  
  // Process CSS files
  console.log('\nMinifying CSS files:');
  await processDirectory(config.css.sourceDir, async (filePath) => {
    if (path.extname(filePath).toLowerCase() === '.css') {
      await createMinifiedVersion(filePath, minifyCSS);
    }
  });
  
  console.log('\nMinification complete!');

  console.log('Starting code linting...');
  
  try {
    // Verify source directories
    if (!checkDirectoryExists(config.jsDir)) {
      console.error('Error: JavaScript source directory not found. Aborting.');
      process.exit(1);
    }
    
    const files = getJavaScriptFiles();
    console.log(`Found ${files.length} JavaScript files to lint`);
    
    if (files.length === 0) {
      console.log('No files to lint. Check if the directory exists and contains .js files.');
      return;
    }
    
    const success = await lintFiles(files);
    
    if (success) {
      console.log('\nLinting successful - No errors found!');
      process.exit(0);
    } else {
      console.log('\nLinting failed - Please fix the errors above');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Unexpected error during linting: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error during minification:', error);
  process.exit(1);
});